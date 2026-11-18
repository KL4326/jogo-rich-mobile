// ===== Estado do jogador, economia e ações =====
import { regime, BLOCK } from './market.js';
import { CLOTH, CLOTHES, defaultLook, randomLook } from './avatar.js';
import {
  DAY_MS, BUSINESSES, BIZ_GROWTH, BIZ_MILESTONES, COURSES, JOBS, PROPERTIES, GOODS, GOOD, ALL_GOODS,
  CARDS, LEVEL_BONUS, TRADE_FEE, LOAN_RATE, RENT_NO_HOME, ASSETS, CRYPTOS, UNLOCKS, SECTORS,
  OWN_TIERS, TRIPS, REST_BONUS, REST_HOURS, LOVE_STAGES, DATES, GIFTS, REPEAT_PENALTY, RING_COST, WEDDINGS, NAMES_F, NAMES_M,
} from './data.js';

const SAVE_KEY = 'magnata_save_v1';

export function newState(name, look) {
  const now = Date.now();
  return ensureLife({
    look: look || null,
    v: 1, name, created: now, last: now,
    cash: 1500, debt: 0, xp: 0,
    job: 'entregador', edu: [], course: null,
    biz: {}, port: {}, props: {}, goods: {},
    poup: 0, cdb: [], tes: [],
    cardMax: 0, peakNW: 1500, ach: {},
    stats: { earned: 0, trades: 0, tradeProfit: 0, bestTrade: 0, divs: 0, rents: 0, loans: 0 },
    friends: [], log: [],
  });
}

export function load() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && s.v === 1) { ensureLife(s); return s; }
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
export const levelMult = (s) => (1 + LEVEL_BONUS * (level(s) - 1)) * lifeMult(s);
// Felicidade: relacionamento (se o carinho estiver bom) + descanso pós-viagem
export function loveBonus(s) { return s.love && s.love.aff >= 30 ? LOVE_STAGES[s.love.stage].bonus : 0; }
export function restBonus(s) { return s.rested && s.rested > Date.now() ? REST_BONUS : 0; }
export const lifeMult = (s) => 1 + loveBonus(s) + restBonus(s);
export function vehicleBonus(s) {
  return [...GOODS.veiculos, ...GOODS.ceumar].filter((g) => s.goods[g.id]).reduce((m, g) => Math.max(m, g.bonus), 0);
}
export function homeOf(s) {
  const owned = GOODS.moradia.filter((g) => s.goods[g.id]);
  return owned.length ? owned[owned.length - 1] : null;
}
export const styleOf = (s) => Object.keys(s.wardrobe || {}).reduce((t, id) => t + (CLOTH[id] ? CLOTH[id].style : 0), 0);
export const tripPrestige = (s) => Object.keys(s.trips || {}).reduce((t, id) => { const tr = TRIPS.find((x) => x.id === id); return t + (tr ? Math.max(1, Math.round(Math.log10(tr.cost) ** 2 - 10)) : 0); }, 0);
export const prestige = (s) => ALL_GOODS.filter((g) => s.goods[g.id]).reduce((p, g) => p + g.prestige, 0) + styleOf(s) + tripPrestige(s) + (s.love && s.love.wedding ? (WEDDINGS.find((w) => w.id === s.love.wedding) || { prestige: 0 }).prestige : 0);
export function offlineHours(s) {
  const home = homeOf(s);
  return card(s).hours + (home ? home.hours : 0);
}

export function bizProfit(s, b, mk) {
  const lvl = s.biz[b.id] || 0;
  if (!lvl) return 0;
  return b.profit * lvl * bizMult(lvl) * SECTOR_MULT[mk.sectorNow(b.sector)] * levelMult(s) * buffMult(s, b.id);
}
export function buffMult(s, id) {
  const now = Date.now();
  return (s.buffs || []).filter((x) => x.until > now && (x.id === id || x.id === '*')).reduce((m, x) => m * x.mult, 1);
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
    if (h && h.q > 0) { const t = ownTier(ownPct(s, a.sym)); const d = ((a.div || 0) + (t ? t.extra : 0)) * (t ? t.mult : 1); if (d) divs += h.q * mk.price(a.sym) * d; }
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
  return v - s.debt - ccOwed(s);
}
export const sellRate = (g) => (g.cat === 'veiculos' || g.cat === 'ceumar' ? 0.6 : g.cat === 'moradia' ? 0.9 : 0.75);

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
  if (s.love) s.love.aff = Math.max(0, s.love.aff - 0.05 * days); // o carinho esfria se ninguém cuida
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

// ---------- Cartão de crédito como forma de pagamento ----------
export const FATURA_MS = 30 * DAY_MS; // a fatura fecha a cada 30 dias do jogo
export const PARCELAS = [1, 3, 6, 12];
function ensureCC(s) { if (!s.cc) s.cc = { fatura: 0, parcels: [], nextClose: Date.now() + FATURA_MS }; return s.cc; }
export function ccOwed(s) { const c = s.cc; return c ? c.fatura + c.parcels.reduce((t, p) => t + p.amt * p.left, 0) : 0; }
export function ccAvail(s) { return Math.max(0, card(s).limit - ccOwed(s) - s.debt); }
export function setPay(s, mode, parc) { s.payMode = mode; if (parc) s.parc = parc; }
// Compra de consumo: dinheiro (sem cashback) ou cartão (com cashback, à vista ou parcelado)
function shop(s, amount) {
  if (s.payMode === 'card') {
    const c = ensureCC(s);
    if (amount > ccAvail(s) + 1e-6) return 'Limite do cartão insuficiente';
    const n = s.parc || 1;
    if (n === 1) c.fatura += amount; else c.parcels.push({ amt: amount / n, left: n, n });
    s.cash += amount * card(s).cashback;
    s.stats.cardUse = (s.stats.cardUse || 0) + 1;
    return null;
  }
  return spend(s, amount);
}
// Fecha faturas vencidas: paga com o dinheiro; o que faltar vai para o rotativo (dívida com juros)
export function ccTick(s) {
  const c = s.cc; if (!c) return [];
  const out = []; let guard = 0;
  while (Date.now() >= c.nextClose && guard++ < 100) {
    let due = c.fatura; c.fatura = 0;
    c.parcels.forEach((p) => { due += p.amt; p.left--; });
    c.parcels = c.parcels.filter((p) => p.left > 0);
    c.nextClose += FATURA_MS;
    if (due <= 0.01) continue;
    const fromCash = Math.min(Math.max(0, s.cash), due);
    s.cash -= fromCash;
    const rest = due - fromCash;
    if (rest > 0.01) { s.debt += rest; out.push({ late: rest, due }); } else out.push({ paid: due });
  }
  return out;
}
export function payFaturaNow(s) {
  const c = s.cc; if (!c || c.fatura <= 0.01) return 'A fatura atual está zerada';
  const amt = Math.min(c.fatura, s.cash);
  if (amt <= 0) return 'Dinheiro insuficiente';
  s.cash -= amt; c.fatura -= amt;
  return null;
}

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
  const e = spend(s, cost); if (e) return e;
  const before = nextMilestone(lvl);
  s.biz[id] = lvl + n;
  addXP(s, (lvl === 0 ? 30 : 0) + 2 * n + (before && lvl + n >= before ? 20 : 0));
  return null;
}

export function ownPct(s, sym) {
  const a = ASSETS.find((x) => x.sym === sym);
  const h = s.port[sym];
  return a && a.shares && h ? h.q / a.shares : 0;
}
export function ownTier(pct) { let t = null; for (const x of OWN_TIERS) if (pct >= x.min - 1e-12) t = x; return t; }
export const controlled = (s) => ASSETS.filter((a) => a.shares && ownPct(s, a.sym) >= 0.51 - 1e-12).length;
export function trade(s, mk, sym, qty, side) {
  const a = ASSETS.find((x) => x.sym === sym);
  const price = mk.price(sym);
  const h = s.port[sym] || (s.port[sym] = { q: 0, cost: 0 });
  if (!(qty > 0)) return 'Quantidade inválida';
  if (side === 'buy') {
    if (a.shares && h.q + qty > a.shares + 1e-6) return `Só restam ${Math.floor(a.shares - h.q).toLocaleString('pt-BR')} ações à venda`;
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
  const e = shop(s, g.cost); if (e) return e;
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
  { id: 'empresa12', icon: '🌐', name: 'Império total', desc: 'Tenha todos os tipos de negócio', test: (s) => bizCount(s) >= BUSINESSES.length },
  { id: 'niveis100', icon: '⬆️', name: 'Expansão', desc: 'Some 100 níveis em empresas', test: (s) => bizLevels(s) >= 100 },
  { id: 'niveis500', icon: '🚀', name: 'Expansão agressiva', desc: 'Some 500 níveis em empresas', test: (s) => bizLevels(s) >= 500 },
  { id: 'acao1', icon: '📈', name: 'Investidor iniciante', desc: 'Compre sua primeira ação', test: (s) => s.stats.trades >= 1 },
  { id: 'lucro1', icon: '💹', name: 'Comprou barato, vendeu caro', desc: 'Lucre R$ 1 mil em uma única venda', test: (s) => s.stats.bestTrade >= 1000 },
  { id: 'lucro2', icon: '🐂', name: 'Lobo da Bolsa', desc: 'Lucre R$ 1 mi em uma única venda', test: (s) => s.stats.bestTrade >= 1e6 },
  { id: 'acionista10', icon: '🪑', name: 'Conselheiro', desc: 'Tenha 10% de uma empresa da bolsa', test: (s) => ASSETS.some((a) => a.shares && ownPct(s, a.sym) >= 0.1) },
  { id: 'controlador', icon: '👑', name: 'Dono da empresa', desc: 'Tenha 51% de uma empresa da bolsa', test: (s) => controlled(s) >= 1 },
  { id: 'controlador5', icon: '🏛️', name: 'Holding bilionária', desc: 'Controle 5 empresas da bolsa', test: (s) => controlled(s) >= 5 },
  { id: 'trader', icon: '🧾', name: 'Day trader', desc: 'Faça 100 operações', test: (s) => s.stats.trades >= 100 },
  { id: 'diversif', icon: '🧺', name: 'Não coloque os ovos na mesma cesta', desc: 'Tenha ações de 5 setores diferentes', test: (s) => sectorsHeld(s) >= 5 },
  { id: 'cripto', icon: '🪙', name: 'To the moon', desc: 'Compre uma criptomoeda', test: hasCrypto },
  { id: 'divs', icon: '💸', name: 'Vivendo de dividendos', desc: 'Receba R$ 100 mil em dividendos', test: (s) => s.stats.divs >= 1e5 },
  { id: 'reserva', icon: '🐷', name: 'Reserva de emergência', desc: 'Tenha R$ 50 mil na poupança', test: (s) => s.poup >= 5e4 },
  { id: 'tesouro', icon: '🏛️', name: 'Pensando no futuro', desc: 'Invista no Tesouro', test: (s) => s.tes.length > 0 },
  { id: 'imovel1', icon: '🔑', name: 'Senhorio', desc: 'Compre um imóvel para alugar', test: (s) => propCount(s) >= 1 },
  { id: 'imovel10', icon: '🏙️', name: 'Barão imobiliário', desc: 'Tenha 10 imóveis alugados', test: (s) => propCount(s) >= 10 },
  { id: 'carro', icon: '🚗', name: 'Habilitado', desc: 'Compre um carro', test: (s) => GOODS.veiculos.some((g) => s.goods[g.id] && !['pedala', 'trovao'].includes(g.brand)) },
  { id: 'casa', icon: '🏠', name: 'Adeus, aluguel', desc: 'Compre sua moradia', test: (s) => !!homeOf(s) },
  { id: 'mansao', icon: '🏰', name: 'Vida de rico', desc: 'Compre uma mansão', test: (s) => ['mansao', 'fazenda', 'mansaopraia', 'castelo', 'ilha', 'lua'].some((g) => s.goods[g]) },
  { id: 'jato', icon: '🛩️', name: 'Ponte aérea', desc: 'Compre um jatinho', test: (s) => !!s.goods.jato },
  { id: 'ilha', icon: '🏝️', name: 'Dono do paraíso', desc: 'Compre uma ilha particular', test: (s) => !!s.goods.ilha },
  { id: 'emprestimo', icon: '🏦', name: 'Alavancado', desc: 'Pegue um empréstimo', test: (s) => s.stats.loans >= 1 },
  { id: 'ceo', icon: '🏆', name: 'Topo da carreira', desc: 'Torne-se CEO', test: (s) => s.job === 'ceo' },
  { id: 'mil', icon: '💵', name: 'Primeiros mil', desc: 'Patrimônio de R$ 10 mil', test: (s) => s.peakNW >= 1e4 },
  { id: 'milhao', icon: '💰', name: 'Milionário', desc: 'Patrimônio de R$ 1 milhão', test: (s) => s.peakNW >= 1e6 },
  { id: 'bilhao', icon: '🤑', name: 'Bilionário', desc: 'Patrimônio de R$ 1 bilhão', test: (s) => s.peakNW >= 1e9 },
  { id: 'trilhao', icon: '👑', name: 'Trilionário', desc: 'Patrimônio de R$ 1 trilhão', test: (s) => s.peakNW >= 1e12 },
  { id: 'evento5', icon: '📨', name: 'Faro para negócios', desc: 'Aceite 5 oportunidades', test: (s) => (s.stats.events || 0) >= 5 },
  { id: 'evento25', icon: '🦊', name: 'Raposa dos negócios', desc: 'Aceite 25 oportunidades', test: (s) => (s.stats.events || 0) >= 25 },
  { id: 'amor1', icon: '💘', name: 'Primeiro encontro', desc: 'Saia com alguém', test: (s) => !!s.love && s.love.stage >= 1 },
  { id: 'amor2', icon: '💑', name: 'Namorando', desc: 'Comece um namoro', test: (s) => !!s.love && s.love.stage >= 2 },
  { id: 'casado', icon: '💒', name: 'Felizes para sempre', desc: 'Case-se', test: (s) => !!s.love && s.love.stage >= 4 },
  { id: 'viagem1', icon: '🧳', name: 'Pé na estrada', desc: 'Faça sua primeira viagem', test: (s) => tripsVisited(s) >= 1 },
  { id: 'viagem5', icon: '🗺️', name: 'Viajante', desc: 'Conheça 5 destinos', test: (s) => tripsVisited(s) >= 5 },
  { id: 'passaporte', icon: '🛂', name: 'Passaporte lotado', desc: 'Conheça todos os destinos', test: (s) => tripsVisited(s) >= TRIPS.length },
  { id: 'estilo1', icon: '👗', name: 'Estiloso', desc: 'Tenha 100 de estilo', test: (s) => styleOf(s) >= 100 },
  { id: 'estilo2', icon: '🕴️', name: 'Ícone da moda', desc: 'Tenha 1.000 de estilo', test: (s) => styleOf(s) >= 1000 },
  { id: 'viagem20', icon: '🌎', name: 'Cidadão do mundo', desc: 'Conheça 20 destinos', test: (s) => tripsVisited(s) >= 20 },
  { id: 'cassino1', icon: '🎰', name: 'Apostador', desc: 'Jogue no cassino', test: (s) => !!s.casino && s.casino.n >= 1 },
  { id: 'jackpot', icon: '7️⃣', name: 'JACKPOT!', desc: 'Tire 7️⃣7️⃣7️⃣ no caça-níquel', test: (s) => !!s.casino && !!s.casino.jackpot },
  { id: 'sortudo', icon: '🍀', name: 'Sortudo', desc: 'Ganhe 30x a aposta numa jogada', test: (s) => !!s.casino && s.casino.bestMult >= 30 },
  { id: 'cartao1', icon: '💳', name: 'Passa no crédito', desc: 'Faça uma compra no cartão', test: (s) => (s.stats.cardUse || 0) >= 1 },
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

// ---------- Oportunidades e imprevistos (acontecimentos da vida) ----------
// Cada acontecimento vira um objeto simples (salvo no save) com os efeitos de aceitar (yes) e recusar/ignorar (no).
// Efeitos: cash (+ganho), pay (custo obrigatório), buff {id, mult, mins}, pending {amt, mins, p, label}, aff, xp, good, rest, chance {p, win, lose}, msg
const MIN = 60_000;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const ownedBiz = (s) => BUSINESSES.filter((b) => s.biz[b.id]);
const hasVeh = (s) => [...GOODS.veiculos].some((g) => s.goods[g.id] && g.id !== 'bike' && g.id !== 'patinete');
const R = (x) => Math.max(1, Math.round(x));

function eventPool(s, mk) {
  const ib = incomeBreakdown(s, mk);
  const net = Math.max(60, ib.net);
  const day = net;               // "um dia" de renda
  const cash = Math.max(0, s.cash);
  const owned = ownedBiz(s);
  const b = owned.length ? pick(owned) : null;
  const bp = b ? bizProfit(s, b, mk) : 0;
  const L = s.love;
  const job = JOBS.find((j) => j.id === s.job);
  const E = [];
  const add = (w, ev) => E.push({ w, ev });

  // ===== Boas notícias (só receber) =====
  add(3, { k: 'heranca', icon: '🎁', title: 'Herança inesperada', text: 'Um tio-avô distante deixou uma herança para você!', gain: R(day * 25), yes: 'Receber', fx: { cash: R(day * 25) } });
  add(4, { k: 'rua', icon: '💵', title: 'Achou dinheiro na rua', text: 'Você encontrou umas notas dobradas na calçada. Ninguém por perto…', gain: R(day * 2), yes: 'Guardar', fx: { cash: R(day * 2) } });
  add(3, { k: 'restituicao', icon: '🧾', title: 'Restituição do imposto', text: 'A Receita liberou sua restituição do imposto de renda!', gain: R(day * 8), yes: 'Receber', fx: { cash: R(day * 8) } });
  add(3, { k: 'bonus', icon: '🏅', title: 'Bônus no trabalho', text: `Seu chefe gostou do seu trabalho como ${job.name} e liberou um bônus!`, gain: R(salary(s) * 10), yes: 'Uhuu!', fx: { cash: R(salary(s) * 10), xp: 10 } });
  add(2, { k: 'bolao', icon: '🎱', title: 'Bolão do trabalho', text: 'O bolão da firma acertou a quina! Sua parte chegou.', gain: R(day * 15), yes: 'Receber', fx: { cash: R(day * 15) } });
  add(3, { k: 'brecho', icon: '📦', title: 'Desapego', text: 'Você vendeu umas coisas velhas que estavam encostadas.', gain: R(day * 3), yes: 'Vender tudo', fx: { cash: R(day * 3) } });
  add(2, { k: 'concurso', icon: '🍰', title: 'Campeão de culinária', text: 'Seu bolo ganhou o concurso do bairro!', gain: R(day * 4), yes: 'Pegar o prêmio', fx: { cash: R(day * 4), xp: 15 } });
  add(2, { k: 'sorteio', icon: '🛒', title: 'Sorteio do mercado', text: 'Sua nota fiscal foi sorteada na promoção do supermercado!', gain: R(day * 6), yes: 'Receber', fx: { cash: R(day * 6) } });
  add(2, { k: 'indenizacao', icon: '⚖️', title: 'Ganhou o processo', text: 'Aquela empresa que te cobrou errado perdeu na justiça e vai te indenizar.', gain: R(day * 12), yes: 'Receber', fx: { cash: R(day * 12) } });
  if (owned.length) add(3, { k: 'viral', icon: '📲', title: 'Viralizou!', text: 'Um vídeo sobre seus negócios viralizou! Todos lucram +50% por 30 min.', yes: 'Aproveitar', fx: { buff: { id: '*', mult: 1.5, mins: 30 } } });
  if (b) add(2, { k: 'vip', icon: '🤵', title: 'Cliente VIP', text: `Um cliente milionário fez uma encomenda enorme na sua ${b.name}.`, gain: R(bp * 40), yes: 'Atender', fx: { cash: R(bp * 40), xp: 10 } });

  // ===== Imprevistos (pagar) =====
  add(3, { k: 'dentista', icon: '🦷', title: 'Dor de dente', text: 'Acordou com dor de dente. Não tem jeito: dentista!', pay: R(day * 3), yes: 'Pagar', fx: {} });
  add(3, { k: 'celular', icon: '📱', title: 'Celular quebrou', text: 'O celular caiu de cara no chão. Tela trincada!', pay: R(day * 4), yes: 'Consertar', fx: {} });
  add(2, { k: 'geladeira', icon: '🧊', title: 'Geladeira pifou', text: 'A geladeira parou de gelar bem no calor.', pay: R(day * 6), yes: 'Comprar outra', fx: {} });
  add(2, { k: 'aniversario', icon: '🎂', title: 'Aniversário de amigo', text: 'É aniversário do seu melhor amigo. Vai dar presente, né?', pay: R(day * 2), yes: 'Dar presente', no: 'Esquecer…', fx: { xp: 5 }, nofx: { msg: '😅 Seu amigo ficou chateado…' } });
  add(2, { k: 'casamentoamigo', icon: '💒', title: 'Casamento de amigo', text: 'Você foi convidado(a) para ser padrinho/madrinha! Terno, presente e festa…', pay: R(day * 8), yes: 'Ir ao casamento', no: 'Dar uma desculpa', fx: { xp: 15, rest: 60 }, nofx: { msg: '😬 Pegou mal faltar…' } });
  if (hasVeh(s)) {
    add(3, { k: 'multa', icon: '🚓', title: 'Multa de trânsito', text: 'Chegou uma multa por excesso de velocidade. Pagar com desconto agora?', pay: R(day * 3), yes: 'Pagar com desconto', no: 'Pagar depois', fx: {}, nofx: { pay: R(day * 5), msg: '🚓 Pagou a multa cheia.' } });
    add(2, { k: 'pneu', icon: '🛞', title: 'Pneu furado', text: 'Furou o pneu no meio do caminho. Guincho e borracharia!', pay: R(day * 2), yes: 'Pagar', fx: {} });
    add(2, { k: 'granizo', icon: '🌨️', title: 'Chuva de granizo', text: 'Uma chuva de granizo amassou seu carro todo.', pay: R(day * 7), yes: 'Funilaria', fx: {} });
  }
  if (homeOf(s)) {
    add(3, { k: 'vazamento', icon: '🚿', title: 'Vazamento em casa', text: 'Um cano estourou e alagou a cozinha!', pay: R(day * 5), yes: 'Chamar encanador', fx: {} });
    add(2, { k: 'iptu', icon: '🏛️', title: 'IPTU chegou', text: 'Chegou o carnê do IPTU da sua casa.', pay: R(day * 6), yes: 'Pagar', fx: {} });
  } else {
    add(2, { k: 'reajuste', icon: '📈', title: 'Aluguel reajustado', text: 'O dono do quarto que você aluga cobrou um reajuste atrasado.', pay: R(day * 3), yes: 'Pagar', fx: {} });
  }

  // ===== Escolhas de risco =====
  if (b) {
    add(3, { k: 'influ', icon: '🤳', title: 'Influenciador famoso', text: `Um influenciador quer divulgar sua ${b.name}. O lucro dela dobra por 30 min.`, cost: R(bp * 15), yes: 'Fechar parceria', no: 'Dispensar', fx: { buff: { id: b.id, mult: 2, mins: 30 }, xp: 10 } });
    add(3, { k: 'reparo', icon: '🔧', title: 'Equipamento quebrado', text: `A ${b.name} quebrou um equipamento! Sem conserto, o lucro dela cai pela metade por 1 hora.`, cost: R(bp * 8), yes: 'Consertar', no: 'Deixar quebrado', fx: { msg: '🔧 Consertado!' }, nofx: { buff: { id: b.id, mult: 0.5, mins: 60 }, msg: '😬 Lucro do negócio pela metade por 1h.' } });
    add(2, { k: 'fiscal', icon: '🕵️‍♂️', title: 'Fiscalização surpresa', text: `A vigilância apareceu na ${b.name}. Pagar a taxa de regularização agora ou arriscar a interdição (50% de chance de fechar por 40 min)?`, cost: R(bp * 6), yes: 'Regularizar', no: 'Arriscar', fx: {}, nofx: { chance: { p: 0.5, win: { msg: '😅 Ufa, passou na fiscalização!' }, lose: { buff: { id: b.id, mult: 0, mins: 40 }, msg: '🚫 Negócio interditado por 40 min!' } } } });
    add(2, { k: 'greve', icon: '🪧', title: 'Funcionários insatisfeitos', text: `Os funcionários da ${b.name} pedem aumento. Sem acordo, a produção cai 40% por 1h.`, cost: R(bp * 10), yes: 'Dar aumento', no: 'Negar', fx: { buff: { id: b.id, mult: 1.15, mins: 60 }, msg: '🤝 Equipe motivada: +15% por 1h!' }, nofx: { buff: { id: b.id, mult: 0.6, mins: 60 }, msg: '🪧 Greve! Produção -40% por 1h.' } });
    add(2, { k: 'apagao', icon: '🔌', title: 'Apagão na cidade', text: 'Um apagão vai derrubar o movimento dos seus negócios por 30 min. Alugar um gerador?', cost: R(ib.biz * 5), yes: 'Alugar gerador', no: 'Esperar a luz voltar', fx: { msg: '🔌 Gerador ligado, tudo funcionando!' }, nofx: { buff: { id: '*', mult: 0.6, mins: 30 }, msg: '🕯️ Negócios a 60% por 30 min.' } });
    if (owned.length >= 2) add(2, { k: 'feira', icon: '🎪', title: 'Feira de negócios', text: 'Montar um estande na feira da cidade aumenta o lucro de TODOS os seus negócios em 25% por 40 min.', cost: R(ib.biz * 12), yes: 'Montar estande', no: 'Não ir', fx: { buff: { id: '*', mult: 1.25, mins: 40 } } });
  }
  if (cash > 2000) {
    add(3, { k: 'estoque', icon: '📦', title: 'Queima de estoque', text: 'Um atacadista em apuros vende mercadoria baratíssima. Revendendo, você recebe <b>+40%</b> em 20 minutos. Garantido!', cost: R(cash * 0.08), yes: 'Comprar lote', no: 'Passar', fx: { pending: { mult: 1.4, mins: 20, p: 1, label: 'Venda do estoque' } } });
    add(2, { k: 'amigo', icon: '🙋', title: 'Amigo pedindo ajuda', text: 'Um amigo pede um empréstimo e promete devolver <b>o dobro</b> em 1 hora. Ele é meio enrolado… (65% de chance).', cost: R(cash * 0.1), yes: 'Emprestar', no: 'Recusar', fx: { pending: { mult: 2, mins: 60, p: 0.65, label: 'Seu amigo' } } });
    add(2, { k: 'startup', icon: '🦄', title: 'Startup de um conhecido', text: 'Um conhecido quer investidores para um app. 25% de chance de virar <b>6x</b> em 1 hora — ou perder tudo.', cost: R(cash * 0.06), yes: 'Investir', no: 'Não confio', fx: { pending: { mult: 6, mins: 60, p: 0.25, label: 'A startup' } } });
    add(2, { k: 'terreno', icon: '🌾', title: 'Terreno barato', text: 'Um terreno na beira da estrada está à venda por um preço ótimo. Em 1h ele deve valorizar <b>60%</b> (80% de chance).', cost: R(cash * 0.12), yes: 'Comprar terreno', no: 'Deixar pra lá', fx: { pending: { mult: 1.6, mins: 60, p: 0.8, label: 'A venda do terreno' } } });
    add(2, { k: 'leilao', icon: '🔨', title: 'Leilão da Receita', text: 'Lotes de mercadoria apreendida estão sendo leiloados. 50% de chance de revender por <b>2,2x</b> em 30 min.', cost: R(cash * 0.05), yes: 'Dar lance', no: 'Ignorar', fx: { pending: { mult: 2.2, mins: 30, p: 0.5, label: 'O lote do leilão' } } });
    add(1, { k: 'golpe', icon: '📞', title: 'Ligação suspeita', text: '"Parabéns, você ganhou um carro! Só precisa pagar a taxa de liberação…"', cost: R(cash * 0.04), yes: 'Pagar a taxa', no: 'Desligar na cara', fx: { msg: '🤦 Era golpe! O dinheiro sumiu.' }, nofx: { xp: 15, msg: '😎 Esperto! Era golpe.' } });
    add(2, { k: 'loteria', icon: '🎟️', title: 'Bilhete de rifa', text: 'Um vendedor de rua oferece um bilhete de rifa. 10% de chance de ganhar <b>8x</b> o valor.', cost: R(Math.max(100, cash * 0.02)), yes: 'Comprar bilhete', no: 'Ignorar', fx: { chance: { p: 0.1, win: { cashMult: 8, msg: '🎉 Ganhou a rifa: 8x!' }, lose: { msg: '🎟️ Não foi dessa vez…' } } } });
    add(1, { k: 'caridade', icon: '🤲', title: 'Campanha de caridade', text: 'Um hospital infantil está arrecadando doações. Ajudar faz bem: +XP e +10% de renda por 1h (de tão feliz).', cost: R(cash * 0.03), yes: 'Doar', no: 'Agora não', fx: { xp: 40, rest: 60, msg: '💛 Que gesto bonito!' } });
    add(1, { k: 'cursorapido', icon: '🧠', title: 'Palestra de sucesso', text: 'Uma palestra famosa sobre negócios na cidade. Dá bastante experiência!', cost: R(day * 4), yes: 'Ir à palestra', no: 'Ficar em casa', fx: { xp: 80 } });
  }
  if (level(s) >= UNLOCKS.bolsa && cash > 5000) {
    const si = Math.floor(Math.random() * (SECTORS.length - 1));
    const nextB = Math.floor(mk.t / BLOCK) + 1;
    let r = regime(si, nextB);
    if (Math.random() > 0.9) r = pick([-1, 0, 1].filter((x) => x !== r));
    if (r !== 0) add(3, { k: 'dica', icon: '🕵️', title: 'Dica quente', text: 'Um analista misterioso vende uma dica sobre a <b>próxima hora</b> da bolsa. Ele quase nunca erra…', cost: R(cash * 0.03), tip: `${SECTORS[si].icon} ${SECTORS[si].name} vai entrar em ${r > 0 ? '🔥 ALTA' : '❄️ QUEDA'} na próxima hora!`, yes: 'Comprar dica', no: 'Não, obrigado', fx: { tip: true } });
  }

  // ===== Vida amorosa =====
  if (L) {
    add(2, { k: 'aniv_par', icon: '🎉', title: `Aniversário de ${L.partner.name}`, text: `Hoje é aniversário de ${L.partner.name}! Uma festa surpresa ia fazer sucesso…`, cost: R(day * 5), yes: 'Fazer festa surpresa', no: 'Só dar parabéns', fx: { aff: 25, msg: '🥳 Amou a surpresa!' }, nofx: { aff: -15, msg: '😒 Esperava mais…' } });
    add(2, { k: 'briga', icon: '😤', title: 'Briguinha de casal', text: `Vocês discutiram por uma bobagem. Um jantar para fazer as pazes?`, cost: R(day * 2), yes: 'Pedir desculpas com jantar', no: 'Deixar esfriar', fx: { aff: 8, msg: '🥰 Fizeram as pazes!' }, nofx: { aff: -12, msg: '💔 Clima ficou pesado…' } });
    add(1, { k: 'sogra', icon: '👵', title: 'Visita da sogra', text: `A família de ${L.partner.name} vem passar o fim de semana. Capricha no almoço?`, cost: R(day * 3), yes: 'Caprichar', no: 'Pedir pizza', fx: { aff: 12, msg: '😋 Todos amaram o almoço!' }, nofx: { aff: -5 } });
  } else {
    add(1, { k: 'crush', icon: '💘', title: 'Alguém de olho em você', text: 'Parece que tem alguém interessado em você… Vá em 👤 Vida → ❤️ Amor e procure!', gain: 0, yes: 'Ficar curioso', fx: { xp: 5 } });
  }
  return E;
}

export function makeEvent(s, mk) {
  const pool = eventPool(s, mk).filter((x) => !s.lastEventK || x.ev.k !== s.lastEventK);
  if (!pool.length) return null;
  let r = Math.random() * pool.reduce((t, x) => t + x.w, 0);
  let e = pool[0].ev;
  for (const x of pool) { r -= x.w; if (r < 0) { e = x.ev; break; } }
  s.lastEventK = e.k;
  return { ...e, exp: Date.now() + 12 * MIN };
}

// Aplica uma lista de efeitos. stake = valor pago (para pendências e prêmios proporcionais)
function applyFx(s, fx, stake = 0) {
  if (!fx) return {};
  const now = Date.now();
  const out = { msg: fx.msg };
  if (fx.chance) { const sub = Math.random() < fx.chance.p ? fx.chance.win : fx.chance.lose; const r = applyFx(s, sub, stake); return { ...out, ...r, msg: r.msg || out.msg, win: sub === fx.chance.win && !!sub.cashMult }; }
  if (fx.cash) { s.cash += fx.cash; out.gain = fx.cash; }
  if (fx.cashMult) { s.cash += stake * fx.cashMult; out.gain = stake * fx.cashMult; }
  if (fx.pay) payForced(s, fx.pay);
  if (fx.buff) { s.buffs = (s.buffs || []).filter((x) => x.until > now); s.buffs.push({ id: fx.buff.id, mult: fx.buff.mult, until: now + fx.buff.mins * MIN }); }
  if (fx.pending) { s.pending = s.pending || []; s.pending.push({ amt: stake * fx.pending.mult, at: now + fx.pending.mins * MIN, p: fx.pending.p, label: fx.pending.label }); if (!out.msg) out.msg = `⏳ Resultado em ${fx.pending.mins} min…`; }
  if (fx.aff && s.love) s.love.aff = Math.max(0, Math.min(100, s.love.aff + fx.aff));
  if (fx.xp) addXP(s, fx.xp);
  if (fx.rest) s.rested = Math.max(s.rested || 0, now) + fx.rest * MIN;
  if (fx.tip) out.tip = true;
  return out;
}
// Despesa obrigatória: se faltar dinheiro, o resto vai para a dívida do cartão
function payForced(s, amt) {
  const fromCash = Math.min(Math.max(0, s.cash), amt);
  s.cash -= fromCash;
  if (amt > fromCash) s.debt += amt - fromCash;
}

// Aceitar (yes=true) ou recusar o evento atual. Retorna mensagem/objeto
export function answerEvent(s, yes) {
  const e = s.event;
  if (!e) return 'Nada para responder';
  if (!yes) { s.event = null; return applyFx(s, e.nofx); }
  if (e.cost) { const err = spend(s, e.cost); if (err) return err; }
  if (e.pay) payForced(s, e.pay);
  s.event = null;
  s.stats.events = (s.stats.events || 0) + 1;
  addXP(s, 10);
  const r = applyFx(s, e.fx, e.cost || 0);
  if (e.tip) { r.msg = '🕵️ ' + e.tip; r.tip = true; }
  if (!r.msg) r.msg = e.pay ? '💸 Pago.' : e.gain ? '💰 Recebido!' : '✅ Feito!';
  return r;
}

// Chamado no loop: cria eventos, expira e paga pendências. Retorna lista de mensagens
export function eventTick(s, mk) {
  const now = Date.now();
  const out = [];
  if (s.event && now > s.event.exp) {
    const e = s.event;
    s.event = null;
    if (e.pay && !e.no) { payForced(s, e.pay); out.push(`💸 ${e.title}: pago automaticamente.`); }
    else if (e.nofx) { const r = applyFx(s, e.nofx); if (r.msg) out.push(r.msg); }
  }
  if (!s.event && now > (s.nextEvent || 0)) {
    if (s.nextEvent) { s.event = makeEvent(s, mk); if (s.event) out.push({ newEvent: true }); }
    s.nextEvent = now + (6 + Math.random() * 8) * MIN;
  }
  if (s.pending && s.pending.length) {
    s.pending = s.pending.filter((p) => {
      if (now < p.at) return true;
      if (Math.random() < p.p) { s.cash += p.amt; out.push({ pay: p.amt, label: p.label }); }
      else out.push({ fail: p.label });
      return false;
    });
  }
  return out;
}

// ---------- Vida: visual, guarda-roupa, viagens e amor ----------
export function ensureLife(s) {
  s.wardrobe = s.wardrobe || {};
  for (const c of CLOTHES) if (c.cost === 0) s.wardrobe[c.id] = 1;
  s.trips = s.trips || {};
  if (s.love === undefined) s.love = null;
  return s;
}
export function setLook(s, patch) {
  s.look = { ...(s.look || defaultLook()), ...patch };
  return null;
}
export function buyCloth(s, id) {
  const c = CLOTH[id];
  if (!c) return 'Item inválido';
  if (!s.wardrobe[id]) {
    const e = shop(s, c.cost); if (e) return e;
    s.wardrobe[id] = Date.now();
    addXP(s, 5 + Math.min(80, c.style));
  }
  s.look = s.look || defaultLook();
  s.look[c.slot] = id;
  return null;
}
export function buySet(s, st) {
  const ids = Object.values(st.pieces).filter((id) => id && !s.wardrobe[id]);
  const cost = ids.reduce((t, id) => t + CLOTH[id].cost, 0);
  if (cost) { const e = shop(s, cost); if (e) return e; }
  ids.forEach((id) => { s.wardrobe[id] = Date.now(); });
  if (ids.length) addXP(s, 10 + Math.min(120, ids.reduce((t, id) => t + CLOTH[id].style, 0)));
  s.look = { ...(s.look || defaultLook()), ...st.pieces };
  return null;
}
export function takeOff(s, slot) {
  const def = { top: 't_branca', bottom: 'b_jeans', shoes: 's_tenis' };
  s.look[slot] = def[slot] || null;
  return null;
}

export function startTrip(s, id, withPartner) {
  const t = TRIPS.find((x) => x.id === id);
  if (s.trip) return 'Você já está viajando!';
  if (withPartner && !s.love) return 'Você não tem companhia';
  const e = shop(s, t.cost * (withPartner ? 2 : 1)); if (e) return e;
  s.trip = { id, start: Date.now(), end: Date.now() + t.days * 60_000, partner: !!withPartner };
  return null;
}
export function checkTrip(s) {
  if (!s.trip || Date.now() < s.trip.end) return null;
  const t = TRIPS.find((x) => x.id === s.trip.id);
  const first = !s.trips[t.id];
  s.trips[t.id] = (s.trips[t.id] || 0) + 1;
  s.rested = Date.now() + REST_HOURS * 3600_000;
  addXP(s, (first ? 40 : 10) + Math.round(Math.log10(t.cost) * 6));
  if (s.trip.partner && s.love) s.love.aff = Math.min(100, s.love.aff + 25);
  const r = { trip: t, first, partner: s.trip.partner };
  s.trip = null;
  return r;
}

// Amor
export function findCandidate(s, pref) {
  const sex = pref === 'a' ? (Math.random() < 0.5 ? 'f' : 'm') : pref;
  const names = sex === 'f' ? NAMES_F : NAMES_M;
  s.lovePref = pref;
  s.candidate = { name: names[Math.floor(Math.random() * names.length)], sex, look: randomLook(sex), compat: 55 + Math.floor(Math.random() * 45) };
  return null;
}
export function askOut(s) {
  const c = s.candidate;
  if (!c) return 'Procure alguém primeiro';
  if (s.love) return 'Você já tem alguém!';
  const d = DATES[0];
  const e = shop(s, d.cost); if (e) return e;
  if (Math.random() * 100 > c.compat) { s.candidate = null; return { refused: c.name }; }
  s.love = { partner: { name: c.name, sex: c.sex, look: c.look }, stage: 0, aff: 15, since: Date.now(), lastDate: d.id, act: { id: d.id, end: Date.now() + d.mins * 60_000, aff: d.aff } };
  s.candidate = null;
  return null;
}
export function doDate(s, id) {
  const L = s.love; if (!L) return 'Você não tem companhia';
  if (L.act) return 'Vocês já estão num programa juntos';
  const d = DATES.find((x) => x.id === id);
  const e = shop(s, d.cost); if (e) return e;
  const aff = d.aff * (L.lastDate === id ? REPEAT_PENALTY : 1);
  L.lastDate = id;
  L.act = { id, end: Date.now() + d.mins * 60_000, aff };
  return null;
}
export function giveGift(s, id) {
  const L = s.love; if (!L) return 'Você não tem companhia';
  const g = GIFTS.find((x) => x.id === id);
  L.cd = L.cd || {};
  if ((L.cd[id] || 0) > Date.now()) return 'Você deu esse presente há pouco tempo… espere um pouco 😉';
  const e = shop(s, g.cost); if (e) return e;
  L.cd[id] = Date.now() + g.cd * 60_000;
  L.aff = Math.min(100, L.aff + g.aff);
  addXP(s, 3);
  return null;
}
export function nextStep(s) {
  const L = s.love; if (!L || L.act) return 'Agora não dá';
  if (L.stage === 1) { if (L.aff < 40) return 'Precisa de pelo menos 40 de carinho ❤️'; L.stage = 2; addXP(s, 60); return null; }
  if (L.stage === 2) {
    if (L.aff < 60) return 'Precisa de pelo menos 60 de carinho ❤️';
    const e = shop(s, RING_COST); if (e) return e;
    L.stage = 3; addXP(s, 100); return null;
  }
  return 'Nada a fazer agora';
}
export function marry(s, id) {
  const L = s.love; if (!L || L.stage !== 3 || L.act) return 'Agora não dá';
  if (L.aff < 75) return 'Precisa de pelo menos 75 de carinho ❤️';
  const w = WEDDINGS.find((x) => x.id === id);
  const e = shop(s, w.cost); if (e) return e;
  L.act = { id: 'wedding', wedding: id, end: Date.now() + w.mins * 60_000, aff: 30 };
  return null;
}
export function breakUp(s) {
  if (!s.love) return null;
  const married = s.love.stage === 4;
  if (married) s.cash -= Math.max(0, s.cash) * 0.25; // divórcio custa caro
  s.love = null;
  return null;
}
export function checkLove(s) {
  const L = s.love; if (!L) return null;
  if (L.aff <= 0 && !L.act) {
    const name = L.partner.name;
    s.love = null;
    return { broke: name };
  }
  if (L.act && Date.now() >= L.act.end) {
    const a = L.act; L.act = null;
    L.aff = Math.min(100, L.aff + a.aff);
    addXP(s, 8);
    if (a.id === 'wedding') { L.stage = 4; L.wedding = a.wedding; L.married = Date.now(); addXP(s, 200); return { wedding: true }; }
    if (L.stage === 0) { L.stage = 1; return { firstDate: true }; }
    return { date: a.id };
  }
  return null;
}

export const tripsVisited = (s) => TRIPS.filter((t) => (s.trips || {})[t.id]).length;

// ---------- Cassino (a casa sempre leva vantagem) ----------
export const SLOT_SYMS = ['🍒', '🍋', '🍇', '🔔', '⭐', '💎', '7️⃣'];
const SLOT_W = [30, 25, 20, 12, 8, 4, 1];
export const SLOT_PAY = [6, 10, 16, 26, 52, 130, 700]; // 3 iguais; 2 cerejas = 2x  (retorno ~90%)
const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
export const isRed = (n) => RED.has(n);
function bet(s, amt) {
  amt = Math.floor(amt);
  if (!(amt >= 1)) return 'Aposta inválida';
  if (amt > s.cash) return 'Dinheiro insuficiente';
  s.cash -= amt;
  s.casino = s.casino || { bet: 0, won: 0, n: 0, bestMult: 0 };
  s.casino.bet += amt; s.casino.n++;
  return null;
}
// O prêmio é creditado depois da animação
export function payout(s, amt, mult) {
  if (amt > 0) { s.cash += amt; s.casino.won += amt; s.casino.bestMult = Math.max(s.casino.bestMult || 0, mult); }
}
function wpick() { let r = Math.random() * 100; for (let i = 0; i < SLOT_W.length; i++) { r -= SLOT_W[i]; if (r < 0) return i; } return 0; }
export function playSlots(s, amt) {
  const e = bet(s, amt); if (e) return e;
  const r = [wpick(), wpick(), wpick()];
  let mult = 0;
  if (r[0] === r[1] && r[1] === r[2]) mult = SLOT_PAY[r[0]];
  else if (r.filter((x) => x === 0).length === 2) mult = 2;
  if (mult === 700) s.casino.jackpot = Date.now();
  return { reels: r, mult, win: Math.floor(amt) * mult };
}
export const ROULETTE_BETS = [
  { id: 'red', name: '🔴 Vermelho', pay: 2, test: (n) => isRed(n) },
  { id: 'black', name: '⚫ Preto', pay: 2, test: (n) => n > 0 && !isRed(n) },
  { id: 'even', name: 'Par', pay: 2, test: (n) => n > 0 && n % 2 === 0 },
  { id: 'odd', name: 'Ímpar', pay: 2, test: (n) => n % 2 === 1 },
  { id: 'low', name: '1 a 18', pay: 2, test: (n) => n >= 1 && n <= 18 },
  { id: 'high', name: '19 a 36', pay: 2, test: (n) => n >= 19 },
  { id: 'num', name: 'Número exato', pay: 36, test: null },
];
export function playRoulette(s, amt, kind, num) {
  const b = ROULETTE_BETS.find((x) => x.id === kind);
  if (!b) return 'Escolha uma aposta';
  if (kind === 'num' && !(num >= 0 && num <= 36)) return 'Escolha um número de 0 a 36';
  const e = bet(s, amt); if (e) return e;
  const n = Math.floor(Math.random() * 37);
  const ok = kind === 'num' ? n === num : b.test(n);
  return { n, mult: ok ? b.pay : 0, win: ok ? Math.floor(amt) * b.pay : 0 };
}
const SCRATCH = [[0.001, 100], [0.009, 10], [0.04, 5], [0.10, 2], [0.25, 1]];
export function playScratch(s, amt) {
  const e = bet(s, amt); if (e) return e;
  let r = Math.random(), mult = 0;
  for (const [p, m] of SCRATCH) { if (r < p) { mult = m; break; } r -= p; }
  return { mult, win: Math.floor(amt) * mult };
}
