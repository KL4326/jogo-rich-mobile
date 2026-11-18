// ===== Interface (visual de jogo) =====
import {
  BRANDS, TIERS, OWN_TIERS, TRIP_CATS, TRIPS, LOVE_STAGES, DATES, GIFTS, RING_COST, WEDDINGS,
  DAY_MS, SECTORS, SECTOR, STOCKS, CRYPTOS, ASSETS, BUSINESSES, COURSES, JOBS, PROPERTIES, GOODS, CARDS, UNLOCKS, TRADE_FEE, LOAN_RATE, LEVEL_BONUS, RENT_NO_HOME,
} from './data.js';
import * as G from './game.js';
import { avatarSVG, defaultLook, SKINS, HAIR_COLORS, EYE_COLORS, HAIRS, BEARDS, CLOTHES, SLOTS, SETS, CLOTH } from './avatar.js';
import { townSVG } from './town.js';
import * as A from './audio.js';
import { tickToMs } from './market.js';

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
export function fmtOwn(p) {
  const v = p * 100;
  if (!v) return '0%';
  const t = v >= 10 ? v.toFixed(1) : v >= 0.01 ? v.toFixed(2) : v < 0.0001 ? '<0,0001' : v.toFixed(4);
  return t.replace('.', ',') + '%';
}
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function dur(ms) {
  ms = Math.max(0, ms);
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h ? `${h}h${String(m).padStart(2, '0')}` : `${m}:${String(ss).padStart(2, '0')}`;
}
function ago(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}
// clima do setor: 🔥 alta, ❄️ queda, ➖ estável, ❔ desconhecido
const WX = { 1: '🔥', '-1': '❄️', 0: '➖', null: '❔' };
const WXN = { 1: 'Em alta', '-1': 'Em queda', 0: 'Estável', null: 'Incerto' };
const wxCls = (r) => (r === 1 ? 'hot' : r === -1 ? 'cold' : r === 0 ? 'calm' : 'unk');

// ---------- contexto ----------
let C;
const ui = { tab: 'inicio', sub: { investir: 'bolsa', bens: 'veiculos', perfil: 'ranking', vida: 'carreira' }, bizN: 1 };
const $ = (sel, root = document) => root.querySelector(sel);

export function init(ctx) {
  C = ctx;
  document.addEventListener('click', onClick);
  document.addEventListener('input', (e) => { const k = e.target.dataset && e.target.dataset.vol; if (k) { A.setVol(k, +e.target.value); if (k === 'svol') A.sfx('coin'); } });
  // No PC: rodinha do mouse rola as faixas horizontais
  document.addEventListener('wheel', (e) => {
    const el = e.target.closest('.subtabs, .wxrow, .street, .lifechips');
    if (el && Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) { el.scrollLeft += e.deltaY; e.preventDefault(); }
  }, { passive: false });
  renderTabs();
  render();
}

// ---------- efeitos ----------
export function toast(msg, kind = '', snd) {
  if (snd !== false) A.sfx(snd || (kind === 'err' ? 'error' : kind === 'gold' ? 'notify' : ''));
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.innerHTML = msg;
  $('#toasts').appendChild(el);
  const all = $('#toasts').children; while (all.length > 3) all[0].remove();
  setTimeout(() => el.classList.add('out'), 2600);
  setTimeout(() => el.remove(), 3000);
}
function burst(el, glyph = '🪙', n = 7) {
  if (!el || !el.getBoundingClientRect) return;
  A.sfx(glyph === '❤️' ? 'love' : 'coin');
  const r = el.getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const p = document.createElement('span');
    p.className = 'coin';
    p.textContent = glyph;
    p.style.left = r.left + r.width / 2 + 'px';
    p.style.top = r.top + r.height / 2 + 'px';
    p.style.setProperty('--dx', (Math.random() * 140 - 70) + 'px');
    p.style.setProperty('--dy', (-60 - Math.random() * 90) + 'px');
    p.style.animationDelay = i * 25 + 'ms';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1100);
  }
}
export function confetti() {
  A.sfx('fanfare');
  const colors = ['#ffc93c', '#ff6b9a', '#4dabff', '#3ddc84', '#b07bff'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('i');
    p.className = 'confetti';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = Math.random() * 0.5 + 's';
    p.style.setProperty('--rot', Math.random() * 720 + 'deg');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 2600);
  }
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
function act(fn, okMsg, el) {
  const r = fn();
  if (typeof r === 'string') { toast('⚠️ ' + r, 'err'); return false; }
  if (okMsg) toast(okMsg, 'ok');
  if (el) burst(el);
  C.afterAction();
  return r || true;
}

const handlers = {
  close: () => closeModal(),
  tab: (d) => { ui.tab = d.tab; if (d.sub) ui.sub[d.tab] = d.sub; closeModal(); renderTabs(); render(true); $('#view').scrollTop = 0; },
  sub: (d) => { ui.sub[ui.tab] = d.sub; render(true); $('#view').scrollTop = 0; },
  bizn: (d) => { ui.bizN = d.n === 'max' ? 'max' : +d.n; render(); },
  buybiz: (d, el) => { const sc = $('#view').scrollTop; if (act(() => G.buyBiz(C.s, d.id, ui.bizN), null, el)) { render(); $('#view').scrollTop = sc; } },
  course: (d, el) => act(() => G.startCourse(C.s, d.id), '📚 Bons estudos!', el) && render(),
  job: (d, el) => act(() => G.takeJob(C.s, d.id), '💼 Novo emprego!', el) && render(),
  asset: (d) => openAsset(d.sym),
  qty: (d) => { const inp = $('#qty'); if (!inp) return; inp.value = d.v; updateTradePreview(); },
  trade: (d) => doTrade(d.sym, d.side),
  sector: (d) => openSector(d.id),
  fixed: (d) => openFixed(d.kind),
  fixedgo: (d) => {
    const v = readAmount();
    if (d.kind === 'saque') act(() => G.withdrawPoup(C.s, v), '🏦 Saque feito');
    else act(() => G.applyFixed(C.s, d.kind, v), '✅ Dinheiro aplicado');
    closeModal(); render();
  },
  pctamt: (d) => { const inp = $('#amt'); inp.value = Math.floor(+d.base * +d.p * 100) / 100; },
  redeem: (d, el) => act(() => G.redeem(C.s, d.kind, +d.i), '💰 Resgatado', el) && render(),
  buyprop: (d, el) => act(() => G.buyProp(C.s, C.mk, d.id), '🔑 Imóvel comprado!', el) && render(),
  sellprop: (d) => confirmBox('Vender este imóvel?', () => act(() => G.sellProp(C.s, C.mk, d.id), 'Imóvel vendido') && render()),
  good: (d) => openGood(d.id),
  buygood: (d, el) => { if (act(() => G.buyGood(C.s, d.id), null, el)) { closeModal(); confetti(); toast(`🎉 ${G_NAME(d.id)} é seu!`, 'gold'); render(); } },
  sellgood: (d) => confirmBox('Vender este bem? Você recebe só uma parte do valor.', () => act(() => G.sellGood(C.s, d.id), 'Vendido') && render()),
  loan: (d) => openLoan(d.kind),
  loango: (d) => {
    const v = readAmount();
    act(() => (d.kind === 'borrow' ? G.borrow(C.s, v) : G.repay(C.s, v)), d.kind === 'borrow' ? '💳 Crédito liberado' : '✅ Pagamento feito');
    closeModal(); render();
  },
  flow: () => modal(`<h3>📊 Seu dinheiro por dia</h3><div class="flow" data-live-html="flow"></div><p class="muted small">1 dia no jogo = 1 minuto de verdade.</p>`),
  news: () => modal(`<h3>📺 Jornal do Mercado</h3><div class="news" data-live-html="news20"></div>`),
  info: (d) => modal(INFO[d.k]),
  delfriend: (d) => confirmBox('Remover essa pessoa dos seus amigos?', () => { C.removeFriend(d.id); render(); }),
  friendadd: () => modal(`<h3>👥 Adicionar amigo</h3><p class="muted">Peça a tag da pessoa (aparece no topo do Ranking dela) e digite aqui.</p><input id="friendtag" placeholder="Ex: MARIA#1234" autocapitalize="characters"><button class="btn full" id="addfriendbtn" data-act="addfriendgo">Adicionar</button>`),
  ach: (d) => { const a = G.ACHIEVEMENTS.find((x) => x.id === d.id); toast(`${C.s.ach[a.id] ? a.icon : '🔒'} <b>${a.name}</b>: ${a.desc}`, C.s.ach[a.id] ? 'gold' : ''); },
  rename: () => {
    const v = $('#newname').value.trim().slice(0, 18);
    if (!v) return;
    C.s.name = v; C.afterAction(); render(); toast('Nome alterado', 'ok');
  },
  reset: () => confirmBox('Apagar TODO o progresso? Isso não tem volta!', () => { G.wipe(); location.reload(); }),
  help: () => openHelp(),
  event: (d, el) => { if (d.yes === '1') burst(el); C.answerEvent(d.yes === '1'); },
  addfriendgo: async () => {
    const inp = $('#friendtag');
    const btn = $('#addfriendbtn');
    btn.disabled = true;
    const err = await C.addFriend(inp.value);
    btn.disabled = false;
    if (err) return toast('⚠️ ' + err, 'err');
    toast('👥 Amigo adicionado!', 'ok'); closeModal(); render();
  },
  copytag: () => {
    const t = C.s.tag || '';
    const done = () => toast(`📋 Tag ${esc(t)} copiada!`, 'ok');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, () => toast('Sua tag: ' + esc(t)));
    else toast('Sua tag: ' + esc(t));
  },
  logout: () => confirmBox('Sair da conta? Seu progresso fica salvo na nuvem.', () => C.logout()),
  look: (d) => {
    const v = ['skin', 'hairColor', 'eyes'].includes(d.k) ? +d.v : d.k === 'beard' ? (d.v || null) : d.v;
    const patch = { [d.k]: v };
    if (d.k === 'sex' && v !== C.s.look.sex) { patch.hair = v === 'f' ? 'longo' : 'curto'; }
    G.setLook(C.s, patch); C.afterAction();
    if (!refreshCreator() && !refreshVisual()) keepScroll(render);
  },
  vis: (d) => { ui.vis = d.t; if (!refreshVisual()) keepScroll(render); },
  cvis: (d) => { ui.cvis = d.t; refreshCreator(); },
  pt: (d) => { ui[d.g] = d.t; keepScroll(render); },
  buycloth: (d, el) => { const owned = !!C.s.wardrobe[d.id]; if (act(() => G.buyCloth(C.s, d.id), owned ? null : '🛍️ Comprado!', owned ? null : el)) { if (!refreshVisual()) keepScroll(render); } },
  buyset: (d, el) => { const st = SETS.find((x) => x.id === d.id); const paid = setCost(C.s, st) > 0; if (act(() => G.buySet(C.s, st), paid ? `🎭 Fantasia de ${st.name}!` : null, paid ? el : null)) { if (!refreshVisual()) keepScroll(render); } },
  takeoff: (d) => { G.takeOff(C.s, d.slot); C.afterAction(); if (!refreshVisual()) keepScroll(render); },
  findlove: (d) => { G.findCandidate(C.s, d.p); C.afterAction(); render(); },
  askout: (d, el) => {
    const r = act(() => G.askOut(C.s), null, el);
    if (r && r.refused) { toast(`💔 ${esc(r.refused)} recusou o convite…`, 'err'); }
    else if (r) toast(`☕ ${esc(C.s.love.partner.name)} aceitou! Estão no primeiro encontro.`, 'gold');
    render();
  },
  date: (d, el) => act(() => G.doDate(C.s, d.id), '💕 Programa começou!', el) && keepScroll(render),
  gift: (d, el) => { if (act(() => G.giveGift(C.s, d.id), null, el)) { burst(el, '❤️', 6); toast('🎁 Amou o presente!', 'ok'); keepScroll(render); } },
  nextstep: (d, el) => { const st = C.s.love.stage; if (act(() => G.nextStep(C.s), null, el)) { confetti(); toast(st === 1 ? '💑 Agora vocês estão namorando!' : '💍 Disse SIM! Vocês estão noivos!', 'gold'); render(); } },
  marry: (d, el) => act(() => G.marry(C.s, d.id), '💒 Preparativos do casamento começaram!', el) && render(),
  breakup: () => confirmBox(C.s.love && C.s.love.stage >= 4 ? 'Pedir divórcio? Você perde 25% do dinheiro.' : 'Terminar o relacionamento?', () => { G.breakUp(C.s); C.afterAction(); render(); toast('💔 Fim do relacionamento.', 'err'); }),
  trip: (d, el) => { if (act(() => G.startTrip(C.s, d.id, d.partner === '1'), null, el)) { toast('✈️ Boa viagem!', 'gold'); render(); } },
  friend: (d) => friendView(d.id),
  betq: (d) => { const inp = $('#bet'); if (!inp) return; inp.value = d.p ? Math.floor(Math.max(0, C.s.cash) * +d.p) : d.v; ui.bet = +inp.value; },
  rbet: (d) => { ui.rbet = d.k; keepScroll(render); },
  spin: (d, el) => {
    if (ui.busy) return;
    const r = G.playSlots(C.s, readBet());
    if (typeof r === 'string') return toast('⚠️ ' + r, 'err');
    ui.busy = true; ui.lastReels = r.reels; refresh();
    const reels = [0, 1, 2].map((i) => $('#reel' + i));
    reels.forEach((x) => x.classList.add('spinning'));
    let k = 0;
    animate(1100, () => { k++; reels.forEach((x, i) => { if (k < 8 + i * 4) x.textContent = G.SLOT_SYMS[Math.floor(Math.random() * 7)]; else { x.textContent = G.SLOT_SYMS[r.reels[i]]; x.classList.remove('spinning'); } }); }, () => casinoResult(r, el));
  },
  roulette: (d, el) => {
    if (ui.busy) return;
    const num = ui.rbet === 'num' ? parseInt(($('#rnum') || {}).value, 10) : null;
    if (ui.rbet === 'num') ui.rnum = num;
    const r = G.playRoulette(C.s, readBet(), ui.rbet || 'red', num);
    if (typeof r === 'string') return toast('⚠️ ' + r, 'err');
    ui.busy = true; ui.lastNum = r.n; refresh();
    const w = $('#wheel'); w.className = 'wheel spinning';
    animate(1400, () => { w.textContent = Math.floor(Math.random() * 37); }, () => { w.textContent = r.n; w.className = 'wheel ' + (r.n === 0 ? 'green' : G.isRed(r.n) ? 'red' : 'black'); setTimeout(() => casinoResult(r, el), 400); });
  },
  scratch: (d, el) => {
    if (ui.busy) return;
    const r = G.playScratch(C.s, readBet());
    if (typeof r === 'string') return toast('⚠️ ' + r, 'err');
    ui.busy = true; ui.lastScratch = r.mult; refresh();
    $('#prize').textContent = r.mult ? '🎉 ' + r.mult + 'x' : '😢 Nada';
    const cv = $('#cover'); cv.textContent = 'RASPE AQUI'; cv.classList.add('scratching');
    setTimeout(() => casinoResult(r, el), 1100);
  },
  snd: () => { const on = A.settings().music || A.settings().sfx; A.setMusic(!on); A.setSfx(!on); renderTop(); toast(on ? '🔇 Som desligado' : '🔊 Som ligado', '', false); },
  sndset: (d) => { const v = !A.settings()[d.k]; if (d.k === 'music') A.setMusic(v); else A.setSfx(v); keepScroll(render); },
  confirmyes: () => { const f = pendingConfirm; closeModal(); f && f(); },
};
const keepScroll = (fn) => { const sc = $('#view').scrollTop; fn(); $('#view').scrollTop = sc; };
const G_NAME = (id) => Object.values(GOODS).flat().find((g) => g.id === id).name;

function onClick(e) {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const h = handlers[el.dataset.act];
  A.unlock();
  if (!QUIET.has(el.dataset.act)) A.sfx('click');
  if (h) { e.preventDefault(); h(el.dataset, el); }
}

const QUIET = new Set(['buybiz', 'buygood', 'buyprop', 'buycloth', 'buyset', 'trade', 'spin', 'roulette', 'scratch', 'gift', 'event']);
let pendingConfirm = null;
function confirmBox(msg, fn) {
  pendingConfirm = fn;
  modal(`<h3>Tem certeza?</h3><p>${msg}</p><div class="btns"><button class="btn ghost" data-act="close">Cancelar</button><button class="btn red" data-act="confirmyes">Confirmar</button></div>`);
}

// ---------- textos de ajuda (ficam escondidos atrás do botão "?") ----------
const INFO = {
  empresas: `<h3>🏭 Como funcionam os negócios</h3>
    <p>Cada negócio gera dinheiro sozinho, todo dia. Cada nível aumenta o lucro.</p>
    <p>⭐ A cada <b>10, 25, 50, 100…</b> níveis o lucro <b>dobra</b>.</p>
    <p>🔥 Se o setor do negócio está <b>em alta</b>, ele lucra +30%. ❄️ Em <b>queda</b>, -25%.</p>
    <p>💳 Seu cartão dá cashback em cada compra.</p>`,
  bolsa: `<h3>📈 Como ganhar na Bolsa</h3>
    <p>O mercado é <b>o mesmo para todos os jogadores</b>. Vence quem decidir melhor!</p>
    <p>⏰ A cada <b>1 hora</b>, cada setor ganha um clima: 🔥 alta, ❄️ queda ou ➖ estável. Em alta as ações sobem; em queda, caem.</p>
    <p>🔮 <b>Previsão:</b> 20 min antes do novo ciclo, aparece o palpite dos analistas (acerta 7 de cada 10 vezes). Arriscado, mas quem entra cedo ganha mais.</p>
    <p>✅ <b>Confirmação:</b> 15 min depois do ciclo começar, o clima real é revelado.</p>
    <p>💥 Às vezes uma empresa tem uma notícia bombástica e o preço salta ou despenca na hora.</p>
    <p>💸 Algumas ações pagam <b>dividendos</b> todo dia só por você tê-las. Cada compra/venda tem taxa de ${(TRADE_FEE * 100).toFixed(1)}%.</p>`,
  cripto: `<h3>🪙 Cripto</h3><p>Funciona como a Bolsa, mas é <b>muito mais maluca</b>: pode subir ou cair dezenas de % em uma hora. Dá para comprar pedacinhos de uma moeda.</p>`,
  renda: `<h3>🏦 Renda fixa</h3><p>Dinheiro guardado que rende sempre, sem risco. Rende menos que negócios e ações em alta, mas nunca perde.</p>
    <p>🐷 <b>Poupança:</b> saque quando quiser.<br>📄 <b>CDB:</b> rende mais, fica preso 1 hora.<br>🏛️ <b>Tesouro:</b> rende mais ainda, fica preso 4 horas.</p><p>A taxa (CDI) muda a cada 6 horas.</p>`,
  imoveis: `<h3>🔑 Imóveis</h3><p>Compre imóveis e receba aluguel todo dia. O preço deles sobe e desce junto com o setor Imobiliário — dá pra comprar barato na crise e vender caro na alta!</p>`,
  credito: `<h3>💳 Empréstimo</h3><p>Pegue dinheiro emprestado para abrir negócios mais cedo. Mas cuidado: os juros (${(LOAN_RATE * 100).toFixed(2)}% ao dia) correm sem parar! O limite depende do seu cartão.</p>`,
  bens: `<h3>🛍️ Coleção de bens</h3><p>🚗🛥️ <b>Carros, barcos e aeronaves</b> aumentam seu salário (vale o melhor que você tiver).</p><p>🏠 <b>Moradia</b> acaba com o aluguel de ${money(RENT_NO_HOME)}/dia e aumenta as horas que você ganha com o jogo fechado.</p><p>💍🖼️ <b>Luxo e Coleção</b> dão muito prestígio ✨ para se exibir no ranking.</p><p>Bens têm uma pequena manutenção diária e, se vender, você recebe só parte do valor.</p>`,
  visual: `<h3>👗 Visual</h3><p>Mude sua aparência de graça quando quiser. Na loja, compre roupas, calçados e acessórios — tudo que você compra fica no guarda-roupa e soma <b>estilo</b> ✨, que entra no seu prestígio do ranking.</p>`,
  amor: `<h3>❤️ Amor</h3><p>Procure alguém e chame pra sair. Programas a dois e presentes aumentam o <b>carinho</b> ❤️, que esfria com o tempo — não esqueça do seu amor!</p><p>Etapas: Ficando (+2%) → Namorando (+5%) → Noivos (+8%) → Casados (+12% de renda), valendo enquanto o carinho estiver acima de 30.</p><p>Se o carinho chegar a zero, a pessoa vai embora.</p>`,
  cassino: `<h3>🎰 Cassino</h3><p>Aposte o dinheiro do jogo no caça-níquel, na roleta ou na raspadinha. Dá para ganhar prêmios grandes — mas, como na vida real, <b>a casa sempre leva vantagem</b> no longo prazo.</p><p>O placar mostra quanto você já apostou, ganhou e o resultado final. Jogue com responsabilidade! 😉</p>`,
  viagens: `<h3>✈️ Viagens</h3><p>Cada dia de viagem dura 1 minuto. Ao voltar você fica <b>descansado</b>: +10% de renda por 3 horas. Cada destino novo carimba seu passaporte e dá prestígio ✨.</p><p>Viajar com seu amor custa o dobro, mas dá +25 de carinho ❤️.</p>`,
  carreira: `<h3>💼 Carreira</h3><p>Estude para desbloquear empregos melhores. Os cursos levam <b>tempo de verdade</b> — deixe estudando e volte depois!</p><p>Alguns empregos também pedem um nível mínimo.</p>`,
};
const infoBtn = (k) => `<button class="qbtn" data-act="info" data-k="${k}">?</button>`;

// ---------- abas ----------
const TABS = [
  { id: 'inicio', icon: '🏙️', name: 'Início' },
  { id: 'vida', icon: '👤', name: 'Vida' },
  { id: 'empresas', icon: '🏭', name: 'Negócios' },
  { id: 'investir', icon: '📈', name: 'Investir' },
  { id: 'bens', icon: '💎', name: 'Bens' },
  { id: 'perfil', icon: '🏆', name: 'Ranking' },
];
function renderTabs() {
  $('#tabs').innerHTML = TABS.map((t) => `<button class="${ui.tab === t.id ? 'on' : ''}" data-act="tab" data-tab="${t.id}"><span>${t.icon}</span><small>${t.name}</small>${t.id === 'inicio' && C.s.event && ui.tab !== 'inicio' ? '<i class="dot"></i>' : ''}</button>`).join('');
}

export function render(anim = false) {
  renderTop();
  renderTabs();
  const v = $('#view');
  const fn = { inicio: vInicio, vida: vVida, empresas: vEmpresas, investir: vInvestir, bens: vBens, perfil: vPerfil }[ui.tab];
  v.innerHTML = `<div class="page${anim ? ' anim' : ''}">${fn()}</div>`;
  v.querySelectorAll('.subtabs').forEach(centerTab);
  refresh(true);
}

function renderTop() {
  const s = C.s;
  const c = G.card(s);
  $('#top').innerHTML = `
    <div class="hud">
      <div class="lvbadge"><span data-live="lvl"></span></div>
      <div class="hudmid">
        <b class="pname">${esc(s.name)}</b>
        <div class="xpbar"><i data-live-w="xp"></i><span data-live="xptxt"></span></div>
      </div>
      <button class="sndbtn" data-act="snd">${A.settings().music || A.settings().sfx ? '🔊' : '🔇'}</button>
      <div class="minicard ${c.cls}" data-act="tab" data-tab="perfil" data-sub="cartoes"><span>${c.name}</span></div>
    </div>
    <div class="cashpill"><span class="cicon">🪙</span><span class="cash" data-live="cash"></span><span class="rate" data-live="rate"></span></div>`;
}

const title = (icon, text, help) => `<div class="ptitle"><h2>${icon} ${text}</h2>${help ? infoBtn(help) : ''}</div>`;
const lockBox = (lvl, what) => `<div class="locked"><div class="lk">🔒</div><b>${what}</b><p>Libera no <span class="lvchip">Nível ${lvl}</span></p><small>Suba de nível estudando, abrindo negócios e conquistando troféus.</small></div>`;
const subtabs = (list) => `<div class="subtabs">${list.map(([id, icon, name]) => `<button class="${ui.sub[ui.tab] === id ? 'on' : ''}" data-act="sub" data-sub="${id}"><span>${icon}</span>${name}</button>`).join('')}</div>`;
const dataAttrs = (data) => Object.entries(data).map(([k, v]) => `data-${k}="${v}"`).join(' ');
const pillTabs = (g, list, cur) => `<div class="ptabs">${list.map(([id, icon, name]) => `<button class="${cur === id ? 'on' : ''}" data-act="pt" data-g="${g}" data-t="${id}">${icon} ${name}</button>`).join('')}</div>`;
const costBtn = (act, data, cost, label = '') => `<button class="btn gold" data-act="${act}" ${dataAttrs(data)} data-cost="${cost}">${label}<span>${money(cost)}</span></button>`;

// ---------- INÍCIO ----------
export function bigCard(name, c, idx, locked = false) {
  return `<div class="ccard ${c.cls} ${locked ? 'lockedcard' : ''}">
    <div class="cc-top"><span class="cc-bank">MAGNATA</span><span class="cc-tier">${c.name.toUpperCase()}</span></div>
    <div class="chip"></div>
    <div class="cc-num">•••• •••• •••• ${String(1000 + idx * 731).slice(-4)}</div>
    <div class="cc-bottom"><span>${locked ? '🔒 ' + money(c.min) : esc(name.toUpperCase())}</span><span>★ ${idx + 1}</span></div>
  </div>`;
}
// ---------- VIDA ----------
function scene() {
  const s = C.s;
  const h = new Date().getHours();
  const night = h < 6 || h >= 19;
  const home = G.homeOf(s);
  const veh = [...GOODS.veiculos, ...GOODS.ceumar].filter((g) => s.goods[g.id]).sort((a, b) => a.cost - b.cost).pop();
  const allBiz = BUSINESSES.filter((b) => s.biz[b.id]);
  const trip = s.trip ? TRIPS.find((x) => x.id === s.trip.id) : null;
  const L = s.love;
  const showPartner = L && (!trip || s.trip.partner);
  return `<div class="scene big ${night ? 'night' : 'day'} ${trip ? 'travel' : ''}">
    <i class="${night ? 'moon' : 'sunc'}"></i>
    ${night ? '<span class="stars">✦ · ✧ · ✦ · ✧</span>' : '<i class="cld k1"></i><i class="cld k2"></i>'}
    <div class="homebig">${trip ? trip.icon : home ? home.icon : '🏚️'}</div>
    <div class="ground"></div>
    <div class="cast ${showPartner ? 'duo' : ''}">
      ${veh && !trip ? `<span class="vehbig" style="filter:hue-rotate(${veh.hue || 0}deg) drop-shadow(0 4px 0 #0002)">${veh.icon}</span>` : ''}
      <div class="me" data-act="tab" data-tab="vida" data-sub="visual">${avatarSVG(s.look, { size: showPartner ? 175 : 190 })}</div>
      ${showPartner ? `<div class="partner" data-act="tab" data-tab="vida" data-sub="amor"><span class="heart">${L.stage >= 4 ? '💞' : '❤️'}</span>${avatarSVG(L.partner.look, { size: 160 })}</div>` : ''}
    </div>
    ${trip ? `<div class="tripbanner">✈️ ${trip.name} · volta em <b data-live="triptime"></b></div>` : ''}
    <div class="plaque"><small>Patrimônio</small><b data-live="nw"></b></div>
  </div>
  ${allBiz.length ? `<div class="street" data-act="tab" data-tab="empresas"><div class="streetin">${townSVG(allBiz)}</div></div>` : ''}
  <div class="lifechips">
    <span class="lchip" data-act="tab" data-tab="vida" data-sub="carreira">${JOBS.find((j) => j.id === s.job).icon} ${JOBS.find((j) => j.id === s.job).name}</span>
    <span class="lchip" data-act="tab" data-tab="vida" data-sub="amor">${L ? `${LOVE_STAGES[L.stage].icon} ${esc(L.partner.name)}` : '💔 Solteiro(a)'}</span>
    <span class="lchip" data-act="tab" data-tab="bens">✨ ${fmt(G.prestige(s))}</span>
  </div>`;
}

function vVida() {
  const sub = ui.sub.vida;
  const head = subtabs([['carreira', '🎓', 'Carreira'], ['visual', '👗', 'Visual'], ['amor', '❤️', 'Amor'], ['viagens', '✈️', 'Viagens'], ['cassino', '🎰', 'Cassino']]);
  const body = sub === 'visual' ? vVisual() : sub === 'amor' ? vAmor() : sub === 'viagens' ? vViagens() : sub === 'cassino' ? vCassino() : vCarreira();
  return title('👤', 'Minha Vida', sub === 'carreira' ? 'carreira' : sub) + head + body;
}

const swatches = (k, list, cur) => `<div class="swatches big">${list.map((c, i) => `<button class="sw ${cur === i ? 'on' : ''}" style="background:${c}" data-act="look" data-k="${k}" data-v="${i}"></button>`).join('')}</div>`;
const LOOK_TABS = [{ id: 'corpo', icon: '🧍', name: 'Corpo' }, { id: 'cabelo', icon: '💇', name: 'Cabelo' }, { id: 'olhos', icon: '👀', name: 'Olhos' }, { id: 'barba', icon: '🧔', name: 'Barba' }];
const isLookTab = (t) => LOOK_TABS.some((x) => x.id === t);
const pickCard = (look, name, on, k, v, size) => `<button class="citem pick ${on ? 'worn' : ''}" data-act="look" data-k="${k}" data-v="${v}"><div class="cprev">${avatarSVG(look, { size })}</div><b>${name}</b>${on ? '<span class="pill ok">✓ Usando</span>' : ''}</button>`;
// Conteúdo de uma aba de aparência (grátis)
function lookPanel(tab, L, size = 110) {
  if (tab === 'corpo') return `<div class="panelbox"><b>Sou</b><div class="seg2">${[['m', '👨 Homem'], ['f', '👩 Mulher']].map(([v, n]) => `<button class="${L.sex === v ? 'on' : ''}" data-act="look" data-k="sex" data-v="${v}">${n}</button>`).join('')}</div>
    <b>Tom de pele</b>${swatches('skin', SKINS, L.skin)}</div>`;
  if (tab === 'olhos') return `<div class="panelbox"><b>Cor dos olhos</b>${swatches('eyes', EYE_COLORS, L.eyes)}</div>`;
  if (tab === 'cabelo') return `<div class="panelbox"><b>Cor do cabelo</b>${swatches('hairColor', HAIR_COLORS, L.hairColor)}</div>
    <div class="closet">${HAIRS.map((h) => pickCard({ ...L, hair: h.id, head: null }, h.name, L.hair === h.id, 'hair', h.id, size)).join('')}</div>`;
  if (tab === 'barba') return `<div class="closet">${BEARDS.map((b) => pickCard({ ...L, beard: b.id, face: null }, b.name, (L.beard || null) === b.id, 'beard', b.id || '', size)).join('')}</div>`;
  return '';
}
const tabChip = (act, t, cur) => `<button class="${cur === t.id ? 'on' : ''}" data-act="${act}" data-t="${t.id}"><span>${t.icon}</span>${t.name}</button>`;
const visBar = (cur) => LOOK_TABS.map((t) => tabChip('vis', t, cur)).join('') + '<span class="tabsep">🛍️ Loja</span>' + SLOTS.map((t) => tabChip('vis', t, cur)).join('');
const visPanel = (tab) => (isLookTab(tab) ? lookPanel(tab, C.s.look) : `<div class="closet">${closetHTML(tab)}</div>`);
function vVisual() {
  const s = C.s;
  const tab = ui.vis || 'corpo';
  return `
  <div class="mirror"><div class="mirrorav" id="mirrorav">${avatarSVG(s.look, { size: 230 })}</div><div class="stylebadge">👗 Estilo <b id="stylev">${fmt(G.styleOf(s))}</b></div></div>
  <div class="subtabs vistabs" id="vistabs">${visBar(tab)}</div>
  <div id="vispanel">${visPanel(tab)}</div>`;
}
function setCost(s, st) { return Object.values(st.pieces).filter((id) => id && !s.wardrobe[id]).reduce((t, id) => t + CLOTH[id].cost, 0); }
function closetHTML(slot) {
  const s = C.s;
  const L = s.look;
  if (slot === 'sets') return SETS.map((st) => {
    const cost = setCost(s, st);
    const wornAll = Object.entries(st.pieces).filter(([, v]) => v).every(([k, v]) => L[k] === v);
    const btn = wornAll ? '<span class="pill ok">Vestindo</span>' : cost ? `<button class="btn gold sm" data-act="buyset" data-id="${st.id}" data-cost="${cost}"><span>${money(cost)}</span></button>` : `<button class="btn sm" data-act="buyset" data-id="${st.id}">Vestir</button>`;
    return `<div class="citem ${wornAll ? 'worn' : ''}"><div class="cprev">${avatarSVG({ ...L, ...st.pieces }, { size: 118 })}</div><b>${st.icon} ${st.name}</b><small>✨ ${Object.values(st.pieces).filter(Boolean).reduce((t, id) => t + CLOTH[id].style, 0)} de estilo</small>${btn}</div>`;
  }).join('');
  return CLOTHES.filter((c) => c.slot === slot).map((c) => {
    const own = !!s.wardrobe[c.id];
    const worn = L[slot] === c.id;
    const btn = worn ? (['head', 'face', 'neck', 'back'].includes(slot) || c.cost > 0 ? `<button class="btn ghost sm" data-act="takeoff" data-slot="${slot}">Tirar</button>` : '<span class="pill ok">Usando</span>')
      : own ? `<button class="btn sm" data-act="buycloth" data-id="${c.id}">Vestir</button>` : `<button class="btn gold sm" data-act="buycloth" data-id="${c.id}" data-cost="${c.cost}"><span>${money(c.cost)}</span></button>`;
    return `<div class="citem ${worn ? 'worn' : ''} ${c.shine ? 'lux' : ''}"><div class="cprev">${avatarSVG({ ...L, [slot]: c.id }, { size: 118 })}</div><b>${c.name}</b><small>✨ ${c.style} de estilo</small>${btn}</div>`;
  }).join('');
}
// Atualiza só o que mudou no Visual (sem redesenhar a aba inteira nem mexer na rolagem)
function refreshVisual() {
  if (!$('#vispanel')) return false;
  const tab = ui.vis || 'corpo';
  $('#mirrorav').innerHTML = avatarSVG(C.s.look, { size: 230 });
  $('#stylev').textContent = fmt(G.styleOf(C.s));
  $('#vistabs').innerHTML = visBar(tab);
  $('#vispanel').innerHTML = visPanel(tab);
  centerTab($('#vistabs'));
  refresh();
  return true;
}
function centerTab(bar) {
  const on = bar && bar.querySelector('.on');
  if (on) bar.scrollLeft = on.offsetLeft - bar.clientWidth / 2 + on.clientWidth / 2;
}
function refreshCreator() {
  const box = $('#creator');
  if (!box) return false;
  const tab = ui.cvis || 'corpo';
  box.querySelector('.mirror').innerHTML = avatarSVG(C.s.look, { size: 180 });
  $('#ctabs').innerHTML = LOOK_TABS.map((t) => tabChip('cvis', t, tab)).join('');
  $('#creatorbody').innerHTML = lookPanel(tab, C.s.look, 96);
  centerTab($('#ctabs'));
  return true;
}

function vAmor() {
  const s = C.s;
  const L = s.love;
  if (!L) {
    const c = s.candidate;
    const pref = s.lovePref || (s.look && s.look.sex === 'f' ? 'm' : 'f');
    return `
    <div class="lovehead"><span>💘</span><div><b>Coração livre</b><small>Encontre alguém especial. Relacionamentos felizes dão bônus na sua renda!</small></div></div>
    <div class="lookrow"><span>Procurar</span><div class="seg2">${[['f', '👩'], ['m', '👨'], ['a', '💞']].map(([v, n]) => `<button class="${pref === v ? 'on' : ''}" data-act="findlove" data-p="${v}">${n}</button>`).join('')}</div></div>
    ${c ? `<div class="candidate"><div class="cav">${avatarSVG(c.look, { size: 190 })}</div><h3>${esc(c.name)}</h3>
      <div class="compat"><small>Compatibilidade</small><div class="bar pink"><i style="width:${c.compat}%"></i></div><b>${c.compat}%</b></div>
      <div class="btns"><button class="btn ghost" data-act="findlove" data-p="${pref}">Próxima pessoa</button><button class="btn pink" data-act="askout" data-cost="${DATES[0].cost}">☕ Chamar pra sair</button></div>
      <small class="muted">O primeiro encontro custa ${money(DATES[0].cost)}. Quanto maior a compatibilidade, maior a chance de aceitar.</small></div>`
      : `<button class="btn pink full" data-act="findlove" data-p="${pref}">🔎 Procurar alguém</button>`}`;
  }
  const st = LOVE_STAGES[L.stage];
  const daysTogether = Math.floor((Date.now() - L.since) / DAY_MS);
  const act = L.act ? (L.act.id === 'wedding' ? { icon: '💒', name: 'Preparando o casamento' } : DATES.find((d) => d.id === L.act.id)) : null;
  let next = '';
  if (!L.act && L.stage === 1) next = `<button class="btn pink full" data-act="nextstep">💌 Pedir em namoro <small>(❤️ 40)</small></button>`;
  if (!L.act && L.stage === 2) next = `<button class="btn pink full" data-act="nextstep" data-cost="${RING_COST}">💍 Pedir em casamento <small>(anel ${money(RING_COST)} · ❤️ 60)</small></button>`;
  const weddings = `<p class="hint small">💒 Precisa de ❤️ 75 de carinho.</p>${WEDDINGS.map((w) => `<div class="item"><span class="bi">${w.icon}</span><div class="grow"><b>${w.name}</b><small>⏱️ ${w.mins} dias · ✨ +${w.prestige}</small></div>${costBtn('marry', { id: w.id }, w.cost)}</div>`).join('')}`;
  const tabs = [['programas', '🎟️', 'Programas'], ['presentes', '🎁', 'Presentes']];
  if (!L.act && L.stage === 3) tabs.unshift(['casamento', '💒', 'Casamento']);
  let lt = ui.lov || 'programas';
  if (!tabs.some(([id]) => id === lt)) lt = tabs[0][0];
  return `
  <div class="couple">
    <div>${avatarSVG(s.look, { size: 150 })}<b>${esc(s.name)}</b></div>
    <span class="bigheart">${L.stage >= 4 ? '💞' : '❤️'}</span>
    <div>${avatarSVG(L.partner.look, { size: 150 })}<b>${esc(L.partner.name)}</b></div>
  </div>
  <div class="box col">
    <div class="lrow"><b>${st.icon} ${st.name}</b><small class="muted">${daysTogether} dias juntos</small></div>
    <div class="lrow"><span>❤️ Carinho</span><b data-live="aff"></b></div>
    <div class="bar pink"><i data-live-w="aff"></i></div>
    <small class="${L.aff >= 30 ? 'up' : 'down'}">${L.aff >= 30 ? `😊 Felicidade: +${Math.round(st.bonus * 100)}% de renda` : '😟 Carinho baixo! Sem bônus — e se chegar a zero, termina.'}</small>
  </div>
  ${act ? `<div class="box studying"><span class="bi">${act.icon}</span><div class="grow"><b>${act.name}</b><small class="muted">juntos agora</small></div><span class="timer" data-live="lovetime"></span></div>` : ''}
  ${next}
  ${pillTabs('lov', tabs, lt)}
  ${lt === 'casamento' ? weddings : ''}
  ${lt !== 'programas' ? '' : DATES.map((d) => `<div class="item ${L.act ? 'dim' : ''}"><span class="bi">${d.icon}</span><div class="grow"><b>${d.name}</b><small>⏱️ ${d.mins} dias · ❤️ +${L.lastDate === d.id ? `${Math.round(d.aff * 0.6)} <span class="down">(repetido)</span>` : d.aff}</small></div>${L.act ? '' : costBtn('date', { id: d.id }, d.cost)}</div>`).join('')}
  ${lt !== 'presentes' ? '' : `<p class="hint small">🎁 Cada presente só pode ser dado de novo depois de um tempo. Os mais caros valem bem mais!</p><div class="gifts">${GIFTS.map((g) => { const wait = ((L.cd || {})[g.id] || 0) > Date.now(); return `<button class="gift ${wait ? 'wait' : ''}" data-act="gift" data-id="${g.id}" ${wait ? '' : `data-cost="${g.cost}"`}><span>${g.icon}</span><b>${g.name}</b><small>❤️ +${g.aff}</small>${wait ? `<em class="cdt" data-live="giftcd:${g.id}"></em>` : `<em>${money(g.cost)}</em><i class="cdinfo">espera ${g.cd >= 60 ? g.cd / 60 + 'h' : g.cd + ' min'}</i>`}</button>`; }).join('')}</div>`}
  <button class="lnk center-block" data-act="breakup">${L.stage >= 4 ? 'Pedir divórcio (custa 25% do dinheiro)' : 'Terminar relacionamento'}</button>`;
}

function vViagens() {
  const s = C.s;
  const trip = s.trip ? TRIPS.find((x) => x.id === s.trip.id) : null;
  const visited = G.tripsVisited(s);
  const L = s.love;
  const cat = ui.tcat || 'cidades';
  const list = TRIPS.filter((t) => t.cat === cat);
  const vis = list.filter((t) => s.trips[t.id]).length;
  return `
  ${trip ? `<div class="box studying"><span class="bi big">${trip.icon}</span><div class="grow"><b>Viajando: ${trip.name}</b><div class="bar"><i data-live-w="trip"></i></div></div><span class="timer" data-live="triptime"></span></div>` : ''}
  ${G.restBonus(s) ? `<div class="pill money restpill">😌 Descansado: +${Math.round(G.restBonus(s) * 100)}% de renda por mais <b data-live="resttime"></b></div>` : ''}
  <div class="passport"><span>🛂</span><div><small>Passaporte</small><b>${visited} / ${TRIPS.length} destinos</b></div><div class="stamps">${TRIPS.filter((t) => s.trips[t.id]).map((t) => `<span>${t.icon}</span>`).join('')}</div></div>
  <div class="subtabs vistabs">${TRIP_CATS.map((c) => `<button class="${cat === c.id ? 'on' : ''}" data-act="pt" data-g="tcat" data-t="${c.id}"><span>${c.icon}</span>${c.name}</button>`).join('')}</div>
  <p class="catcount">${vis} de ${list.length} conhecidos</p>
  ${list.map((t) => {
    const n = s.trips[t.id] || 0;
    return `<div class="item trip ${n ? 'done' : ''}"><span class="bi">${t.icon}${n ? '<i class="stamp">✓</i>' : ''}</span><div class="grow"><b>${t.name}</b><small>🗓️ ${t.days} dias${n ? ` · visitado ${n}x` : ''}</small></div>
      ${trip ? '' : `<div class="col">${costBtn('trip', { id: t.id }, t.cost)}${L ? `<button class="btn pink sm" data-act="trip" data-id="${t.id}" data-partner="1" data-cost="${t.cost * 2}">+ ${esc(L.partner.name)} ❤️</button>` : ''}</div>`}</div>`;
  }).join('')}`;
}

// ---------- CASSINO ----------
function vCassino() {
  const s = C.s;
  if (G.level(s) < UNLOCKS.cassino) return lockBox(UNLOCKS.cassino, 'Cassino');
  const c = s.casino || { bet: 0, won: 0, n: 0 };
  const res = c.won - c.bet;
  const t = ui.cas || 'slots';
  let game = '';
  if (t === 'slots') {
    const r = ui.lastReels || [6, 6, 6];
    game = `<div class="slotm"><div class="slottop">🎰 MAGNATA SLOTS</div><div class="reels">${r.map((x, i) => `<span id="reel${i}">${G.SLOT_SYMS[x]}</span>`).join('')}</div>
      <button class="btn gold full big" id="spinbtn" data-act="spin"><em>GIRAR!</em></button></div>
      <div class="paytable">${G.SLOT_SYMS.map((sym, i) => `<span>${sym}${sym}${sym}<b>${G.SLOT_PAY[i]}x</b></span>`).join('')}<span>🍒🍒<b>2x</b></span></div>`;
  } else if (t === 'roleta') {
    const k = ui.rbet || 'red';
    const n = ui.lastNum;
    game = `<div class="wheelbox"><div class="wheel ${n === undefined ? '' : n === 0 ? 'green' : G.isRed(n) ? 'red' : 'black'}" id="wheel">${n === undefined ? '?' : n}</div></div>
      <div class="rbets">${G.ROULETTE_BETS.map((b) => `<button class="chipbtn ${k === b.id ? 'on' : ''}" data-act="rbet" data-k="${b.id}">${b.name} <small>${b.pay}x</small></button>`).join('')}</div>
      ${k === 'num' ? `<input id="rnum" type="number" inputmode="numeric" min="0" max="36" placeholder="Número de 0 a 36" value="${ui.rnum ?? ''}">` : ''}
      <button class="btn gold full big" id="spinbtn" data-act="roulette"><em>GIRAR A ROLETA</em></button>`;
  } else {
    game = `<div class="scratch" id="scratch"><div class="prize" id="prize">${ui.lastScratch === undefined ? '🎟️' : ui.lastScratch ? '🎉 ' + ui.lastScratch + 'x' : '😢 Nada'}</div><div class="cover" id="cover">${ui.lastScratch === undefined ? 'RASPE AQUI' : ''}</div></div>
      <button class="btn gold full big" id="spinbtn" data-act="scratch"><em>COMPRAR E RASPAR</em></button>
      <div class="paytable"><span>100x<b>0,1%</b></span><span>10x<b>0,9%</b></span><span>5x<b>4%</b></span><span>2x<b>10%</b></span><span>1x<b>25%</b></span></div>`;
  }
  return `
  <div class="casinohead"><div><small>Apostado</small><b>${money(c.bet)}</b></div><div><small>Ganho</small><b>${money(c.won)}</b></div><div><small>Resultado</small><b class="${res >= 0 ? 'up' : 'down'}">${res >= 0 ? '+' : ''}${money(res)}</b></div></div>
  ${pillTabs('cas', [['slots', '🎰', 'Caça-níquel'], ['roleta', '🎡', 'Roleta'], ['rasp', '🎟️', 'Raspadinha']], t)}
  <div class="betbox"><b>💰 Sua aposta</b><input id="bet" type="number" inputmode="numeric" min="1" value="${ui.bet || 100}">
    <div class="quick">${[[100, '100'], [1000, '1 mil'], [10000, '10 mil'], [100000, '100 mil']].map(([v, n]) => `<button class="chipbtn" data-act="betq" data-v="${v}">${n}</button>`).join('')}<button class="chipbtn" data-act="betq" data-p="0.1">10%</button><button class="chipbtn" data-act="betq" data-p="0.5">50%</button></div></div>
  ${game}
  <p class="muted center small">🎲 A casa sempre leva vantagem no longo prazo. Aposte só o que pode perder 😉</p>`;
}
const readBet = () => { const v = Math.floor(parseFloat(($('#bet') || {}).value) || 0); ui.bet = v; return v; };
function casinoResult(r, el) {
  G.payout(C.s, r.win, r.mult);
  ui.busy = false;
  if (r.win > 0) { A.sfx('win'); toast(`🎉 Ganhou ${money(r.win)}! (${r.mult}x)`, 'gold', false); burst(el, '🪙', 10); if (r.mult >= 10) confetti(); }
  else { A.sfx('lose'); toast('😬 Não foi dessa vez…', 'err', false); }
  C.afterAction();
  keepScroll(render);
}
function animate(ms, step, done) {
  const t0 = Date.now();
  const iv = setInterval(() => { A.sfx('tick'); step(); if (Date.now() - t0 > ms) { clearInterval(iv); done(); } }, 70);
}

export function openCreator() {
  const L = C.s.look || defaultLook('m');
  C.s.look = L;
  const tab = ui.cvis || 'corpo';
  modal(`<div id="creator"><h3>✨ Crie seu personagem</h3><div class="mirror small">${avatarSVG(L, { size: 180 })}</div>
    <div class="subtabs vistabs incard" id="ctabs">${LOOK_TABS.map((t) => tabChip('cvis', t, tab)).join('')}</div><div id="creatorbody">${lookPanel(tab, L, 96)}</div>
    <p class="muted small">Roupas e acessórios você compra depois na aba 👤 Vida → Visual.</p>
    <button class="btn full" data-act="close">Pronto! 😎</button></div>`);
}

function friendView(uid) {
  const p = C.friends[uid];
  if (!p) return;
  const card = CARDS[p.card || 0];
  modal(`<div class="fview"><h3>${p.home || ''} ${esc(p.name)} <small class="muted">${esc(p.tag || '')}</small></h3>
    <div class="couple small"><div>${avatarSVG(p.look, { size: 150 })}</div>${p.partner ? `<span class="bigheart">${p.partner.stage >= 4 ? '💞' : '❤️'}</span><div>${avatarSVG(p.partner.look, { size: 135 })}<b>${esc(p.partner.name)}</b></div>` : ''}</div>
    <div class="fstats">
      <div><small>Patrimônio</small><b>${money(p.nw)}</b></div><div><small>Por dia</small><b class="up">+${money(p.net || 0)}</b></div>
      <div><small>Nível</small><b>⭐ ${p.level}</b></div><div><small>Cartão</small><b>${card.name}</b></div>
      <div><small>Trabalho</small><b>${p.jobIcon || ''} ${esc(p.jobName || '')}</b></div><div><small>Amor</small><b>${p.partner ? LOVE_STAGES[p.partner.stage].icon + ' ' + LOVE_STAGES[p.partner.stage].name : '💔 Solteiro(a)'}</b></div>
      <div><small>Viagens</small><b>🛂 ${p.trips || 0}</b></div><div><small>Prestígio</small><b>✨ ${fmt(p.prestige || 0)}</b></div>
      <div><small>Troféus</small><b>🎖️ ${p.ach}</b></div><div><small>Veículo</small><b>${p.veh || '🚶'}</b></div>
      <div><small>Empresas controladas</small><b>👑 ${p.ctrl || 0}</b></div>
    </div>
    <small class="muted">${Date.now() - p.updated < 180000 ? '🟢 jogando agora' : '⚪ visto ' + ago(p.updated)}</small></div>`);
}

function vInicio() {
  const s = C.s;
  const next = CARDS[s.cardMax + 1];
  const course = s.course ? COURSES.find((x) => x.id === s.course.id) : null;
  const q = quest();
  return `
  ${scene()}
  ${buffsLine()}
  <div class="stats3" data-act="flow">
    <div><small>Ganha por dia</small><b class="up" data-live="inc"></b></div>
    <div><small>Gasta por dia</small><b class="down" data-live="exp"></b></div>
    <div class="more">›</div>
  </div>
  ${eventCard()}
  ${q ? `<div class="quest"><span class="qi">⭐</span><div><small>MISSÃO</small><p>${q}</p></div></div>` : ''}
  ${course ? `<div class="box studying"><span class="bi">${course.icon}</span><div class="grow"><b>${course.name}</b><div class="bar"><i data-live-w="course"></i></div></div><span class="timer" data-live="coursetime"></span></div>` : ''}
  ${next ? `<div class="box goal" data-act="tab" data-tab="perfil" data-sub="cartoes"><div class="mini2 ${next.cls}"></div><div class="grow"><small>Próximo cartão</small><b>${next.name}</b><div class="bar gold"><i data-live-w="nextcard"></i></div></div><span class="goalv">${money(next.min)}</span></div>` : ''}
  <div class="box newsbox" data-act="news">
    <div class="nhead"><b>📺 Jornal do Mercado</b><span class="lnk">ver tudo ›</span></div>
    <div class="news" data-live-html="news3"></div>
  </div>`;
}
function eventCard() {
  const e = C.s.event;
  if (!e) return '';
  return `<div class="event"><div class="evhead"><span class="evi">${e.icon}</span><div class="grow"><small>${e.gain ? 'BOA NOTÍCIA' : e.pay ? 'IMPREVISTO' : 'OPORTUNIDADE'}</small><b>${e.title}</b></div><span class="timer sm" data-live="evtime"></span></div>
    <p>${e.text}</p>${e.cost || e.pay ? `<p class="evcost">${e.pay && !e.no ? 'Despesa obrigatória' : 'Custa'}: <b>${money(e.cost || e.pay)}</b></p>` : ''}${e.gain ? `<p class="evgain">Você recebe <b>${money(e.gain)}</b> 🎉</p>` : ''}
    <div class="btns">${e.no ? `<button class="btn ghost" data-act="event" data-yes="0">${e.no}</button>` : ''}<button class="btn ${e.pay && !e.no ? 'red' : ''}" data-act="event" data-yes="1" ${e.cost ? `data-cost="${e.cost}"` : ''}>${e.yes}</button></div></div>`;
}
function buffsLine() {
  const now = Date.now();
  const list = (C.s.buffs || []).filter((x) => x.until > now);
  if (!list.length) return '';
  return `<div class="buffs">${list.map((x) => { const b = BUSINESSES.find((y) => y.id === x.id); return `<span class="pill ${x.mult > 1 ? 'money' : 'bad'}">${b ? b.icon : '🏭'} ${x.mult > 1 ? 'x' + x.mult : '½'} · ${dur(x.until - now)}</span>`; }).join('')}</div>`;
}
function quest() {
  const s = C.s;
  if (!s.edu.length && !s.course) return 'Faça o <b>Ensino Médio</b> na aba 👤 Vida → Carreira para ganhar mais.';
  if (!Object.keys(s.biz).length) return 'Abra sua primeira <b>Barraca de Pastel</b> na aba 🏭 Negócios.';
  if (s.job === 'entregador' && s.edu.includes('medio')) return 'Você já pode ser <b>Atendente</b>! Vá em 👤 Vida → Carreira.';
  if (!s.goods.bike && !G.vehicleBonus(s)) return 'Compre uma <b>bicicleta</b> em 💎 Bens: +5% de salário.';
  if (G.level(s) >= UNLOCKS.bolsa && !s.stats.trades) return 'A <b>Bolsa</b> abriu! Veja o 📺 jornal e compre ações de um setor 🔥.';
  if (!s.love && s.cash > 3000 && !s.candidate) return 'Que tal encontrar um amor? Vá em 👤 Vida → ❤️ Amor.';
  if (!Object.keys(s.trips).length && s.cash > 8000) return 'Tire férias! Viajar dá bônus de renda. 👤 Vida → ✈️ Viagens.';
  if (!G.homeOf(s) && s.cash > 50000) return 'Compre sua <b>casa própria</b> e pare de pagar aluguel.';
  return '';
}
function flowHTML() {
  const ib = G.incomeBreakdown(C.s, C.mk);
  const rows = [
    ['💼 Salário', ib.sal], ['🏭 Negócios', ib.biz], ['🔑 Aluguéis', ib.rent], ['💸 Dividendos', ib.divs], ['🏦 Juros', ib.juros],
    ['🏠 Aluguel da moradia', -ib.moradia], ['🔧 Manutenção', -ib.manut], ['💳 Juros da dívida', -ib.loan],
  ].filter((r) => Math.abs(r[1]) > 0.0001);
  return rows.map(([n, v]) => `<div class="fr"><span>${n}</span><b class="${v < 0 ? 'down' : 'up'}">${v < 0 ? '-' : '+'}${money(Math.abs(v))}</b></div>`).join('') +
    `<div class="fr total"><span>Sobra por dia</span><b class="${ib.net < 0 ? 'down' : 'up'}">${money(ib.net)}</b></div>` +
    (G.lifeMult(C.s) > 1 ? `<div class="fr"><span>😊 Felicidade e descanso</span><b>+${Math.round((G.lifeMult(C.s) - 1) * 100)}%</b></div>` : '') +
    `<div class="fr"><span>⭐ Bônus de nível</span><b>+${Math.round(LEVEL_BONUS * 100 * (G.level(C.s) - 1))}%</b></div>`;
}
function newsHTML(n) {
  const list = C.mk.news(n);
  if (!list.length) return '<p class="muted">Nada de novo por enquanto…</p>';
  return list.map((x) => `<div class="nitem ${x.dir > 0 ? 'pos' : 'neg'} ${x.kind}"><span class="ni">${x.icon}</span><div><p>${x.text}</p><small>${ago(tickToMs(x.t))}${x.kind === 'forecast' ? ' · palpite' : ''}</small></div></div>`).join('');
}

// ---------- CARREIRA ----------
function vCarreira() {
  const s = C.s;
  const job = JOBS.find((j) => j.id === s.job);
  const lvl = G.level(s);
  const courses = COURSES.map((c) => {
    const done = s.edu.includes(c.id);
    const running = s.course && s.course.id === c.id;
    const reqOk = !c.req || s.edu.includes(c.req);
    let right;
    if (done) right = '<span class="pill ok">✓</span>';
    else if (running) right = '<span class="timer" data-live="coursetime"></span>';
    else if (!reqOk || s.course) right = '<span class="pill">🔒</span>';
    else right = costBtn('course', { id: c.id }, c.cost);
    return `<div class="item ${done ? 'done' : ''} ${!reqOk && !done ? 'dim' : ''}"><span class="bi">${c.icon}</span><div class="grow"><b>${c.name}</b><small>⏱️ ${c.mins} min${!reqOk && !done ? ` · precisa de ${COURSES.find((x) => x.id === c.req).name}` : ''}</small>${running ? '<div class="bar"><i data-live-w="course"></i></div>' : ''}</div>${right}</div>`;
  }).join('');
  const jobs = JOBS.map((j) => {
    const cur = s.job === j.id;
    const ok = G.canTakeJob(s, j);
    const miss = [...j.edu.filter((e) => !s.edu.includes(e)).map((e) => COURSES.find((c) => c.id === e).name), lvl < j.lvl ? `Nível ${j.lvl}` : null].filter(Boolean);
    if (cur) return '';
    return `<div class="item ${ok ? '' : 'dim'}"><span class="bi">${j.icon}</span><div class="grow"><b>${j.name}</b><small>${ok ? `💵 ${money(j.salary)}/dia` : '🔒 ' + miss.join(', ')}</small></div>${ok ? `<button class="btn" data-act="job" data-id="${j.id}">Trabalhar</button>` : ''}</div>`;
  }).join('');
  const t = ui.car || 'estudos';
  return `
  <div class="hero job"><span class="hi">${job.icon}</span><div><small>Seu emprego</small><h3>${job.name}</h3><span class="pill money"><b data-live="salary"></b>/dia</span></div></div>
  ${pillTabs('car', [['estudos', '📚', 'Estudos'], ['empregos', '💼', 'Empregos']], t)}
  ${t === 'estudos' ? courses : jobs}`;
}

// ---------- NEGÓCIOS ----------
function vEmpresas() {
  const s = C.s;
  const mk = C.mk;
  const total = BUSINESSES.reduce((t, b) => t + G.bizProfit(s, b, mk), 0);
  let shownLocked = false;
  const cards = BUSINESSES.map((b, i) => {
    const lvl = s.biz[b.id] || 0;
    const prevOwned = i === 0 || (s.biz[BUSINESSES[i - 1].id] || 0) > 0;
    if (!lvl && !prevOwned) {
      if (shownLocked) return '';
      shownLocked = true;
      return `<div class="biz mystery"><span class="bico">❔</span><div class="grow"><b>Negócio secreto</b><small>Abra o anterior para revelar</small></div></div>`;
    }
    const n = ui.bizN === 'max' ? Math.max(1, G.bizMaxBuy(b, lvl, s.cash)) : ui.bizN;
    const cost = G.bizCost(b, lvl, n);
    const ms = G.nextMilestone(lvl);
    const reg = mk.sectorNow(b.sector);
    const profit = lvl ? G.bizProfit(s, b, mk) : b.profit * G.SECTOR_MULT[reg] * G.levelMult(s);
    const prevMs = [0, ...[10, 25, 50, 100, 150, 200, 300, 400, 500]].filter((m) => m <= lvl).pop();
    return `<div class="biz ${lvl ? '' : 'new'}">
      <span class="bico s-${b.sector}">${b.icon}${lvl ? `<i class="lv">${lvl}</i>` : ''}<em class="wx ${wxCls(reg)}" title="${WXN[reg]}">${WX[reg]}</em></span>
      <div class="grow">
        <b>${b.name}</b>
        <span class="pill money">+${money(profit)}/dia</span>
        ${lvl && ms ? `<div class="bar thin"><i style="width:${Math.min(100, ((lvl - prevMs) / (ms - prevMs)) * 100)}%"></i></div><small>⭐ ${ms - lvl} p/ dobrar</small>` : `<small>${lvl ? '⭐ nível máximo de bônus' : SECTOR[b.sector].name}</small>`}
      </div>
      ${costBtn('buybiz', { id: b.id }, cost, lvl ? `<em>▲ ${n}</em>` : '<em>Abrir</em>')}
    </div>`;
  }).join('');
  return `${title('🏭', 'Negócios', 'empresas')}
  <div class="bizhead"><div><small>Lucro total</small><b class="up">${money(total)}<small>/dia</small></b></div>
    <div class="seg">${[1, 10, 'max'].map((n) => `<button class="${ui.bizN === n ? 'on' : ''}" data-act="bizn" data-n="${n}">${n === 'max' ? 'MÁX' : 'x' + n}</button>`).join('')}</div></div>
  ${cards}`;
}

// ---------- INVESTIR ----------
function vInvestir() {
  const s = C.s;
  const sub = ui.sub.investir;
  const head = subtabs([['bolsa', '📈', 'Bolsa'], ['cripto', '🪙', 'Cripto'], ['renda', '🐷', 'Poupar'], ['imoveis', '🔑', 'Imóveis'], ['credito', '💳', 'Crédito']]);
  const L = G.level(s);
  let body = '';
  if (sub === 'bolsa') body = L < UNLOCKS.bolsa ? lockBox(UNLOCKS.bolsa, 'Bolsa de Valores') : vBolsa(STOCKS, true);
  if (sub === 'cripto') body = L < UNLOCKS.cripto ? lockBox(UNLOCKS.cripto, 'Criptomoedas') : vBolsa(CRYPTOS, false);
  if (sub === 'renda') body = vRenda();
  if (sub === 'imoveis') body = L < UNLOCKS.imoveis ? lockBox(UNLOCKS.imoveis, 'Imóveis') : vImoveis();
  if (sub === 'credito') body = L < UNLOCKS.credito ? lockBox(UNLOCKS.credito, 'Empréstimos') : vCredito();
  const helpKey = { bolsa: 'bolsa', cripto: 'cripto', renda: 'renda', imoveis: 'imoveis', credito: 'credito' }[sub];
  return title('📈', 'Investir', helpKey) + head + body;
}

function portfolioValue(list) {
  let v = 0, cost = 0;
  for (const a of list) { const h = C.s.port[a.sym]; if (h && h.q > 0) { v += h.q * C.mk.price(a.sym); cost += h.cost; } }
  return { v, cost };
}
function vBolsa(list, stocks) {
  const k = stocks ? 's' : 'c';
  return `
  <div class="wallet"><div><small>💼 Sua carteira</small><b data-live="pv:${k}"></b></div><div class="right"><small>Lucro</small><b data-live="pl:${k}"></b></div></div>
  <div class="wxhead"><b>Clima dos setores</b><small>muda em <span data-live="nextblock"></span></small></div>
  <div class="wxrow" data-live-html="${stocks ? 'sectors' : 'cryptosector'}"></div>
  ${assetFilters(list, stocks)}
  <div class="assets">${filterAssets(list, stocks).map((a) => `
    <div class="asset" data-act="asset" data-sym="${a.sym}">
      <span class="aico s-${a.sector}">${SECTOR[a.sector].icon}</span>
      <div class="grow"><b>${a.name}${a.div ? ' <em class="divtag">💸</em>' : ''}</b><small class="held" data-live="held:${a.sym}"></small>${a.shares && G.ownPct(C.s, a.sym) > 0 ? `<div class="ownmini"><i style="width:${Math.max(3, Math.min(100, G.ownPct(C.s, a.sym) / 0.51 * 100))}%"></i></div>` : ''}</div>
      <svg class="spark" data-spark="${a.sym}" viewBox="0 0 64 28" preserveAspectRatio="none"></svg>
      <div class="right"><b data-live="price:${a.sym}"></b><span class="chg" data-live="chg:${a.sym}"></span></div>
    </div>`).join('') || '<p class="emptyf">Nenhum ativo aqui ainda 🙃</p>'}</div>
  <div class="box newsbox" data-act="news"><div class="nhead"><b>📺 Jornal do Mercado</b><span class="lnk">ver tudo ›</span></div><div class="news" data-live-html="news3"></div></div>`;
}
function assetFilters(list, stocks) {
  const key = stocks ? 'sf' : 'cf';
  const cur = ui[key] || 'all';
  const secs = [...new Set(list.map((a) => a.sector))];
  const opts = [['all', '📋', 'Todas'], ['mine', '🎒', 'Minhas'], ...(stocks ? secs.map((id) => [id, SECTOR[id].icon, SECTOR[id].name]) : [])];
  return `<div class="subtabs vistabs filt">${opts.map(([id, ic, n]) => `<button class="${cur === id ? 'on' : ''}" data-act="pt" data-g="${key}" data-t="${id}"><span>${ic}</span>${n}</button>`).join('')}</div>`;
}
function filterAssets(list, stocks) {
  const f = ui[stocks ? 'sf' : 'cf'] || 'all';
  const out = f === 'all' ? list : f === 'mine' ? list.filter((a) => (C.s.port[a.sym] || {}).q > 0) : list.filter((a) => a.sector === f);
  return out.length ? out : [];
}
function sectorsHTML(ids) {
  const mk = C.mk;
  return ids.map((id) => {
    const sc = SECTOR[id];
    const k = mk.sectorKnown(id);
    const f = mk.sectorForecast(id);
    return `<div class="wxc ${wxCls(k)}" data-act="sector" data-id="${id}"><span class="wi">${sc.icon}</span><span class="wn">${sc.name}</span><span class="wnow">${WX[k]}</span>${f !== null ? `<span class="wf">→${WX[f]}</span>` : ''}</div>`;
  }).join('');
}
function openSector(id) {
  const sc = SECTOR[id];
  const assets = ASSETS.filter((a) => a.sector === id);
  const biz = BUSINESSES.filter((b) => b.sector === id);
  const k = C.mk.sectorKnown(id), f = C.mk.sectorForecast(id);
  modal(`<h3>${sc.icon} ${sc.name}</h3>
  <div class="wxbig"><div class="${wxCls(k)}"><small>Agora</small><span>${WX[k]}</span><b>${WXN[k]}</b></div><div class="${wxCls(f)}"><small>Próxima hora (palpite)</small><span>${WX[f]}</span><b>${f === null ? 'Aguardando' : WXN[f]}</b></div></div>
  <div class="assets">${assets.map((a) => `<div class="asset" data-act="asset" data-sym="${a.sym}"><div class="grow"><b>${a.name}</b><small>${a.sym}</small></div><div class="right"><b data-live="price:${a.sym}"></b><span class="chg" data-live="chg:${a.sym}"></span></div></div>`).join('')}</div>
  ${biz.length ? `<p class="muted">Negócios deste setor: ${biz.map((b) => b.icon).join(' ')}</p>` : ''}`);
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
    const d = sparkPath(h, w, hh, big ? 8 : 3);
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
  const k = C.mk.sectorKnown(a.sector);
  modal(`<h3>${SECTOR[a.sector].icon} ${a.name}</h3>
    <div class="pricehead"><b class="bigprice" data-live="price:${sym}"></b><span class="chg" data-live="chg:${sym}"></span></div>
    <svg class="spark chart" data-spark="${sym}" viewBox="0 0 300 140" preserveAspectRatio="none"></svg>
    <div class="tags"><span class="pill ${wxCls(k)}">${WX[k]} ${SECTOR[a.sector].name}: ${WXN[k]}</span>${a.div ? `<span class="pill">💸 ${(a.div * 100).toFixed(2)}%/dia</span>` : ''}</div>
    <div class="heldbox" data-live="heldfull:${sym}"></div>
    ${a.shares ? ownHTML(sym) : ''}
    <div class="qtyrow"><input id="qty" type="number" inputmode="decimal" min="0" step="${crypto ? 'any' : '1'}" value="${crypto ? '' : 1}" placeholder="${crypto ? 'Quantidade' : 'Qtd. de ações'}"></div>
    <div class="quick">${crypto ? '' : [[1, '1'], [100, '100'], [1000, '1 mil'], [1e5, '100 mil'], [1e6, '1 mi']].map(([v, n]) => `<button class="chipbtn" data-act="qty" data-v="${v}">${n}</button>`).join('')}
      <button class="chipbtn" data-act="qty" data-v="${maxBuy(sym)}">Máx</button>
      ${h && h.q > 0 ? `<button class="chipbtn" data-act="qty" data-v="${h.q}">Tudo meu</button>` : ''}</div>
    <div class="preview" id="tradeprev"></div>
    <div class="btns"><button class="btn red" data-act="trade" data-side="sell" data-sym="${sym}">Vender</button><button class="btn" data-act="trade" data-side="buy" data-sym="${sym}">Comprar</button></div>`);
  $('#qty').addEventListener('input', updateTradePreview);
  updateTradePreview();
}
function ownHTML(sym) {
  const a = ASSETS.find((x) => x.sym === sym);
  const own = G.ownPct(C.s, sym);
  const tier = G.ownTier(own);
  const next = OWN_TIERS.find((t) => own < t.min - 1e-12);
  const prev = tier ? tier.min : 0;
  const prog = next ? (own - prev) / (next.min - prev) : 1;
  return `<div class="ownbox">
    <div class="lrow"><b>🏢 Sua fatia da empresa</b><b class="ownpct">${fmtOwn(own)}</b></div>
    <div class="bar gold"><i style="width:${Math.max(own > 0 ? 2 : 0, Math.min(100, own * 100))}%"></i></div>
    <small class="muted">${fmt(a.shares)} ações no total · você tem ${fmt((C.s.port[sym] || { q: 0 }).q)}${tier ? ` · ${tier.icon} <b>${tier.name}</b>` : ''}</small>
    ${next ? `<div class="nexttier"><span>Próximo: ${next.icon} <b>${next.name}</b> (${fmtOwn(next.min)})</span><div class="bar thin"><i style="width:${Math.min(100, prog * 100)}%"></i></div><small class="muted">Faltam ${fmt(Math.ceil((next.min - own) * a.shares))} ações ≈ ${money((next.min - own) * a.shares * C.mk.price(sym))}</small></div>` : '<div class="nexttier"><b>👑 Você controla esta empresa!</b></div>'}
    <div class="tiers">${OWN_TIERS.map((t) => `<span class="${own >= t.min - 1e-12 ? 'on' : ''}">${t.icon} ${fmtOwn(t.min)}<small>${t.mult > 1 ? '+' + Math.round((t.mult - 1) * 100) + '% div.' : 'título'}</small></span>`).join('')}</div>
  </div>`;
}
function maxBuy(sym) {
  const p = C.mk.price(sym) * (1 + TRADE_FEE);
  const q = Math.max(0, C.s.cash) / p;
  if (G.isCrypto(sym)) return Math.floor(q * 1e6) / 1e6;
  const a = ASSETS.find((x) => x.sym === sym);
  const left = a.shares ? a.shares - ((C.s.port[sym] || {}).q || 0) : Infinity;
  return Math.max(0, Math.floor(Math.min(q, left)));
}
function updateTradePreview() {
  const el = $('#tradeprev');
  if (!el || !tradeSym) return;
  const q = parseFloat($('#qty').value) || 0;
  el.innerHTML = `Total: <b>${money(q * C.mk.price(tradeSym))}</b>`;
}
function doTrade(sym, side) {
  let q = parseFloat($('#qty').value);
  if (!G.isCrypto(sym)) q = Math.floor(q);
  const r = act(() => G.trade(C.s, C.mk, sym, q, side));
  if (!r) return;
  if (side === 'buy') { A.sfx('cash'); toast(`✅ Comprou ${fmt(q)} ${sym}`, 'ok'); }
  else if (r.profit >= 0) { toast(`💰 Lucro de ${money(r.profit)}!`, 'gold'); confetti(); }
  else toast(`📉 Prejuízo de ${money(-r.profit)}`, 'err');
  closeModal(); render();
}

function vRenda() {
  const s = C.s;
  const cdi = C.mk.cdi();
  const now = Date.now();
  const list = (kind) => s[kind].map((x, i) => {
    const ready = now >= x.until;
    return `<div class="lock"><b>${money(x.amt)}</b>${ready ? `<button class="btn sm" data-act="redeem" data-kind="${kind}" data-i="${i}">Resgatar</button>` : `<span class="timer sm">🔒 ${dur(x.until - now)}</span>`}</div>`;
  }).join('');
  const sum = (k) => s[k].reduce((t, x) => t + x.amt, 0);
  return `
  <div class="vault pig"><span class="vi">🐷</span><div class="grow"><b>Poupança</b><small>+${(cdi * 70).toFixed(3)}%/dia · saque livre</small><span class="vv" data-live="poup"></span></div>
    <div class="vbtns"><button class="btn sm" data-act="fixed" data-kind="poup">Guardar</button><button class="btn ghost sm" data-act="fixed" data-kind="saque">Sacar</button></div></div>
  <div class="vault cdb"><span class="vi">📄</span><div class="grow"><b>CDB</b><small>+${(cdi * 110).toFixed(3)}%/dia · preso 1h</small><span class="vv">${money(sum('cdb'))}</span>${list('cdb')}</div>
    <div class="vbtns"><button class="btn sm" data-act="fixed" data-kind="cdb">Aplicar</button></div></div>
  <div class="vault tes"><span class="vi">🏛️</span><div class="grow"><b>Tesouro</b><small>+${(cdi * 130).toFixed(3)}%/dia · preso 4h</small><span class="vv">${money(sum('tes'))}</span>${list('tes')}</div>
    <div class="vbtns"><button class="btn sm" data-act="fixed" data-kind="tes">Aplicar</button></div></div>`;
}
function readAmount() { return parseFloat(($('#amt') || {}).value) || 0; }
function amountModal(ttl, desc, base, go, kind) {
  modal(`<h3>${ttl}</h3><p class="muted">${desc}</p>
    <input id="amt" type="number" inputmode="decimal" min="0" placeholder="Valor em R$">
    <div class="quick">${[0.25, 0.5, 1].map((p) => `<button class="chipbtn" data-act="pctamt" data-p="${p}" data-base="${Math.max(0, base)}">${p === 1 ? 'Tudo' : p * 100 + '%'}</button>`).join('')}</div>
    <div class="btns"><button class="btn ghost" data-act="close">Cancelar</button><button class="btn" data-act="${go}" data-kind="${kind}">Confirmar</button></div>`);
}
function openFixed(kind) {
  const s = C.s;
  if (kind === 'saque') return amountModal('🐷 Sacar da poupança', `Saldo: ${money(s.poup)}`, s.poup, 'fixedgo', 'saque');
  const names = { poup: '🐷 Guardar na poupança', cdb: '📄 Aplicar no CDB', tes: '🏛️ Investir no Tesouro' };
  amountModal(names[kind], `Você tem ${money(s.cash)}`, s.cash, 'fixedgo', kind);
}

function vImoveis() {
  const s = C.s;
  const idx = C.mk.realEstateIndex();
  const k = C.mk.sectorKnown('realestate');
  return `
  <div class="wallet"><div><small>🏘️ Preço dos imóveis</small><b class="${idx >= 1 ? 'up' : 'down'}">${pct(idx - 1)}</b></div><div class="right"><small>Setor</small><b class="${wxCls(k)}t">${WX[k]} ${WXN[k]}</b></div></div>
  ${PROPERTIES.map((p) => {
    const n = s.props[p.id] || 0;
    const cost = p.cost * idx;
    return `<div class="biz"><span class="bico s-realestate">${p.icon}${n ? `<i class="lv">${n}</i>` : ''}</span><div class="grow"><b>${p.name}</b><span class="pill money">+${money(p.rent * G.levelMult(s))}/dia</span>${n ? `<button class="lnk" data-act="sellprop" data-id="${p.id}">vender 1</button>` : ''}</div>
    ${costBtn('buyprop', { id: p.id }, cost, '<em>Comprar</em>')}</div>`;
  }).join('')}`;
}

function vCredito() {
  const s = C.s;
  const c = G.card(s);
  const used = s.debt / c.limit;
  return `
  <div class="loanbox">
    ${bigCard(s.name, c, s.cardMax)}
    <div class="limit"><div class="lrow"><span>Limite usado</span><b><span data-live="debt"></span> / ${money(c.limit)}</b></div><div class="bar red"><i style="width:${Math.min(100, used * 100)}%"></i></div>
    <small class="muted">Juros: <b class="down" data-live="debtint"></b> por dia</small></div>
    <div class="btns"><button class="btn ghost" data-act="loan" data-kind="repay">Pagar dívida</button><button class="btn" data-act="loan" data-kind="borrow">Pegar emprestado</button></div>
  </div>`;
}
function openLoan(kind) {
  const s = C.s;
  if (kind === 'borrow') amountModal('💳 Pegar emprestado', `Disponível: ${money(G.card(s).limit - s.debt)}`, G.card(s).limit - s.debt, 'loango', 'borrow');
  else amountModal('✅ Pagar dívida', `Dívida: ${money(s.debt)}`, Math.min(s.debt, s.cash), 'loango', 'repay');
}

// ---------- BENS ----------
const RAR = ['comum', 'comum', 'comum', 'raro', 'raro', 'raro', 'epico', 'epico', 'lendario', 'lendario'];
const RARN = { comum: 'Comum', raro: 'Raro', epico: 'Épico', lendario: 'Lendário' };
function vBens() {
  const s = C.s;
  const sub = ui.sub.bens;
  const list = GOODS[sub];
  const owned = list.filter((g) => s.goods[g.id]).length;
  const head = title('💎', 'Coleção', 'bens') + subtabs([['veiculos', '🚗', 'Carros'], ['ceumar', '🛥️', 'Céu e Mar'], ['moradia', '🏠', 'Casas'], ['luxo', '💍', 'Luxo'], ['colecao', '🖼️', 'Coleção']]) + `
  <div class="wallet"><div><small>✨ Prestígio</small><b>${fmt(G.prestige(s))}</b></div><div class="right"><small>Coleção</small><b>${owned}/${list.length}</b></div></div>`;
  if (sub === 'veiculos') return head + vCarros();
  return head + `
  <div class="goods">${list.map((g, i) => goodCard(g, RAR[i])).join('')}</div>`;
}
const TIER_RAR = { Entrada: 'comum', 'Intermediário': 'raro', Luxo: 'epico', Esportivo: 'lendario' };
const vIcon = (g) => `<span class="vic" style="filter:hue-rotate(${g.hue || 0}deg)">${g.icon}</span>`;
function goodCard(g, r) {
  const s = C.s;
  {
    const own = !!s.goods[g.id];
    const perk = g.bonus ? `+${Math.round(g.bonus * 100)}% salário` : g.hours ? `+${g.hours}h offline` : `✨ ${g.prestige}`;
    return `<div class="gcard ${r} ${own ? 'own' : ''}" data-act="good" data-id="${g.id}">
      <span class="rar">${RARN[r]}</span>${own ? '<span class="owned">✓</span>' : ''}
      <div class="gi">${g.brand ? vIcon(g) : g.icon}</div><b>${g.name}</b><small>${perk}</small>
      <div class="gprice" data-cost="${own ? 0 : g.cost}">${own ? 'É seu!' : money(g.cost)}</div></div>`;
  }
}
const brandBadge = (b, big) => `<span class="bmono ${big ? 'big' : ''}" style="background:linear-gradient(135deg, ${b.c1}, ${b.c2})">${b.mono}</span>`;
function vCarros() {
  const s = C.s;
  const brand = BRANDS.find((b) => b.id === ui.brand) || BRANDS[0];
  const models = GOODS.veiculos.filter((g) => g.brand === brand.id);
  return `
  <div class="subtabs brands">${BRANDS.map((b) => { const n = GOODS.veiculos.filter((g) => g.brand === b.id && s.goods[g.id]).length; return `<button class="${b.id === brand.id ? 'on' : ''}" data-act="pt" data-g="brand" data-t="${b.id}">${brandBadge(b)}${b.name}${n ? ` <i class="bown">${n}</i>` : ''}</button>`; }).join('')}</div>
  <div class="brandhead">${brandBadge(brand, true)}<div><b>${brand.name}</b><small>${brand.slogan}</small></div></div>
  ${TIERS.filter((t) => models.some((g) => g.tier === t)).map((t) => `<h4 class="sec tierh">${{ Entrada: '🟢', 'Intermediário': '🔵', Luxo: '🟣', Esportivo: '🔥' }[t]} ${t}</h4>
    <div class="goods">${models.filter((g) => g.tier === t).map((g) => goodCard(g, TIER_RAR[t])).join('')}</div>`).join('')}`;
}
function openGood(id) {
  const s = C.s;
  const list = Object.values(GOODS).flat();
  const g = list.find((x) => x.id === id);
  const cat = Object.keys(GOODS).find((k) => GOODS[k].some((x) => x.id === id));
  const r = g.tier ? TIER_RAR[g.tier] : RAR[GOODS[cat].indexOf(g)];
  const own = !!s.goods[id];
  const rate = cat === 'veiculos' || cat === 'ceumar' ? 0.6 : cat === 'moradia' ? 0.9 : 0.75;
  const br = g.brand ? BRANDS.find((b) => b.id === g.brand) : null;
  modal(`<div class="goodmodal ${r}"><div class="gi">${g.brand ? vIcon(g) : g.icon}</div><span class="rar">${g.tier ? g.tier : RARN[r]}</span><h3>${g.name}</h3>${br ? `<p class="muted">${brandBadge(br)} ${br.name} · ${br.slogan}</p>` : ''}
    <div class="tags">${g.bonus ? `<span class="pill">💼 +${Math.round(g.bonus * 100)}% salário</span>` : ''}${g.hours ? `<span class="pill">🌙 +${g.hours}h offline</span><span class="pill">🏠 sem aluguel</span>` : ''}<span class="pill">✨ ${g.prestige} prestígio</span></div>
    ${own ? `<p class="muted">Você é dono disso! Se vender, recebe ${money(g.cost * rate)}.</p><button class="btn red full" data-act="sellgood" data-id="${id}">Vender</button>`
      : `<p class="muted">Cashback do seu cartão: ${Math.round(G.card(s).cashback * 100)}%</p><button class="btn gold full" data-act="buygood" data-id="${id}" data-cost="${g.cost}"><em>Comprar</em><span>${money(g.cost)}</span></button>`}</div>`);
}

// ---------- RANKING / PERFIL ----------
function vPerfil() {
  const sub = ui.sub.perfil;
  const head = subtabs([['ranking', '🏆', 'Ranking'], ['cartoes', '💳', 'Cartões'], ['conquistas', '🎖️', 'Troféus'], ['ajustes', '⚙️', 'Ajustes']]);
  const body = sub === 'cartoes' ? vCartoes() : sub === 'conquistas' ? vConquistas() : sub === 'ajustes' ? vAjustes() : vRanking();
  return title('🏆', { ranking: 'Ranking', cartoes: 'Cartões', conquistas: 'Troféus', ajustes: 'Ajustes' }[sub]) + head + body;
}
function vRanking() {
  const s = C.s;
  const me = { look: s.look, partner: s.love ? { look: s.love.partner.look } : null, n: s.name, w: G.netWorth(s, C.mk), l: G.level(s), a: Object.keys(s.ach).length, c: s.cardMax, p: G.prestige(s), net: G.incomeBreakdown(s, C.mk).net, me: true, home: (G.homeOf(s) || {}).icon || '🏚️' };
  const fr = s.friends.map((uid) => { const p = C.friends[uid]; return p ? { look: p.look, partner: p.partner, n: p.name, w: p.nw, l: p.level, a: p.ach, c: p.card || 0, p: p.prestige, net: p.net, t: p.updated, id: uid, home: p.home, online: Date.now() - p.updated < 3 * 60_000 } : { n: 'Carregando…', w: -1, l: 0, a: 0, c: 0, p: 0, id: uid, loading: true }; });
  const all = [me, ...fr].sort((a, b) => b.w - a.w);
  const pod = [all[1], all[0], all[2]];
  const medal = ['🥈', '🥇', '🥉'];
  const cls = ['p2', 'p1', 'p3'];
  return `
  <div class="mytag"><div><small>Sua tag de amigo</small><b>${C.cloud ? esc(s.tag || 'gerando…') : 'offline'}</b></div><button class="btn sm" data-act="copytag">Copiar</button></div>
  <div class="podium">${pod.map((p, i) => p && !p.loading ? `<div class="pcol ${cls[i]} ${p.me ? 'me' : ''}"><div class="pav2" ${p.me ? '' : `data-act="friend" data-id="${p.id}"`}>${avatarSVG(p.look, { size: i === 1 ? 110 : 90 })}${p.online || p.me ? '<i class="on"></i>' : ''}</div><b>${esc(p.n)}</b><small>${money(p.w)}</small><div class="pbar"><span>${medal[i]}</span></div></div>` : '<div class="pcol empty"><div class="pbar"></div></div>').join('')}</div>
  <div class="ranklist">${all.map((p, i) => `<div class="rank ${p.me ? 'me' : ''}" ${p.me || p.loading ? '' : `data-act="friend" data-id="${p.id}"`}><span class="pos">${i + 1}º</span><span class="rav">${p.loading ? '' : avatarSVG(p.look, { size: 52 })}</span>
      <div class="grow"><b>${p.home || ''} ${esc(p.n)}${p.me ? ' (você)' : ''}</b>${p.loading ? '' : `<small>⭐${p.l} · 💳${CARDS[p.c].name} · 🎖️${p.a} · ✨${fmt(p.p)}</small><small class="${p.online || p.me ? 'up' : ''}">${p.me ? '🟢 você' : p.online ? '🟢 jogando agora' : '⚪ visto ' + ago(p.t)} · ${p.net >= 0 ? '+' : ''}${fmt(p.net || 0)}/dia</small>`}</div>
      <div class="right"><b>${p.loading ? '…' : money(p.w)}</b>${p.me ? '' : `<button class="lnk" data-act="delfriend" data-id="${p.id}">remover</button>`}</div></div>`).join('')}</div>
  ${s.friends.length ? '' : '<p class="muted center">Ainda só você aqui! Adicione a família pela tag 👇</p>'}
  ${C.cloud ? '<button class="btn full blue" data-act="friendadd">👥 Adicionar amigo pela tag</button>' : '<p class="muted center">Ranking online disponível quando as contas estiverem ativadas.</p>'}
  <p class="muted center small">O ranking atualiza ao vivo. O mercado é o mesmo para todos — vence quem decidir melhor! 😎</p>`;
}
function vCartoes() {
  const s = C.s;
  return `<p class="muted center">Cartões são liberados pelo seu patrimônio e são seus para sempre.</p>
  <div class="cards">${CARDS.map((c, i) => `<div class="cardwrap ${i > s.cardMax ? 'lk' : ''}">${bigCard(s.name, c, i, i > s.cardMax)}
    <div class="perks"><span>💸 ${Math.round(c.cashback * 100)}%</span><span>💳 ${money(c.limit)}</span><span>🌙 ${c.hours}h</span></div></div>`).join('')}</div>`;
}
function vConquistas() {
  const s = C.s;
  const got = G.ACHIEVEMENTS.filter((a) => s.ach[a.id]).length;
  return `<div class="trophyhead"><span>🏆</span><b>${got} / ${G.ACHIEVEMENTS.length}</b><small>toque num troféu para ver</small></div>
  <div class="badges">${G.ACHIEVEMENTS.map((a) => `<div class="badge ${s.ach[a.id] ? 'got' : ''}" data-act="ach" data-id="${a.id}"><span>${s.ach[a.id] ? a.icon : '🔒'}</span><small>${a.name}</small></div>`).join('')}</div>`;
}
function vAjustes() {
  const s = C.s;
  return `<div class="box col"><b>✏️ Seu nome</b><input id="newname" maxlength="18" value="${esc(s.name)}"><button class="btn full" data-act="rename">Salvar</button></div>
  <div class="box col sndbox"><b>🔊 Som</b>
    <div class="lrow"><span>🎵 Música de fundo</span><button class="tgl ${A.settings().music ? 'on' : ''}" data-act="sndset" data-k="music"><i></i></button></div>
    <input type="range" min="0" max="1" step="0.05" value="${A.settings().mvol}" data-vol="mvol">
    <div class="lrow"><span>🔔 Efeitos sonoros</span><button class="tgl ${A.settings().sfx ? 'on' : ''}" data-act="sndset" data-k="sfx"><i></i></button></div>
    <input type="range" min="0" max="1" step="0.05" value="${A.settings().svol}" data-vol="svol">
  </div>
  <button class="btn ghost full" data-act="help">📖 Como jogar</button>
  <div class="box col stats">
    <div class="fr"><span>📅 Dias jogados</span><b>${fmt(Math.floor((Date.now() - s.created) / DAY_MS))}</b></div>
    <div class="fr"><span>💰 Total ganho</span><b>${money(s.stats.earned)}</b></div>
    <div class="fr"><span>📈 Operações na bolsa</span><b>${s.stats.trades}</b></div>
    <div class="fr"><span>🎯 Lucro com ações</span><b class="${s.stats.tradeProfit >= 0 ? 'up' : 'down'}">${money(s.stats.tradeProfit)}</b></div>
    <div class="fr"><span>🏔️ Maior patrimônio</span><b>${money(s.peakNW)}</b></div>
  </div>
  ${C.cloud ? `<div class="box col"><b>👤 Conta</b><small class="muted">Seu progresso é salvo na nuvem automaticamente.</small><button class="btn ghost full" data-act="logout">Sair da conta</button></div>` : ''}
  <p class="muted center small">Versão do jogo: ${esc(window.GAME_VERSION || '?')} · atualiza sozinho</p>
  <button class="btn red full" data-act="reset">Apagar progresso</button>`;
}

export function openHelp() {
  modal(`<h3>📖 Como jogar</h3>
  <div class="helpl">
  <p><span>🎯</span><span>Seja a pessoa <b>mais rica da família</b>. Sem ficar tocando na tela: aqui vence quem toma as <b>melhores decisões</b>.</span></p>
  <p><span>⏱️</span><span><b>1 dia no jogo = 1 minuto real.</b> O dinheiro cai sozinho, até com o jogo fechado (por algumas horas).</span></p>
  <p><span>🎓</span><span>Estude para pegar empregos melhores.</span></p>
  <p><span>🏭</span><span>Abra negócios e suba de nível. A cada 10, 25, 50… níveis o lucro dobra!</span></p>
  <p><span>🔥</span><span>Cada setor tem um <b>clima</b> que muda toda hora. Leia o 📺 jornal e invista no setor que vai esquentar.</span></p>
  <p><span>💳</span><span>Fique rico para desbloquear cartões cada vez mais top.</span></p>
  <p><span>🏆</span><span>Troque códigos no grupo da família e veja quem está na frente.</span></p>
  </div>
  <button class="btn full" data-act="close">Bora ficar rico! 🚀</button>`);
}

// ---------- atualização ao vivo ----------
function liveValue(key) {
  const s = C.s, mk = C.mk;
  const [k, arg] = key.split(':');
  switch (k) {
    case 'cash': return money(s.cash);
    case 'rate': { const n = G.incomeBreakdown(s, mk).net; return { t: `${n >= 0 ? '+' : ''}${fmt(n)}/dia`, c: n >= 0 ? 'up' : 'down' }; }
    case 'inc': return '+' + money(G.incomeBreakdown(s, mk).inc);
    case 'exp': return '-' + money(G.incomeBreakdown(s, mk).exp);
    case 'lvl': return G.level(s);
    case 'xptxt': { const L = G.level(s); return `${fmt(s.xp - G.xpForLevel(L))} / ${fmt(G.xpForLevel(L + 1) - G.xpForLevel(L))} XP`; }
    case 'nw': return money(G.netWorth(s, mk));
    case 'salary': return money(G.salary(s));
    case 'poup': return money(s.poup);
    case 'debt': return money(s.debt);
    case 'debtint': return money(s.debt * LOAN_RATE);
    case 'evtime': return s.event ? '⏳ ' + dur(s.event.exp - Date.now()) : '';
    case 'triptime': return s.trip ? dur(s.trip.end - Date.now()) : '';
    case 'resttime': return s.rested ? dur(s.rested - Date.now()) : '';
    case 'lovetime': return s.love && s.love.act ? '⏱️ ' + dur(s.love.act.end - Date.now()) : '';
    case 'aff': return s.love ? Math.round(s.love.aff) + ' / 100' : '';
    case 'giftcd': { const t = ((s.love || {}).cd || {})[arg] || 0; return t > Date.now() ? '⏳ ' + dur(t - Date.now()) : '✅ pronto'; }
    case 'coursetime': return s.course ? '⏱️ ' + dur(s.course.end - Date.now()) : '';
    case 'nextblock': return dur(mk.msToNextBlock());
    case 'price': return price(mk.price(arg));
    case 'chg': { const c = mk.change(arg); return { t: (c >= 0 ? '▲ ' : '▼ ') + pct(Math.abs(c)).slice(1), c: c >= 0 ? 'up' : 'down' }; }
    case 'held': case 'heldfull': {
      const h = s.port[arg];
      if (!h || !(h.q > 0)) return k === 'heldfull' ? 'Você ainda não tem.' : G.isCrypto(arg) || !ASSETS.find((a) => a.sym === arg) ? arg : arg;
      const v = h.q * mk.price(arg);
      const pl = v / h.cost - 1;
      const q = G.isCrypto(arg) ? fmt(h.q, h.q < 10 ? 4 : 2) : fmt(h.q);
      const own = G.ownPct(s, arg); const tier = G.ownTier(own);
      return { t: k === 'heldfull' ? `Você tem ${q} = ${money(v)} (${pct(pl)})` : `${tier ? tier.icon : '🎒'} ${q}${own ? ' · ' + fmtOwn(own) : ''} · ${pct(pl, 0)}`, c: pl >= 0 ? 'up' : 'down' };
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
    case 'news3': return newsHTML(3);
    case 'news20': return newsHTML(20);
    case 'sectors': return sectorsHTML(SECTORS.filter((x) => x.id !== 'crypto').map((x) => x.id));
    case 'cryptosector': return sectorsHTML(['crypto']);
  }
  return '';
}
function liveWidth(key) {
  const s = C.s;
  if (key === 'xp') { const L = G.level(s); const a = G.xpForLevel(L), b = G.xpForLevel(L + 1); return (s.xp - a) / (b - a); }
  if (key === 'aff') return s.love ? s.love.aff / 100 : 0;
  if (key === 'trip') { if (!s.trip) return 0; return (Date.now() - s.trip.start) / (s.trip.end - s.trip.start); }
  if (key === 'course') { if (!s.course) return 0; return (Date.now() - s.course.start) / (s.course.end - s.course.start); }
  if (key === 'nextcard') { const n = CARDS[s.cardMax + 1]; if (!n) return 1; const p = CARDS[s.cardMax].min; return (G.netWorth(s, C.mk) - p) / (n.min - p); }
  return 0;
}

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
  refresh(true);
  if (ui.tab === 'empresas' && !modalOpen()) { const sc = $('#view').scrollTop; render(); $('#view').scrollTop = sc; }
}
export function onEvent() { renderTabs(); if (ui.tab === 'inicio' && !modalOpen()) { const sc = $('#view').scrollTop; render(); $('#view').scrollTop = sc; } }
export function onFriends() { if (ui.tab === 'perfil' && ui.sub.perfil === 'ranking' && !modalOpen()) { const sc = $('#view').scrollTop; render(); $('#view').scrollTop = sc; } }
export function slowRefresh() {
  document.querySelectorAll('[data-live-html="flow"]').forEach((el) => { el.innerHTML = flowHTML(); });
}
export { ui };
