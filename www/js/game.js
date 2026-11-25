// ===== Estado do jogador, economia e ações =====
import { regime, BLOCK, EPOCH } from './market.js';
import { CLOTH, CLOTHES, defaultLook, randomLook, LEGEND, LEGEND_COST } from './avatar.js';
import {
  DAY_MS, BUSINESSES, BIZ_GROWTH, BIZ_MILESTONES, COURSES, JOBS, PROPERTIES, GOODS, GOOD, ALL_GOODS,
  CARDS, LEVEL_BONUS, TRADE_FEE, LOAN_RATE, RENT_NO_HOME, ASSETS, CRYPTOS, UNLOCKS, SECTORS,
  SEGMENTS, SEGMENT, STAFF, PRODUCT_TIERS,
  OWN_TIERS, TRIPS, REST_BONUS, REST_HOURS, LOVE_STAGES, DATES, GIFTS, REPEAT_PENALTY, RING_COST, WEDDINGS, NAMES_F, NAMES_M,
} from './data.js';

const SAVE_KEY = 'magnata_save_v1';

// Sorteia um emprego de entrada (sem estudo) de qualquer área
export const STARTER_JOBS = JOBS.filter((j) => !j.edu.length && j.lvl <= 1);
export const starterJob = () => STARTER_JOBS[Math.floor(Math.random() * STARTER_JOBS.length)].id;
export function newState(name, look) {
  const now = Date.now();
  const st = newStateBase(name, look, now);
  st.job = st.startJob = starterJob();
  return st;
}
function newStateBase(name, look, now) {
  return ensureLife({
    look: look || null,
    v: 1, name, created: now, last: now,
    cash: 1500, debt: 0, xp: 0,
    job: null, edu: [], course: null,
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
  // s.last só muda quando a renda é calculada (no loop ou ao voltar), nunca ao salvar
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
export const levelMult = (s) => (1 + LEVEL_BONUS * (level(s) - 1)) * lifeMult(s) * legacyMult(s) * bankruptMult(s);
// Felicidade: relacionamento (se o carinho estiver bom) + descanso pós-viagem
export function loveBonus(s) { return s.love && s.love.aff >= 30 ? LOVE_STAGES[s.love.stage].bonus : 0; }
export function restBonus(s) { return s.rested && s.rested > Date.now() ? REST_BONUS : 0; }
export const lifeMult = (s) => 1 + loveBonus(s) + restBonus(s);
export function vehicleBonus(s) {
  return [...GOODS.veiculos, ...GOODS.ceumar].filter((g) => s.goods[g.id]).concat(pgoods(s).filter((g) => g.bonus)).reduce((m, g) => Math.max(m, g.bonus), 0);
}
// Skin lendária vestida dá bônus no salário
export const legendBonus = (s) => (s.look && s.look.lend && (s.legends || {})[s.look.lend] && LEGEND[s.look.lend] ? LEGEND[s.look.lend].bonus : 0);
export function buyLegend(s, id) {
  const l = LEGEND[id]; if (!l) return 'Skin inválida';
  s.legends = s.legends || {};
  if (!s.legends[id]) {
    const e = shop(s, LEGEND_COST); if (e) return e;
    s.legends[id] = Date.now();
    addXP(s, 120);
  }
  s.look = s.look || defaultLook();
  s.look.lend = id;
  return null;
}
export function takeOffLegend(s) { if (s.look) s.look.lend = null; return null; }
export function homeOf(s) {
  const owned = GOODS.moradia.filter((g) => s.goods[g.id]).concat(pgoods(s).filter((g) => g.cat === 'moradia')).sort((a, b) => a.cost - b.cost);
  return owned.length ? owned[owned.length - 1] : null;
}
export const styleOf = (s) => Object.keys(s.wardrobe || {}).reduce((t, id) => t + (CLOTH[id] ? CLOTH[id].style : 0), 0) + Object.keys(s.legends || {}).length * 300;
export const tripPrestige = (s) => Object.keys(s.trips || {}).reduce((t, id) => { const tr = TRIPS.find((x) => x.id === id); return t + (tr ? Math.max(1, Math.round(Math.log10(tr.cost) ** 2 - 10)) : 0); }, 0);
export const hasPhone = (s) => !!(s.goods.celular || s.goods.celular0);
// ===== Status social (vem do prestígio) =====
export const STATUS = [
  { min: 0, name: 'Anônimo', icon: '👤', biz: 0, disc: 0 },
  { min: 50, name: 'Conhecido', icon: '🙂', biz: 0.03, disc: 0 },
  { min: 250, name: 'Influente', icon: '📣', biz: 0.06, disc: 0.05 },
  { min: 1000, name: 'Celebridade', icon: '🌟', biz: 0.10, disc: 0.08, luck: true },
  { min: 5000, name: 'Lenda', icon: '👑', biz: 0.15, disc: 0.12, luck: true, love: true, club: true },
  { min: 20000, name: 'Ícone mundial', icon: '🌍', biz: 0.20, disc: 0.15, luck: true, love: true, club: true },
];
export const statusIdx = (p) => { let i = 0; STATUS.forEach((x, j) => { if (p >= x.min) i = j; }); return i; };
let stCache = { s: null, t: 0, v: null };
export function statusOf(s) {
  const now = Date.now();
  if (stCache.s === s && now - stCache.t < 1000) return stCache.v;
  const p = prestige(s), i = statusIdx(p);
  stCache = { s, t: now, v: { ...STATUS[i], idx: i, p, next: STATUS[i + 1] || null } };
  return stCache.v;
}
export const statusRefresh = () => { stCache.t = 0; };
export const discPrice = (s, cost) => cost * (1 - statusOf(s).disc);
const loveMult = (s) => (statusOf(s).love ? 1.25 : 1);
// Bens comprados de marcas de outros jogadores (guardam uma cópia dos dados)
export const pgoods = (s) => Object.values(s.pgoods || {});
const allOwned = (s) => ALL_GOODS.filter((g) => s.goods[g.id]).concat(pgoods(s));
export const prestige = (s) => (s.bonusPrestige || 0) + allOwned(s).reduce((p, g) => p + g.prestige, 0) + styleOf(s) + tripPrestige(s) + (s.love && s.love.wedding ? (WEDDINGS.find((w) => w.id === s.love.wedding) || { prestige: 0 }).prestige : 0);
// Tempo fora do jogo: os primeiros minutos rendem 100%, o resto rende metade, até o limite de horas
export const OFFLINE = { fullMins: 5, eff: 0.5, maxHours: 10 };
export function offlineHours(s) {
  const home = homeOf(s);
  return Math.min(OFFLINE.maxHours, card(s).hours + (home ? home.hours : 0));
}

export function bizProfit(s, b, mk) {
  const lvl = s.biz[b.id] || 0;
  if (!lvl) return 0;
  return b.profit * lvl * bizMult(lvl) * SECTOR_MULT[mk.sectorNow(b.sector)] * levelMult(s) * buffMult(s, b.id) * (1 + statusOf(s).biz);
}
export function buffMult(s, id) {
  const now = Date.now();
  return (s.buffs || []).filter((x) => x.until > now && (x.id === id || x.id === '*')).reduce((m, x) => m * x.mult, 1);
}

export function salary(s) {
  const j = JOBS.find((x) => x.id === s.job);
  return j.salary * (1 + vehicleBonus(s)) * (1 + legendBonus(s)) * levelMult(s);
}

// Renda e gastos por dia de jogo, detalhado
export function incomeBreakdown(s, mk) {
  const sal = salary(s);
  const salVeh = sal - sal / (1 + vehicleBonus(s)); // parte do salário que vem do veículo
  const salLend = sal - sal / (1 + legendBonus(s)); // parte que vem da skin lendária
  const bizGross = BUSINESSES.reduce((t, b) => t + bizProfit(s, b, mk), 0);
  const biz = bizGross * (1 - corpFloat(s)); // a fatia vendida na bolsa vai para os acionistas
  const rent = PROPERTIES.reduce((t, p) => t + (s.props[p.id] || 0) * p.rent, 0) * levelMult(s);
  let divs = familyDivs(s);
  for (const a of ASSETS) {
    const h = s.port[a.sym];
    if (h && h.q > 0) { const t = ownTier(ownPct(s, a.sym)); const d = ((a.div || 0) + (t ? t.extra : 0)) * (t ? t.mult : 1); if (d) divs += h.q * mk.price(a.sym) * d; }
  }
  const cdi = mk.cdi();
  const juros = s.poup * cdi * 0.7 + s.cdb.reduce((t, x) => t + x.amt * fixedRate('cdb', x), 0) * cdi + s.tes.reduce((t, x) => t + x.amt * fixedRate('tes', x), 0) * cdi;
  const moradia = homeOf(s) ? 0 : RENT_NO_HOME;
  const manut = allOwned(s).reduce((t, g) => t + g.cost * 0.0002, 0);
  const comp = compIncome(s, mk); // lucro (ou prejuízo) das suas empresas, já sem a parte dos acionistas
  const loan = s.debt * LOAN_RATE;
  // 🦁 Impostos: IR progressivo sobre a renda do trabalho/negócios, IPVA/IPTU sobre bens e imóveis, fortuna acima de R$ 1 bi
  const ir = incomeTax(sal + biz + rent + Math.max(0, comp));
  const tBens = (allOwned(s).reduce((t, g) => t + g.cost, 0) + PROPERTIES.reduce((t, p) => t + (s.props[p.id] || 0) * p.cost, 0)) * TAX.bens / 365;
  const tFort = Math.max(0, netWorthFast(s, mk) - TAX.fortunaMin) * TAX.fortuna / 365;
  const tax = ir + tBens + tFort;
  const inc = sal + biz + rent + divs + juros + Math.max(0, comp);
  const exp = moradia + manut + loan + Math.max(0, -comp) + tax;
  return { sal, salVeh, salLend, biz, rent, divs, juros, moradia, manut, loan, comp, ir, tBens, tFort, tax, inc, exp, net: inc - exp };
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
  v += BUSINESSES.reduce((t, b) => t + (s.biz[b.id] ? bizCost(b, 0, s.biz[b.id]) * 0.6 : 0), 0) * (1 - corpFloat(s));
  v += Object.values(s.fport || {}).reduce((t, h) => t + h.q * h.price, 0);
  v += allOwned(s).reduce((t, g) => t + g.cost * sellRate(g), 0);
  v += (s.companies || []).reduce((t, c) => t + c.invested * 0.6 * (1 - c.float), 0);
  return v - s.debt - ccOwed(s);
}
export const sellRate = (g) => (g.cat === 'veiculos' || g.cat === 'ceumar' ? 0.6 : g.cat === 'moradia' ? 0.9 : 0.75);

// ---------- Simulação ----------
// Aplica dt milissegundos de economia. Retorna o lucro líquido.
// eff < 1 = tempo offline (rende menos). Gastos e juros da dívida correm normalmente.
export function accrue(s, mk, dt, eff = 1) {
  const real = dt / DAY_MS;
  const days = real * eff;
  const ib = incomeBreakdown(s, mk);
  const cdi = mk.cdi();
  // juros compõem nas próprias aplicações
  s.poup += s.poup * cdi * 0.7 * days;
  s.cdb.forEach((x) => { x.amt += x.amt * cdi * fixedRate('cdb', x) * days; });
  s.tes.forEach((x) => { x.amt += x.amt * cdi * fixedRate('tes', x) * days; });
  s.debt += s.debt * LOAN_RATE * real;
  const taxNow = ib.ir * days + (ib.tBens + ib.tFort) * real;
  const cashGain = (ib.sal + ib.biz + ib.rent + ib.divs + Math.max(0, ib.comp)) * days - (ib.moradia + ib.manut + Math.max(0, -ib.comp)) * real - taxNow;
  s.cash += cashGain;
  s.stats.taxPaid = (s.stats.taxPaid || 0) + taxNow;
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
  amount = discPrice(s, amount); // desconto do status social
  if (s.payMode === 'card') {
    if (isBankrupt(s)) return 'Cartão bloqueado: você está falido(a). Pague com dinheiro.';
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
    const skip = c.paidAhead === c.nextClose; // parcela deste mês já foi antecipada
    if (!skip) c.parcels.forEach((p) => { due += p.amt; p.left--; });
    c.paidAhead = null;
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
export const ccCurrent = (s) => (s.cc ? s.cc.fatura + s.cc.parcels.reduce((t, p) => t + p.amt, 0) : 0);
// all=false: paga a fatura atual (compras à vista + parcela deste mês); all=true: quita tudo, inclusive parcelas futuras
export function payFaturaNow(s, all = false) {
  const c = s.cc;
  const due = all ? ccOwed(s) : ccCurrent(s);
  if (!c || due <= 0.01) return 'Não há nada para pagar no cartão';
  if (s.cash < due - 0.01) return `Você precisa de ${Math.ceil(due).toLocaleString('pt-BR')} em dinheiro`;
  s.cash -= due;
  c.fatura = 0;
  if (all) c.parcels = [];
  else { c.parcels.forEach((p) => { p.left--; p.prepaid = (p.prepaid || 0) + 1; }); c.parcels = c.parcels.filter((p) => p.left > 0); c.paidAhead = c.nextClose; }
  return { paid: due };
}

export function startCourse(s, id) {
  const c = COURSES.find((x) => x.id === id);
  if (s.course) return 'Você já está estudando';
  if (s.edu.includes(id)) return 'Você já concluiu este curso';
  if (!courseReqOk(s, c)) return 'Requisito não concluído';
  const e = spend(s, c.cost); if (e) return e;
  s.course = { id, end: Date.now() + c.mins * 60_000, start: Date.now() };
  return null;
}
export const courseReqs = (c) => (Array.isArray(c.req) ? c.req : c.req ? [c.req] : []);
export const courseReqOk = (s, c) => courseReqs(c).every((r) => s.edu.includes(r)) && (!c.reqAny || c.reqAny.some((r) => s.edu.includes(r)));
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
    const gross = qty * price * (1 - TRADE_FEE);
    const ct = capTax(s, gross - avg * qty);
    const recv = gross - ct;
    const profit = recv - avg * qty;
    h.cost -= avg * qty; h.q -= qty;
    if (h.q < 1e-9) { h.q = 0; h.cost = 0; }
    s.cash += recv;
    s.stats.trades++;
    s.stats.tradeProfit += profit;
    s.stats.bestTrade = Math.max(s.stats.bestTrade, profit);
    if (profit > 0) addXP(s, 5 + Math.min(60, Math.round(Math.log10(1 + profit) * 4)));
    return { profit, tax: ct };
  }
  return null;
}
export const isCrypto = (sym) => CRYPTOS.some((c) => c.sym === sym);

// Prazos: quanto mais tempo preso, mais rende (multiplicador sobre o CDI). mins = minutos reais
export const TERMS = {
  cdb: [{ mins: 15, rate: 1.0 }, { mins: 30, rate: 1.1 }, { mins: 60, rate: 1.2 }],
  tes: [{ mins: 60, rate: 1.25 }, { mins: 120, rate: 1.35 }, { mins: 240, rate: 1.5 }],
};
const defRate = (kind) => (kind === 'cdb' ? 1.1 : 1.3); // aplicações antigas
export const fixedRate = (kind, x) => x.rate || defRate(kind);
export function applyFixed(s, kind, amt, term = 0) {
  if (!(amt > 0)) return 'Valor inválido';
  const e = spend(s, amt); if (e) return e;
  if (kind === 'poup') s.poup += amt;
  else {
    const t = TERMS[kind][term] || TERMS[kind][0];
    s[kind].push({ amt, principal: amt, start: Date.now(), until: Date.now() + t.mins * 60_000, rate: t.rate, mins: t.mins });
  }
  addXP(s, 2);
  return null;
}
export function withdrawPoup(s, amt) {
  amt = Math.min(amt, s.poup);
  s.poup -= amt; s.cash += amt;
  return null;
}
// Resgate: no prazo recebe tudo; antes do prazo recebe só o valor aplicado (perde o rendimento)
export function redeem(s, kind, i, early = false) {
  const list = s[kind];
  const x = list[i];
  if (!x) return 'Aplicação não encontrada';
  const ready = Date.now() >= x.until;
  if (!ready && !early) return 'Ainda está no prazo de carência';
  list.splice(i, 1);
  const got = ready ? x.amt : Math.min(x.amt, x.principal || x.amt);
  s.cash += got;
  return { got, lost: x.amt - got };
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
  if (isBankrupt(s)) return 'Banco não empresta para quem está falido(a)';
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
  { id: 'emprego', icon: '💼', name: 'Carteira assinada', desc: 'Troque de emprego', test: (s) => s.job !== (s.startJob || 'entregador') },
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
  { id: 'doutor', icon: '🎓', name: 'Doutor(a)', desc: 'Conclua um doutorado', test: (s) => s.edu.includes('doutorado') },
  { id: 'juiz', icon: '⚖️', name: 'Meritíssimo(a)', desc: 'Torne-se juiz(a)', test: (s) => s.job === 'juiz' || s.job === 'desembargador' },
  { id: 'jaleco', icon: '🩺', name: 'De jaleco', desc: 'Torne-se médico(a)', test: (s) => ['medico', 'cirurgiao'].includes(s.job) },
  { id: 'espaco', icon: '👩‍🚀', name: 'Rumo às estrelas', desc: 'Torne-se astronauta', test: (s) => s.job === 'astronauta' },
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
  { id: 'fundador', icon: '🏢', name: 'Fundador(a)', desc: 'Funde sua própria empresa', test: (s) => !!s.corp || (s.companies || []).length >= 1 },
  { id: 'ipo', icon: '🔔', name: 'Toque do sino', desc: 'Abra o capital da sua empresa na bolsa', test: (s) => (!!s.corp && !!s.corp.ipoAt) || (s.companies || []).some((c) => c.ipoAt) },
  { id: 'empresario', icon: '🏭', name: 'Empreendedor(a)', desc: 'Crie uma empresa num segmento', test: (s) => (s.companies || []).length >= 1 },
  { id: 'lancamento', icon: '🚀', name: 'Lançamento!', desc: 'Lance um produto da sua empresa', test: (s) => (s.companies || []).some((c) => c.products.length) },
  { id: 'conglomerado', icon: '🌐', name: 'Conglomerado', desc: 'Tenha 3 empresas ao mesmo tempo', test: (s) => (s.companies || []).length >= 3 },
  { id: 'vendeu_jogador', icon: '🛒', name: 'Marca famosa', desc: 'Venda um produto para outro jogador', test: (s) => (s.stats.pSales || 0) >= 1 },
  { id: 'socio_familia', icon: '🤝', name: 'Sócio(a) da família', desc: 'Compre ações da empresa de um amigo', test: (s) => Object.keys(s.fport || {}).length >= 1 },
  { id: 'precavido', icon: '🛡️', name: 'Precavido(a)', desc: 'Tenha 3 seguros ao mesmo tempo', test: (s) => Object.keys(s.ins || {}).length >= 3 },
  { id: 'salvo_seguro', icon: '☂️', name: 'Salvo pelo seguro', desc: 'Economize R$ 100 mil com seguros', test: (s) => (s.stats.insSaved || 0) >= 1e5 },
  { id: 'lendaria1', icon: '🌟', name: 'Lendário(a)', desc: 'Compre uma skin lendária', test: (s) => Object.keys(s.legends || {}).length >= 1 },
  { id: 'lendaria5', icon: '🏯', name: 'Colecionador(a) de lendas', desc: 'Tenha 5 skins lendárias', test: (s) => Object.keys(s.legends || {}).length >= 5 },
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
// O que a pessoa realmente tem (para os acontecimentos combinarem com a vida dela)
const bestOwned = (s, list) => list.filter((g) => s.goods[g.id]).sort((a, b) => b.cost - a.cost)[0] || null;
const myCar = (s) => bestOwned(s, GOODS.veiculos.filter((g) => !['pedala', 'trovao'].includes(g.brand)));
const myMoto = (s) => bestOwned(s, GOODS.veiculos.filter((g) => g.brand === 'trovao'));
const myBoat = (s) => bestOwned(s, GOODS.ceumar.filter((g) => ['jetski', 'lancha', 'veleiro', 'iate', 'megaiate', 'submarino'].includes(g.id)));
const myAircraft = (s) => bestOwned(s, GOODS.ceumar.filter((g) => ['heli', 'jato', 'aviao'].includes(g.id)));
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
  if (!['entregador', 'influencer', 'garcom'].includes(s.job)) add(3, { k: 'bonus', icon: '🏅', title: 'Bônus no trabalho', text: `Seu chefe gostou do seu trabalho como ${job.name} e liberou um bônus!`, gain: R(salary(s) * 10), yes: 'Uhuu!', fx: { cash: R(salary(s) * 10), xp: 10 } });
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
  const car = myCar(s), moto = myMoto(s), boat = myBoat(s), air = myAircraft(s);
  const road = car || moto;
  if (road) {
    add(3, { k: 'multa', icon: '🚓', title: 'Multa de trânsito', text: `Chegou uma multa por excesso de velocidade com ${car ? 'seu' : 'sua'} ${road.name}. Pagar com desconto agora?`, pay: R(day * 3), yes: 'Pagar com desconto', no: 'Pagar depois', fx: {}, nofx: { pay: R(day * 5), msg: '🚓 Pagou a multa cheia.' } });
    add(2, { k: 'pneu', icon: '🛞', title: 'Pneu furado', text: `Furou o pneu ${car ? 'do seu' : 'da sua'} ${road.name} no meio do caminho. Guincho e borracharia!`, pay: R(day * 2), yes: 'Pagar', fx: {} });
  }
  if (car) add(1, { k: 'roubo_carro', icon: '🚨', title: 'Carro roubado!', text: `Levaram seu ${car.name} durante a noite!`, forced: true, car: car.id, yes: 'Que tristeza…', fx: { loseGood: car.id, msg: `😭 Você perdeu seu ${car.name}.` } });
  add(2, { k: 'hospital', icon: '🏥', title: 'Internação', text: 'Uma virose forte te levou ao hospital por alguns dias.', pay: R(day * 12), yes: 'Pagar o hospital', fx: {} });
  add(1, { k: 'acidente', icon: '🤕', title: 'Acidente', text: 'Você escorregou na escada e quebrou o braço. Tratamento e fisioterapia…', pay: R(day * 9), yes: 'Pagar tratamento', fx: {} });
  if (car) {
    add(2, { k: 'granizo', icon: '🌨️', title: 'Chuva de granizo', text: `Uma chuva de granizo amassou seu ${car.name} todo.`, pay: R(Math.max(day * 4, car.cost * 0.01)), yes: 'Funilaria', fx: {} });
    add(1, { k: 'revisao', icon: '🔧', title: 'Revisão do carro', text: `Chegou a hora da revisão do seu ${car.name}. Fazer agora evita prejuízo maior depois (30% de chance de quebrar feio).`, cost: R(Math.max(day * 2, car.cost * 0.004)), yes: 'Fazer revisão', no: 'Deixar pra depois', fx: { msg: '🔧 Carro revisado, tudo certo!' }, nofx: { chance: { p: 0.7, win: { msg: '😅 Desta vez deu sorte…' }, lose: { pay: R(Math.max(day * 6, car.cost * 0.02)), msg: '💥 O carro quebrou! Conserto caro.' } } } });
  }
  if (moto) add(1, { k: 'capacete', icon: '🪖', title: 'Capacete rachado', text: `O capacete que você usa com a ${moto.name} rachou. Segurança em primeiro lugar!`, pay: R(day * 1.5), yes: 'Comprar outro', fx: {} });
  if (boat) add(2, { k: 'marina', icon: '⚓', title: 'Taxa da marina', text: `A marina cobrou a taxa anual de ${boat.name}.`, pay: R(Math.max(day * 3, boat.cost * 0.005)), yes: 'Pagar', fx: {} });
  if (air) add(2, { k: 'hangar', icon: '🛫', title: 'Manutenção da aeronave', text: `${air.name} precisa da manutenção obrigatória de voo.`, pay: R(Math.max(day * 5, air.cost * 0.004)), yes: 'Pagar', fx: {} });
  if (!road && !air) add(2, { k: 'onibus', icon: '🚌', title: 'Greve de ônibus', text: 'Greve no transporte público! Vai de táxi para o trabalho?', cost: R(day * 0.8), yes: 'Pegar táxi', no: 'Faltar ao trabalho', fx: { msg: '🚕 Chegou no horário!' }, nofx: { pay: R(salary(s) * 2), msg: '📉 Faltou e teve o dia descontado.' } });
  if (homeOf(s)) {
    add(1, { k: 'incendio', icon: '🔥', title: 'Princípio de incêndio', text: `Um curto-circuito causou um incêndio na sua ${homeOf(s).name}!`, pay: R(Math.max(day * 10, homeOf(s).cost * 0.03)), yes: 'Reformar', fx: {} });
    add(1, { k: 'assalto', icon: '🦹', title: 'Casa assaltada', text: 'Enquanto você viajava, entraram na sua casa e levaram TV e eletrônicos.', pay: R(day * 8), yes: 'Repor tudo', fx: {} });
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
    if (L.stage >= 1) add(2, { k: 'briga', icon: '😤', title: 'Briguinha de casal', text: `Vocês discutiram por uma bobagem. Um jantar para fazer as pazes?`, cost: R(day * 2), yes: 'Pedir desculpas com jantar', no: 'Deixar esfriar', fx: { aff: 8, msg: '🥰 Fizeram as pazes!' }, nofx: { aff: -12, msg: '💔 Clima ficou pesado…' } });
    if (L.stage >= 2) add(1, { k: 'sogra', icon: '👵', title: 'Visita da sogra', text: `A família de ${L.partner.name} vem passar o fim de semana. Capricha no almoço?`, cost: R(day * 3), yes: 'Caprichar', no: 'Pedir pizza', fx: { aff: 12, msg: '😋 Todos amaram o almoço!' }, nofx: { aff: -5 } });
  } else {
    add(1, { k: 'crush', icon: '💘', title: 'Alguém de olho em você', text: 'Parece que tem alguém interessado em você… Vá em 👤 Vida → ❤️ Amor e procure!', gain: 0, yes: 'Ficar curioso', fx: { xp: 5 } });
  }
  // Celebridade ou mais: a sorte sorri (mais boas notícias, menos imprevistos)
  if (statusOf(s).luck) E.forEach((x) => { if (x.ev.gain) x.w *= 1.5; else if (x.ev.pay) x.w *= 0.7; });
  return E;
}

export function makeEvent(s, mk) {
  const pool = eventPool(s, mk).filter((x) => !s.lastEventK || x.ev.k !== s.lastEventK);
  if (!pool.length) return null;
  let r = Math.random() * pool.reduce((t, x) => t + x.w, 0);
  let e = pool[0].ev;
  for (const x of pool) { r -= x.w; if (r < 0) { e = x.ev; break; } }
  s.lastEventK = e.k;
  return applyInsurance(s, { ...e, exp: Date.now() + 12 * MIN });
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
  if (fx.loseGood && s.goods[fx.loseGood]) delete s.goods[fx.loseGood];
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
  if (e.saved) s.stats.insSaved = (s.stats.insSaved || 0) + e.saved;
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
    if (e.forced) { const r = applyFx(s, e.fx); if (r.msg) out.push(r.msg); }
    else if (e.pay && !e.no) { payForced(s, e.pay); out.push(`💸 ${e.title}: pago automaticamente.`); }
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
  s.companies = s.companies || [];
  s.pgoods = s.pgoods || {};
  // Ações antigas das holdings dos amigos eram guardadas pelo id do amigo; agora pelo id da empresa
  for (const k of Object.keys(s.fport || {})) if (!k.includes('_')) { s.fport[k + '_h'] = s.fport[k]; delete s.fport[k]; }
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
  L.aff = Math.min(100, L.aff + g.aff * loveMult(s));
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
    L.aff = Math.min(100, L.aff + a.aff * loveMult(s));
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

// ---------- Sua própria empresa na bolsa (holding) ----------
export const CORP = { minNW: 5e7, minBiz: 3, cost: 1e6, shares: 1e7, pe: 400, maxFloat: 0.49, fee: 0.005 };
export const corpFloat = (s) => (s.corp ? s.corp.float || 0 : 0);
export const grossBizProfit = (s, mk) => BUSINESSES.reduce((t, b) => t + bizProfit(s, b, mk), 0);
// Valor da ação = lucro diário dos negócios × 400 ÷ 10 milhões de ações
export const corpPrice = (s, mk) => (s.corp ? Math.max(0.01, (grossBizProfit(s, mk) * CORP.pe) / CORP.shares) : 0);
export function canFound(s) { return (s.peakNW || 0) >= CORP.minNW && Object.values(s.biz).filter((x) => x > 0).length >= CORP.minBiz; }
export function tickerFrom(name) { return (name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z]/g, '') + 'XXXX').slice(0, 4) + '3'; }
export function foundCorp(s, name, ticker) {
  if (s.corp) return 'Você já tem uma empresa';
  if (!canFound(s)) return 'Ainda não cumpre os requisitos';
  name = (name || '').trim().slice(0, 22);
  ticker = (ticker || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
  if (name.length < 3) return 'Escolha um nome com pelo menos 3 letras';
  if (ticker.length !== 4) return 'O código precisa de 4 letras';
  const e = spend(s, CORP.cost); if (e) return e;
  s.corp = { name, ticker: ticker + '3', founded: Date.now(), float: 0 };
  addXP(s, 150);
  return null;
}
export function ipo(s, mk, pct) {
  const c = s.corp; if (!c) return 'Funde sua empresa primeiro';
  if (!(pct > 0) || c.float + pct > CORP.maxFloat + 1e-9) return `Você pode vender no máximo ${Math.round(CORP.maxFloat * 100)}% (para continuar no controle)`;
  const gross = pct * CORP.shares * corpPrice(s, mk) * (1 - CORP.fee * 4);
  const got = gross - capTax(s, gross);
  c.float += pct; c.ipoAt = c.ipoAt || Date.now();
  s.cash += got;
  s.stats.ipoCash = (s.stats.ipoCash || 0) + got;
  addXP(s, 100);
  return { got };
}
export function buyback(s, mk, pct) {
  const c = s.corp; if (!c || c.float <= 0) return 'Não há ações no mercado para recomprar';
  pct = Math.min(pct, c.float);
  const cost = pct * CORP.shares * corpPrice(s, mk) * (1 + CORP.fee * 4);
  const e = spend(s, cost); if (e) return e;
  c.float -= pct; if (c.float < 1e-9) c.float = 0;
  return { cost };
}
// Ações das empresas dos amigos (compradas do mercado)
export function updateFriendCorp(s, uid, corp) {
  const h = (s.fport || {})[uid];
  if (h && corp) Object.assign(h, { price: corp.price, profit: corp.profit, float: corp.float, name: corp.name, ticker: corp.ticker });
}
export function tradeFriendCorp(s, uid, corp, qty, side) {
  qty = Math.floor(qty);
  if (!(qty >= 1)) return 'Quantidade inválida';
  s.fport = s.fport || {};
  const h = s.fport[uid] || (s.fport[uid] = { q: 0, cost: 0 });
  Object.assign(h, { price: corp.price, profit: corp.profit, float: corp.float, name: corp.name, ticker: corp.ticker });
  if (side === 'buy') {
    const max = Math.floor(CORP.shares * corp.float);
    if (h.q + qty > max) return `O mercado só tem ${max.toLocaleString('pt-BR')} ações dessa empresa`;
    const total = qty * corp.price * (1 + CORP.fee);
    const e = spend(s, total); if (e) return e;
    h.q += qty; h.cost += total;
    s.stats.trades++;
    return null;
  }
  if (qty > h.q) return 'Você não tem tudo isso';
  const avg = h.cost / h.q;
  const recv = qty * corp.price * (1 - CORP.fee);
  h.cost -= avg * qty; h.q -= qty;
  s.cash += recv;
  if (h.q <= 0) delete s.fport[uid];
  s.stats.trades++;
  return { profit: recv - avg * qty };
}
// Dividendos das empresas da família: sua fatia do lucro diário dos negócios do dono
export const familyDivs = (s) => Object.values(s.fport || {}).reduce((t, h) => t + (h.q / CORP.shares) * Math.max(0, h.profit || 0), 0);

// ---------- Seguros ----------
// Cada seguro tem plano básico (cobre 50%) ou completo (cobre 100% e mais situações).
export const INSURANCES = [
  { id: 'auto', name: 'Seguro de Veículos', icon: '🚗', need: 'veículo (carro ou moto)', basic: 'Granizo e pneu/guincho (50%)', full: 'Tudo 100% + quebra por falta de revisão + roubo do carro' },
  { id: 'casa', name: 'Seguro Residencial', icon: '🏠', need: 'casa própria', basic: 'Vazamento e incêndio (50%)', full: 'Tudo 100% + eletrodomésticos + assalto' },
  { id: 'saude', name: 'Plano de Saúde', icon: '🩺', need: null, basic: 'Internação (50%)', full: 'Internação 100% + dentista' },
  { id: 'vida', name: 'Seguro de Vida e Acidentes', icon: '❤️‍🩹', need: null, basic: 'Acidentes (50%)', full: 'Acidentes 100% + indenização extra' },
  { id: 'cel', name: 'Seguro do Celular', icon: '📱', need: null, basic: 'Conserto do celular (50%)', full: 'Conserto do celular 100%' },
  { id: 'biz', name: 'Seguro Empresarial', icon: '🏭', need: 'negócios', basic: 'Equipamento quebrado (50%)', full: 'Equipamento 100% + gerador no apagão' },
];
// Qual seguro cobre cada acontecimento (only = só no plano completo)
const INS_MAP = {
  granizo: { t: 'auto' }, pneu: { t: 'auto' }, revisao: { t: 'auto', only: 1, nofx: 1 }, roubo_carro: { t: 'auto', only: 1, theft: 1 },
  vazamento: { t: 'casa' }, incendio: { t: 'casa' }, geladeira: { t: 'casa', only: 1 }, assalto: { t: 'casa', only: 1 },
  hospital: { t: 'saude' }, dentista: { t: 'saude', only: 1 }, acidente: { t: 'vida', bonus: 1 }, celular: { t: 'cel' },
  reparo: { t: 'biz' }, apagao: { t: 'biz', only: 1 },
};
const insVehicle = (s) => bestOwned(s, GOODS.veiculos.filter((g) => g.brand !== 'pedala'));
export function insAvailable(s, id) {
  if (id === 'auto') return !!insVehicle(s);
  if (id === 'casa') return !!homeOf(s);
  if (id === 'biz') return Object.values(s.biz).some((x) => x > 0);
  return true;
}
// Mensalidade (a cada 30 dias do jogo) de cada plano
export function insPremium(s, mk, id, plan) {
  if (!plan) return 0;
  const full = plan === 'completo';
  const ib = incomeBreakdown(s, mk);
  const day = Math.max(60, ib.net);
  let v = 0;
  if (id === 'auto') { const g = insVehicle(s); v = g ? g.cost * (full ? 0.012 : 0.006) : 0; }
  if (id === 'casa') { const h = homeOf(s); v = h ? h.cost * (full ? 0.004 : 0.002) : 0; }
  if (id === 'saude') v = salary(s) * (full ? 4 : 2);
  if (id === 'vida') v = day * (full ? 2.5 : 1);
  if (id === 'cel') v = full ? 60 : 25;
  if (id === 'biz') v = grossBizProfit(s, mk) * (full ? 2.5 : 1);
  return Math.max(20, Math.round(v));
}
export const insPlan = (s, id) => ((s.ins || {})[id] && insAvailable(s, id) ? s.ins[id] : null);
export function setInsurance(s, mk, id, plan) {
  s.ins = s.ins || {};
  if (plan && !insAvailable(s, id)) return 'Você ainda não tem o que segurar';
  if (!plan) { delete s.ins[id]; return null; }
  if ((s.ins[id] || null) === plan) return null;
  const first = insPremium(s, mk, id, plan); // a primeira mensalidade é paga na contratação
  const e = spend(s, first); if (e) return e;
  s.ins[id] = plan;
  if (!s.insNext) s.insNext = Date.now() + FATURA_MS;
  addXP(s, 10);
  return null;
}
export const insMonthly = (s, mk) => INSURANCES.reduce((t, x) => t + insPremium(s, mk, x.id, insPlan(s, x.id)), 0);
// Cobra as mensalidades a cada 30 dias do jogo
export function insTick(s, mk) {
  if (!s.ins || !s.insNext || Date.now() < s.insNext) return null;
  let total = 0, guard = 0;
  while (Date.now() >= s.insNext && guard++ < 50) { total += insMonthly(s, mk); s.insNext += FATURA_MS; }
  if (total > 0) payForced(s, total);
  return total > 0 ? total : null;
}
function coverPays(fx, c) { // reduz despesas dentro dos efeitos (inclusive chances)
  if (!fx) return 0;
  let saved = 0;
  if (fx.pay) { const n = Math.round(fx.pay * (1 - c)); saved += fx.pay - n; fx.pay = n; }
  if (fx.chance) { saved += coverPays(fx.chance.lose, c); }
  return saved;
}
function applyInsurance(s, e) {
  const m = INS_MAP[e.k];
  if (!m) return e;
  const plan = insPlan(s, m.t);
  const c = plan === 'completo' ? 1 : plan === 'basico' && !m.only ? 0.5 : 0;
  const ins = INSURANCES.find((x) => x.id === m.t);
  if (!c) { if (!plan) e.noIns = ins.name; return e; }
  e.insName = ins.name;
  if (m.theft) { e.fx = { msg: `🛡️ O seguro repôs seu veículo. Ufa!` }; e.text += ' Mas o seu seguro completo repõe o veículo!'; e.covered = 1; return e; }
  if (m.nofx) { e.nofx = JSON.parse(JSON.stringify(e.nofx)); e.saved = coverPays(e.nofx, c); e.text += ' (Se quebrar, seu seguro cobre o conserto.)'; e.covered = c; return e; }
  if (e.pay) { const n = Math.round(e.pay * (1 - c)); e.saved = e.pay - n; e.payOrig = e.pay; e.pay = n; }
  if (e.cost) { const n = Math.round(e.cost * (1 - c)); e.saved = e.cost - n; e.costOrig = e.cost; e.cost = n; }
  if (m.bonus && c === 1) { e.fx = { ...(e.fx || {}), cash: (e.fx && e.fx.cash) || Math.round((e.payOrig || 0) * 0.5) }; e.gain = e.fx.cash; }
  e.covered = c;
  return e;
}

// ---------- Empresas criadas pelos jogadores ----------
export const COMP_CLIMA = { 1: 1.3, 0: 1, '-1': 0.6 };
export const COMP = { shares: 1e7, pe: 400, maxFloat: 0.49, fee: 0.005, foundK: 50000, devMult: 300, minLevel: 8, margin: 0.2, versionCost: 0.4, versionTime: 0.5 };
const STAFF_MAP = Object.fromEntries(STAFF.map((r) => [r.id, r]));
const MGMT = { ceo: 0.3, diretor: 0.15, gerente: 0.08, operador: 0.08 };
const EXTRA_COMP = { gerente: 1, operador: 1, diretor: 2, ceo: 4 };
export const maxCompanies = (s) => 1 + (EXTRA_COMP[s.job] || 0) + (statusOf(s).idx >= 4 ? 1 : 0);
export const mgmtMult = (s) => 1 + (MGMT[s.job] || 0) + (s.edu.includes('mba') ? 0.05 : 0);
export const foundCost = (seg) => COMP.foundK * seg.k;
export const devCost = (seg, tier, version) => PRODUCT_TIERS[tier].rev * seg.k * COMP.devMult * (version ? COMP.versionCost : 1);
export const devMins = (c, tier, version) => (PRODUCT_TIERS[tier].mins * (version ? COMP.versionTime : 1)) / (1 + 0.15 * (c.staff.pd || 0));
// Novidade do produto: lançamento dá +50% (some em 60 dias); depois de 240 dias vai envelhecendo até a metade
export function freshness(p, now = Date.now()) {
  const d = (now - p.launched) / DAY_MS;
  if (d < 60) return 1.5 - (0.5 * d) / 60;
  if (d < 240) return 1;
  return Math.max(0.5, 1 - (0.5 * (d - 240)) / 1200);
}
const topTier = (c) => c.products.reduce((m, p) => Math.max(m, p.tier), 0);
export const wageOf = (c, role) => STAFF_MAP[role].pct * PRODUCT_TIERS[topTier(c)].rev * SEGMENT[c.seg].k;
export function staffCap(c, role) {
  const n = c.products.length;
  return role === 'prod' ? 300 : role === 'pd' ? 10 : role === 'vendas' ? Math.max(2, 4 * n) : Math.max(1, 3 * n);
}
export function compStats(s, c, mk) {
  const seg = SEGMENT[c.seg], st = c.staff;
  const now = Date.now();
  const base = c.products.reduce((t, p) => t + PRODUCT_TIERS[p.tier].rev * seg.k * freshness(p, now), 0);
  const need = c.products.reduce((t, p) => t + PRODUCT_TIERS[p.tier].need, 0);
  const cap = need ? Math.min(1, (st.prod || 0) / need) : 0;
  const boost = (1 + 0.05 * (st.vendas || 0)) * (1 + 0.04 * (st.mkt || 0));
  const clima = COMP_CLIMA[mk.sectorNow(seg.sector)]; // empresas sentem mais a crise do setor
  const mg = mgmtMult(s);
  const rev = base * cap * boost * clima * mg * legacyMult(s) * bankruptMult(s);
  const cost = STAFF.reduce((t, r) => t + (st[r.id] || 0) * wageOf(c, r.id), 0);
  return { rev, cost, profit: rev - cost, base, need, cap, boost, clima, mg };
}
// O que vai para o dono: lucro × parte que ele controla (prejuízo fica todo com o dono)
export const compOwnerIncome = (s, c, mk) => { const p = compStats(s, c, mk).profit; return p > 0 ? p * (1 - c.float) : p; };
export const compIncome = (s, mk) => (s.companies || []).reduce((t, c) => t + compOwnerIncome(s, c, mk), 0);
export const compPrice = (s, c, mk) => Math.max(0.01, (Math.max(0, compStats(s, c, mk).profit) * COMP.pe) / COMP.shares);
export const findComp = (s, id) => (s.companies || []).find((c) => c.id === id);

export function foundCompany(s, segId, name, ticker, taken = []) {
  const seg = SEGMENT[segId]; if (!seg) return 'Escolha um segmento';
  if (level(s) < COMP.minLevel) return `Precisa do nível ${COMP.minLevel}`;
  s.companies = s.companies || [];
  if (s.companies.length >= maxCompanies(s)) return `Seu limite é ${maxCompanies(s)} empresa(s). Cargos de gestão (Gerente, Diretor, CEO) e o status Lenda liberam mais.`;
  name = (name || '').trim().slice(0, 22);
  ticker = (ticker || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
  if (name.length < 3) return 'Escolha um nome com pelo menos 3 letras';
  if (ticker.length !== 4) return 'O código na bolsa precisa de 4 letras';
  const mine = s.companies.map((c) => c.ticker).concat(s.corp ? [s.corp.ticker] : []);
  if (mine.includes(ticker + '3') || taken.includes(ticker + '3')) return 'Esse código já existe na bolsa. Escolha outro.';
  const cost = foundCost(seg);
  const e = spend(s, cost); if (e) return e;
  const id = Math.random().toString(36).slice(2, 8);
  s.companies.push({ id, name, ticker: ticker + '3', seg: segId, founded: Date.now(), staff: { prod: 0, vendas: 0, mkt: 0, pd: 0 }, products: [], dev: null, float: 0, invested: cost, sales: 0 });
  addXP(s, 150);
  return { id };
}
export function hire(s, id, role, n) {
  const c = findComp(s, id); if (!c) return 'Empresa não encontrada';
  const cur = c.staff[role] || 0, cap = staffCap(c, role);
  if (n > 0 && cur >= cap) return role === 'prod' || role === 'pd' ? 'Limite de vagas atingido' : 'Lance mais produtos para abrir mais vagas';
  c.staff[role] = Math.max(0, Math.min(cap, cur + n));
  return null;
}
export function canDev(c, tier) {
  if (c.dev) return 'Já tem um projeto em desenvolvimento';
  if (c.products.some((p) => p.tier === tier)) return 'Produto já lançado';
  if (tier > 0 && !c.products.some((p) => p.tier === tier - 1)) return 'Lance o produto anterior primeiro';
  if ((c.staff.pd || 0) < PRODUCT_TIERS[tier].pd) return `Precisa de ${PRODUCT_TIERS[tier].pd} pesquisador(es) de P&D`;
  return null;
}
export function startDev(s, id, tier, model) {
  const c = findComp(s, id); if (!c) return 'Empresa não encontrada';
  const why = canDev(c, tier); if (why) return why;
  model = (model || '').trim().slice(0, 18);
  if (model.length < 2) return 'Dê um nome ao produto';
  const cost = devCost(SEGMENT[c.seg], tier);
  const e = spend(s, cost); if (e) return e;
  c.invested += cost;
  c.dev = { tier, model, start: Date.now(), end: Date.now() + devMins(c, tier) * 60_000 };
  addXP(s, 20 + tier * 15);
  return null;
}
export function newVersion(s, id, tier) {
  const c = findComp(s, id); if (!c) return 'Empresa não encontrada';
  if (c.dev) return 'Já tem um projeto em desenvolvimento';
  const p = c.products.find((x) => x.tier === tier); if (!p) return 'Produto não encontrado';
  const cost = devCost(SEGMENT[c.seg], tier, true);
  const e = spend(s, cost); if (e) return e;
  c.invested += cost * 0.5;
  c.dev = { tier, model: p.model, version: true, start: Date.now(), end: Date.now() + devMins(c, tier, true) * 60_000 };
  return null;
}
// Termina desenvolvimentos prontos. Retorna a lista do que foi lançado.
export function compTick(s) {
  const out = [];
  for (const c of s.companies || []) {
    if (!c.dev || Date.now() < c.dev.end) continue;
    const d = c.dev; c.dev = null;
    const kind = SEGMENT[c.seg].products[d.tier];
    if (d.version) { const p = c.products.find((x) => x.tier === d.tier); if (p) { p.v = (p.v || 1) + 1; p.launched = Date.now(); out.push({ c, p, kind, version: true }); } }
    else { const p = { tier: d.tier, model: d.model, launched: Date.now(), v: 1 }; c.products.push(p); c.products.sort((a, b) => a.tier - b.tier); addXP(s, 40 + d.tier * 30); out.push({ c, p, kind }); }
  }
  return out;
}
export function compIpo(s, mk, id, pct) {
  const c = findComp(s, id); if (!c) return 'Empresa não encontrada';
  if (!c.products.length) return 'Lance pelo menos um produto antes de abrir o capital';
  if (!(pct > 0) || c.float + pct > COMP.maxFloat + 1e-9) return `Você pode vender no máximo ${Math.round(COMP.maxFloat * 100)}% (para continuar no controle)`;
  const gross = pct * COMP.shares * compPrice(s, c, mk) * (1 - COMP.fee * 4);
  const got = gross - capTax(s, gross);
  c.float += pct; c.ipoAt = c.ipoAt || Date.now();
  s.cash += got;
  s.stats.ipoCash = (s.stats.ipoCash || 0) + got;
  addXP(s, 100);
  return { got };
}
// Recompra só as ações que estão "soltas" no mercado (as que outros jogadores têm não dá)
export function compBuyback(s, mk, id, pct, heldByOthers = 0) {
  const c = findComp(s, id); if (!c || c.float <= 0) return 'Não há ações no mercado para recomprar';
  const free = c.float - heldByOthers / COMP.shares;
  if (free <= 1e-9) return 'Todas as ações no mercado estão com outros jogadores';
  pct = Math.min(pct, free);
  const cost = pct * COMP.shares * compPrice(s, c, mk) * (1 + COMP.fee * 4);
  const e = spend(s, cost); if (e) return e;
  c.float -= pct; if (c.float < 1e-9) c.float = 0;
  return { cost, pct };
}
export function closeCompany(s, id) {
  const c = findComp(s, id); if (!c) return 'Empresa não encontrada';
  if (c.float > 0) return 'Recompre todas as ações da bolsa antes de fechar';
  s.cash += c.invested * 0.5;
  s.companies = s.companies.filter((x) => x !== c);
  return { got: c.invested * 0.5 };
}
// Dados públicos que vão para a bolsa (todos os jogadores veem)
export function compPublic(s, c, mk) {
  const seg = SEGMENT[c.seg];
  const st = compStats(s, c, mk);
  return {
    name: c.name, ticker: c.ticker, seg: c.seg, float: c.float, shares: COMP.shares, price: compPrice(s, c, mk), profit: st.profit, founded: c.founded,
    products: seg.cat ? c.products.map((p) => { const k = seg.products[p.tier]; return { tier: p.tier, model: p.model, kind: k.name, icon: k.icon, cat: seg.cat, price: k.price, prestige: k.prestige, bonus: k.bonus || 0, hours: k.hours || 0 }; }) : [],
    nprod: c.products.length,
    plist: c.products.map((p) => ({ icon: seg.products[p.tier].icon, kind: seg.products[p.tier].name, model: p.model, v: p.v || 1 })),
  };
}
// Holding antiga (reúne os negócios) também aparece na bolsa
export function holdingPublic(s, mk) {
  return { name: s.corp.name, ticker: s.corp.ticker, seg: 'holding', float: s.corp.float, shares: COMP.shares, price: corpPrice(s, mk), profit: grossBizProfit(s, mk), founded: s.corp.founded, products: [], nprod: 0 };
}
// ----- Ações de empresas de outros jogadores (doc = dados públicos + id) -----
export function syncHolding(s, doc) {
  const h = (s.fport || {})[doc.id];
  if (h) Object.assign(h, { price: doc.price, profit: doc.profit, float: doc.float, name: doc.name, ticker: doc.ticker, seen: true });
}
export function tradeCompany(s, doc, qty, side, heldByOthers = 0) {
  qty = Math.floor(qty);
  if (!(qty >= 1)) return 'Quantidade inválida';
  s.fport = s.fport || {};
  const h = s.fport[doc.id] || (s.fport[doc.id] = { q: 0, cost: 0 });
  Object.assign(h, { price: doc.price, profit: doc.profit, float: doc.float, name: doc.name, ticker: doc.ticker });
  if (side === 'buy') {
    const free = Math.floor(COMP.shares * doc.float) - heldByOthers - h.q;
    if (qty > free) { if (!h.q) delete s.fport[doc.id]; return free > 0 ? `Só tem ${free.toLocaleString('pt-BR')} ações disponíveis no mercado` : 'Não há ações disponíveis no mercado agora'; }
    const total = qty * doc.price * (1 + COMP.fee);
    const e = spend(s, total); if (e) { if (!h.q) delete s.fport[doc.id]; return e; }
    h.q += qty; h.cost += total;
    s.stats.trades++;
    return { q: h.q };
  }
  if (qty > h.q) return 'Você não tem tudo isso';
  const avg = h.cost / h.q;
  const gross = qty * doc.price * (1 - COMP.fee);
  const ct = capTax(s, gross - avg * qty);
  const recv = gross - ct;
  h.cost -= avg * qty; h.q -= qty;
  s.cash += recv;
  const left = h.q;
  if (h.q <= 0) delete s.fport[doc.id];
  s.stats.trades++;
  return { profit: recv - avg * qty, q: left, tax: ct };
}
// ----- Bens das marcas dos jogadores -----
export const pgoodId = (doc, prod) => `${doc.id}:${prod.tier}`;
export function buyPlayerGood(s, doc, prod) {
  const pid = pgoodId(doc, prod);
  s.pgoods = s.pgoods || {};
  if (s.pgoods[pid]) return 'Você já tem';
  const e = shop(s, prod.price); if (e) return e;
  s.pgoods[pid] = { id: pid, name: `${doc.name} ${prod.model}`, model: prod.model, kind: prod.kind, brand: doc.name, ticker: doc.ticker, seg: doc.seg, icon: prod.icon, cat: prod.cat, cost: prod.price, prestige: prod.prestige, bonus: prod.bonus || 0, hours: prod.hours || 0, comp: doc.id, owner: doc.owner, t: Date.now() };
  addXP(s, 15 + prod.prestige);
  return { pid, paid: discPrice(s, prod.price) };
}
export function sellPlayerGood(s, pid) {
  const g = (s.pgoods || {})[pid]; if (!g) return 'Você não tem';
  delete s.pgoods[pid];
  s.cash += g.cost * sellRate(g);
  return null;
}

// Criador do jogo: aparece destacado no ranking e fica fora da disputa da temporada
export const CREATOR = 'XKSi4cIA7HaYsEFpvUvY9cM8bbp1';
// ---------- Calendário (igual para todos): 1 minuto = 1 dia, 365 dias = 1 ano ----------
export const YEAR_DAYS = 365;
export const INFLATION = 0.1;
// O Ano 1 começou em 19/11/2026 (alinhado ao relógio do mercado)
const CAL_EPOCH = EPOCH + 74 * YEAR_DAYS * DAY_MS;
export function calendar(now = Date.now()) {
  const d = Math.max(0, Math.floor((now - CAL_EPOCH) / DAY_MS));
  const year = Math.floor(d / YEAR_DAYS) + 1;
  return { year, day: (d % YEAR_DAYS) + 1, next: CAL_EPOCH + year * YEAR_DAYS * DAY_MS };
}
// ---------- Legado: bônus permanente de renda (renascer e prêmios de temporada) ----------
export const LEGACY = { perPt: 0.02, minNW: 1e8 };
export const legacyPts = (s) => (s.legacy || {}).pts || 0;
export const legacyMult = (s) => 1 + LEGACY.perPt * legacyPts(s);
export const rebirthGain = (nw) => (nw >= LEGACY.minNW ? Math.floor(Math.sqrt(nw / 1e8)) : 0);
export const SEASON_PRIZE = [3, 2, 1]; // pontos de legado para 1º, 2º e 3º do ano
// Crescimento no ano atual (o que conta no ranking da temporada)
export function seasonGrow(s, mk) {
  if (!s.season) return 0;
  return netWorth(s, mk) - s.season.start;
}
// Detecta a virada do ano. Retorna { ended, grow } se o ano mudou.
export function seasonTick(s, mk) {
  const cal = calendar();
  const nw = netWorth(s, mk);
  if (!s.season) { s.season = { year: cal.year, start: nw }; return null; }
  if (cal.year <= s.season.year) return null;
  const ended = s.season.year, grow = nw - s.season.start;
  s.seasonHist = [{ year: ended, grow }, ...(s.seasonHist || [])].slice(0, 20);
  s.lastSeason = { year: ended, grow };
  // 💸 Inflação: dinheiro parado na conta perde 10% a cada virada (investido não perde)
  const inflation = s.cash > 0 ? s.cash * INFLATION : 0;
  s.cash -= inflation;
  s.season = { year: cal.year, start: netWorth(s, mk) };
  return { ended, grow, inflation };
}
export function seasonPrize(s, place, year) {
  const pts = SEASON_PRIZE[place - 1] || 0;
  s.legacy = s.legacy || { pts: 0, n: 0 };
  s.legacy.pts += pts;
  if (place === 1) s.titles = (s.titles || 0) + 1;
  s.seasonHist = (s.seasonHist || []).map((h) => (h.year === year ? { ...h, place } : h));
  return pts;
}
export function canRebirth(s, mk) {
  const nw = netWorth(s, mk);
  if (nw < LEGACY.minNW) return `Precisa de pelo menos ${(LEGACY.minNW / 1e6).toLocaleString('pt-BR')} milhões de patrimônio`;
  if ((s.legacy || {}).year === calendar().year) return 'Você já renasceu neste ano. Espere a virada!';
  return null;
}
// Recomeça a economia do zero e ganha pontos de legado. Mantém a vida (visual, roupas, estudos, profissão, viagens, amor, troféus, amigos, nível).
export function rebirth(s, mk) {
  const why = canRebirth(s, mk); if (why) return why;
  const nw = netWorth(s, mk);
  const gain = rebirthGain(nw);
  const sold = Object.keys(s.fport || {});
  const fresh = newStateBase(s.name, s.look, Date.now());
  for (const k of ['cash', 'debt', 'biz', 'port', 'props', 'goods', 'poup', 'cdb', 'tes', 'cardMax', 'peakNW']) s[k] = fresh[k];
  s.pgoods = {}; s.companies = []; s.fport = {}; s.ins = {}; s.buffs = [];
  delete s.corp; delete s.cc; delete s.loans;
  s.payMode = 'cash';
  s.legacy = { pts: legacyPts(s) + gain, n: ((s.legacy || {}).n || 0) + 1, year: calendar().year, best: Math.max(nw, (s.legacy || {}).best || 0) };
  s.season = { year: calendar().year, start: netWorth(s, mk) };
  return { gain, nw, sold };
}

// ---------- 🦁 Impostos ----------
export const TAX = {
  // Imposto de Renda progressivo por faixa de renda POR DIA (como o IR de verdade, só a parte acima de cada faixa paga mais)
  ir: [[2000, 0], [20000, 0.075], [200000, 0.15], [2e6, 0.225], [Infinity, 0.275]],
  ganho: 0.15, // ganho de capital: lucro ao vender ações/cripto e dinheiro do IPO
  bens: 0.02, // IPVA/IPTU: 2% ao ano do valor dos bens e imóveis
  fortuna: 0.01, fortunaMin: 1e9, // 1% ao ano sobre o patrimônio acima de R$ 1 bi
};
export function incomeTax(daily) {
  let tax = 0, prev = 0;
  for (const [lim, rate] of TAX.ir) { if (daily <= prev) break; tax += (Math.min(daily, lim) - prev) * rate; prev = lim; }
  return tax;
}
export const irRate = (daily) => (daily > 0 ? incomeTax(daily) / daily : 0);
function capTax(s, gain) {
  if (!(gain > 0)) return 0;
  const t = gain * TAX.ganho;
  s.stats.taxPaid = (s.stats.taxPaid || 0) + t;
  return t;
}
// patrimônio sem chamar incomeBreakdown (evita recursão)
function netWorthFast(s, mk) { return netWorth(s, mk); }

// ---------- 💀 Falência ----------
export const BANKRUPT = { graceDays: 30, falidoDays: 365, penalty: 0.3, auction: 0.5, bizAuction: 0.3, compAuction: 0.3 };
export const isBankrupt = (s) => !!(s.bankrupt && Date.now() < s.bankrupt.until);
export const bankruptMult = (s) => (isBankrupt(s) ? 1 - BANKRUPT.penalty : 1);
// Verifica a saúde financeira. Retorna { warn } ao entrar em risco, { bankrupt } quando quebra, { recovered } ao sair do risco, { cleared } ao fim do período de falido
export function solvencyTick(s, mk) {
  if (s.bankrupt && Date.now() >= s.bankrupt.until) { delete s.bankrupt; return { cleared: true }; }
  const nw = netWorth(s, mk);
  if (nw < 0) {
    if (!s.insolvent) { s.insolvent = Date.now(); return { warn: true }; }
    if (Date.now() - s.insolvent >= BANKRUPT.graceDays * DAY_MS) return { bankrupt: declareBankruptcy(s, mk) };
    return null;
  }
  if (s.insolvent) { s.insolvent = null; return { recovered: true }; }
  return null;
}
// O banco leiloa tudo com desconto até cobrir as dívidas
export function declareBankruptcy(s, mk) {
  const owed = s.debt + ccOwed(s);
  let raised = Math.max(0, s.cash) + s.poup + s.cdb.reduce((t, x) => t + x.amt, 0) + s.tes.reduce((t, x) => t + x.amt, 0);
  s.cash = Math.min(0, s.cash); s.poup = 0; s.cdb = []; s.tes = [];
  const sold = [], fportIds = [];
  const enough = () => raised >= owed;
  // ações e cripto
  for (const a of ASSETS) { if (enough()) break; const h = s.port[a.sym]; if (!h || !(h.q > 0)) continue; raised += h.q * mk.price(a.sym) * BANKRUPT.auction; sold.push(`${a.name}`); delete s.port[a.sym]; }
  for (const [id, h] of Object.entries(s.fport || {})) { if (enough()) break; raised += h.q * h.price * BANKRUPT.auction; sold.push(`ações da ${h.name}`); fportIds.push(id); delete s.fport[id]; }
  // imóveis de aluguel
  for (const p of PROPERTIES) { if (enough()) break; const n = s.props[p.id] || 0; if (!n) continue; raised += n * p.cost * mk.realEstateIndex() * BANKRUPT.auction; sold.push(`${n}× ${p.name}`); delete s.props[p.id]; }
  // bens (do mais caro para o mais barato)
  const goods = allOwned(s).sort((a, b) => b.cost - a.cost);
  for (const g of goods) { if (enough()) break; raised += g.cost * BANKRUPT.auction; sold.push(g.name); if (s.pgoods && s.pgoods[g.id]) delete s.pgoods[g.id]; else delete s.goods[g.id]; }
  // empresas (só as que não têm ações com outros jogadores ficam por último)
  for (const c of [...(s.companies || [])]) { if (enough()) break; raised += c.invested * BANKRUPT.compAuction; sold.push(`empresa ${c.name}`); s.companies = s.companies.filter((x) => x !== c); }
  // negócios (do mais caro para o mais barato)
  for (const b of [...BUSINESSES].reverse()) { if (enough()) break; const lv = s.biz[b.id] || 0; if (!lv) continue; raised += bizCost(b, 0, lv) * BANKRUPT.bizAuction; sold.push(`${b.name} (nível ${lv})`); delete s.biz[b.id]; }
  if (!Object.keys(s.biz).length && s.corp) { sold.push(`holding ${s.corp.name}`); delete s.corp; }
  const left = raised - owed;
  s.cash += Math.max(0, left);
  s.debt = 0; delete s.cc;
  s.insolvent = null;
  s.bankrupt = { at: Date.now(), until: Date.now() + BANKRUPT.falidoDays * DAY_MS, owed, raised };
  s.stats.bankrupt = (s.stats.bankrupt || 0) + 1;
  return { owed, raised, forgiven: Math.max(0, -left), sold, fportIds };
}
