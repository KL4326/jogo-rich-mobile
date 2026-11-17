// ===== Mercado global determinístico =====
// Todos os celulares calculam exatamente o mesmo mercado a partir do relógio.
// Assim você, sua irmã e sua esposa veem as MESMAS notícias e os MESMOS preços.
import { ASSETS, SECTORS, SECTOR } from './data.js';

export const EPOCH = Date.UTC(2026, 10, 1, 0, 0, 0);
export const TICK_MS = 20_000; // um "pregão" a cada 20s
export const BLOCK = 180; // ciclos de setor duram 180 pregões (1h)
export const CONFIRM_AT = 45; // notícia confirmando o ciclo sai 15 min após início
export const FORECAST_AT = 120; // previsão do próximo ciclo sai 40 min após início
export const FORECAST_ACC = 0.7;
const HIST = 180;
const KAPPA = 0.003;

export function h32(a, b, c) {
  let x = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((b + 0x7f4a7c15) | 0, 0xc2b2ae35) ^ Math.imul((c + 0x165667b1) | 0, 0x27d4eb2f);
  x ^= x >>> 15; x = Math.imul(x, 0x2c1b3c6d);
  x ^= x >>> 12; x = Math.imul(x, 0x297a2d39);
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}

export const nowTick = (now = Date.now()) => Math.floor((now - EPOCH) / TICK_MS);

// -1 queda, 0 estável, 1 alta
export function regime(secIdx, block) {
  const u = h32(1, secIdx, block);
  const edge = secIdx === SECTOR.crypto.idx ? 0.32 : 0.25;
  return u < edge ? 1 : u > 1 - edge ? -1 : 0;
}
export function forecast(secIdx, block) {
  if (h32(8, secIdx, block) < FORECAST_ACC) return regime(secIdx, block);
  const u = h32(9, secIdx, block);
  return u < 0.33 ? 1 : u < 0.66 ? -1 : 0;
}

function driftFor(secIdx) {
  return secIdx === SECTOR.crypto.idx ? 0.0018 : 0.001;
}

function jumpAt(i, t) {
  if (h32(5, i, t) >= 0.0018) return 0;
  return (h32(6, i, t) < 0.5 ? -1 : 1) * (0.08 + 0.17 * h32(7, i, t));
}

function step(x, i, a, t) {
  const sec = SECTOR[a.sector].idx;
  const reg = regime(sec, Math.floor(t / BLOCK));
  const z = (h32(2, i, t) + h32(3, i, t) + h32(4, i, t) - 1.5) * 2;
  const target = a.g * t;
  return x + KAPPA * (target - x) + reg * driftFor(sec) + a.sigma * z + jumpAt(i, t);
}

const LS_KEY = 'magnata_market_v1';

export class Market {
  constructor() {
    this.t = -1;
    this.x = ASSETS.map(() => 0);
    this.hist = ASSETS.map(() => []);
    try {
      const c = JSON.parse(localStorage.getItem(LS_KEY));
      if (c && c.x && c.x.length === ASSETS.length) Object.assign(this, { t: c.t, x: c.x, hist: c.hist });
    } catch (e) { /* recalcula */ }
    this.index = Object.fromEntries(ASSETS.map((a, i) => [a.sym, i]));
    this.update();
  }

  save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ t: this.t, x: this.x, hist: this.hist })); } catch (e) { }
  }

  // Avança o mercado até o pregão atual. Retorna true se mudou.
  update(now = Date.now()) {
    const target = nowTick(now);
    if (target <= this.t) return false;
    let t = this.t;
    if (t < 0) t = 0;
    const histFrom = target - HIST;
    while (t < target) {
      t++;
      for (let i = 0; i < ASSETS.length; i++) {
        this.x[i] = step(this.x[i], i, ASSETS[i], t);
        if (t > histFrom) {
          const h = this.hist[i];
          h.push(+(ASSETS[i].base * Math.exp(this.x[i])).toPrecision(6));
          if (h.length > HIST) h.shift();
        }
      }
    }
    this.t = target;
    this.save();
    return true;
  }

  price(sym) {
    const i = this.index[sym];
    return ASSETS[i].base * Math.exp(this.x[i]);
  }
  // variação na última hora (%)
  change(sym) {
    const h = this.hist[this.index[sym]];
    if (h.length < 2) return 0;
    return h[h.length - 1] / h[0] - 1;
  }
  history(sym) { return this.hist[this.index[sym]]; }

  block() { return Math.floor(this.t / BLOCK); }
  blockPos() { return this.t - this.block() * BLOCK; }

  // Regime real atual (afeta lucro das empresas)
  sectorNow(secId) { return regime(SECTOR[secId].idx, this.block()); }
  // Regime conhecido pelo jogador (só depois da confirmação)
  sectorKnown(secId) { return this.blockPos() >= CONFIRM_AT ? this.sectorNow(secId) : null; }
  sectorForecast(secId) { return this.blockPos() >= FORECAST_AT ? forecast(SECTOR[secId].idx, this.block() + 1) : null; }

  // Índice do setor imobiliário (valoriza/desvaloriza imóveis)
  realEstateIndex() {
    const syms = ASSETS.filter((a) => a.sector === 'realestate');
    const avg = syms.reduce((s, a) => s + this.price(a.sym) / a.base, 0) / syms.length;
    return 0.6 + 0.4 * avg;
  }

  msToNextTick(now = Date.now()) { return TICK_MS - ((now - EPOCH) % TICK_MS); }
  msToNextBlock(now = Date.now()) { return (BLOCK - this.blockPos()) * TICK_MS - ((now - EPOCH) % TICK_MS); }

  // Feed de notícias das últimas ~2h (determinístico)
  news(limit = 25) {
    const out = [];
    const t = this.t;
    const b = this.block();
    for (let bb = b; bb >= b - 2; bb--) {
      const start = bb * BLOCK;
      if (start + FORECAST_AT <= t) {
        SECTORS.forEach((s, si) => {
          const f = forecast(si, bb + 1);
          if (f !== 0) out.push({ t: start + FORECAST_AT, kind: 'forecast', icon: f > 0 ? '🔮' : '🌧️', text: f > 0 ? `Analistas preveem ALTA para ${s.name} na próxima hora` : `Analistas preveem QUEDA para ${s.name} na próxima hora`, dir: f, sector: s.id });
        });
      }
      if (start + CONFIRM_AT <= t) {
        SECTORS.forEach((s, si) => {
          const r = regime(si, bb);
          if (r !== 0) out.push({ t: start + CONFIRM_AT, kind: 'confirm', icon: r > 0 ? '📈' : '📉', text: r > 0 ? `Confirmado: setor de ${s.name} está aquecido` : `Confirmado: setor de ${s.name} em crise`, dir: r, sector: s.id });
        });
      }
    }
    const GOOD = ['anuncia lucro recorde', 'fecha contrato bilionário', 'lança produto que vira febre', 'recebe aporte de fundo estrangeiro'];
    const BAD = ['é investigada por fraude', 'tem resultado abaixo do esperado', 'perde cliente importante', 'enfrenta greve de funcionários'];
    for (let tt = t; tt > t - 2 * BLOCK && tt > 0; tt--) {
      ASSETS.forEach((a, i) => {
        const j = jumpAt(i, tt);
        if (j !== 0) {
          const list = j > 0 ? GOOD : BAD;
          const msg = list[Math.floor(h32(10, i, tt) * list.length)];
          out.push({ t: tt, kind: 'event', icon: j > 0 ? '🚀' : '💥', text: `${a.name} (${a.sym}) ${msg}: ${j > 0 ? '+' : ''}${Math.round(j * 100)}%`, dir: j > 0 ? 1 : -1, sector: a.sector });
        }
      });
    }
    out.sort((p, q) => q.t - p.t);
    return out.slice(0, limit);
  }

  // Taxa CDI por dia de jogo (varia a cada 6h)
  cdi() {
    const b6 = Math.floor(this.t / (BLOCK * 6));
    return 0.0004 + 0.00025 * h32(11, 0, b6);
  }
}

export const tickToMs = (t) => EPOCH + t * TICK_MS;
