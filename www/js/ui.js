// ===== Interface =====
import {
  DAY_MS, SECTORS, SECTOR, STOCKS, CRYPTOS, ASSETS, BUSINESSES, COURSES, JOBS, PROPERTIES, GOODS, CARDS, UNLOCKS, TRADE_FEE, LOAN_RATE, LEVEL_BONUS,
} from './data.js';
import * as G from './game.js';
import { TICK_MS, tickToMs } from './market.js';

// ---------- formatação ----------
const SUF = ['', ' mil', ' mi', ' bi', ' tri', ' quatri', ' quint', ' sext', ' sept'];
export function fmt(n, dec) {
  if (!isFinite(n)) return '∞';
  const sign = n < 0 ? '-' : '';
  n = Math.abs(n);
  if (n < 1000) {
    const d = dec !== undefined ? dec : n < 10 && n % 1 ? 2 : 0;
    return sign + n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  const i = Math.min(SUF.length - 1, Math.floor(Math.log10(n) / 3));
  const v = n / Math.pow(1000, i);
  const d = v < 10 ? 2 : v < 100 ? 1 : 0;
  return sign + v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }) + SUF[i];
}
export const money = (n, dec) => 'R$ ' + fmt(n, dec);
const price = (n) => 'R$ ' + (n >= 1000 ? fmt(n) : n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: n < 1 ? 4 : 2 }));
const pct = (x, d = 1) => (x >= 0 ? '+' : '') + (x * 100).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }) + '%';
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function dur(ms) {
  ms = Math.max(0, ms);
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h ? `${h}h ${String(m).padStart(2, '0')}min` : `${m}:${String(ss).padStart(2, '0')}`;
}
function ago(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)} dia(s)`;
}
const regLabel = (r) => (r === 1 ? '<span class="up">▲ Alta</span>' : r === -1 ? '<span class="down">▼ Queda</span>' : r === 0 ? '<span class="flat">● Estável</span>' : '<span class="muted">? Incerto</span>');

// ---------- contexto ----------
let C; // { s, mk, save(), afterAction() }
const ui = { tab: 'inicio', sub: { investir: 'bolsa', bens: 'veiculos', perfil: 'ranking' }, bizN: 1 };
const $ = (sel, root = document) => root.querySelector(sel);

export function init(ctx) {
  C = ctx;
  document.addEventListener('click', onClick);
  renderTabs();
  render();
}

// ---------- toasts / modais ----------
export function toast(msg, kind = '') {
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.innerHTML = msg;
  $('#toasts').appendChild(el);
  const all = $('#toasts').children; while (all.length > 3) all[0].remove();
  setTimeout(() => el.classList.add('out'), 2600);
  setTimeout(() => el.remove(), 3000);
}
export function modal(html, cls = '') {
  const root = $('#modal-root');
  root.innerHTML = `<div class="backdrop" data-act="close"></div><div class="sheet ${cls}"><button class="x" data-act="close">✕</button>${html}</div>`;
  root.classList.add('open');
  refresh(true);
}
export function closeModal() {
  const root = $('#modal-root');
  root.classList.remove('open');
  root.innerHTML = '';
}
const modalOpen = () => $('#modal-root').classList.contains('open');

// ---------- ações ----------
function act(fn, okMsg) {
  const r = fn();
  if (typeof r === 'string') { toast('⚠️ ' + r, 'err'); return false; }
  if (okMsg) toast(okMsg, 'ok');
  C.afterAction();
  return r || true;
}

const handlers = {
  close: () => closeModal(),
  tab: (d) => { ui.tab = d.tab; if (d.sub) ui.sub[d.tab] = d.sub; closeModal(); renderTabs(); render(); $('#view').scrollTop = 0; },
  sub: (d) => { ui.sub[ui.tab] = d.sub; render(); $('#view').scrollTop = 0; },
  bizn: (d) => { ui.bizN = d.n === 'max' ? 'max' : +d.n; render(); },
  buybiz: (d) => act(() => G.buyBiz(C.s, d.id, ui.bizN)) && render(),
  course: (d) => act(() => G.startCourse(C.s, d.id), '📚 Curso iniciado!') && render(),
  job: (d) => act(() => G.takeJob(C.s, d.id), '💼 Novo emprego!') && render(),
  asset: (d) => openAsset(d.sym),
  qty: (d) => { const inp = $('#qty'); if (!inp) return; inp.value = d.v; updateTradePreview(); },
  trade: (d) => doTrade(d.sym, d.side),
  sector: (d) => openSector(d.id),
  fixed: (d) => openFixed(d.kind),
  fixedgo: (d) => {
    const v = readAmount();
    if (d.kind === 'saque') act(() => G.withdrawPoup(C.s, v), '🏦 Saque feito');
    else act(() => G.applyFixed(C.s, d.kind, v), '✅ Aplicação feita');
    closeModal(); render();
  },
  pctamt: (d) => { const inp = $('#amt'); inp.value = Math.floor(+d.base * +d.p * 100) / 100; },
  redeem: (d) => act(() => G.redeem(C.s, d.kind, +d.i), '💰 Resgatado') && render(),
  buyprop: (d) => act(() => G.buyProp(C.s, C.mk, d.id), '🔑 Imóvel comprado!') && render(),
  sellprop: (d) => confirmBox('Vender este imóvel?', () => act(() => G.sellProp(C.s, C.mk, d.id), 'Imóvel vendido') && render()),
  buygood: (d) => act(() => G.buyGood(C.s, d.id), '🎉 Comprado!') && render(),
  sellgood: (d) => confirmBox('Vender este bem? Você recebe só uma parte do valor.', () => act(() => G.sellGood(C.s, d.id), 'Vendido') && render()),
  loan: (d) => openLoan(d.kind),
  loango: (d) => {
    const v = readAmount();
    act(() => (d.kind === 'borrow' ? G.borrow(C.s, v) : G.repay(C.s, v)), d.kind === 'borrow' ? '💳 Crédito liberado' : '✅ Pagamento feito');
    closeModal(); render();
  },
  copycode: () => copyCode(),
  addfriend: () => {
    const raw = $('#friendcode').value;
    const d = G.parseCode(raw);
    if (!d) return toast('⚠️ Código inválido', 'err');
    act(() => G.addFriend(C.s, d), `👥 ${esc(d.n)} adicionado ao ranking`) && render();
  },
  delfriend: (d) => confirmBox('Remover do ranking?', () => { C.s.friends = C.s.friends.filter((f) => String(f.id) !== d.id); C.afterAction(); render(); }),
  rename: () => {
    const v = $('#newname').value.trim().slice(0, 18);
    if (!v) return;
    C.s.name = v; C.afterAction(); render(); toast('Nome alterado', 'ok');
  },
  reset: () => confirmBox('Apagar TODO o progresso? Isso não tem volta!', () => { G.wipe(); location.reload(); }),
  help: () => openHelp(),
  confirmyes: () => { const f = pendingConfirm; closeModal(); f && f(); },
};

function onClick(e) {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const h = handlers[el.dataset.act];
  if (h) { e.preventDefault(); h(el.dataset); }
}

let pendingConfirm = null;
function confirmBox(msg, fn) {
  pendingConfirm = fn;
  modal(`<h3>Confirmar</h3><p>${msg}</p><div class="btns"><button class="btn ghost" data-act="close">Cancelar</button><button class="btn" data-act="confirmyes">Confirmar</button></div>`);
}

// ---------- abas ----------
const TABS = [
  { id: 'inicio', icon: '🏠', name: 'Início' },
  { id: 'carreira', icon: '💼', name: 'Carreira' },
  { id: 'empresas', icon: '🏭', name: 'Empresas' },
  { id: 'investir', icon: '📈', name: 'Investir' },
  { id: 'bens', icon: '🛍️', name: 'Bens' },
  { id: 'perfil', icon: '🏆', name: 'Ranking' },
];
function renderTabs() {
  $('#tabs').innerHTML = TABS.map((t) => `<button class="${ui.tab === t.id ? 'on' : ''}" data-act="tab" data-tab="${t.id}"><span>${t.icon}</span><small>${t.name}</small></button>`).join('');
}

export function render() {
  renderTop();
  const v = $('#view');
  const fn = { inicio: vInicio, carreira: vCarreira, empresas: vEmpresas, investir: vInvestir, bens: vBens, perfil: vPerfil }[ui.tab];
  v.innerHTML = fn();
  refresh(true);
}

function renderTop() {
  const s = C.s;
  const c = G.card(s);
  $('#top').innerHTML = `
    <div class="who">
      <div class="avatar">${esc(s.name[0] || '?').toUpperCase()}</div>
      <div class="whoinfo"><b>${esc(s.name)}</b>
        <div class="lvl">Nível <span data-live="lvl"></span><div class="xpbar"><i data-live-w="xp"></i></div></div>
      </div>
      <div class="minicard ${c.cls}" data-act="tab" data-tab="perfil" data-sub="cartoes"><span>${c.name}</span></div>
    </div>
    <div class="money"><div class="cash" data-live="cash"></div><div class="rate" data-live="rate"></div></div>`;
}

const lockBox = (lvl, what) => `<div class="locked"><div class="big">🔒</div><b>${what}</b><p>Desbloqueia no <b>nível ${lvl}</b>.<br>Ganhe experiência estudando, abrindo empresas, comprando bens e conquistando objetivos.</p></div>`;
const subtabs = (list) => `<div class="subtabs">${list.map(([id, name]) => `<button class="${ui.sub[ui.tab] === id ? 'on' : ''}" data-act="sub" data-sub="${id}">${name}</button>`).join('')}</div>`;
const costBtn = (act, data, cost, label = '') => `<button class="btn buy" data-act="${act}" ${Object.entries(data).map(([k, v]) => `data-${k}="${v}"`).join(' ')} data-cost="${cost}">${label}${money(cost)}</button>`;

// ---------- INÍCIO ----------
function bigCard(s, c, idx, locked = false) {
  return `<div class="ccard ${c.cls} ${locked ? 'lockedcard' : ''}">
    <div class="cc-top"><span class="cc-bank">MAGNATA BANK</span><span class="cc-tier">${c.name.toUpperCase()}</span></div>
    <div class="chip"></div>
    <div class="cc-num">•••• •••• •••• ${String(1000 + idx * 731).slice(-4)}</div>
    <div class="cc-bottom"><span>${locked ? 'BLOQUEADO' : esc(s.name.toUpperCase())}</span><span>${locked ? money(c.min) : 'VIP ' + (idx + 1)}</span></div>
  </div>`;
}
function vInicio() {
  const s = C.s;
  const c = G.card(s);
  const next = CARDS[s.cardMax + 1];
  const course = s.course ? COURSES.find((x) => x.id === s.course.id) : null;
  return `
  <section class="hero">
    ${bigCard(s, c, s.cardMax)}
    <div class="nw"><small>Patrimônio líquido</small><b data-live="nw"></b></div>
    ${next ? `<div class="goal"><div class="goalrow"><span>Próximo cartão: <b>${next.name}</b></span><span>${money(next.min)}</span></div><div class="bar"><i data-live-w="nextcard"></i></div></div>` : '<div class="goal">👑 Você tem o cartão mais alto do jogo!</div>'}
  </section>
  ${course ? `<section class="panel"><h4>📚 Estudando: ${course.name}</h4><div class="bar"><i data-live-w="course"></i></div><small class="muted">Termina em <span data-live="coursetime"></span></small></section>` : ''}
  ${tipsPanel()}
  <section class="panel">
    <h4>📊 Fluxo por dia <small class="muted">(1 dia = 1 minuto)</small></h4>
    <div class="flow" data-live-html="flow"></div>
  </section>
  <section class="panel">
    <h4>📰 Notícias do mercado</h4>
    <div class="news" data-live-html="news6"></div>
    <button class="btn ghost full" data-act="tab" data-tab="investir" data-sub="bolsa">Ver mercado</button>
  </section>`;
}
function tipsPanel() {
  const s = C.s;
  const tips = [];
  if (!s.edu.length && !s.course) tips.push('📘 Faça o <b>Ensino Médio</b> na aba Carreira para conseguir empregos melhores.');
  if (!Object.keys(s.biz).length) tips.push('🥟 Abra sua primeira empresa: a <b>Barraca de Pastel</b> gera renda passiva para sempre.');
  if (G.level(s) >= UNLOCKS.bolsa && !s.stats.trades) tips.push('📈 A Bolsa foi liberada! Leia as <b>notícias</b>: setores em alta fazem as ações subirem.');
  if (!s.goods.bike && s.cash > 900) tips.push('🚲 Uma <b>bicicleta</b> aumenta seu salário em 5%. Veículos melhores dão bônus maiores.');
  if (!tips.length) return '';
  return `<section class="panel tips"><h4>💡 Dicas</h4>${tips.slice(0, 2).map((t) => `<p>${t}</p>`).join('')}</section>`;
}
function flowHTML() {
  const ib = G.incomeBreakdown(C.s, C.mk);
  const rows = [
    ['💼 Salário', ib.sal], ['🏭 Empresas', ib.biz], ['🔑 Aluguéis', ib.rent], ['💸 Dividendos', ib.divs], ['🏦 Juros', ib.juros],
    ['🏠 Aluguel de moradia', -ib.moradia], ['🔧 Manutenção dos bens', -ib.manut], ['💳 Juros do empréstimo', -ib.loan],
  ].filter((r) => Math.abs(r[1]) > 0.0001);
  return rows.map(([n, v]) => `<div class="fr"><span>${n}</span><b class="${v < 0 ? 'down' : 'up'}">${v < 0 ? '-' : '+'}${money(Math.abs(v))}</b></div>`).join('') +
    `<div class="fr total"><span>Total por dia</span><b class="${ib.net < 0 ? 'down' : 'up'}">${money(ib.net)}</b></div>` +
    `<div class="fr"><span class="muted">Bônus de nível</span><b class="muted">+${Math.round(LEVEL_BONUS * 100 * (G.level(C.s) - 1))}%</b></div>`;
}
function newsHTML(n) {
  const list = C.mk.news(n);
  if (!list.length) return '<p class="muted">Sem notícias por enquanto.</p>';
  return list.map((x) => `<div class="nitem ${x.dir > 0 ? 'pos' : 'neg'} ${x.kind}"><span class="ni">${x.icon}</span><div><p>${x.text}</p><small>${ago(tickToMs(x.t))}${x.kind === 'forecast' ? ' · previsão (70% de acerto)' : ''}</small></div></div>`).join('');
}

// ---------- CARREIRA ----------
function vCarreira() {
  const s = C.s;
  const job = JOBS.find((j) => j.id === s.job);
  const lvl = G.level(s);
  return `
  <section class="panel jobnow">
    <div class="big">${job.icon}</div>
    <div><small class="muted">Emprego atual</small><h3>${job.name}</h3><b class="up" data-live="salary"></b> <small class="muted">por dia</small>
    ${G.vehicleBonus(s) ? `<br><small class="muted">inclui +${Math.round(G.vehicleBonus(s) * 100)}% do seu veículo</small>` : ''}</div>
  </section>
  <h4 class="sec">🎓 Educação</h4>
  ${COURSES.map((c) => {
    const done = s.edu.includes(c.id);
    const running = s.course && s.course.id === c.id;
    const reqOk = !c.req || s.edu.includes(c.req);
    let right;
    if (done) right = '<span class="tag ok">✓ Concluído</span>';
    else if (running) right = `<span class="tag run" data-live="coursetime"></span>`;
    else if (!reqOk) right = `<span class="tag">Requer ${COURSES.find((x) => x.id === c.req).name}</span>`;
    else if (s.course) right = '<span class="tag">Termine o curso atual</span>';
    else right = costBtn('course', { id: c.id }, c.cost);
    return `<div class="row ${done ? 'dim' : ''}"><div class="ico">${c.icon}</div><div class="grow"><b>${c.name}</b><small>Duração: ${c.mins} min</small>${running ? '<div class="bar"><i data-live-w="course"></i></div>' : ''}</div>${right}</div>`;
  }).join('')}
  <h4 class="sec">💼 Empregos</h4>
  ${JOBS.map((j) => {
    const cur = s.job === j.id;
    const ok = G.canTakeJob(s, j);
    const reqs = [...j.edu.map((e) => COURSES.find((c) => c.id === e).name), j.lvl > 1 ? `Nível ${j.lvl}` : null].filter(Boolean);
    const miss = [...j.edu.filter((e) => !s.edu.includes(e)).map((e) => COURSES.find((c) => c.id === e).name), lvl < j.lvl ? `Nível ${j.lvl}` : null].filter(Boolean);
    return `<div class="row ${cur ? 'cur' : ''}"><div class="ico">${j.icon}</div><div class="grow"><b>${j.name}</b><small>${money(j.salary)}/dia base${reqs.length ? ' · ' + reqs.join(', ') : ''}</small>${!ok ? `<small class="down">Falta: ${miss.join(', ')}</small>` : ''}</div>
    ${cur ? '<span class="tag ok">Atual</span>' : ok ? `<button class="btn" data-act="job" data-id="${j.id}">Assumir</button>` : '<span class="tag">🔒</span>'}</div>`;
  }).join('')}`;
}

// ---------- EMPRESAS ----------
function vEmpresas() {
  const s = C.s;
  const mk = C.mk;
  const total = BUSINESSES.reduce((t, b) => t + G.bizProfit(s, b, mk), 0);
  return `
  <section class="panel row-flat"><div><small class="muted">Lucro das empresas</small><h3 class="up">${money(total)}<small>/dia</small></h3></div>
    <div class="seg">${[1, 10, 'max'].map((n) => `<button class="${ui.bizN === n ? 'on' : ''}" data-act="bizn" data-n="${n}">${n === 'max' ? 'MÁX' : 'x' + n}</button>`).join('')}</div></section>
  <p class="hint">💡 Cada empresa pertence a um setor. Setor em <span class="up">alta</span> = +30% de lucro, em <span class="down">queda</span> = -25%. A cada 10, 25, 50, 100... níveis o lucro <b>dobra</b>.</p>
  ${BUSINESSES.map((b, i) => {
    const lvl = s.biz[b.id] || 0;
    const prevOwned = i === 0 || (s.biz[BUSINESSES[i - 1].id] || 0) > 0;
    if (!lvl && !prevOwned) return `<div class="row dim"><div class="ico">❔</div><div class="grow"><b>???</b><small>Abra a empresa anterior para revelar</small></div></div>`;
    const n = ui.bizN === 'max' ? Math.max(1, G.bizMaxBuy(b, lvl, s.cash)) : ui.bizN;
    const cost = G.bizCost(b, lvl, n);
    const ms = G.nextMilestone(lvl);
    const reg = mk.sectorNow(b.sector);
    const profitNext = b.profit * (lvl + n) * G.bizMult(lvl + n) * G.SECTOR_MULT[reg] * G.levelMult(s) - G.bizProfit(s, b, mk);
    return `<div class="row biz ${lvl ? '' : 'new'}">
      <div class="ico">${b.icon}${lvl ? `<span class="lv">${lvl}</span>` : ''}</div>
      <div class="grow"><b>${b.name}</b>
        <small>${SECTOR[b.sector].icon} ${SECTOR[b.sector].name} · ${reg === 1 ? '<span class="up">em alta</span>' : reg === -1 ? '<span class="down">em queda</span>' : 'estável'}</small>
        ${lvl ? `<small>Lucro: <b class="up">${money(G.bizProfit(s, b, mk))}/dia</b> · x${G.bizMult(lvl)}</small>` : `<small>Lucro inicial: ${money(b.profit * G.SECTOR_MULT[reg] * G.levelMult(s))}/dia</small>`}
        ${lvl && ms ? `<div class="bar thin"><i style="width:${Math.min(100, (lvl / ms) * 100)}%"></i></div><small class="muted">${ms - lvl} níveis para dobrar o lucro</small>` : ''}
      </div>
      <div class="col"><small class="up">+${money(profitNext)}/dia</small>${costBtn('buybiz', { id: b.id }, cost, lvl ? `+${n} ` : 'Abrir ')}</div>
    </div>`;
  }).join('')}`;
}

// ---------- INVESTIR ----------
function vInvestir() {
  const s = C.s;
  const sub = ui.sub.investir;
  const head = subtabs([['bolsa', '📈 Bolsa'], ['cripto', '🪙 Cripto'], ['renda', '🏦 Renda Fixa'], ['imoveis', '🔑 Imóveis'], ['credito', '💳 Crédito']]);
  const L = G.level(s);
  let body = '';
  if (sub === 'bolsa') body = L < UNLOCKS.bolsa ? lockBox(UNLOCKS.bolsa, 'Bolsa de Valores') : vBolsa(STOCKS, true);
  if (sub === 'cripto') body = L < UNLOCKS.cripto ? lockBox(UNLOCKS.cripto, 'Criptomoedas') : vBolsa(CRYPTOS, false);
  if (sub === 'renda') body = vRenda();
  if (sub === 'imoveis') body = L < UNLOCKS.imoveis ? lockBox(UNLOCKS.imoveis, 'Imóveis para alugar') : vImoveis();
  if (sub === 'credito') body = L < UNLOCKS.credito ? lockBox(UNLOCKS.credito, 'Crédito') : vCredito();
  return head + body;
}

function portfolioValue(list) {
  let v = 0, cost = 0;
  for (const a of list) { const h = C.s.port[a.sym]; if (h && h.q > 0) { v += h.q * C.mk.price(a.sym); cost += h.cost; } }
  return { v, cost };
}
function vBolsa(list, stocks) {
  const pv = portfolioValue(list);
  return `
  <section class="panel">
    <div class="row-flat"><div><small class="muted">Sua carteira</small><h3 data-live="pv:${stocks ? 's' : 'c'}"></h3></div><div class="right"><small class="muted">Resultado</small><b data-live="pl:${stocks ? 's' : 'c'}"></b></div></div>
    <small class="muted">Próximo pregão em <span data-live="nexttick"></span> · Taxa de corretagem ${(TRADE_FEE * 100).toFixed(1)}%</small>
  </section>
  ${stocks ? `<section class="panel"><h4>🧭 Termômetro dos setores <small class="muted">· ciclo muda em <span data-live="nextblock"></span></small></h4>
    <div class="sectors" data-live-html="sectors"></div>
    <small class="muted">Toque num setor para entender. Previsões acertam ~70% das vezes. A confirmação sai 15 min após o início do ciclo.</small></section>` : `<p class="hint">⚠️ Criptomoedas são MUITO voláteis: podem dobrar ou derreter em uma hora. Compra fracionada por valor.</p>
    <section class="panel"><h4>🪙 Ciclo cripto</h4><div class="sectors" data-live-html="cryptosector"></div></section>`}
  <div class="list">${list.map((a) => `
    <div class="row asset" data-act="asset" data-sym="${a.sym}">
      <div class="ico">${SECTOR[a.sector].icon}</div>
      <div class="grow"><b>${a.name}</b><small>${a.sym}${a.div ? ` · 💸 div. ${(a.div * 100).toFixed(2)}%/dia` : ''}</small><small class="held" data-live="held:${a.sym}"></small></div>
      <svg class="spark" data-spark="${a.sym}" viewBox="0 0 64 28" preserveAspectRatio="none"></svg>
      <div class="right"><b data-live="price:${a.sym}"></b><small data-live="chg:${a.sym}"></small></div>
    </div>`).join('')}</div>
  <section class="panel"><h4>📰 Notícias</h4><div class="news" data-live-html="news20"></div></section>`;
}
function sectorsHTML(ids) {
  const mk = C.mk;
  return ids.map((id) => {
    const sc = SECTOR[id];
    const k = mk.sectorKnown(id);
    const f = mk.sectorForecast(id);
    return `<div class="sct" data-act="sector" data-id="${id}"><span>${sc.icon}</span><b>${sc.name}</b><div>${regLabel(k)}</div><small>Próx: ${f === null ? '<span class="muted">aguardando</span>' : regLabel(f)}</small></div>`;
  }).join('');
}
function openSector(id) {
  const sc = SECTOR[id];
  const assets = ASSETS.filter((a) => a.sector === id);
  const biz = BUSINESSES.filter((b) => b.sector === id);
  modal(`<h3>${sc.icon} ${sc.name}</h3>
  <p>Agora: ${regLabel(C.mk.sectorKnown(id))}<br>Próximo ciclo (previsão): ${regLabel(C.mk.sectorForecast(id))}</p>
  <p class="muted">Cada ciclo dura 1 hora. Em <b>alta</b>, as ações do setor tendem a subir e as suas empresas desse setor lucram +30%. Em <b>queda</b>, o contrário. A previsão sai 20 min antes do ciclo começar e acerta ~70% das vezes — quem compra antes da confirmação arrisca mais, mas pode lucrar mais.</p>
  <h4>Ativos</h4>${assets.map((a) => `<div class="row" data-act="asset" data-sym="${a.sym}"><div class="grow"><b>${a.name}</b><small>${a.sym}</small></div><div class="right"><b data-live="price:${a.sym}"></b><small data-live="chg:${a.sym}"></small></div></div>`).join('')}
  ${biz.length ? `<h4>Suas empresas do setor</h4><p>${biz.map((b) => `${b.icon} ${b.name}`).join('<br>')}</p>` : ''}`);
}

function sparkPath(h, w, hh, pad = 2) {
  if (h.length < 2) return '';
  const mn = Math.min(...h), mx = Math.max(...h);
  const r = mx - mn || 1;
  return h.map((v, i) => `${i ? 'L' : 'M'}${((i / (h.length - 1)) * w).toFixed(1)},${(pad + (1 - (v - mn) / r) * (hh - 2 * pad)).toFixed(1)}`).join('');
}
function drawSparks() {
  document.querySelectorAll('[data-spark]').forEach((el) => {
    const h = C.mk.history(el.dataset.spark);
    const up = h.length > 1 && h[h.length - 1] >= h[0];
    const big = el.classList.contains('chart');
    const w = big ? 300 : 64, hh = big ? 140 : 28;
    const d = sparkPath(h, w, hh, big ? 8 : 2);
    el.innerHTML = big
      ? `<path d="${d} L${w},${hh} L0,${hh} Z" class="area ${up ? 'up' : 'down'}"/><path d="${d}" class="line ${up ? 'up' : 'down'}"/>`
      : `<path d="${d}" class="line ${up ? 'up' : 'down'}"/>`;
  });
}

let tradeSym = null;
function openAsset(sym) {
  const a = ASSETS.find((x) => x.sym === sym);
  const crypto = G.isCrypto(sym);
  tradeSym = sym;
  const h = C.s.port[sym];
  modal(`<h3>${SECTOR[a.sector].icon} ${a.name} <small class="muted">${a.sym}</small></h3>
    <div class="row-flat"><b class="bigprice" data-live="price:${sym}"></b><span data-live="chg:${sym}"></span></div>
    <svg class="spark chart" data-spark="${sym}" viewBox="0 0 300 140" preserveAspectRatio="none"></svg>
    <small class="muted">Última hora · setor ${SECTOR[a.sector].name}: ${regLabel(C.mk.sectorKnown(a.sector))}${a.div ? ` · paga ${(a.div * 100).toFixed(2)}% ao dia em dividendos` : ''}</small>
    <div class="held big" data-live="heldfull:${sym}"></div>
    <label class="lbl">${crypto ? 'Quantidade (pode ser fracionada)' : 'Quantidade de ações'}</label>
    <input id="qty" type="number" inputmode="decimal" min="0" step="${crypto ? 'any' : '1'}" value="${crypto ? '' : 1}" placeholder="0">
    <div class="quick">${crypto ? '' : '<button class="btn ghost sm" data-act="qty" data-v="1">1</button><button class="btn ghost sm" data-act="qty" data-v="10">10</button><button class="btn ghost sm" data-act="qty" data-v="100">100</button>'}
      <button class="btn ghost sm" data-act="qty" data-v="${maxBuy(sym)}">Máx compra</button>
      ${h && h.q > 0 ? `<button class="btn ghost sm" data-act="qty" data-v="${h.q}">Tudo que tenho</button>` : ''}</div>
    <div class="preview" id="tradeprev"></div>
    <div class="btns"><button class="btn sell" data-act="trade" data-side="sell" data-sym="${sym}">Vender</button><button class="btn" data-act="trade" data-side="buy" data-sym="${sym}">Comprar</button></div>`);
  const inp = $('#qty');
  inp.addEventListener('input', updateTradePreview);
  updateTradePreview();
}
function maxBuy(sym) {
  const p = C.mk.price(sym) * (1 + TRADE_FEE);
  const q = Math.max(0, C.s.cash) / p;
  return G.isCrypto(sym) ? Math.floor(q * 1e6) / 1e6 : Math.floor(q);
}
function updateTradePreview() {
  const el = $('#tradeprev');
  if (!el || !tradeSym) return;
  const q = parseFloat($('#qty').value) || 0;
  const p = C.mk.price(tradeSym);
  el.innerHTML = `Total: <b>${money(q * p)}</b> <small class="muted">(+ ${money(q * p * TRADE_FEE)} de taxa)</small>`;
}
function doTrade(sym, side) {
  let q = parseFloat($('#qty').value);
  if (!G.isCrypto(sym)) q = Math.floor(q);
  const r = act(() => G.trade(C.s, C.mk, sym, q, side));
  if (!r) return;
  if (side === 'buy') toast(`✅ Comprou ${fmt(q)} ${sym}`, 'ok');
  else toast(r.profit >= 0 ? `💰 Lucro de ${money(r.profit)}!` : `📉 Prejuízo de ${money(-r.profit)}`, r.profit >= 0 ? 'ok' : 'err');
  closeModal(); render();
}

function vRenda() {
  const s = C.s;
  const cdi = C.mk.cdi();
  const now = Date.now();
  const list = (kind) => s[kind].map((x, i) => {
    const ready = now >= x.until;
    return `<div class="row sm"><div class="grow"><b>${money(x.amt)}</b><small>${ready ? 'Disponível para resgate' : 'Libera em ' + dur(x.until - now)}</small></div>${ready ? `<button class="btn sm" data-act="redeem" data-kind="${kind}" data-i="${i}">Resgatar</button>` : '<span class="tag">🔒</span>'}</div>`;
  }).join('');
  return `
  <p class="hint">🏦 Renda fixa é segura: rende sempre, sem risco. Mas rende menos que empresas e ações em alta. O CDI muda a cada 6 horas.</p>
  <section class="panel"><div class="row-flat"><span>CDI atual</span><b>${(cdi * 100).toFixed(3)}% ao dia</b></div></section>
  <section class="panel">
    <div class="row-flat"><div><h4>🐷 Poupança</h4><small class="muted">${(cdi * 70).toFixed(3)}%/dia · saque a qualquer hora</small></div><b data-live="poup"></b></div>
    <div class="btns"><button class="btn ghost" data-act="fixed" data-kind="saque">Sacar</button><button class="btn" data-act="fixed" data-kind="poup">Depositar</button></div>
  </section>
  <section class="panel">
    <div class="row-flat"><div><h4>📄 CDB</h4><small class="muted">${(cdi * 110).toFixed(3)}%/dia · carência de 1 hora</small></div><b>${money(s.cdb.reduce((t, x) => t + x.amt, 0))}</b></div>
    ${list('cdb')}
    <button class="btn full" data-act="fixed" data-kind="cdb">Aplicar no CDB</button>
  </section>
  <section class="panel">
    <div class="row-flat"><div><h4>🏛️ Tesouro</h4><small class="muted">${(cdi * 130).toFixed(3)}%/dia · carência de 4 horas</small></div><b>${money(s.tes.reduce((t, x) => t + x.amt, 0))}</b></div>
    ${list('tes')}
    <button class="btn full" data-act="fixed" data-kind="tes">Investir no Tesouro</button>
  </section>`;
}
function readAmount() { return parseFloat(($('#amt') || {}).value) || 0; }
function amountModal(title, desc, base, go, kind) {
  modal(`<h3>${title}</h3><p class="muted">${desc}</p>
    <input id="amt" type="number" inputmode="decimal" min="0" placeholder="Valor em R$">
    <div class="quick">${[0.25, 0.5, 1].map((p) => `<button class="btn ghost sm" data-act="pctamt" data-p="${p}" data-base="${Math.max(0, base)}">${p * 100}%</button>`).join('')}</div>
    <div class="btns"><button class="btn ghost" data-act="close">Cancelar</button><button class="btn" data-act="${go}" data-kind="${kind}">Confirmar</button></div>`);
}
function openFixed(kind) {
  const s = C.s;
  if (kind === 'saque') return amountModal('Sacar da poupança', `Saldo: ${money(s.poup)}`, s.poup, 'fixedgo', 'saque');
  const names = { poup: 'Depositar na poupança', cdb: 'Aplicar no CDB', tes: 'Investir no Tesouro' };
  amountModal(names[kind], `Disponível: ${money(s.cash)}`, s.cash, 'fixedgo', kind);
}

function vImoveis() {
  const s = C.s;
  const idx = C.mk.realEstateIndex();
  return `
  <p class="hint">🔑 Imóveis pagam aluguel todo dia e valorizam (ou desvalorizam) junto com o setor Imobiliário. Bom para renda estável.</p>
  <section class="panel row-flat"><div><small class="muted">Índice imobiliário</small><h3 class="${idx >= 1 ? 'up' : 'down'}">${pct(idx - 1)}</h3></div><div class="right"><small class="muted">Setor agora</small><div>${regLabel(C.mk.sectorKnown('realestate'))}</div></div></section>
  ${PROPERTIES.map((p) => {
    const n = s.props[p.id] || 0;
    const cost = p.cost * idx;
    return `<div class="row"><div class="ico">${p.icon}${n ? `<span class="lv">${n}</span>` : ''}</div><div class="grow"><b>${p.name}</b><small>Aluguel: <b class="up">${money(p.rent * G.levelMult(s))}/dia</b> · ${(p.rent / cost * 100).toFixed(2)}%</small>${n ? `<small>Você tem ${n} · rende ${money(n * p.rent * G.levelMult(s))}/dia</small>` : ''}</div>
    <div class="col">${costBtn('buyprop', { id: p.id }, cost)}${n ? `<button class="btn ghost sm" data-act="sellprop" data-id="${p.id}">Vender</button>` : ''}</div></div>`;
  }).join('')}`;
}

function vCredito() {
  const s = C.s;
  const c = G.card(s);
  return `
  <p class="hint">💳 Empréstimo é uma faca de dois gumes: dá para abrir uma empresa antes, mas os juros (${(LOAN_RATE * 100).toFixed(2)}% ao dia) correm sem parar. O limite depende do seu cartão.</p>
  <section class="panel">
    <div class="row-flat"><span>Cartão</span><b>${c.name}</b></div>
    <div class="row-flat"><span>Limite total</span><b>${money(c.limit)}</b></div>
    <div class="row-flat"><span>Dívida atual</span><b class="down" data-live="debt"></b></div>
    <div class="row-flat"><span>Juros por dia</span><b class="down" data-live="debtint"></b></div>
    <div class="btns"><button class="btn ghost" data-act="loan" data-kind="repay">Pagar</button><button class="btn" data-act="loan" data-kind="borrow">Pegar empréstimo</button></div>
  </section>`;
}
function openLoan(kind) {
  const s = C.s;
  if (kind === 'borrow') amountModal('Pegar empréstimo', `Disponível: ${money(G.card(s).limit - s.debt)}`, G.card(s).limit - s.debt, 'loango', 'borrow');
  else amountModal('Pagar dívida', `Dívida: ${money(s.debt)}`, Math.min(s.debt, s.cash), 'loango', 'repay');
}

// ---------- BENS ----------
function vBens() {
  const s = C.s;
  const sub = ui.sub.bens;
  const list = GOODS[sub];
  const info = {
    veiculos: '🚗 Veículos aumentam seu <b>salário</b> (só o melhor conta). Revenda: 60% do valor.',
    moradia: `🏠 Ter moradia própria elimina o aluguel de ${money(15)}/dia e aumenta as <b>horas de renda offline</b>. Revenda: 90%.`,
    luxo: '💎 Itens de luxo dão muito <b>prestígio</b>, que aparece no ranking. Revenda: 75%.',
  }[sub];
  return subtabs([['veiculos', '🚗 Veículos'], ['moradia', '🏠 Moradia'], ['luxo', '💎 Luxo']]) + `
  <section class="panel row-flat"><div><small class="muted">Prestígio</small><h3>✨ ${fmt(G.prestige(s))}</h3></div><div class="right"><small class="muted">Cashback do cartão</small><h3>${Math.round(G.card(s).cashback * 100)}%</h3></div></section>
  <p class="hint">${info} Bens têm manutenção de 0,02% do valor por dia.</p>
  <div class="goods">${list.map((g) => {
    const own = !!s.goods[g.id];
    const perk = g.bonus ? `+${Math.round(g.bonus * 100)}% salário` : g.hours ? `+${g.hours}h offline` : '';
    return `<div class="good ${own ? 'own' : ''}"><div class="gi">${g.icon}</div><b>${g.name}</b><small>✨ ${g.prestige} ${perk ? '· ' + perk : ''}</small>
      ${own ? `<span class="tag ok">✓ Seu</span><button class="btn ghost sm" data-act="sellgood" data-id="${g.id}">Vender</button>` : costBtn('buygood', { id: g.id }, g.cost)}</div>`;
  }).join('')}</div>`;
}

// ---------- PERFIL / RANKING ----------
function vPerfil() {
  const sub = ui.sub.perfil;
  const head = subtabs([['ranking', '🏆 Ranking'], ['cartoes', '💳 Cartões'], ['conquistas', '🎖️ Conquistas'], ['ajustes', '⚙️ Ajustes']]);
  if (sub === 'cartoes') return head + vCartoes();
  if (sub === 'conquistas') return head + vConquistas();
  if (sub === 'ajustes') return head + vAjustes();
  return head + vRanking();
}
function vRanking() {
  const s = C.s;
  const me = { n: s.name, w: G.netWorth(s, C.mk), l: G.level(s), a: Object.keys(s.ach).length, c: s.cardMax, p: G.prestige(s), t: Date.now(), me: true };
  const all = [me, ...s.friends].sort((a, b) => b.w - a.w);
  const medal = ['🥇', '🥈', '🥉'];
  return `
  <section class="panel">
    <h4>👨‍👩‍👧 Ranking da família</h4>
    ${all.map((p, i) => `<div class="rank ${p.me ? 'me' : ''}"><span class="pos">${medal[i] || i + 1 + 'º'}</span>
      <div class="grow"><b>${esc(p.n)}${p.me ? ' (você)' : ''}</b><small>Nv ${p.l} · 💳 ${CARDS[p.c].name} · 🎖️ ${p.a} · ✨ ${fmt(p.p)}</small><small class="muted">${p.me ? 'ao vivo' : 'atualizado ' + ago(p.t)}</small></div>
      <div class="right"><b>${money(p.w)}</b>${p.me ? '' : `<button class="lnk" data-act="delfriend" data-id="${p.id}">remover</button>`}</div></div>`).join('')}
  </section>
  <section class="panel">
    <h4>📤 Seu código</h4>
    <p class="muted">Copie e mande no grupo da família (WhatsApp). Cada um cola o código dos outros aqui embaixo para atualizar o ranking.</p>
    <textarea id="mycode" readonly rows="3">${G.shareCode(s, C.mk)}</textarea>
    <button class="btn full" data-act="copycode">📋 Copiar meu código</button>
  </section>
  <section class="panel">
    <h4>📥 Adicionar código de alguém</h4>
    <textarea id="friendcode" rows="3" placeholder="Cole aqui o código MAG1..."></textarea>
    <button class="btn full" data-act="addfriend">Adicionar / Atualizar</button>
  </section>
  <p class="hint">🎯 O mercado é o MESMO para todos: as notícias e os preços que você vê são iguais aos dos outros jogadores. Vence quem tomar as melhores decisões!</p>`;
}
function copyCode() {
  const ta = $('#mycode');
  ta.value = G.shareCode(C.s, C.mk);
  const done = () => toast('📋 Código copiado! Agora cole no WhatsApp.', 'ok');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(done, () => { ta.select(); document.execCommand('copy'); done(); });
  else { ta.select(); document.execCommand('copy'); done(); }
}
function vCartoes() {
  const s = C.s;
  return `<p class="hint">💳 Cartões são desbloqueados quando seu patrimônio atinge cada patamar — e ficam com você para sempre. Cada um aumenta cashback, limite de crédito e horas de renda offline.</p>
  <div class="cards">${CARDS.map((c, i) => `<div class="cardwrap">${bigCard(s, c, i, i > s.cardMax)}
    <small>${i <= s.cardMax ? '✅ ' : '🔒 '}<b>${c.name}</b> · ${money(c.min)}<br>Cashback ${Math.round(c.cashback * 100)}% · Limite ${money(c.limit)} · Offline ${c.hours}h</small></div>`).join('')}</div>`;
}
function vConquistas() {
  const s = C.s;
  const got = G.ACHIEVEMENTS.filter((a) => s.ach[a.id]).length;
  return `<section class="panel row-flat"><h3>🎖️ ${got} / ${G.ACHIEVEMENTS.length}</h3><small class="muted">Cada conquista dá +80 XP</small></section>
  <div class="achs">${G.ACHIEVEMENTS.map((a) => `<div class="ach ${s.ach[a.id] ? 'got' : ''}"><span>${s.ach[a.id] ? a.icon : '🔒'}</span><div><b>${a.name}</b><small>${a.desc}</small></div></div>`).join('')}</div>`;
}
function vAjustes() {
  const s = C.s;
  return `<section class="panel"><h4>✏️ Seu nome</h4><input id="newname" maxlength="18" value="${esc(s.name)}"><button class="btn full" data-act="rename">Salvar nome</button></section>
  <section class="panel"><h4>📖 Como jogar</h4><button class="btn ghost full" data-act="help">Abrir guia</button></section>
  <section class="panel"><h4>📈 Estatísticas</h4>
    <div class="row-flat"><span>Dias jogados</span><b>${fmt(Math.floor((Date.now() - s.created) / DAY_MS))}</b></div>
    <div class="row-flat"><span>Total ganho</span><b>${money(s.stats.earned)}</b></div>
    <div class="row-flat"><span>Operações na bolsa</span><b>${s.stats.trades}</b></div>
    <div class="row-flat"><span>Lucro com trades</span><b class="${s.stats.tradeProfit >= 0 ? 'up' : 'down'}">${money(s.stats.tradeProfit)}</b></div>
    <div class="row-flat"><span>Dividendos recebidos</span><b>${money(s.stats.divs)}</b></div>
    <div class="row-flat"><span>Maior patrimônio</span><b>${money(s.peakNW)}</b></div>
  </section>
  <p class="muted" style="text-align:center">Versão do jogo: ${esc(window.GAME_VERSION || '?')} · atualiza sozinho</p>
  <section class="panel danger"><h4>⚠️ Zona de perigo</h4><button class="btn sell full" data-act="reset">Apagar progresso e recomeçar</button></section>`;
}

export function openHelp() {
  modal(`<h3>📖 Como jogar</h3>
  <p><b>Objetivo:</b> ter o maior patrimônio da família. Aqui não tem que ficar tocando na tela — o dinheiro vem das suas <b>decisões</b>.</p>
  <p>⏱️ <b>1 dia no jogo = 1 minuto real.</b> Salário, lucros e juros caem continuamente. Com o app fechado você continua ganhando por algumas horas (aumenta com cartões e moradia).</p>
  <p>💼 <b>Carreira:</b> estude para pegar empregos melhores. Cursos levam tempo real.</p>
  <p>🏭 <b>Empresas:</b> renda passiva. Cada nível aumenta o lucro e, em 10/25/50/100 níveis, o lucro dobra.</p>
  <p>📈 <b>Bolsa e Cripto:</b> o mercado é o MESMO para todos os jogadores. A cada hora cada setor entra num ciclo de alta, queda ou estabilidade. Leia as <b>previsões</b> (70% de acerto) e as <b>confirmações</b> nas notícias para comprar na hora certa.</p>
  <p>🏦 <b>Renda fixa:</b> segura, mas rende menos. 🔑 <b>Imóveis:</b> aluguel todo dia. 💳 <b>Crédito:</b> antecipa compras, mas cobra juros.</p>
  <p>💳 <b>Cartões:</b> desbloqueados por patrimônio. Dão cashback, limite e horas offline.</p>
  <p>🏆 <b>Ranking:</b> copie seu código e mande no grupo. Cole o dos outros para ver quem está na frente.</p>
  <button class="btn full" data-act="close">Bora ficar rico! 🚀</button>`);
}

// ---------- atualização ao vivo ----------
function liveValue(key) {
  const s = C.s, mk = C.mk;
  const [k, arg] = key.split(':');
  switch (k) {
    case 'cash': return money(s.cash);
    case 'rate': { const n = G.incomeBreakdown(s, mk).net; return { t: `${n >= 0 ? '+' : ''}${money(n)}/dia`, c: n >= 0 ? 'up' : 'down' }; }
    case 'lvl': return G.level(s);
    case 'nw': return money(G.netWorth(s, mk));
    case 'salary': return money(G.salary(s));
    case 'poup': return money(s.poup);
    case 'debt': return money(s.debt);
    case 'debtint': return money(s.debt * LOAN_RATE);
    case 'coursetime': return s.course ? dur(s.course.end - Date.now()) : '';
    case 'nexttick': return dur(mk.msToNextTick());
    case 'nextblock': return dur(mk.msToNextBlock());
    case 'price': return price(mk.price(arg));
    case 'chg': { const c = mk.change(arg); return { t: pct(c) + ' 1h', c: c >= 0 ? 'up' : 'down' }; }
    case 'held': case 'heldfull': {
      const h = s.port[arg];
      if (!h || !(h.q > 0)) return k === 'heldfull' ? 'Você não tem este ativo.' : '';
      const v = h.q * mk.price(arg);
      const pl = v / h.cost - 1;
      const q = G.isCrypto(arg) ? fmt(h.q, h.q < 10 ? 4 : 2) : fmt(h.q);
      return { t: `Você tem ${q} · ${money(v)} (${pct(pl)})`, c: pl >= 0 ? 'up' : 'down' };
    }
    case 'pv': case 'pl': {
      const r = portfolioValue(arg === 's' ? STOCKS : CRYPTOS);
      if (k === 'pv') return money(r.v);
      const d = r.v - r.cost;
      return { t: (d >= 0 ? '+' : '') + money(d), c: d >= 0 ? 'up' : 'down' };
    }
  }
  return '';
}
function liveHTML(key) {
  switch (key) {
    case 'flow': return flowHTML();
    case 'news6': return newsHTML(6);
    case 'news20': return newsHTML(20);
    case 'sectors': return sectorsHTML(SECTORS.filter((x) => x.id !== 'crypto').map((x) => x.id));
    case 'cryptosector': return sectorsHTML(['crypto']);
  }
  return '';
}
function liveWidth(key) {
  const s = C.s;
  if (key === 'xp') { const L = G.level(s); const a = G.xpForLevel(L), b = G.xpForLevel(L + 1); return (s.xp - a) / (b - a); }
  if (key === 'course') { if (!s.course) return 0; return (Date.now() - s.course.start) / (s.course.end - s.course.start); }
  if (key === 'nextcard') { const n = CARDS[s.cardMax + 1]; if (!n) return 1; const p = CARDS[s.cardMax].min; return (G.netWorth(s, C.mk) - p) / (n.min - p); }
  return 0;
}

// refresh leve (a cada ~250ms). heavy=true quando o mercado muda
export function refresh(heavy = false) {
  if (!C) return;
  document.querySelectorAll('[data-live]').forEach((el) => {
    const v = liveValue(el.dataset.live);
    if (typeof v === 'object') { if (el.textContent !== v.t) el.textContent = v.t; el.classList.toggle('up', v.c === 'up'); el.classList.toggle('down', v.c === 'down'); }
    else if (el.textContent !== String(v)) el.textContent = v;
  });
  document.querySelectorAll('[data-live-w]').forEach((el) => {
    el.style.width = Math.max(0, Math.min(100, liveWidth(el.dataset.liveW) * 100)) + '%';
  });
  document.querySelectorAll('[data-cost]').forEach((el) => el.classList.toggle('cant', C.s.cash < +el.dataset.cost));
  if (heavy) {
    document.querySelectorAll('[data-live-html]').forEach((el) => { el.innerHTML = liveHTML(el.dataset.liveHtml); });
    drawSparks();
  }
}
export function onMarketTick() {
  // re-renderiza blocos pesados; se aba depende de preços, atualiza
  refresh(true);
  if (ui.tab === 'empresas' && !modalOpen()) render();
}
export function slowRefresh() {
  // fluxo muda continuamente; atualiza a cada poucos segundos
  document.querySelectorAll('[data-live-html="flow"]').forEach((el) => { el.innerHTML = flowHTML(); });
}
export { ui };
