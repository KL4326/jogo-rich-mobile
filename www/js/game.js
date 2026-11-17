// ===== Estado do jogador, economia e ações =====
import {
  DAY_MS, BUSINESSES, BIZ_GROWTH, BIZ_MILESTONES, COURSES, JOBS, PROPERTIES, GOODS, GOOD, ALL_GOODS,
  CARDS, LEVEL_BONUS, TRADE_FEE, LOAN_RATE, RENT_NO_HOME, ASSETS, CRYPTOS, UNLOCKS,
} from './data.js';

const SAVE_KEY = 'magnata_save_v1';

export function newState(name) {
  const now = Date.now();
  return {
    v: 1, name, created: now, last: now,
    cash: 1500, debt: 0, xp: 0,
    job: 'entregador', edu: [], course: null,
    biz: {}, port: {}, props: {}, goods: {},
    poup: 0, cdb: [], tes: [],
    cardMax: 0, peakNW: 1500, ach: {},
    stats: { earned: 0, trades: 0, tradeProfit: 0, bestTrade: 0, divs: 0, rents: 0, loans: 0 },
    friends: [], log: [],
  };
}

export function load() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && s.v === 1) return s;
  } catch (e) { }
  return null;
}
export function save(s) {
  s.last = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) { }
}
export function wipe() { localStorage.removeItem(SAVE_KEY); }

// ---------- Níveis ----------
export const xpForLevel = (n) => Math.floor(120 * Math.pow(n - 1, 1.7)); // xp total para alcançar o nível n
export function levelOf(xp) {
  let n = 1;
  while (xp >= xpForLevel(n + 1)) n++;
  return n;
}
export const level = (s) => levelOf(s.xp);
export const isUnlocked = (s, key) => level(s) >= UNLOCKS[key];

// ---------- Cálculos ----------
export const bizCost = (b, lvl, n = 1) => {
  // soma geométrica de n níveis a partir de lvl
  const r = BIZ_GROWTH;
  return b.cost * Math.pow(r, lvl) * (Math.pow(r, n) - 1) / (r - 1);
};
export function bizMaxBuy(b, lvl, cash) {
  const r = BIZ_GROWTH;
  const n = Math.floor(Math.log(cash * (r - 1) / (b.cost * Math.pow(r, lvl)) + 1) / Math.log(r));
  return Math.max(0, n);
}
export const bizMult = (lvl) => Math.pow(2, BIZ_MILESTONES.filter((m) => lvl >= m).length);
export const nextMilestone = (lvl) => BIZ_MILESTONES.find((m) => lvl < m);
export const SECTOR_MULT = { 1: 1.3, 0: 1, '-1': 0.75 };

export function card(s) { return CARDS[s.cardMax]; }
export const levelMult = (s) => 1 + LEVEL_BONUS * (level(s) - 1);
export function vehicleBonus(s) {
  return GOODS.veiculos.filter((g) => s.goods[g.id]).reduce((m, g) => Math.max(m, g.bonus), 0);
}
export function homeOf(s) {
  const owned = GOODS.moradia.filter((g) => s.goods[g.id]);
  return owned.length ? owned[owned.length - 1] : null;
}
export const prestige = (s) => ALL_GOODS.filter((g) => s.goods[g.id]).reduce((p, g) => p + g.prestige, 0);
export function offlineHours(s) {
  const home = homeOf(s);
  return card(s).hours + (home ? home.hours : 0);
}

export function bizProfit(s, b, mk) {
  const lvl = s.biz[b.id] || 0;
  if (!lvl) return 0;
  return b.profit * lvl * bizMult(lvl) * SECTOR_MULT[mk.sectorNow(b.sector)] * levelMult(s);
}

export function salary(s) {
  const j = JOBS.find((x) => x.id === s.job);
  return j.salary * (1 + vehicleBonus(s)) * levelMult(s);
}

// Renda e gastos por dia de jogo, detalhado
export function incomeBreakdown(s, mk) {
  const sal = salary(s);
  const biz = BUSINESSES.reduce((t, b) => t + bizProfit(s, b, mk), 0);
  const rent = PROPERTIES.reduce((t, p) => t + (s.props[p.id] || 0) * p.rent, 0) * levelMult(s);
  let divs = 0;
  for (const a of ASSETS) {
    const h = s.port[a.sym];
    if (h && h.q > 0 && a.div) divs += h.q * mk.price(a.sym) * a.div;
  }
  const cdi = mk.cdi();
  const juros = s.poup * cdi * 0.7 + s.cdb.reduce((t, x) => t + x.amt, 0) * cdi * 1.1 + s.tes.reduce((t, x) => t + x.amt, 0) * cdi * 1.3;
  const moradia = homeOf(s) ? 0 : RENT_NO_HOME;
  const manut = ALL_GOODS.filter((g) => s.goods[g.id]).reduce((t, g) => t + g.cost * 0.0002, 0);
  const loan = s.debt * LOAN_RATE;
  const inc = sal + biz + rent + divs + juros;
  const exp = moradia + manut + loan;
  return { sal, biz, rent, divs, juros, moradia, manut, loan, inc, exp, net: inc - exp };
}

export function netWorth(s, mk) {
  let v = s.cash + s.poup + s.cdb.reduce((t, x) => t + x.amt, 0) + s.tes.reduce((t, x) => t + x.amt, 0);
  for (const a of ASSETS) {
    const h = s.port[a.sym];
    if (h && h.q > 0) v += h.q * mk.price(a.sym);
  }
  const idx = mk.realEstateIndex();
  v += PROPERTIES.reduce((t, p) => t + (s.props[p.id] || 0) * p.cost * idx, 0);
  // empresas valem 60% do que foi investido
  v += BUSINESSES.reduce((t, b) => t + (s.biz[b.id] ? bizCost(b, 0, s.biz[b.id]) * 0.6 : 0), 0);
  v += ALL_GOODS.filter((g) => s.goods[g.id]).reduce((t, g) => t + g.cost * sellRate(g), 0);
  return v - s.debt;
}
export const sellRate = (g) => (g.cat === 'veiculos' ? 0.6 : g.cat === 'moradia' ? 0.9 : 0.75);

// ---------- Simulação ----------
// Aplica dt milissegundos de economia. Retorna o lucro líquido.
export function accrue(s, mk, dt) {
  const days = dt / DAY_MS;
  const ib = incomeBreakdown(s, mk);
  const cdi = mk.cdi();
  // juros compõem nas próprias aplicações
  s.poup += s.poup * cdi * 0.7 * days;
  s.cdb.forEach((x) => { x.amt += x.amt * cdi * 1.1 * days; });
  s.tes.forEach((x) => { x.amt += x.amt * cdi * 1.3 * days; });
  s.debt += s.debt * LOAN_RATE * days;
  const cashGain = (ib.sal + ib.biz + ib.rent + ib.divs - ib.moradia - ib.manut) * days;
  s.cash += cashGain;
  s.stats.earned += Math.max(0, ib.inc) * days;
  s.stats.divs += ib.divs * days;
  s.stats.rents += ib.rent * days;
  if (s.cash < 0 && s.debt === 0 && s.poup > 0) { const t = Math.min(s.poup, -s.cash); s.poup -= t; s.cash += t; }
  return ib.net * days;
}

// ---------- Ações ----------
// Retorna string de erro ou null
function spend(s, amount, withCashback = false) {
  if (s.cash < amount - 1e-6) return 'Dinheiro insuficiente';
  s.cash -= amount;
  if (withCashback) s.cash += amount * card(s).cashback;
  return null;
}
const addXP = (s, n) => { s.xp += n; };

export function startCourse(s, id) {
  const c = COURSES.find((x) => x.id === id);
  if (s.course) return 'Você já está estudando';
  if (s.edu.includes(id)) return 'Você já concluiu este curso';
  if (c.req && !s.edu.includes(c.req)) return 'Requisito não concluído';
  const e = spend(s, c.cost); if (e) return e;
  s.course = { id, end: Date.now() + c.mins * 60_000, start: Date.now() };
  return null;
}
export function checkCourse(s) {
  if (s.course && Date.now() >= s.course.end) {
    const c = COURSES.find((x) => x.id === s.course.id);
    s.edu.push(c.id);
    s.course = null;
    addXP(s, 40 + Math.round(Math.log10(c.cost) * 15));
    return c;
  }
  return null;
}
export function canTakeJob(s, j) {
  return j.edu.every((e) => s.edu.includes(e)) && level(s) >= j.lvl;
}
export function takeJob(s, id) {
  const j = JOBS.find((x) => x.id === id);
  if (!canTakeJob(s, j)) return 'Requisitos não atendidos';
  if (s.job !== id) { s.job = id; addXP(s, 25); }
  return null;
}

export function buyBiz(s, id, n) {
  const b = BUSINESSES.find((x) => x.id === id);
  const lvl = s.biz[id] || 0;
  if (n === 'max') n = bizMaxBuy(b, lvl, s.cash);
  if (n < 1) return 'Dinheiro insuficiente';
  const cost = bizCost(b, lvl, n);
  const e = spend(s, cost, true); if (e) return e;
  const before = nextMilestone(lvl);
  s.biz[id] = lvl + n;
  addXP(s, (lvl === 0 ? 30 : 0) + 2 * n + (before && lvl + n >= before ? 20 : 0));
  return null;
}

export function trade(s, mk, sym, qty, side) {
  const a = ASSETS.find((x) => x.sym === sym);
  const price = mk.price(sym);
  const h = s.port[sym] || (s.port[sym] = { q: 0, cost: 0 });
  if (!(qty > 0)) return 'Quantidade inválida';
  if (side === 'buy') {
    const total = qty * price * (1 + TRADE_FEE);
    const e = spend(s, total); if (e) return e;
    h.cost += total; h.q += qty;
    s.stats.trades++;
    addXP(s, 3);
  } else {
    if (qty > h.q + 1e-9) return 'Você não tem tudo isso';
    const avg = h.cost / h.q;
    const recv = qty * price * (1 - TRADE_FEE);
    const profit = recv - avg * qty;
    h.cost -= avg * qty; h.q -= qty;
    if (h.q < 1e-9) { h.q = 0; h.cost = 0; }
    s.cash += recv;
    s.stats.trades++;
    s.stats.tradeProfit += profit;
    s.stats.bestTrade = Math.max(s.stats.bestTrade, profit);
    if (profit > 0) addXP(s, 5 + Math.min(60, Math.round(Math.log10(1 + profit) * 4)));
    return { profit };
  }
  return null;
}
export const isCrypto = (sym) => CRYPTOS.some((c) => c.sym === sym);

export function applyFixed(s, kind, amt) {
  if (!(amt > 0)) return 'Valor inválido';
  const e = spend(s, amt); if (e) return e;
  if (kind === 'poup') s.poup += amt;
  else if (kind === 'cdb') s.cdb.push({ amt, until: Date.now() + 60 * DAY_MS });
  else s.tes.push({ amt, until: Date.now() + 240 * DAY_MS });
  addXP(s, 2);
  return null;
}
export function withdrawPoup(s, amt) {
  amt = Math.min(amt, s.poup);
  s.poup -= amt; s.cash += amt;
  return null;
}
export function redeem(s, kind, i) {
  const list = s[kind];
  const x = list[i];
  if (!x || Date.now() < x.until) return 'Ainda está no prazo de carência';
  list.splice(i, 1);
  s.cash += x.amt;
  return null;
}

export function buyProp(s, mk, id) {
  const p = PROPERTIES.find((x) => x.id === id);
  const price = p.cost * mk.realEstateIndex();
  const e = spend(s, price); if (e) return e;
  s.props[id] = (s.props[id] || 0) + 1;
  addXP(s, 20);
  return null;
}
export function sellProp(s, mk, id) {
  const p = PROPERTIES.find((x) => x.id === id);
  if (!s.props[id]) return 'Você não tem este imóvel';
  s.props[id]--;
  s.cash += p.cost * mk.realEstateIndex() * 0.97;
  return null;
}

export function buyGood(s, id) {
  const g = GOOD[id];
  if (s.goods[id]) return 'Você já tem';
  const e = spend(s, g.cost, true); if (e) return e;
  s.goods[id] = Date.now();
  addXP(s, 15 + g.prestige);
  return null;
}
export function sellGood(s, id) {
  const g = GOOD[id];
  if (!s.goods[id]) return 'Você não tem';
  delete s.goods[id];
  s.cash += g.cost * sellRate(g);
  return null;
}

export function borrow(s, amt) {
  const lim = card(s).limit;
  if (!(amt > 0)) return 'Valor inválido';
  if (s.debt + amt > lim + 1e-6) return 'Acima do limite do seu cartão';
  s.debt += amt; s.cash += amt;
  s.stats.loans++;
  return null;
}
export function repay(s, amt) {
  amt = Math.min(amt, s.debt, s.cash);
  if (!(amt > 0)) return 'Nada a pagar';
  s.debt -= amt; s.cash -= amt;
  if (s.debt < 0.01) s.debt = 0;
  return null;
}

// Atualiza cartão e patrimônio máximo. Retorna o novo cartão se subiu
export function checkCard(s, nw) {
  s.peakNW = Math.max(s.peakNW || 0, nw);
  let idx = s.cardMax;
  while (idx + 1 < CARDS.length && s.peakNW >= CARDS[idx + 1].min) idx++;
  if (idx > s.cardMax) {
    const gained = idx - s.cardMax;
    s.cardMax = idx;
    addXP(s, 60 * gained);
    return CARDS[idx];
  }
  return null;
}

// ---------- Conquistas ----------
const bizCount = (s) => Object.values(s.biz).filter((x) => x > 0).length;
const bizLevels = (s) => Object.values(s.biz).reduce((a, b) => a + b, 0);
const propCount = (s) => Object.values(s.props).reduce((a, b) => a + b, 0);
const hasCrypto = (s) => CRYPTOS.some((c) => s.port[c.sym] && s.port[c.sym].q > 0);
const sectorsHeld = (s) => new Set(ASSETS.filter((a) => s.port[a.sym] && s.port[a.sym].q > 0).map((a) => a.sector)).size;

export const ACHIEVEMENTS = [
  { id: 'estudo1', icon: '📘', name: 'De volta aos estudos', desc: 'Conclua seu primeiro curso', test: (s) => s.edu.length >= 1 },
  { id: 'emprego', icon: '💼', name: 'Carteira assinada', desc: 'Troque de emprego', test: (s) => s.job !== 'entregador' },
  { id: 'empresa1', icon: '🥟', name: 'Empreendedor', desc: 'Abra sua primeira empresa', test: (s) => bizCount(s) >= 1 },
  { id: 'empresa3', icon: '🏪', name: 'Grupo empresarial', desc: 'Tenha 3 tipos de empresa', test: (s) => bizCount(s) >= 3 },
  { id: 'empresa6', icon: '🏭', name: 'Conglomerado', desc: 'Tenha 6 tipos de empresa', test: (s) => bizCount(s) >= 6 },
  { id: 'empresa12', icon: '🌐', name: 'Império total', desc: 'Tenha todos os 12 tipos de empresa', test: (s) => bizCount(s) >= 12 },
  { id: 'niveis100', icon: '⬆️', name: 'Expansão', desc: 'Some 100 níveis em empresas', test: (s) => bizLevels(s) >= 100 },
  { id: 'niveis500', icon: '🚀', name: 'Expansão agressiva', desc: 'Some 500 níveis em empresas', test: (s) => bizLevels(s) >= 500 },
  { id: 'acao1', icon: '📈', name: 'Investidor iniciante', desc: 'Compre sua primeira ação', test: (s) => s.stats.trades >= 1 },
  { id: 'lucro1', icon: '💹', name: 'Comprou barato, vendeu caro', desc: 'Lucre R$ 1 mil em uma única venda', test: (s) => s.stats.bestTrade >= 1000 },
  { id: 'lucro2', icon: '🐂', name: 'Lobo da Bolsa', desc: 'Lucre R$ 1 mi em uma única venda', test: (s) => s.stats.bestTrade >= 1e6 },
  { id: 'trader', icon: '🧾', name: 'Day trader', desc: 'Faça 100 operações', test: (s) => s.stats.trades >= 100 },
  { id: 'diversif', icon: '🧺', name: 'Não coloque os ovos na mesma cesta', desc: 'Tenha ações de 5 setores diferentes', test: (s) => sectorsHeld(s) >= 5 },
  { id: 'cripto', icon: '🪙', name: 'To the moon', desc: 'Compre uma criptomoeda', test: hasCrypto },
  { id: 'divs', icon: '💸', name: 'Vivendo de dividendos', desc: 'Receba R$ 100 mil em dividendos', test: (s) => s.stats.divs >= 1e5 },
  { id: 'reserva', icon: '🐷', name: 'Reserva de emergência', desc: 'Tenha R$ 50 mil na poupança', test: (s) => s.poup >= 5e4 },
  { id: 'tesouro', icon: '🏛️', name: 'Pensando no futuro', desc: 'Invista no Tesouro', test: (s) => s.tes.length > 0 },
  { id: 'imovel1', icon: '🔑', name: 'Senhorio', desc: 'Compre um imóvel para alugar', test: (s) => propCount(s) >= 1 },
  { id: 'imovel10', icon: '🏙️', name: 'Barão imobiliário', desc: 'Tenha 10 imóveis alugados', test: (s) => propCount(s) >= 10 },
  { id: 'carro', icon: '🚗', name: 'Habilitado', desc: 'Compre um carro', test: (s) => ['popular', 'suv', 'sedan', 'esportivo'].some((g) => s.goods[g]) },
  { id: 'casa', icon: '🏠', name: 'Adeus, aluguel', desc: 'Compre sua moradia', test: (s) => !!homeOf(s) },
  { id: 'mansao', icon: '🏰', name: 'Vida de rico', desc: 'Compre uma mansão', test: (s) => ['mansao', 'mansaopraia', 'castelo', 'ilha'].some((g) => s.goods[g]) },
  { id: 'jato', icon: '🛩️', name: 'Ponte aérea', desc: 'Compre um jatinho', test: (s) => !!s.goods.jato },
  { id: 'ilha', icon: '🏝️', name: 'Dono do paraíso', desc: 'Compre uma ilha particular', test: (s) => !!s.goods.ilha },
  { id: 'emprestimo', icon: '🏦', name: 'Alavancado', desc: 'Pegue um empréstimo', test: (s) => s.stats.loans >= 1 },
  { id: 'ceo', icon: '🏆', name: 'Topo da carreira', desc: 'Torne-se CEO', test: (s) => s.job === 'ceo' },
  { id: 'mil', icon: '💵', name: 'Primeiros mil', desc: 'Patrimônio de R$ 10 mil', test: (s) => s.peakNW >= 1e4 },
  { id: 'milhao', icon: '💰', name: 'Milionário', desc: 'Patrimônio de R$ 1 milhão', test: (s) => s.peakNW >= 1e6 },
  { id: 'bilhao', icon: '🤑', name: 'Bilionário', desc: 'Patrimônio de R$ 1 bilhão', test: (s) => s.peakNW >= 1e9 },
  { id: 'trilhao', icon: '👑', name: 'Trilionário', desc: 'Patrimônio de R$ 1 trilhão', test: (s) => s.peakNW >= 1e12 },
  { id: 'nivel10', icon: '⭐', name: 'Experiente', desc: 'Alcance o nível 10', test: (s) => level(s) >= 10 },
  { id: 'nivel25', icon: '🌟', name: 'Lenda', desc: 'Alcance o nível 25', test: (s) => level(s) >= 25 },
];

export function checkAchievements(s) {
  const got = [];
  for (const a of ACHIEVEMENTS) {
    if (!s.ach[a.id] && a.test(s)) {
      s.ach[a.id] = Date.now();
      addXP(s, 80);
      got.push(a);
    }
  }
  return got;
}

// ---------- Código de competição ----------
function checksum(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}
export function shareCode(s, mk) {
  const d = { n: s.name, w: Math.round(netWorth(s, mk)), l: level(s), a: Object.keys(s.ach).length, c: s.cardMax, p: prestige(s), i: incomeBreakdown(s, mk).net, t: Date.now(), id: s.created };
  const json = JSON.stringify(d);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return `MAG1.${b64}.${checksum(json + 'magnata')}`;
}
export function parseCode(code) {
  try {
    const [tag, b64, sum] = code.trim().split('.');
    if (tag !== 'MAG1') return null;
    const json = decodeURIComponent(escape(atob(b64)));
    if (checksum(json + 'magnata') !== sum) return null;
    return JSON.parse(json);
  } catch (e) { return null; }
}
export function addFriend(s, d) {
  if (d.id === s.created) return 'Esse é o seu próprio código 😅';
  const i = s.friends.findIndex((f) => f.id === d.id);
  if (i >= 0) {
    if (s.friends[i].t > d.t) return 'Você já tem um código mais recente dessa pessoa';
    s.friends[i] = d;
  } else s.friends.push(d);
  return null;
}
