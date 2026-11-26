// ===== Interface (visual de jogo) =====
import {
  COURSE_GROUPS, JOB_AREAS, BRANDS, TIERS, OWN_TIERS, TRIP_CATS, TRIPS, LOVE_STAGES, DATES, GIFTS, RING_COST, WEDDINGS,
  SEGMENTS, SEGMENT, STAFF, PRODUCT_TIERS,
  EXCLUSIVES, EXCL,
  DAY_MS, SECTORS, SECTOR, STOCKS, CRYPTOS, ASSETS, BUSINESSES, COURSES, JOBS, PROPERTIES, GOODS, CARDS, UNLOCKS, TRADE_FEE, LOAN_RATE, LEVEL_BONUS, RENT_NO_HOME,
} from './data.js';
import * as G from './game.js';
import { avatarSVG, HAND_ITEMS, defaultLook, LEGENDS, LEGEND, LEGEND_COST, SKINS, HAIR_COLORS, EYE_COLORS, HAIRS, BEARDS, CLOTHES, SLOTS, SETS, CLOTH } from './avatar.js';
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
export const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function dur(ms) {
  ms = Math.max(0, ms);
  if (ms >= 86_400_000) { const d = Math.floor(ms / 86_400_000), h = Math.floor((ms % 86_400_000) / 3_600_000); return `${d}d ${h}h`; }
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h ? `${h}h${String(m).padStart(2, '0')}` : `${m}:${String(ss).padStart(2, '0')}`;
}
export function ago(ts) {
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
  document.addEventListener('input', (e) => { if (e.target.id === 'pixdesc' && $('#pixcount')) $('#pixcount').textContent = e.target.value.length + '/50'; if (e.target.id === 'amt') updProj(); const k = e.target.dataset && e.target.dataset.vol; if (k) { A.setVol(k, +e.target.value); if (k === 'svol') A.sfx('coin'); } });
  // No PC: rodinha do mouse rola as faixas horizontais
  document.addEventListener('wheel', (e) => {
    const el = e.target.closest('.subtabs, .wxrow, .street, .lifechips');
    if (el && Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) { el.scrollLeft += e.deltaY; e.preventDefault(); }
  }, { passive: false });
  renderTabs();
  render();
}

// ---------- efeitos ----------
export function toast(msg, kind = '', snd, onTap) {
  if (snd !== false) A.sfx(snd || (kind === 'err' ? 'error' : kind === 'gold' ? 'notify' : ''));
  const el = document.createElement('div');
  el.className = 'toast ' + kind + (onTap ? ' tap' : '');
  el.innerHTML = msg + (onTap ? '<small class="taphint">toque para abrir ›</small>' : '');
  if (onTap) el.addEventListener('click', () => { el.remove(); A.unlock(); onTap(); });
  $('#toasts').appendChild(el);
  const all = $('#toasts').children; while (all.length > 3) all[0].remove();
  const life = onTap ? 4500 : 2600;
  setTimeout(() => el.classList.add('out'), life);
  setTimeout(() => el.remove(), life + 400);
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
  status: () => statusModal(),
  phonechat: (d) => import('./phone.js').then((m) => { C.phone = m; closeModal(); m.open(C, 'chat', { uid: d.id }); }),
  invok: (d) => C.acceptInvite(d.id),
  invno: (d) => C.declineInvite(d.id),
  phone: () => G.hasPhone(C.s) ? handlers.phoneopen() : modal(`<h3>📱 Você ainda não tem celular</h3><p>Com um celular você usa a <b>📷 Câmera</b>, conversa no <b>💬 Vapo-Vapo</b> (privado e no <b>🌎 Geral</b> com todos os jogadores) e posta no <b>✨ Instantâneo</b>.</p><p class="muted">Compre um em 💎 Bens → 💍 Luxo. O <b>Celular Básico</b> custa só ${money(500)}.</p><button class="btn full" data-act="tab" data-tab="bens" data-sub="luxo">Ir para a loja</button>`),
  phoneopen: () => import('./phone.js').then((m) => { C.phone = m; m.open(C); }).catch(() => toast('⚠️ Não foi possível abrir o celular', 'err')),
  tab: (d) => { ui.tab = d.tab; if (d.sub) ui.sub[d.tab] = d.sub; closeModal(); renderTabs(); render(true); $('#view').scrollTop = 0; },
  sub: (d) => { ui.sub[ui.tab] = d.sub; render(true); $('#view').scrollTop = 0; },
  bizn: (d) => { ui.bizN = d.n === 'max' ? 'max' : +d.n; render(); },
  buybiz: (d, el) => { const sc = $('#view').scrollTop; if (act(() => G.buyBiz(C.s, d.id, ui.bizN), null, el)) { render(); $('#view').scrollTop = sc; } },
  course: (d, el) => { if (act(() => G.startCourse(C.s, d.id), '📚 Bons estudos!', el)) { keepScroll(render); if ($('#jobpath')) openJobPath(ui.lastPath); } },
  jobpath: (d) => openJobPath(d.id),
  job: (d, el) => { if (act(() => G.takeJob(C.s, d.id), '💼 Nova profissão!', el)) { closeModal(); keepScroll(render); } },
  asset: (d) => openAsset(d.sym),
  qty: (d) => { const inp = $('#qty'); if (!inp) return; inp.value = d.v; updateTradePreview(); },
  trade: (d) => doTrade(d.sym, d.side),
  sector: (d) => openSector(d.id),
  fixed: (d) => openFixed(d.kind),
  fixedgo: (d) => {
    const v = readAmount();
    if (d.kind === 'saque') act(() => G.withdrawPoup(C.s, v), '🏦 Saque feito');
    else act(() => G.applyFixed(C.s, d.kind, v, (ui.term || {})[d.kind] ?? 1), '✅ Dinheiro aplicado');
    closeModal(); render();
  },
  pctamt: (d) => { const inp = $('#amt'); inp.value = Math.floor(+d.base * +d.p * 100) / 100; updProj(); },
  redeem: (d, el) => act(() => G.redeem(C.s, d.kind, +d.i), '💰 Resgatado', el) && keepScroll(render),
  redeemearly: (d) => { const x = C.s[d.kind][+d.i]; confirmBox(`Resgatar antes do prazo? Você recebe ${money(x.principal || x.amt)} e perde ${money(x.amt - (x.principal || x.amt))} de rendimento.`, () => { if (act(() => G.redeem(C.s, d.kind, +d.i, true), '💸 Resgatado antes do prazo')) keepScroll(render); }); },
  term: (d, el) => { ui.term = ui.term || {}; ui.term[d.k] = +d.i; el.parentElement.querySelectorAll('.tp').forEach((b) => b.classList.toggle('on', b === el)); updProj(); },
  buyprop: (d, el) => act(() => G.buyProp(C.s, C.mk, d.id), '🔑 Imóvel comprado!', el) && render(),
  sellprop: (d) => confirmBox('Vender este imóvel?', () => act(() => G.sellProp(C.s, C.mk, d.id), 'Imóvel vendido') && render()),
  good: (d) => openGood(d.id),
  buygood: (d, el) => { if (act(() => G.buyGood(C.s, d.id), null, el)) { closeModal(); confetti(); toast(`🎉 ${G_NAME(d.id)} é seu!`, 'gold'); if (d.id === 'celular' || d.id === 'celular0') setTimeout(() => toast('📱 Toque no celular lá em cima para usar Câmera, Vapo-Vapo e Instantâneo!', 'gold'), 1200); render(); } },
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
  friendadd: () => modal(`<h3>👥 Adicionar amigo</h3><p class="muted">Peça a tag da pessoa (aparece no topo do Ranking dela) e digite aqui. Ela recebe um <b>convite</b> para aceitar ou recusar.</p><input id="friendtag" placeholder="Ex: MARIA#1234" autocapitalize="characters"><button class="btn full" id="addfriendbtn" data-act="addfriendgo">Adicionar</button>`),
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
    if (err === 'sent') { toast('📨 Convite enviado! Assim que aceitarem, aparece no seu ranking.', 'ok'); closeModal(); return render(); }
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
    // 1) cobre o bilhete de novo (sem animação), 2) troca o prêmio por baixo, 3) raspa
    const cv = $('#cover');
    cv.style.transition = 'none';
    cv.classList.remove('scratching', 'revealed');
    void cv.offsetWidth;
    $('#prize').textContent = r.mult ? '🎉 ' + r.mult + 'x' : '😢 Nada';
    requestAnimationFrame(() => requestAnimationFrame(() => { cv.style.transition = ''; cv.classList.add('scratching'); }));
    setTimeout(() => casinoResult(r, el), 1300);
  },
  snd: () => { const on = A.settings().music || A.settings().sfx; A.setMusic(!on); A.setSfx(!on); renderTop(); toast(on ? '🔇 Som desligado' : '🔊 Som ligado', '', false); },
  sndset: (d) => { const v = !A.settings()[d.k]; if (d.k === 'music') A.setMusic(v); else A.setSfx(v); keepScroll(render); },
  pix: (d) => {
    const p = C.friends[d.id];
    modal(`<h3>💸 Pix para ${esc(p.name)}</h3><p class="muted">O dinheiro sai da sua conta e cai na hora para ${esc(p.name)}. Não tem como desfazer!</p>
      <input id="amt" type="number" inputmode="numeric" min="1" placeholder="Valor em R$">
      <div class="descwrap"><input id="pixdesc" maxlength="50" placeholder="Descrição (opcional) — ex: Pra ajudar no carro 🚗"><small id="pixcount">0/50</small></div>
      <div class="quick">${[[1000, '1 mil'], [10000, '10 mil'], [100000, '100 mil'], [1e6, '1 mi']].map(([v, n]) => `<button class="chipbtn" data-act="pctamt" data-p="1" data-base="${v}">${n}</button>`).join('')}<button class="chipbtn" data-act="pctamt" data-p="0.1" data-base="${Math.max(0, C.s.cash)}">10%</button></div>
      <div class="btns"><button class="btn ghost" data-act="close">Cancelar</button><button class="btn" id="pixgo" data-act="pixgo" data-id="${d.id}">Enviar Pix</button></div>`);
  },
  pixgo: async (d) => {
    const v = readAmount();
    const btn = $('#pixgo'); if (btn) btn.disabled = true;
    const err = await C.sendPix(d.id, v, ($('#pixdesc') || {}).value || '');
    if (err) { if (btn) btn.disabled = false; return toast('⚠️ ' + err, 'err'); }
    closeModal(); A.sfx('cash'); toast(`💸 Pix de ${money(v)} enviado para ${esc(C.friends[d.id].name)}!`, 'ok', false); render();
  },
  inboxok: () => { C.clearInbox(); keepScroll(render); },
  paymode: (d) => { G.setPay(C.s, d.m); C.afterAction(); if (!refreshVisual()) keepScroll(render); },
  parc: (d) => { G.setPay(C.s, 'card', +d.n); C.afterAction(); if (!refreshVisual()) keepScroll(render); },
  payfatura: (d) => { const r = act(() => G.payFaturaNow(C.s, d.all === '1')); if (r) { A.sfx('cash'); toast(d.all === '1' ? `🧾 Cartão quitado: ${money(r.paid)}` : `🧾 Fatura paga: ${money(r.paid)}`, 'ok', false); keepScroll(render); } },
  found: (d, el) => { if (act(() => G.foundCorp(C.s, ($('#cname') || {}).value, ($('#cticker') || {}).value), '🏛️ Holding fundada!', el)) { confetti(); C.pushCompanies && C.pushCompanies(); render(); } },
  ipo: (d, el) => confirmBox(`Vender ${Math.round(+d.p * 100)}% da sua holding no mercado? Essa fatia do lucro dos seus negócios passa a ir para os acionistas.`, () => { const r = act(() => G.ipo(C.s, C.mk, +d.p)); if (r) { A.sfx('cash'); toast(`🔔 IPO! Você recebeu ${money(r.got)}`, 'gold', false); confetti(); C.pushCompanies && C.pushCompanies(); render(); } }),
  buyback: (d, el) => { const r = act(() => G.buyback(C.s, C.mk, +d.p), null, el); if (r) { toast(`🔁 Recompra feita: ${money(r.cost)}`, 'ok'); C.pushCompanies && C.pushCompanies(); render(); } },
  comp: (d) => { ui.comp = d.id; render(true); $('#view').scrollTop = 0; },
  compback: () => { ui.comp = null; render(true); },
  newcomp: () => newCompModal(),
  newcomp2: (d) => newCompForm(d.seg),
  foundcomp: (d, el) => {
    const taken = Object.values(C.companies || {}).filter((x) => x.owner !== C.uid).map((x) => x.ticker);
    const r = act(() => G.foundCompany(C.s, d.seg, ($('#cname') || {}).value, ($('#cticker') || {}).value, taken), null, el);
    if (r) { closeModal(); confetti(); toast('🏢 Empresa criada! Contrate funcionários e desenvolva seu primeiro produto.', 'gold'); ui.comp = r.id; C.pushCompanies && C.pushCompanies(); render(true); }
  },
  hire: (d) => { if (act(() => G.hire(C.s, d.id, d.r, +d.n))) keepScroll(render); },
  devprod: (d) => devModal(d.id, +d.t),
  devsug: (d) => { const i = $('#pmodel'); if (i) i.value = d.v; },
  devgo: (d, el) => { if (act(() => G.startDev(C.s, d.id, +d.t, ($('#pmodel') || {}).value), null, el)) { closeModal(); toast('🧪 Desenvolvimento iniciado!', 'ok'); render(); } },
  newver: (d, el) => { const c = G.findComp(C.s, d.id); const p = c.products.find((x) => x.tier === +d.t); confirmBox(`Lançar uma nova versão de <b>${esc(p.model)}</b>? Custa ${money(G.devCost(SEGMENT[c.seg], p.tier, true))} e as vendas voltam ao pico de lançamento.`, () => { if (act(() => G.newVersion(C.s, d.id, +d.t))) { toast('🧪 Nova versão em desenvolvimento!', 'ok'); render(); } }); },
  cipo: (d) => { const c = G.findComp(C.s, d.id); confirmBox(`Vender ${Math.round(+d.p * 100)}% da <b>${esc(c.name)}</b> na bolsa? Você recebe o dinheiro agora e essa fatia do lucro passa a ir para quem comprar as ações.`, () => { const r = act(() => G.compIpo(C.s, C.mk, d.id, +d.p)); if (r) { A.sfx('cash'); toast(`🔔 Ações na bolsa! Você recebeu ${money(r.got)}`, 'gold', false); confetti(); C.pushCompanies && C.pushCompanies(); render(); } }); },
  cbuyback: (d, el) => { const c = G.findComp(C.s, d.id); const r = act(() => C.compBuyback(c, +d.p), null, el); if (r) { toast(`🔁 Recomprou ${Math.round(r.pct * 1000) / 10}% por ${money(r.cost)}`, 'ok'); C.pushCompanies && C.pushCompanies(); render(); } },
  closecomp: (d) => { const c = G.findComp(C.s, d.id); confirmBox(`Fechar a <b>${esc(c.name)}</b>? Os funcionários são demitidos, os produtos saem da loja e você recebe ${money(c.invested * 0.5)} (metade do investido).`, () => { const r = act(() => G.closeCompany(C.s, d.id)); if (r) { ui.comp = null; toast(`🏚️ Empresa fechada. Recebeu ${money(r.got)}`, 'ok'); C.pushCompanies && C.pushCompanies(); render(); } }); },
  pcomp: (d) => openPlayerCompany(d.id),
  pctrade: async (d, el) => { el.disabled = true; const r = await C.tradeCompany(ui.pcomp, parseFloat($('#qty').value), d.side); el.disabled = false; if (typeof r === 'string') return toast('⚠️ ' + r, 'err'); A.sfx('cash'); toast(d.side === 'buy' ? '🤝 Agora você é sócio(a) dessa empresa!' : `💰 Vendeu ${r.profit >= 0 ? 'com lucro de ' : 'com prejuízo de '}${money(Math.abs(r.profit))}`, 'ok', false); closeModal(); keepScroll(render); },
  pgood: (d) => openPlayerGood(d.id, +d.t),
  buypgood: (d, el) => { const r = C.buyPlayerGood(d.id, +d.t); if (typeof r === 'string') return toast('⚠️ ' + r, 'err'); burst(el); closeModal(); confetti(); toast('🎉 É seu! Parte do valor foi para a empresa dona da marca.', 'gold'); render(); },
  sellpgood: (d) => { if (act(() => G.sellPlayerGood(C.s, d.id))) { closeModal(); toast('💰 Vendido!', 'ok'); render(); } },
  pgoodold: (d) => confirmBox('Vender este bem? A marca saiu do mercado.', () => { if (act(() => G.sellPlayerGood(C.s, d.id))) { toast('💰 Vendido!', 'ok'); render(); } }),
  season: () => seasonModal(),
  hand: (d) => { const on = !(C.s.look && C.s.look.hand === d.id); if (act(() => G.toggleHand(C.s, d.id))) { toast(on ? `${EXCL[d.id].icon} Agora seu personagem está segurando o <b>${esc(EXCL[d.id].name)}</b>!` : '🎒 Item guardado', on ? 'gold' : 'ok'); render(); } },
  buyexcl: (d, el) => { const x = EXCL[d.id]; confirmBox(`Comprar <b>${x.icon} ${esc(x.name)}</b> por <b>${money(x.cost)}</b>?<br>${esc(x.desc)} · +${fmt(x.prestige)} de prestígio · +${fmt(x.xp)} XP.<br><small>Pago só com dinheiro. Depois que o tempo acabar, ninguém mais consegue comprar.</small>`, () => { if (act(() => G.buyExclusive(C.s, d.id))) { closeModal(); confetti(); setTimeout(confetti, 500); toast(`${x.icon} <b>${esc(x.name)}</b> é seu! Item exclusivo!`, 'gold'); render(); } }); },
  crcash: (d, el) => {
    if (C.uid !== G.CREATOR) return;
    const v = d.v ? +d.v : parseFloat(($('#crval') || {}).value);
    if (!(v > 0)) return toast('⚠️ Digite um valor', 'err');
    C.s.cash += v; burst(el); toast(`🧪 +${money(v)} adicionado`, 'gold'); C.afterAction(); keepScroll(render);
  },
  crprest: (d) => {
    if (C.uid !== G.CREATOR) return;
    const v = +d.v;
    C.s.bonusPrestige = v ? (C.s.bonusPrestige || 0) + v : 0;
    G.statusRefresh(); toast(v ? `✨ +${fmt(v)} de prestígio de teste` : '✨ Prestígio de teste zerado', 'gold'); C.afterAction(); keepScroll(render);
  },
  rebirth: () => { const s = C.s, gain = G.rebirthGain(G.netWorth(s, C.mk)); confirmBox(`<b>Renascer agora?</b><br>Você perde dinheiro, negócios, investimentos, bens, empresas e cartões, e recomeça com R$ 1.500.<br>Em troca ganha <b>+${gain} de legado</b>: seu bônus de renda vai de +${G.legacyPct(G.legacyPts(s))}% para <b>+${G.legacyPct(Math.min(G.LEGACY.maxPts, G.legacyPts(s) + gain))}%</b> para sempre.<br><small>Mantém: nível, estudos, profissão, visual, roupas, skins, viagens, amor, troféus e amigos.</small>`, () => { const r = C.rebirth(); if (typeof r === 'string') return toast('⚠️ ' + r, 'err'); closeModal(); confetti(); toast(`🔁 Você renasceu! +${r.gain} de legado`, 'gold'); ui.tab = 'inicio'; render(true); }); },
  rkmode: (d) => { ui.rk = d.m; if (d.m === 'todos') ui.topList = null; render(); },
  invitetag: async (d, el) => { el.disabled = true; const r = await C.addFriend(d.tag); if (r === 'sent') { toast('📨 Convite enviado!', 'ok'); keepScroll(render); } else if (r) toast('⚠️ ' + r, 'err'); else keepScroll(render); },
  fcorp: (d) => openFriendCorp(d.id),
  fctrade: (d) => { const uid = ui.fcorp; const p = C.friends[uid]; const r = act(() => G.tradeFriendCorp(C.s, uid, p.corp, parseFloat($('#qty').value), d.side)); if (r) { A.sfx('cash'); toast(d.side === 'buy' ? `🤝 Agora você é sócio(a) de ${esc(p.name)}!` : `💰 Vendeu ${r.profit >= 0 ? 'com lucro de ' : 'com prejuízo de '}${money(Math.abs(r.profit))}`, 'ok', false); closeModal(); render(); } },
  insplan: (d) => {
    const plan = d.p || null;
    const x = G.INSURANCES.find((i) => i.id === d.id);
    if (!plan) { act(() => G.setInsurance(C.s, C.mk, d.id, null), `${x.icon} Seguro cancelado`); return keepScroll(render); }
    const pr = G.insPremium(C.s, C.mk, d.id, plan);
    confirmBox(`Contratar ${x.name} (${plan === 'completo' ? 'Completo' : 'Básico'}) por ${money(pr)} a cada 30 dias do jogo? A primeira mensalidade é cobrada agora.`, () => { if (act(() => G.setInsurance(C.s, C.mk, d.id, plan), `🛡️ ${x.name} contratado!`)) keepScroll(render); });
  },
  lsex: (d) => { ui.lsex = d.v; if (!refreshVisual()) keepScroll(render); },
  lend: (d, el) => { const owned = !!(C.s.legends || {})[d.id]; if (act(() => G.buyLegend(C.s, d.id), null, owned ? null : el)) { if (!owned) { confetti(); toast(`🌟 Skin lendária: ${esc(LEGEND[d.id].name)}! +${Math.round(LEGEND[d.id].bonus * 100)}% no salário`, 'gold'); } else toast(`✨ Usando ${esc(LEGEND[d.id].name)}`, 'ok'); if (!refreshVisual()) keepScroll(render); } },
  lendoff: () => { G.takeOffLegend(C.s); C.afterAction(); toast('Skin lendária guardada', 'ok'); if (!refreshVisual()) keepScroll(render); },
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
  holding: `<h3>🏛️ Holding dos negócios</h3><p>Com R$ 50 mi de patrimônio e 3 tipos de negócio você pode fundar uma holding que reúne seus negócios. No IPO você vende até 49% das ações e recebe na hora; essa fatia dos lucros dos negócios passa a ir para os acionistas.</p>`,
  companies: `<h3>🏢 Como funcionam suas empresas</h3>
    <p><b>1. Crie</b> uma empresa num segmento (nível ${8}+). O segmento define os produtos e o setor da bolsa: quando o setor está 🔥 em alta a empresa vende +30%; em ❄️ queda, −25%.</p>
    <p><b>2. Desenvolva produtos</b> (5 por segmento, do mais simples ao mais avançado). Cada um custa e leva alguns minutos. Produto novo vende +50% no lançamento; depois de ~4h vai envelhecendo — lance uma <b>nova versão</b> para voltar ao pico.</p>
    <p><b>3. Contrate</b>: 🏭 Produção é obrigatória (sem gente suficiente você vende menos); 🤝 Vendas (+5% cada) e 📣 Marketing (+4% cada) aumentam a receita; 🧪 P&D acelera o desenvolvimento e é exigido nos produtos avançados. Salário cresce com o porte da empresa.</p>
    <p><b>Lucro = receita − salários</b>, e cai direto no seu dinheiro todo dia.</p>
    <h3>📈 Ações da sua empresa</h3>
    <p>Toda empresa tem <b>10 milhões de ações</b>. Preço da ação = <b>lucro por dia × 400 ÷ 10 milhões</b>. Mais lucro = ação mais cara.</p>
    <p>🔔 <b>IPO</b>: você vende até 49% e recebe o dinheiro <b>na hora</b> (preço × ações). Você continua no controle (51%+).</p>
    <p>💸 <b>O preço disso</b>: a fatia vendida do lucro passa a ir para quem tem as ações, para sempre (ou até você recomprar). Se vendeu 30%, você fica com 70% do lucro.</p>
    <p>🤝 <b>O sócio</b> (quem compra) recebe todo dia: ações ÷ 10 milhões × lucro da empresa. Dá ~0,25% ao dia do valor investido, e ainda ganha se a ação subir.</p>
    <p>🔁 <b>Recompra</b>: você pode recomprar as ações que ainda estão soltas na bolsa (as que outros jogadores compraram, só eles podem vender).</p>
    <h3>🧠 Estratégia</h3>
    <p>• Venda ações <b>quando o lucro está alto</b> (setor 🔥, produto recém-lançado): recebe mais por cada %.</p>
    <p>• Recompre quando estiver barata (setor ❄️, produto velho) e depois lance nova versão.</p>
    <p>• Como investidor, compre ações de empresas com lucro crescendo e setor indo para 🔥 (veja o 📺 Jornal); venda antes do ❄️.</p>
    <p>• Use o dinheiro do IPO para abrir outra empresa: o lucro dela é 100% seu.</p>
    <p>• Gerente, Diretor(a) e CEO podem ter mais empresas e lucram mais (CEO: 5 empresas e +30%).</p>`,
  credito: `<h3>💳 Cartão de crédito</h3><p>Nas telas de compra (bens, roupas, viagens, presentes e programas) escolha <b>Pagar com 💳 Cartão</b>: à vista ou em 3x, 6x ou 12x sem juros. Só no cartão você ganha <b>cashback</b>.</p><p>A fatura fecha a cada 30 dias do jogo (30 min) e é paga sozinha com seu dinheiro. Se faltar, o resto vira dívida no <b>rotativo</b>, com juros.</p><p>Negócios, imóveis e ações só podem ser comprados à vista.</p><h3>🏦 Empréstimo</h3><p>Pegue dinheiro emprestado para abrir negócios mais cedo. Mas cuidado: os juros (${(LOAN_RATE * 100).toFixed(2)}% ao dia) correm sem parar! O limite depende do seu cartão.</p>`,
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
  $('#tabs').innerHTML = TABS.map((t) => `<button class="${ui.tab === t.id ? 'on' : ''}" data-act="tab" data-tab="${t.id}"><span>${t.icon}</span><small>${t.name}</small>${t.id === 'inicio' && (C.s.event || (C.s.inbox || []).length) && ui.tab !== 'inicio' ? '<i class="dot"></i>' : ''}</button>`).join('');
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
      <button class="sndbtn phonebtn ${G.hasPhone(s) ? '' : 'nophone'}" data-act="phone" aria-label="Celular">📱<i class="pdot" style="display:none"></i></button>
      <button class="sndbtn" data-act="snd">${A.settings().music || A.settings().sfx ? '🔊' : '🔇'}</button>
      <div class="minicard ${c.cls}" data-act="tab" data-tab="perfil" data-sub="cartoes"><span>${c.name}</span></div>
    </div>
    <div class="cashpill"><span class="cicon">🪙</span><span class="cash" data-live="cash"></span><span class="rate" data-live="rate"></span></div>`;
  if (C.phone) C.phone.badge();
}

const title = (icon, text, help) => `<div class="ptitle"><h2>${icon} ${text}</h2>${help ? infoBtn(help) : ''}</div>`;
const lockBox = (lvl, what) => `<div class="locked"><div class="lk">🔒</div><b>${what}</b><p>Libera no <span class="lvchip">Nível ${lvl}</span></p><small>Suba de nível estudando, abrindo negócios e conquistando troféus.</small></div>`;
const subtabs = (list) => `<div class="subtabs">${list.map(([id, icon, name]) => `<button class="${ui.sub[ui.tab] === id ? 'on' : ''}" data-act="sub" data-sub="${id}"><span>${icon}</span>${name}</button>`).join('')}</div>`;
const dataAttrs = (data) => Object.entries(data).map(([k, v]) => `data-${k}="${v}"`).join(' ');
const pillTabs = (g, list, cur) => `<div class="ptabs">${list.map(([id, icon, name]) => `<button class="${cur === id ? 'on' : ''}" data-act="pt" data-g="${g}" data-t="${id}">${icon} ${name}</button>`).join('')}</div>`;
function payBar() {
  const s = C.s;
  const card = s.payMode === 'card';
  return `<div class="paybar"><div class="pbrow"><span>Pagar com</span><div class="seg2">${[['cash', '💵 Dinheiro'], ['card', '💳 Cartão']].map(([m, n]) => `<button class="${(s.payMode || 'cash') === m ? 'on' : ''}" data-act="paymode" data-m="${m}">${n}</button>`).join('')}</div></div>
    ${card ? `<div class="pbrow"><div class="parc">${G.PARCELAS.map((n) => `<button class="chipbtn ${(s.parc || 1) === n ? 'on' : ''}" data-act="parc" data-n="${n}">${n === 1 ? 'À vista' : n + 'x'}</button>`).join('')}</div></div><small>Limite disponível: <b data-live="ccavail"></b> · cashback ${Math.round(G.card(s).cashback * 100)}%</small>` : '<small>💡 No cartão você ganha cashback e pode parcelar.</small>'}${G.statusOf(s).disc ? `<small class="up">🏷️ Desconto de ${G.statusOf(s).name}: ${Math.round(G.statusOf(s).disc * 100)}% (já no preço)</small>` : ''}</div>`;
}
const dp = (c) => G.discPrice(C.s, c);
const costBtn = (act, data, cost, label = '') => `<button class="btn gold" data-act="${act}" ${dataAttrs(data)} data-cost="${cost}">${label}<span>${money(cost)}</span></button>`;

// ---------- CAMPEÃO DO ÚLTIMO ANO ----------
// ---------- Temporada em 2 categorias ----------
function seasonRows(year) {
  const s = C.s, cur = year === G.calendar().year;
  const rows = [];
  if (C.uid !== G.CREATOR) {
    if (cur) { const rb = G.seasonCat(s) === 'rb'; rows.push({ n: s.name, look: s.look, me: true, cat: rb ? 'rb' : 'vet', score: rb ? G.netWorth(s, C.mk) : G.seasonPct(s, C.mk) }); }
    else if (s.lastSeason && s.lastSeason.year === year) rows.push({ n: s.name, look: s.look, me: true, titles: s.titles || 0, cat: s.lastSeason.rb ? 'rb' : 'vet', score: s.lastSeason.rb ? s.lastSeason.nw || 0 : s.lastSeason.pct || 0 });
  }
  for (const uid of s.friends) {
    if (uid === G.CREATOR) continue;
    const p = C.friends[uid]; if (!p) continue;
    const r = G.profileSeason(p, year);
    if (r) rows.push({ n: p.name, look: p.look, id: uid, titles: p.titles || 0, ...r });
    else if (cur) rows.push({ n: p.name, look: p.look, id: uid, cat: 'vet', score: 0, idle: true });
  }
  return rows;
}
const CATS = { rb: { name: '🔁 Renascidos', how: 'maior patrimônio', fmt: (v) => money(v) }, vet: { name: '🏛️ Veteranos', how: 'maior crescimento em %', fmt: (v) => pctTxt(v) } };
function seasonBoards(year, small = false) {
  const rows = seasonRows(year);
  return ['rb', 'vet'].map((cat) => {
    const list = rows.filter((r) => r.cat === cat).sort((a, b) => b.score - a.score);
    return `<div class="sboard ${cat}"><div class="sbhead"><b>${CATS[cat].name}</b><small>vence o ${CATS[cat].how}</small></div>
      ${list.length ? `<div class="ranklist ${small ? 'small' : ''}">${list.map((r, i) => `<div class="rank ${r.me ? 'me' : ''}" ${r.me ? '' : `data-act="friend" data-id="${r.id}"`}><span class="pos">${['🥇', '🥈', '🥉'][i] || i + 1 + 'º'}</span><span class="rav">${avatarSVG(r.look, { size: small ? 40 : 52 })}</span><div class="grow"><b>${esc(r.n)}${r.me ? ' (você)' : ''}</b>${r.idle ? '<small class="muted">ainda não entrou nesta temporada</small>' : ''}</div><div class="right"><b class="up">${CATS[cat].fmt(r.score)}</b></div></div>`).join('')}</div>`
        : `<p class="emptyf">${cat === 'rb' ? 'Ninguém renasceu nesta temporada ainda.' : 'Ninguém nesta categoria.'}</p>`}</div>`;
  }).join('');
}
function lastChampion() {
  const s = C.s, ly = G.calendar().year - 1;
  if (ly < 1) return null;
  const cands = [];
  if (C.uid !== G.CREATOR && s.lastSeason && s.lastSeason.year === ly) cands.push({ n: s.name, look: s.look, g: s.lastSeason.pct ?? 0, me: true, titles: s.titles || 0 });
  for (const uid of s.friends) {
    const p = C.friends[uid];
    if (!p || uid === G.CREATOR) continue;
    const g = p.lastYr === ly ? p.lastPct : p.yr === ly ? p.pct : null;
    if (g !== null && g !== undefined) cands.push({ n: p.name, look: p.look, g, id: uid, titles: p.titles || 0 });
  }
  const best = cands.filter((c) => c.g > 0).sort((a, b) => b.g - a.g)[0];
  return best ? { ...best, year: ly } : null;
}
function championBanner() {
  const ly = G.calendar().year - 1;
  if (ly < 1) return '';
  const rows = seasonRows(ly);
  return ['rb', 'vet'].map((cat) => {
    const c = rows.filter((r) => r.cat === cat && (cat === 'rb' || r.score > 0)).sort((a, b) => b.score - a.score)[0];
    if (!c) return '';
    return `<div class="champ" ${c.me ? '' : `data-act="friend" data-id="${c.id}"`}><div class="chav">${avatarSVG(c.look, { size: 74 })}<span class="chcrown">👑</span></div>
    <div class="grow"><small>🏆 CAMPEÃO DO ANO ${ly} · ${CATS[cat].name}</small><b>${esc(c.n)}${c.me ? ' (você!)' : ''}</b><span>${cat === 'rb' ? 'Patrimônio' : 'Cresceu'} <b class="up">${CATS[cat].fmt(c.score)}</b>${c.titles > 1 ? ` · ${c.titles} títulos` : ''}</span></div></div>`;
  }).join('');
}

// ---------- CRIADOR (destaque no ranking) ----------
function creatorCard(p, yearMode) {
  return `<div class="creator" ${p.me ? '' : `data-act="friend" data-id="${p.id}"`}>
    <div class="crav">${avatarSVG(p.look, { size: 120 })}</div>
    <div class="grow"><span class="crtag">👑 CRIADOR</span>
      <b class="crname">${esc(p.n)}${p.me ? ' (você)' : ''}</b>
      <small>⭐${p.l} · 💳${CARDS[p.c].name} · 🎖️${p.a} · ${G.STATUS[G.statusIdx(p.p || 0)].icon}${fmt(p.p)}</small>
      <div class="crstats"><div><small>${yearMode ? 'Cresceu no ano' : 'Patrimônio'}</small><b>${yearMode ? pctTxt(p.w) : money(p.w)}</b></div><div><small>Por dia</small><b class="${p.net >= 0 ? 'up' : 'down'}">${p.net >= 0 ? '+' : ''}${fmt(p.net || 0)}</b></div></div>
      <small class="crnote">${p.me ? '🟢 você' : p.online ? '🟢 jogando agora' : '⚪ visto ' + ago(p.t)} · fora da disputa</small></div></div>`;
}

// Ferramentas de teste: só aparecem na conta do criador
function creatorTools() {
  const amts = [[1e6, '1 mi'], [1e9, '1 bi'], [1e10, '10 bi'], [1e11, '100 bi'], [1e12, '1 tri']];
  return `<div class="box col crtools"><b>🧪 Ferramentas do Criador</b><small class="muted">Só aparece na sua conta. Você está fora da disputa do ranking.</small>
    <div class="quick">${amts.map(([v, n]) => `<button class="chipbtn" data-act="crcash" data-v="${v}">+ ${n}</button>`).join('')}</div>
    <div class="lrow"><input id="crval" type="number" inputmode="numeric" placeholder="Outro valor (R$)"><button class="btn sm" data-act="crcash">Adicionar</button></div>
    <div class="quick">${[[1000, '1 mil'], [10000, '10 mil']].map(([v, n]) => `<button class="chipbtn" data-act="crprest" data-v="${v}">✨ + ${n} prestígio</button>`).join('')}<button class="chipbtn" data-act="crprest" data-v="0">✨ Zerar prestígio de teste</button></div></div>`;
}

// ---------- TEMPORADA (ANO) E RENASCER ----------
const pctTxt = (g) => `${g >= 0 ? '+' : ''}${(+g).toFixed(1)}%`;
const growOf = (p, yr) => (p.yr === yr ? p.grow : p.lastYr === yr ? p.lastGrow : null);
function seasonModal() {
  const s = C.s, mk = C.mk, cal = G.calendar();
  const me = { n: s.name + ' (você)', g: G.seasonPct(s, mk), me: true, look: s.look };
  const rows = [...(C.uid === G.CREATOR ? [] : [me]), ...s.friends.filter((uid) => uid !== G.CREATOR).map((uid) => C.friends[uid]).filter(Boolean).map((p) => ({ n: p.name, g: p.yr === cal.year ? p.pct || 0 : 0, look: p.look }))].sort((a, b) => b.g - a.g);
  const nw = G.netWorth(s, mk), gain = G.rebirthGain(nw), why = G.canRebirth(s, mk);
  const hist = (s.seasonHist || []).slice(0, 6);
  modal(`<h3>📅 Ano ${cal.year} · dia ${cal.day}/365</h3>
    <p class="muted">O ano (temporada) vira em <b data-live="yearleft"></b>. Cada temporada dura <b>3 dias</b> e todos os jogadores viram juntos.</p>
    <div class="seasonme"><small>${G.seasonCat(s) === 'rb' ? 'Você renasceu: disputa nos 🔁 Renascidos com seu patrimônio' : 'Você está nos 🏛️ Veteranos: cresceu neste ano'}</small><b ${G.seasonCat(s) === 'rb' ? 'data-live="nw"' : 'data-live="sgrow"'}></b></div>
    <h4>🏁 Ranking do ano</h4>
    ${seasonBoards(cal.year, true)}
    <p class="hint small">🎁 Na virada, em <b>cada categoria</b>: 🥇 +3 de legado e o título 🏆 · 🥈 +2 · 🥉 +1. O legado dá bônus de renda para sempre: os primeiros pontos valem mais (~3% cada) e o bônus vai crescendo cada vez mais devagar, até o máximo de <b>+300%</b>. (Precisa de pelo menos 2 jogadores na categoria.)</p>
    <div class="legacybox"><div><small>Seu legado</small><b>⭐ ${G.legacyPts(s)} pts</b></div><div><small>Bônus de renda</small><b class="up">+${Math.round((G.legacyMult(s) - 1) * 100)}%</b></div><div><small>Títulos</small><b>🏆 ${s.titles || 0}</b></div></div>
    ${hist.length ? `<h4>📜 Anos anteriores</h4>${hist.map((h) => `<div class="fr"><span>Ano ${h.year}${h.place ? ' · ' + (['🥇', '🥈', '🥉'][h.place - 1] || h.place + 'º') : ''}</span><b class="${h.grow >= 0 ? 'up' : 'down'}">${h.grow >= 0 ? '+' : ''}${money(h.grow)}</b></div>`).join('')}` : ''}
    ${C.s.wear ? `<p class="warnbox">⏳ Desgaste do império: <b>−${C.s.wear * 10}% de renda</b> por ${C.s.wear} temporada(s) sem renascer. Renascer zera.</p>` : '<p class="hint small">⏳ Quem tem patrimônio para renascer e passa a temporada inteira sem renascer ganha <b>−10% de renda</b> por temporada (desgaste do império, até −40%). Renascer zera.</p>'}
    <h4>🔁 Renascer</h4>
    <p class="muted small">Recomece a economia do zero e ganhe legado conforme seu patrimônio (mínimo ${money(G.LEGACY.minNW)}, uma vez por ano). Quanto mais rico, mais pontos. Você mantém nível, estudos, profissão, visual, roupas, skins, viagens, amor, troféus e amigos.</p>
    <div class="fr"><span>Se renascer agora ganha</span><b class="up">+${gain} pts (bônus vai para +${G.legacyPct(Math.min(G.LEGACY.maxPts, G.legacyPts(s) + gain))}%)</b></div>
    <button class="btn ${why ? 'ghost' : 'red'} full" data-act="rebirth" ${why ? 'disabled' : ''}>🔁 Renascer${why ? '' : ` (+${gain} de legado)`}</button>${why ? `<small class="muted">${why}</small>` : ''}`);
}

// ---------- STATUS SOCIAL ----------
const perksOf = (x) => [x.biz ? `🏭 +${Math.round(x.biz * 100)}% no lucro dos negócios` : '', x.disc ? `🏷️ ${Math.round(x.disc * 100)}% de desconto em bens, roupas, viagens e no amor` : '', x.luck ? '🍀 Mais boas notícias e menos imprevistos' : '', x.love ? '❤️ +25% de carinho em presentes e encontros' : '', x.club ? '👑 Selo do Clube dos Magnatas no ranking' : ''].filter(Boolean);
function statusModal() {
  const st = G.statusOf(C.s);
  const nx = st.next;
  const pct = nx ? Math.min(100, ((st.p - st.min) / (nx.min - st.min)) * 100) : 100;
  modal(`<h3>${st.icon} Status: ${st.name}</h3>
    <p class="muted">Seu <b>prestígio</b> (✨ ${fmt(st.p)}) define seu status social. Quanto mais famoso, mais vantagens!</p>
    ${nx ? `<div class="bar gold"><i style="width:${pct}%"></i></div><small>Faltam <b>✨ ${fmt(nx.min - st.p)}</b> para ${nx.icon} ${nx.name}</small>` : '<p class="up"><b>Você chegou ao topo! 🌍</b></p>'}
    <div class="stlist">${G.STATUS.map((x, i) => `<div class="stier ${i === st.idx ? 'cur' : i < st.idx ? 'done' : ''}"><div class="sthead"><span>${x.icon}</span><b>${x.name}</b><small>✨ ${fmt(x.min)}</small>${i === st.idx ? '<em>você</em>' : i < st.idx ? '<em class="ok">✓</em>' : ''}</div>${perksOf(x).length ? `<ul>${perksOf(x).map((t) => `<li>${t}</li>`).join('')}</ul>` : '<small class="muted">Sem vantagens ainda</small>'}</div>`).join('')}</div>
    ${C.s.bonusPrestige ? `<p class="muted small">🧪 Inclui ✨ ${fmt(C.s.bonusPrestige)} de prestígio de teste.</p>` : ''}
    <p class="hint small">✨ Como ganhar prestígio: comprando 💎 bens (carros, casas, luxo), 👗 roupas com estilo, 🌟 skins lendárias, ✈️ conhecendo destinos novos e 💒 casando.</p>`);
}

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
  const veh = [...GOODS.veiculos, ...GOODS.ceumar].filter((g) => s.goods[g.id]).concat(G.pgoods(s).filter((g) => g.bonus)).sort((a, b) => a.cost - b.cost).pop();
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
    <span class="lchip" data-act="status">${G.statusOf(s).icon} ${G.statusOf(s).name} · ✨ ${fmt(G.prestige(s))}</span>
  </div>`;
}

function vVida() {
  const sub = ui.sub.vida;
  const head = subtabs([['carreira', '🎓', 'Carreira'], ['visual', '👗', 'Visual'], ['amor', '❤️', 'Amor'], ['viagens', '✈️', 'Viagens'], ['seguros', '🛡️', 'Seguros'], ['cassino', '🎰', 'Cassino']]);
  let body = sub === 'visual' ? vVisual() : sub === 'amor' ? vAmor() : sub === 'viagens' ? vViagens() : sub === 'cassino' ? vCassino() : sub === 'seguros' ? vSeguros() : vCarreira();
  if (sub === 'amor' || sub === 'viagens') body = `<div data-cardable>${payBar()}${body}</div>`;
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
const visBar = (cur) => LOOK_TABS.map((t) => tabChip('vis', t, cur)).join('') + '<span class="tabsep">🛍️ Loja</span>' + tabChip('vis', { id: 'lendas', icon: '🌟', name: 'Lendárias' }, cur) + SLOTS.map((t) => tabChip('vis', t, cur)).join('');
const visPanel = (tab) => (tab === 'lendas' ? legendsPanel() : isLookTab(tab) ? lookPanel(tab, C.s.look) : `${payBar()}<div class="closet" data-cardable>${closetHTML(tab)}</div>`);
function vVisual() {
  const s = C.s;
  const tab = ui.vis || 'corpo';
  return `
  <div class="mirror"><div class="mirrorav" id="mirrorav">${avatarSVG(s.look, { size: 230 })}</div><div class="stylebadge">👗 Estilo <b id="stylev">${fmt(G.styleOf(s))}</b></div></div>
  <div class="subtabs vistabs" id="vistabs">${visBar(tab)}</div>
  <div id="vispanel">${visPanel(tab)}</div>`;
}
function legendsPanel() {
  const s = C.s;
  const sx = ui.lsex || (s.look && s.look.sex) || 'm';
  const cur = s.look && s.look.lend;
  const list = LEGENDS.filter((l) => l.sex === sx);
  return `<div class="legendhead"><b>🌟 Skins Lendárias</b><small>Visual completo e exclusivo + <b>bônus no salário</b> enquanto estiver usando. ${money(dp(LEGEND_COST))} cada.</small></div>
  ${cur ? `<div class="paybar lendnow"><span>Usando: <b>${esc(LEGEND[cur].name)}</b> (+${Math.round(LEGEND[cur].bonus * 100)}% salário)</span><button class="btn ghost sm" data-act="lendoff">Tirar</button></div>` : ''}
  ${payBar()}
  <div class="seg2 lsex">${[['m', '♂️ Masculinas'], ['f', '♀️ Femininas']].map(([v, n]) => `<button class="${sx === v ? 'on' : ''}" data-act="lsex" data-v="${v}">${n}</button>`).join('')}</div>
  <div class="closet" data-cardable>${list.map((l) => {
    const own = !!(s.legends || {})[l.id];
    const worn = cur === l.id;
    const btn = worn ? '<span class="pill ok">✨ Usando</span>' : own ? `<button class="btn sm" data-act="lend" data-id="${l.id}">Usar</button>` : `<button class="btn gold sm" data-act="lend" data-id="${l.id}" data-cost="${dp(LEGEND_COST)}"><span>${money(dp(LEGEND_COST))}</span></button>`;
    return `<div class="citem legend ${worn ? 'worn' : ''}"><span class="lrar">LENDÁRIA</span><div class="cprev">${avatarSVG({ ...(s.look || defaultLook(l.sex)), lend: l.id }, { size: 128 })}</div><b>${l.name}</b><span class="pill money">+${Math.round(l.bonus * 100)}% salário</span>${btn}</div>`;
  }).join('')}</div>`;
}
function setCost(s, st) { return Object.values(st.pieces).filter((id) => id && !s.wardrobe[id]).reduce((t, id) => t + CLOTH[id].cost, 0); }
function closetHTML(slot) {
  const s = C.s;
  const L = s.look;
  if (slot === 'sets') return SETS.map((st) => {
    const cost = setCost(s, st);
    const wornAll = Object.entries(st.pieces).filter(([, v]) => v).every(([k, v]) => L[k] === v);
    const btn = wornAll ? '<span class="pill ok">Vestindo</span>' : cost ? `<button class="btn gold sm" data-act="buyset" data-id="${st.id}" data-cost="${dp(cost)}"><span>${money(dp(cost))}</span></button>` : `<button class="btn sm" data-act="buyset" data-id="${st.id}">Vestir</button>`;
    return `<div class="citem ${wornAll ? 'worn' : ''}"><div class="cprev">${avatarSVG({ ...L, ...st.pieces }, { size: 118 })}</div><b>${st.icon} ${st.name}</b><small>✨ ${Object.values(st.pieces).filter(Boolean).reduce((t, id) => t + CLOTH[id].style, 0)} de estilo</small>${btn}</div>`;
  }).join('');
  return CLOTHES.filter((c) => c.slot === slot).map((c) => {
    const own = !!s.wardrobe[c.id];
    const worn = L[slot] === c.id;
    const btn = worn ? (['head', 'face', 'neck', 'back'].includes(slot) || c.cost > 0 ? `<button class="btn ghost sm" data-act="takeoff" data-slot="${slot}">Tirar</button>` : '<span class="pill ok">Usando</span>')
      : own ? `<button class="btn sm" data-act="buycloth" data-id="${c.id}">Vestir</button>` : `<button class="btn gold sm" data-act="buycloth" data-id="${c.id}" data-cost="${dp(c.cost)}"><span>${money(dp(c.cost))}</span></button>`;
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
  const weddings = `<p class="hint small">💒 Precisa de ❤️ 75 de carinho.</p>${WEDDINGS.map((w) => `<div class="item"><span class="bi">${w.icon}</span><div class="grow"><b>${w.name}</b><small>⏱️ ${w.mins} dias · ✨ +${w.prestige}</small></div>${costBtn('marry', { id: w.id }, dp(w.cost))}</div>`).join('')}`;
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
  ${lt !== 'programas' ? '' : DATES.map((d) => `<div class="item ${L.act ? 'dim' : ''}"><span class="bi">${d.icon}</span><div class="grow"><b>${d.name}</b><small>⏱️ ${d.mins} dias · ❤️ +${L.lastDate === d.id ? `${Math.round(d.aff * 0.6)} <span class="down">(repetido)</span>` : d.aff}</small></div>${L.act ? '' : costBtn('date', { id: d.id }, dp(d.cost))}</div>`).join('')}
  ${lt !== 'presentes' ? '' : `<p class="hint small">🎁 Cada presente só pode ser dado de novo depois de um tempo. Os mais caros valem bem mais!</p><div class="gifts">${GIFTS.map((g) => { const wait = ((L.cd || {})[g.id] || 0) > Date.now(); return `<button class="gift ${wait ? 'wait' : ''}" data-act="gift" data-id="${g.id}" ${wait ? '' : `data-cost="${dp(g.cost)}"`}><span>${g.icon}</span><b>${g.name}</b><small>❤️ +${g.aff}</small>${wait ? `<em class="cdt" data-live="giftcd:${g.id}"></em>` : `<em>${money(dp(g.cost))}</em><i class="cdinfo">espera ${g.cd >= 60 ? g.cd / 60 + 'h' : g.cd + ' min'}</i>`}</button>`; }).join('')}</div>`}
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
      ${trip ? '' : `<div class="col">${costBtn('trip', { id: t.id }, dp(t.cost))}${L ? `<button class="btn pink sm" data-act="trip" data-id="${t.id}" data-partner="1" data-cost="${dp(t.cost * 2)}">+ ${esc(L.partner.name)} ❤️</button>` : ''}</div>`}</div>`;
  }).join('')}`;
}

// ---------- HOLDING / EMPRESAS DA FAMÍLIA ----------
function holdingSection() {
  const s = C.s, mk = C.mk;
  const c = s.corp;
  let mine;
  if (!c) {
    const ok = G.canFound(s);
    const nbiz = Object.values(s.biz).filter((x) => x > 0).length;
    mine = `<div class="corpcard empty"><div class="cbig">🏛️</div><h3>Holding dos seus Negócios</h3><p class="muted small">Junta suas barracas, lojas e fábricas numa empresa só e vende ações dela na bolsa.</p>
      <div class="rqs center"><span class="rq ${s.peakNW >= G.CORP.minNW ? 'ok' : ''}">${s.peakNW >= G.CORP.minNW ? '✓' : '○'} Patrimônio ${money(G.CORP.minNW)}</span><span class="rq ${nbiz >= G.CORP.minBiz ? 'ok' : ''}">${nbiz >= G.CORP.minBiz ? '✓' : '○'} ${G.CORP.minBiz} tipos de negócio (${nbiz})</span></div>
      ${ok ? `<input id="cname" maxlength="22" placeholder="Nome da empresa (ex: ${esc(s.name)} Holding)"><input id="cticker" maxlength="4" placeholder="Código de 4 letras (ex: ${G.tickerFrom(s.name).slice(0, 4)})" autocapitalize="characters">
      <button class="btn gold full" data-act="found" data-cost="${G.CORP.cost}"><em>Fundar holding</em><span>${money(G.CORP.cost)}</span></button>` : '<p class="muted small">Continue crescendo para fundar sua holding!</p>'}</div>`;
  } else {
    const price = G.corpPrice(s, mk);
    const val = price * G.CORP.shares;
    const left = G.CORP.maxFloat - c.float;
    mine = `<div class="corpcard"><div class="crow"><span class="clogo">${esc(c.ticker.slice(0, 1))}</span><div class="grow"><b>${esc(c.name)}</b><small>${esc(c.ticker)} · fundada ${ago(c.founded)}</small></div><div class="right"><small>Ação</small><b>${price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b></div></div>
      <div class="cstats"><div><small>Valor de mercado</small><b>${money(val)}</b></div><div><small>Lucro/dia dos negócios</small><b class="up">${money(G.grossBizProfit(s, mk))}</b></div></div>
      <div class="lrow"><span>Você controla</span><b>${Math.round((1 - c.float) * 100)}%</b></div>
      <div class="bar"><i style="width:${(1 - c.float) * 100}%"></i></div>
      <small class="muted">${c.float > 0 ? `${Math.round(c.float * 100)}% das ações estão no mercado: essa fatia do lucro dos negócios vai para os acionistas.` : 'Empresa fechada: 100% do lucro é seu.'}</small>
      ${left > 0.0001 ? `<h4>🔔 Vender ações no mercado (IPO)</h4><div class="quick">${[0.05, 0.1, 0.2, 0.3, 0.49].filter((p) => p <= left + 1e-9).map((p) => `<button class="chipbtn" data-act="ipo" data-p="${p}">${Math.round(p * 100)}% <small>+${money(p * val * 0.98)}</small></button>`).join('')}</div>` : ''}
      ${c.float > 0 ? `<h4>🔁 Recomprar ações</h4><div class="quick">${[0.05, 0.1, 0.2, c.float].filter((p, i, a) => p <= c.float + 1e-9 && a.indexOf(p) === i).map((p) => `<button class="chipbtn" data-act="buyback" data-p="${p}" data-cost="${p * val * 1.02}">${p === c.float ? 'Tudo' : Math.round(p * 100) + '%'} <small>${money(p * val * 1.02)}</small></button>`).join('')}</div>` : ''}
    </div>`;
  }
  return mine;
}
const price2 = (n) => 'R$ ' + (n >= 1000 ? fmt(n) : n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
function openFriendCorp(uid) {
  const p = C.friends[uid]; if (!p || !p.corp) return;
  const h = (C.s.fport || {})[uid];
  const max = Math.floor(G.CORP.shares * p.corp.float);
  ui.fcorp = uid;
  modal(`<h3>🏢 ${esc(p.corp.name)} <small class="muted">${esc(p.corp.ticker)}</small></h3>
    <p class="muted">Empresa de ${esc(p.name)} · lucro dos negócios ${money(p.corp.profit)}/dia</p>
    <div class="pricehead"><b class="bigprice">${price2(p.corp.price)}</b></div>
    <div class="ownbox"><div class="lrow"><span>No mercado</span><b>${fmt(max)} ações (${Math.round(p.corp.float * 100)}%)</b></div>
    <div class="lrow"><span>Você tem</span><b>${fmt(h ? h.q : 0)} ações</b></div>
    <small class="muted">Cada ação rende ${money(p.corp.profit / G.CORP.shares)}/dia em dividendos (0,25% ao dia no preço atual).</small></div>
    <input id="qty" type="number" inputmode="numeric" min="1" value="1000">
    <div class="quick">${[[1000, '1 mil'], [10000, '10 mil'], [100000, '100 mil']].map(([v, n]) => `<button class="chipbtn" data-act="qty" data-v="${v}">${n}</button>`).join('')}<button class="chipbtn" data-act="qty" data-v="${Math.max(0, Math.min(max - (h ? h.q : 0), Math.floor(C.s.cash / (p.corp.price * 1.005))))}">Máx</button>${h ? `<button class="chipbtn" data-act="qty" data-v="${h.q}">Tudo meu</button>` : ''}</div>
    <div class="btns"><button class="btn red" data-act="fctrade" data-side="sell">Vender</button><button class="btn" data-act="fctrade" data-side="buy">Comprar</button></div>`);
}

// ---------- MINHAS EMPRESAS (criadas pelo jogador) ----------
const segLogo = (seg, cls = 'clogo') => `<span class="${cls}" style="background:${seg.color}">${seg.icon}</span>`;
const compLogo = (doc) => { const seg = SEGMENT[doc.seg]; return seg ? segLogo(seg, 'aico clogo2') : `<span class="aico clogo2">${esc((doc.ticker || '?').slice(0, 1))}</span>`; };
function vCompanies() {
  const s = C.s, mk = C.mk;
  const list = s.companies || [];
  const max = G.maxCompanies(s);
  const tot = G.compIncome(s, mk);
  const job = JOBS.find((j) => j.id === s.job);
  const mg = G.mgmtMult(s);
  const lvl = G.level(s);
  return `<div class="comphead"><div><small>Empresas</small><b>${list.length}/${max}</b></div><div><small>Sua parte/dia</small><b class="${tot < 0 ? 'down' : 'up'}">${money(tot)}</b></div><div><small>Gestão</small><b>+${Math.round((mg - 1) * 100)}%</b></div></div>
  <p class="hint small">💼 Como <b>${job.name}</b> você pode ter <b>${max}</b> empresa(s)${mg > 1 ? ` e ganha <b>+${Math.round((mg - 1) * 100)}%</b> de lucro nelas` : ''}. Gerente: 2 empresas (+8%) · Diretor(a): 3 (+15%) · CEO: 5 (+30%) · MBA: +5% · Status 👑 Lenda: +1 empresa.</p>
  ${list.map((c) => {
    const seg = SEGMENT[c.seg], st = G.compStats(s, c, mk);
    return `<div class="compcard" data-act="comp" data-id="${c.id}">${segLogo(seg)}<div class="grow"><b>${esc(c.name)}</b><small>${esc(c.ticker)} · ${seg.name} · ${c.products.length}/5 produtos${c.float > 0 ? ` · ${Math.round(c.float * 100)}% na bolsa` : ''}</small>
      ${c.dev ? `<div class="bar thin"><i data-live-w="cdev:${c.id}"></i></div><small>🧪 ${esc(c.dev.model)}${c.dev.version ? ' (nova versão)' : ''} · <span data-live="cdevt:${c.id}"></span></small>` : !c.products.length ? '<small class="warn">👉 Toque para contratar e criar seu 1º produto</small>' : st.cap < 1 ? '<small class="warn">⚠️ Falta gente na produção</small>' : ''}</div>
      <div class="right"><small>Lucro/dia</small><b class="${st.profit < 0 ? 'down' : 'up'}">${money(st.profit)}</b></div></div>`;
  }).join('')}
  ${lvl < G.COMP.minLevel ? lockBox(G.COMP.minLevel, 'Criar empresas') : list.length < max ? '<button class="btn gold full newcompbtn" data-act="newcomp">＋ Criar nova empresa</button>' : '<p class="muted center small">Você chegou ao limite de empresas do seu cargo.</p>'}
  <h4 class="sec">🏛️ Holding dos negócios</h4>
  ${holdingSection()}`;
}
function newCompModal() {
  const s = C.s;
  modal(`<h3>🏢 Nova empresa</h3><p class="muted">Escolha o segmento. Ele define os produtos, o clima do setor na bolsa (🔥/❄️) e o tamanho do investimento.</p>
    <div class="seggrid">${SEGMENTS.map((g) => `<button class="segcard" data-act="newcomp2" data-seg="${g.id}" data-cost="${G.foundCost(g)}" style="--sc:${g.color}">
      <span class="segi">${g.icon}</span><b>${g.name}</b><small>${SECTOR[g.sector].icon} ${SECTOR[g.sector].name}</small>
      <small>${g.products.map((p) => p.icon).join('')}</small>
      ${g.cat ? `<em class="segbens">💎 Vende em Bens</em>` : ''}<span class="segcost">${money(G.foundCost(g))}</span></button>`).join('')}</div>`);
}
function newCompForm(segId) {
  const g = SEGMENT[segId], s = C.s;
  const sug = `${s.name.split(' ')[0]} ${{ alimentos: 'Foods', moda: 'Fashion', tech: 'Tech', joias: 'Joias', farma: 'Pharma', auto: 'Motors', construtora: 'Construções', fintech: 'Bank', energia: 'Energia', nautica: 'Aero & Náutica' }[segId]}`.slice(0, 22);
  modal(`<div class="segform">${segLogo(g)}<div><h3>${g.name}</h3><small class="muted">${g.products.map((p) => `${p.icon} ${p.name}`).join(' · ')}</small></div></div>
    ${g.cat ? `<p class="hint small">💎 Os produtos dessa empresa aparecem em <b>Bens → Marcas</b> para todos os jogadores comprarem. Cada venda manda ${Math.round(G.COMP.margin * 100)}% do preço para você.</p>` : '<p class="hint small">📦 Os produtos são vendidos para o mercado (não aparecem em Bens).</p>'}
    <input id="cname" maxlength="22" placeholder="Nome da empresa" value="${esc(sug)}">
    <input id="cticker" maxlength="4" placeholder="Código na bolsa (4 letras)" value="${G.tickerFrom(sug).slice(0, 4)}" autocapitalize="characters">
    <button class="btn gold full" data-act="foundcomp" data-seg="${g.id}" data-cost="${G.foundCost(g)}"><em>Criar empresa</em><span>${money(G.foundCost(g))}</span></button>
    <button class="btn ghost full sm" data-act="newcomp">‹ Outro segmento</button>`);
}
function freshLabel(f) { return f > 1.2 ? '🔥 Lançamento' : f >= 1 ? '✅ Em alta' : f > 0.75 ? '📉 Envelhecendo' : '🥀 Velho: lance nova versão'; }
function vCompany(id) {
  const s = C.s, mk = C.mk, c = G.findComp(s, id);
  const seg = SEGMENT[c.seg], st = G.compStats(s, c, mk), price = G.compPrice(s, c, mk);
  const doc = (C.companies || {})[C.compDocId ? C.compDocId(c) : ''];
  const others = C.heldByOthers ? C.heldByOthers(doc) : 0;
  const reg = mk.sectorNow(seg.sector);
  const val = price * G.COMP.shares;
  const next = seg.products.findIndex((_, i) => !c.products.some((p) => p.tier === i));
  const left = G.COMP.maxFloat - c.float;
  const free = c.float - others / G.COMP.shares;
  const staffRows = STAFF.map((r) => {
    const n = c.staff[r.id] || 0, cap = G.staffCap(c, r.id);
    return `<div class="staffrow"><span class="bi">${r.icon}</span><div class="grow"><b>${r.name} <span class="cnt">${n}/${cap}</span></b><small>${r.desc}</small><small>💵 ${money(G.wageOf(c, r.id))}/dia cada</small></div>
      <div class="hirebtns"><button class="chipbtn" data-act="hire" data-id="${c.id}" data-r="${r.id}" data-n="-1" ${n ? '' : 'disabled'}>−</button><button class="chipbtn" data-act="hire" data-id="${c.id}" data-r="${r.id}" data-n="1" ${n < cap ? '' : 'disabled'}>＋</button><button class="chipbtn" data-act="hire" data-id="${c.id}" data-r="${r.id}" data-n="5" ${n < cap ? '' : 'disabled'}>+5</button></div></div>`;
  }).join('');
  const prodRows = seg.products.map((k, i) => {
    const p = c.products.find((x) => x.tier === i);
    const tierInfo = PRODUCT_TIERS[i];
    const sale = seg.cat ? `<small>💎 Em Bens por ${money(k.price)}${k.bonus ? ` · +${Math.round(k.bonus * 100)}% salário` : k.hours ? ` · ${k.hours}h offline` : ''}</small>` : '';
    if (p) {
      const f = G.freshness(p);
      return `<div class="prodrow on"><span class="bi">${k.icon}</span><div class="grow"><b>${esc(p.model)} <small class="muted">${k.name} · v${p.v || 1}</small></b><small>${money(tierInfo.rev * seg.k * f)}/dia de vendas base · ${freshLabel(f)}</small><div class="bar thin fresh"><i style="width:${Math.round((f / 1.5) * 100)}%"></i></div>${sale}</div>
        ${c.dev ? '' : `<button class="btn sm ghost" data-act="newver" data-id="${c.id}" data-t="${i}" data-cost="${G.devCost(seg, i, true)}">🆕 Nova versão<span>${money(G.devCost(seg, i, true))}</span></button>`}</div>`;
    }
    if (c.dev && c.dev.tier === i) return `<div class="prodrow dev"><span class="bi">${k.icon}</span><div class="grow"><b>🧪 ${esc(c.dev.model)} <small class="muted">${k.name}</small></b><div class="bar"><i data-live-w="cdev:${c.id}"></i></div><small>Fica pronto em <span data-live="cdevt:${c.id}"></span></small></div></div>`;
    if (i === next) {
      const why = G.canDev(c, i);
      return `<div class="prodrow next"><span class="bi">${k.icon}</span><div class="grow"><b>${k.name}</b><small>Vende ${money(tierInfo.rev * seg.k)}/dia base · precisa de ${tierInfo.need} na produção${tierInfo.pd ? ` · ${tierInfo.pd} em P&D` : ''} · ⏱️ ${Math.ceil(G.devMins(c, i))} min</small>${sale}${why && !c.dev ? `<small class="warn">${why}</small>` : ''}</div>
        ${c.dev ? '' : `<button class="btn gold sm" data-act="devprod" data-id="${c.id}" data-t="${i}" data-cost="${G.devCost(seg, i)}" ${why ? 'disabled' : ''}>Desenvolver<span>${money(G.devCost(seg, i))}</span></button>`}</div>`;
    }
    return `<div class="prodrow plock"><span class="bi">🔒</span><div class="grow"><b>${k.name}</b><small>Lance o produto anterior primeiro</small></div></div>`;
  }).join('');
  return `<button class="backbtn" data-act="compback">‹ Minhas empresas</button>
  <div class="corpcard">
    <div class="crow">${segLogo(seg)}<div class="grow"><b>${esc(c.name)}</b><small>${esc(c.ticker)} · ${seg.name} · fundada ${ago(c.founded)}</small></div><span class="wxpill ${wxCls(reg)}">${SECTOR[seg.sector].icon} ${WX[reg]} ${WXN[reg]}</span></div>
    <div class="cstats3"><div><small>Receita/dia</small><b class="up">${money(st.rev)}</b></div><div><small>Salários/dia</small><b class="down">${money(st.cost)}</b></div><div><small>Lucro/dia</small><b class="${st.profit < 0 ? 'down' : 'up'}">${money(st.profit)}</b></div></div>
    <div class="cstats3"><div><small>Ação ${esc(c.ticker)}</small><b>${price2(price)}</b></div><div><small>Valor de mercado</small><b>${money(val)}</b></div><div><small>Você controla</small><b>${Math.round((1 - c.float) * 100)}%</b></div></div>
    ${c.products.length && st.cap < 1 ? `<p class="warnbox">⚠️ Falta gente na produção: só dá para fabricar <b>${Math.round(st.cap * 100)}%</b> do que você vende. Contrate mais <b>${st.need - (c.staff.prod || 0)}</b> em 🏭 Produção.</p>` : ''}
    ${!c.products.length ? '<p class="hint small">👉 Comece pelo 1º produto lá embaixo. Depois contrate 🏭 Produção para fabricar e 🤝 Vendas / 📣 Marketing para vender mais.</p>' : ''}
    <small class="muted">Clima do setor ${WXN[reg].toLowerCase()} (${st.clima > 1 ? '+30%' : st.clima < 1 ? '−25%' : 'normal'}) · Gestão ${st.mg > 1 ? '+' + Math.round((st.mg - 1) * 100) + '%' : 'sem bônus'} · Vendas e marketing +${Math.round((st.boost - 1) * 100)}%</small>
  </div>
  <h4 class="sec">📦 Produtos</h4><div class="prodlist">${prodRows}</div>
  <h4 class="sec">👥 Funcionários</h4><div class="stafflist">${staffRows}</div>
  <h4 class="sec">🔔 Ações na bolsa</h4>
  <div class="corpcard">
    <div class="lrow"><span>Você controla</span><b>${Math.round((1 - c.float) * 100)}%</b></div><div class="bar"><i style="width:${(1 - c.float) * 100}%"></i></div>
    <small class="muted">${c.float > 0 ? `${Math.round(c.float * 100)}% estão na bolsa${others ? ` · ${fmt(others)} ações (${(others / G.COMP.shares * 100).toFixed(1)}%) com outros jogadores` : ' · nenhum jogador comprou ainda'}. Essa fatia do lucro vai para os acionistas.` : 'Empresa fechada: 100% do lucro é seu.'}</small>
    ${!c.products.length ? '<p class="muted small">Lance um produto para poder vender ações.</p>' : left > 0.0001 ? `<h4>Vender ações (IPO)</h4><div class="quick">${[0.05, 0.1, 0.2, 0.3, 0.49].filter((x) => x <= left + 1e-9).map((x) => `<button class="chipbtn" data-act="cipo" data-id="${c.id}" data-p="${x}">${Math.round(x * 100)}% <small>+${money(x * val * 0.98)}</small></button>`).join('')}</div>` : ''}
    ${free > 1e-6 ? `<h4>Recomprar ações</h4><div class="quick">${[0.05, 0.1, free].filter((x, i, a) => x <= free + 1e-9 && a.indexOf(x) === i).map((x) => `<button class="chipbtn" data-act="cbuyback" data-id="${c.id}" data-p="${x}" data-cost="${x * val * 1.02}">${x === free ? 'Tudo que está livre' : Math.round(x * 100) + '%'} <small>${money(x * val * 1.02)}</small></button>`).join('')}</div>` : ''}
  </div>
  <div class="center"><button class="btn ghost sm" data-act="closecomp" data-id="${c.id}" ${c.float > 0 ? 'disabled' : ''}>🏚️ Fechar empresa</button>${c.float > 0 ? '<small class="muted"><br>Para fechar, recompre todas as ações da bolsa.</small>' : ''}</div>`;
}
function devModal(id, tier) {
  const c = G.findComp(C.s, id), seg = SEGMENT[c.seg], k = seg.products[tier];
  const SUG = ['Turbo', 'Prime', 'Max', 'Ultra', 'Nova', 'Fênix', 'Titan', 'Aurora', 'Vortex', 'Zen', 'Supreme', 'Neo'];
  const sugs = SUG.sort(() => Math.random() - 0.5).slice(0, 4).map((x) => `${x} ${['X', 'One', 'Pro', 'S', '2027'][Math.floor(Math.random() * 5)]}`);
  modal(`<h3>${k.icon} Novo produto: ${k.name}</h3><p class="muted">Dê um nome ao seu ${k.name.toLowerCase()}. ${seg.cat ? `Ele vai aparecer em 💎 Bens como <b>${esc(c.name)} + nome</b>.` : ''}</p>
    <input id="pmodel" maxlength="18" placeholder="Nome do produto" value="${sugs[0]}">
    <div class="quick">${sugs.map((x) => `<button class="chipbtn" data-act="devsug" data-v="${x}">${x}</button>`).join('')}</div>
    <p class="muted small">⏱️ Fica pronto em ${Math.ceil(G.devMins(c, tier))} min · ${c.staff.pd ? `${c.staff.pd} pesquisador(es) acelerando` : 'contrate 🧪 P&D para acelerar'}</p>
    <button class="btn gold full" data-act="devgo" data-id="${id}" data-t="${tier}" data-cost="${G.devCost(seg, tier)}"><em>Começar desenvolvimento</em><span>${money(G.devCost(seg, tier))}</span></button>`);
}
// ----- Empresas de todos os jogadores na Bolsa -----
function playerCompaniesHTML() {
  if (!C.cloud) return '';
  const s = C.s;
  C.refreshCompanies && C.refreshCompanies();
  const docs = Object.values(C.companies || {}).map((d) => (C.liveDoc ? C.liveDoc(d) : d)).sort((a, b) => b.price * (b.shares || 1e7) - a.price * (a.shares || 1e7));
  const filt = ui.sf || 'all';
  if (filt !== 'all' && filt !== 'jog' && filt !== 'mine') return '';
  const list = filt === 'mine' ? docs.filter((d) => (s.fport || {})[d.id] || d.owner === C.uid) : docs;
  return `<h4 class="sec">🏢 Empresas dos jogadores</h4>
  ${list.length ? list.map((d) => {
    const h = (s.fport || {})[d.id];
    const mine = d.owner === C.uid;
    const seg = SEGMENT[d.seg];
    return `<div class="asset" data-act="pcomp" data-id="${d.id}">${compLogo(d)}<div class="grow"><b>${esc(d.name)}</b><small>${esc(d.ticker)} · ${mine ? '⭐ sua' : 'de ' + esc(d.ownerName || '?')} · ${seg ? seg.name : 'Holding'} · ${Math.round((d.float || 0) * 100)}% na bolsa</small>${h ? `<small class="up">🎒 ${fmt(h.q)} ações · +${money((h.q / G.COMP.shares) * Math.max(0, d.profit))}/dia</small>` : ''}</div>
      <div class="right"><b>${price2(d.price)}</b><small class="${d.profit >= 0 ? 'up' : 'down'}">lucro ${fmt(d.profit)}/dia</small></div></div>`;
  }).join('') : '<p class="emptyf">Nenhum jogador criou empresa ainda. Seja o primeiro em 🏭 Negócios → Minhas Empresas!</p>'}`;
}
function openPlayerCompany(id) {
  const raw = (C.companies || {})[id]; if (!raw) return;
  const d = C.liveDoc ? C.liveDoc(raw) : raw;
  const s = C.s;
  const h = (s.fport || {})[id];
  const others = C.heldByOthers(d);
  const total = Math.floor(G.COMP.shares * (d.float || 0));
  const free = Math.max(0, total - others - (h ? h.q : 0));
  const seg = SEGMENT[d.seg];
  const mine = d.owner === C.uid;
  ui.pcomp = id;
  const divDay = Math.max(0, d.profit) / G.COMP.shares;
  modal(`<h3>${seg ? seg.icon : '🏛️'} ${esc(d.name)} <small class="muted">${esc(d.ticker)}</small></h3>
    <p class="muted">${mine ? 'Sua empresa (valor ao vivo)' : `Empresa de ${esc(d.ownerName || '?')} · atualizado ${d.updated ? ago(d.updated) : '—'}`} · ${seg ? `${seg.name} · ${SECTOR[seg.sector].icon} ${WX[C.mk.sectorNow(seg.sector)]} ${WXN[C.mk.sectorNow(seg.sector)]}` : 'Holding de negócios'} · ${d.nprod || 0} produto(s)</p>
    <div class="pricehead"><b class="bigprice">${price2(d.price)}</b><small class="${d.profit >= 0 ? 'up' : 'down'}">lucro ${money(d.profit)}/dia</small></div>
    ${(d.plist || []).length ? `<div class="plist">${d.plist.map((x) => `<span class="pill">${x.icon} ${esc(x.model)} <small>${esc(x.kind)}${x.v > 1 ? ' v' + x.v : ''}</small></span>`).join('')}</div>${seg && !seg.cat ? '<small class="muted">Esses produtos são vendidos ao mercado (não aparecem em 💎 Bens).</small>' : ''}` : ''}
    <div class="ownbox"><div class="lrow"><span>Na bolsa</span><b>${fmt(total)} ações (${Math.round((d.float || 0) * 100)}%)</b></div>
    <div class="lrow"><span>Com outros jogadores</span><b>${fmt(others)}</b></div>
    <div class="lrow"><span>Disponíveis para comprar</span><b>${fmt(free)}</b></div>
    <div class="lrow"><span>Você tem</span><b>${fmt(h ? h.q : 0)} ações${h ? ` (${(h.q / G.COMP.shares * 100).toFixed(2)}%)` : ''}</b></div>
    <small class="muted">💸 Cada ação rende ${money(divDay, 4)}/dia de dividendos (${d.price > 0.011 ? ((divDay / d.price) * 100).toFixed(2) : '0'}% ao dia no preço atual). O preço sobe e desce com o lucro da empresa.</small></div>
    ${mine ? '<p class="hint small">Essa é sua. Para vender ou recomprar ações dela, vá em 🏭 Negócios → Minhas Empresas.</p>' : `
    <input id="qty" type="number" inputmode="numeric" min="1" value="${Math.min(1000, free) || 1000}">
    <div class="quick">${[[1000, '1 mil'], [10000, '10 mil'], [100000, '100 mil']].map(([v, n]) => `<button class="chipbtn" data-act="qty" data-v="${v}">${n}</button>`).join('')}<button class="chipbtn" data-act="qty" data-v="${Math.max(0, Math.min(free, Math.floor(s.cash / (d.price * 1.005))))}">Máx</button>${h ? `<button class="chipbtn" data-act="qty" data-v="${h.q}">Tudo meu</button>` : ''}</div>
    <div class="btns"><button class="btn red" data-act="pctrade" data-side="sell" ${h ? '' : 'disabled'}>Vender</button><button class="btn" data-act="pctrade" data-side="buy" ${free ? '' : 'disabled'}>Comprar</button></div>`}`);
}
// ----- Bens das marcas dos jogadores -----
function vMarcas() {
  const s = C.s;
  if (!C.cloud) return '<p class="emptyf">Disponível com a conta online.</p>';
  C.refreshCompanies && C.refreshCompanies();
  const docs = Object.values(C.companies || {}).filter((d) => (d.products || []).length);
  const mineOwned = G.pgoods(s);
  return `<p class="hint small">🏷️ Produtos criados pelas empresas dos jogadores. Funcionam como os outros bens (prestígio, bônus de salário, casa) e <b>20% do preço vai para o dono da marca</b>.<br>Só aparecem aqui Montadora, Construtora, Joalheria, Tecnologia e Náutica. Bancos, alimentos, moda, farmácia e energia vendem para o mercado: veja os produtos delas em 📈 Bolsa → 🏢 Jogadores.</p>
  ${docs.length ? docs.map((d) => `<div class="brandhead">${compLogo(d)}<div><b>${esc(d.name)}</b><small>${SEGMENT[d.seg] ? SEGMENT[d.seg].name : ''} · de ${d.owner === C.uid ? 'você' : esc(d.ownerName || '?')}</small></div></div>
    <div class="goods">${d.products.map((p) => { const own = !!(s.pgoods || {})[`${d.id}:${p.tier}`]; return `<div class="gcard ${RAR[Math.min(RAR.length - 1, p.tier * 2)]} ${own ? 'own' : ''}" data-act="pgood" data-id="${d.id}" data-t="${p.tier}">
      ${own ? '<span class="owned">✓</span>' : ''}<span class="rar">${esc(p.kind)}</span><div class="gi">${p.icon}</div><b>${esc(d.name)} ${esc(p.model)}</b><small>${p.bonus ? `+${Math.round(p.bonus * 100)}% salário` : p.hours ? `+${p.hours}h offline` : `✨ ${p.prestige}`}</small>
      <div class="gprice" data-cost="${own ? 0 : dp(p.price)}">${own ? 'É seu!' : money(dp(p.price))}</div></div>`; }).join('')}</div>`).join('')
    : '<p class="emptyf">Nenhuma marca lançou produtos ainda. Crie uma Montadora, Construtora, Joalheria, Tecnologia ou Náutica em 🏭 Negócios → Minhas Empresas!</p>'}
  ${mineOwned.filter((g) => !docs.some((d) => g.comp === d.id)).map((g) => `<div class="asset" data-act="pgoodold" data-id="${g.id}"><span class="aico">${g.icon}</span><div class="grow"><b>${esc(g.name)}</b><small>Marca fora do mercado · é seu</small></div></div>`).join('')}`;
}
function openPlayerGood(id, tier) {
  const s = C.s, d = (C.companies || {})[id];
  const p = d && (d.products || []).find((x) => x.tier === tier);
  if (!p) return;
  const pid = `${id}:${tier}`;
  const own = (s.pgoods || {})[pid];
  const rate = p.cat === 'veiculos' || p.cat === 'ceumar' ? 0.6 : p.cat === 'moradia' ? 0.9 : 0.75;
  modal(`<div class="goodmodal" data-cardable><div class="gi">${p.icon}</div><span class="rar">${esc(p.kind)}</span><h3>${esc(d.name)} ${esc(p.model)}</h3><p class="muted">${compLogo(d)} Marca de ${d.owner === C.uid ? 'você' : esc(d.ownerName || '?')}</p>
    <div class="tags">${p.bonus ? `<span class="pill">💼 +${Math.round(p.bonus * 100)}% salário</span>` : ''}${p.hours ? `<span class="pill">🌙 +${p.hours}h offline</span><span class="pill">🏠 sem aluguel</span>` : ''}<span class="pill">✨ ${p.prestige} prestígio</span></div>
    ${own ? `<p class="muted">Você é dono disso! Se vender, recebe ${money(own.cost * rate)}.</p><button class="btn red full" data-act="sellpgood" data-id="${pid}">Vender</button>`
      : `${payBar()}<button class="btn gold full" data-act="buypgood" data-id="${id}" data-t="${tier}" data-cost="${dp(p.price)}"><em>Comprar</em><span>${money(dp(p.price))}</span></button>${d.owner !== C.uid ? `<small class="muted">🤝 ${money(p.price * G.COMP.margin)} vão para ${esc(d.ownerName || 'o dono')}.</small>` : ''}`}</div>`);
}

// ---------- SEGUROS ----------
function vSeguros() {
  const s = C.s, mk = C.mk;
  const total = G.insMonthly(s, mk);
  return `
  <div class="inshead"><div><small>Mensalidade total</small><b>${money(total)}</b><small>a cada 30 dias do jogo</small></div>
    <div><small>Próxima cobrança</small><b data-live="insnext"></b></div><div><small>Já economizou</small><b class="up">${money(s.stats.insSaved || 0)}</b></div></div>
  <p class="hint small">🛡️ O seguro paga parte (Básico: 50%) ou tudo (Completo: 100%) dos imprevistos. O Completo também cobre situações extras, como roubo do carro. A primeira mensalidade é cobrada na contratação.</p>
  ${G.INSURANCES.map((x) => {
    const avail = G.insAvailable(s, x.id);
    const cur = G.insPlan(s, x.id);
    const plans = [[null, 'Nenhum', 0, 'Sem proteção'], ['basico', 'Básico', G.insPremium(s, mk, x.id, 'basico'), x.basic], ['completo', 'Completo', G.insPremium(s, mk, x.id, 'completo'), x.full]];
    return `<div class="inscard ${cur ? 'on' : ''} ${avail ? '' : 'dim'}"><div class="crow"><span class="bi">${x.icon}</span><div class="grow"><b>${x.name}</b><small>${cur ? `✅ Plano ${cur === 'completo' ? 'Completo' : 'Básico'} ativo` : avail ? 'Sem seguro' : `🔒 Precisa ter ${x.need}`}</small></div></div>
      ${avail ? `<div class="plans">${plans.map(([id, n, pr, d]) => `<button class="plan ${(cur || null) === id ? 'sel' : ''}" data-act="insplan" data-id="${x.id}" data-p="${id || ''}"><b>${n}</b>${id ? `<em>${money(pr)}/mês</em>` : '<em>R$ 0</em>'}<small>${d}</small></button>`).join('')}</div>` : ''}</div>`;
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
    game = `<div class="scratch" id="scratch"><div class="prize" id="prize">${ui.lastScratch === undefined ? '🎟️' : ui.lastScratch ? '🎉 ' + ui.lastScratch + 'x' : '😢 Nada'}</div><div class="cover ${ui.lastScratch === undefined ? '' : 'revealed'}" id="cover">RASPE AQUI</div></div>
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
      <div><small>Viagens</small><b>🛂 ${p.trips || 0}</b></div><div><small>Status</small><b>${G.STATUS[G.statusIdx(p.prestige || 0)].icon} ${G.STATUS[G.statusIdx(p.prestige || 0)].name}</b></div>
      <div><small>Troféus</small><b>🎖️ ${p.ach}</b></div><div><small>Veículo</small><b>${p.veh || '🚶'}</b></div>
      <div><small>Empresas controladas</small><b>👑 ${p.ctrl || 0}</b></div><div><small>Vitórias de temporada</small><b>🏆 ${p.titles || 0}</b></div>
      <div><small>Legado</small><b>⭐ ${p.legacy || 0} <small>(+${G.legacyPct(p.legacy || 0)}%)</small></b></div><div><small>${p.lastYr ? `No Ano ${p.lastYr} cresceu` : 'Ano anterior'}</small><b class="${(p.lastGrow || 0) >= 0 ? 'up' : 'down'}">${p.lastYr ? (p.lastPct !== undefined ? pctTxt(p.lastPct) : `${p.lastGrow >= 0 ? '+' : ''}${money(p.lastGrow)}`) : '—'}</b></div>
    </div>
    ${(p.excl || []).filter((id) => EXCL[id]).length ? `<div class="exclshow"><b>💎 Exclusivos</b>${p.excl.filter((id) => EXCL[id]).map((id) => `<span class="pill gold">${EXCL[id].icon} ${esc(EXCL[id].name)}</span>`).join('')}</div>` : ''}
    <small class="muted">${Date.now() - p.updated < 11 * 60_000 ? '🟢 jogando agora' : '⚪ visto ' + ago(p.updated)}</small>
    <button class="btn full pixbtn" data-act="pix" data-id="${uid}">💸 Enviar Pix para ${esc(p.name)}</button>
    ${G.hasPhone(C.s) && C.uid ? `<button class="btn full ghost" data-act="phonechat" data-id="${uid}">💬 Mandar mensagem</button>` : ''}</div>`);
}

function vInicio() {
  const s = C.s;
  const next = CARDS[s.cardMax + 1];
  const course = s.course ? COURSES.find((x) => x.id === s.course.id) : null;
  const q = quest();
  return `
  ${scene()}
  <div class="calbar" data-act="season"><span class="calic">📅</span><div class="grow"><b>Ano <span data-live="year"></span></b> <small>· dia <span data-live="yday"></span>/365</small><div class="bar thin gold"><i data-live-w="year"></i></div></div><div class="right"><small>Vira o ano em</small><b data-live="yearleft"></b></div></div>
  ${buffsLine()}
  <div class="stats3" data-act="flow">
    <div><small>Ganha por dia</small><b class="up" data-live="inc"></b></div>
    <div><small>Gasta por dia</small><b class="down" data-live="exp"></b></div>
    <div class="more">›</div>
  </div>
  ${exclusiveCards()}
  ${riskCard()}
  ${invitesCard()}
  ${inboxCard()}
  ${eventCard()}
  ${q ? `<div class="quest"><span class="qi">⭐</span><div><small>MISSÃO</small><p>${q}</p></div></div>` : ''}
  ${course ? `<div class="box studying"><span class="bi">${course.icon}</span><div class="grow"><b>${course.name}</b><div class="bar"><i data-live-w="course"></i></div></div><span class="timer" data-live="coursetime"></span></div>` : ''}
  ${next ? `<div class="box goal" data-act="tab" data-tab="perfil" data-sub="cartoes"><div class="mini2 ${next.cls}"></div><div class="grow"><small>Próximo cartão</small><b>${next.name}</b><div class="bar gold"><i data-live-w="nextcard"></i></div></div><span class="goalv">${money(next.min)}</span></div>` : ''}
  <div class="box newsbox" data-act="news">
    <div class="nhead"><b>📺 Jornal do Mercado</b><span class="lnk">ver tudo ›</span></div>
    <div class="news" data-live-html="news3"></div>
  </div>`;
}
// 💎 Item exclusivo do momento (destaque dourado no Início)
function exclusiveCards() {
  const s = C.s;
  return G.activeExclusives().map((x) => {
    const own = !!(s.excl || {})[x.id];
    return `<div class="exclcard ${own ? 'own' : ''}"><div class="exclrib">✨ EXCLUSIVO · NUNCA MAIS VOLTA ✨</div>
      <div class="exclbody"><div class="exclicon"><span>${x.icon}</span><i>${x.fx || '✨'}</i></div>
      <div class="grow"><small>${esc(x.tag)}</small><b>${esc(x.name)}</b><em>${esc(x.sub)}</em>
        <div class="exclperks"><span>💰 ${esc(x.desc)}</span><span>✨ +${fmt(x.prestige)} prestígio</span><span>⭐ +${fmt(x.xp)} XP</span></div></div></div>
      <div class="exclfoot"><div><small>Acaba em</small><b data-live="exclt:${x.id}"></b></div>
        ${own ? `<button class="btn ${s.look && s.look.hand === x.id ? 'ghost' : ''}" data-act="hand" data-id="${x.id}">${s.look && s.look.hand === x.id ? '🎒 Guardar' : `${x.icon} Segurar na mão`}</button>` : G.exclEligible(s, x) ? `<button class="btn gold" data-act="buyexcl" data-id="${x.id}" data-cost="${x.cost}"><em>Comprar</em><span>${money(x.cost)}</span></button>` : `<button class="btn ghost exlock" data-act="season"><em>🔒 Só para quem renasceu</em><span>${money(x.cost)}</span></button>`}</div>
      ${x.needRebirth && !own ? `<div class="exclcond">🔁 <b>Condição:</b> ter <b>renascido nesta temporada</b>. ${G.exclEligible(s, x) ? '✅ Você cumpre!' : 'Toque para ver o renascimento.'}</div>` : ''}</div>`;
  }).join('');
}
function riskCard() {
  const s = C.s;
  if (G.isBankrupt(s)) return `<div class="riskcard falido"><b>💀 Falido(a)</b><p>Renda −30% e cartão bloqueado por mais <b data-live="falido"></b>. Pague com dinheiro e reconstrua com cuidado!</p></div>`;
  if (s.insolvent) return `<div class="riskcard"><b>🚨 Risco de falência!</b><p>Suas dívidas (<b>${money(s.debt + G.ccOwed(s))}</b>) passaram do valor de tudo que você tem. Se não melhorar em <b data-live="insolv"></b>, o banco leiloa seus bens pela metade do preço.</p><small>💡 Venda bens, demita funcionários de empresas no prejuízo ou pague dívidas em Investir → Cartão.</small></div>`;
  return '';
}
function invitesCard() {
  const list = C.invites || [];
  if (!list.length) return '';
  return `<div class="invites"><b>👥 Convites de amizade</b>${list.map((i) => `<div class="invrow"><span class="fav">${i.fromLook ? avatarSVG(i.fromLook, { size: 70 }) : '👤'}</span><div class="grow"><b>${esc(i.fromName)}</b><small>${esc(i.fromTag || '')} quer ser seu amigo</small></div><button class="btn sm" data-act="invok" data-id="${i.id}">Aceitar</button><button class="btn ghost sm" data-act="invno" data-id="${i.id}">Recusar</button></div>`).join('')}</div>`;
}
function sentCard() {
  const sent = Object.entries(C.s.sent || {});
  if (!sent.length) return '';
  return `<div class="sentinv"><small>📨 Aguardando resposta:</small> ${sent.map(([, x]) => `<span class="pill">${esc(x.tag)}</span>`).join(' ')}</div>`;
}
function inboxCard() {
  const list = C.s.inbox || [];
  if (!list.length) return '';
  return `<div class="inbox"><div class="ibhead"><b>📬 Novidades</b><span class="ibn">${list.length}</span></div>
    ${list.slice(0, 6).map((n) => `<div class="ibitem"><span>${n.icon}</span><p>${n.text}<small>${ago(n.t)}</small></p></div>`).join('')}
    ${list.length > 6 ? `<small class="muted">+ ${list.length - 6} mais antigas</small>` : ''}
    <button class="btn full sm" data-act="inboxok">Entendi 👍</button></div>`;
}
function eventCard() {
  const e = C.s.event;
  if (!e) return '';
  return `<div class="event"><div class="evhead"><span class="evi">${e.icon}</span><div class="grow"><small>${e.gain ? 'BOA NOTÍCIA' : e.pay ? 'IMPREVISTO' : 'OPORTUNIDADE'}</small><b>${e.title}</b></div><span class="timer sm" data-live="evtime"></span></div>
    <p>${e.text}</p>${e.cost || e.pay ? `<p class="evcost">${e.pay && !e.no ? 'Despesa obrigatória' : 'Custa'}: <b>${money(e.cost || e.pay)}</b>${e.payOrig || e.costOrig ? ` <s>${money(e.payOrig || e.costOrig)}</s>` : ''}</p>` : (e.payOrig || e.costOrig) ? '<p class="evcost">Custo para você: <b class="up">R$ 0</b></p>' : ''}${e.gain ? `<p class="evgain">Você recebe <b>${money(e.gain)}</b> 🎉</p>` : ''}${e.covered ? `<p class="evins">🛡️ Seu ${esc(e.insName)} ${e.saved ? `cobriu <b>${money(e.saved)}</b>` : 'te protegeu'}!</p>` : e.noIns ? `<p class="evnoins">💡 Um ${esc(e.noIns)} teria ajudado aqui. Veja em Vida → Seguros.</p>` : ''}
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
  if (G.STARTER_JOBS.some((j) => j.id === s.job) && s.edu.includes('medio')) return 'Você já pode ser <b>Atendente</b>! Vá em 👤 Vida → Carreira.';
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
    ['💼 Salário', ib.sal - ib.salVeh - ib.salLend], ['🚗 Bônus do veículo', ib.salVeh], ['🌟 Bônus da skin lendária', ib.salLend], ['🏭 Negócios', ib.biz], ['🏢 Suas empresas', ib.comp], ['🔑 Aluguéis', ib.rent], ['💸 Dividendos', ib.divs], ['🏦 Juros', ib.juros],
    ['🏠 Aluguel da moradia', -ib.moradia], ['🔧 Manutenção', -ib.manut], ['💳 Juros da dívida', -ib.loan],
    [`🦁 Imposto de Renda (${(G.irRate(ib.sal + ib.biz + ib.rent + Math.max(0, ib.comp)) * 100).toFixed(1)}%)`, -ib.ir], ['🚗 IPVA/IPTU (2% por temporada)', -ib.tBens], ['💎 Imposto sobre fortuna', -ib.tFort],
  ].filter((r) => Math.abs(r[1]) > 0.0001);
  return rows.map(([n, v]) => `<div class="fr"><span>${n}</span><b class="${v < 0 ? 'down' : 'up'}">${v < 0 ? '-' : '+'}${money(Math.abs(v))}</b></div>`).join('') +
    `<div class="fr total"><span>Sobra por dia</span><b class="${ib.net < 0 ? 'down' : 'up'}">${money(ib.net)}</b></div>` +
    (G.lifeMult(C.s) > 1 ? `<div class="fr"><span>😊 Felicidade e descanso</span><b>+${Math.round((G.lifeMult(C.s) - 1) * 100)}%</b></div>` : '') +
    `<div class="fr"><span>⭐ Bônus de nível</span><b>+${Math.round(LEVEL_BONUS * 100 * (G.level(C.s) - 1))}%</b></div>` +
    (G.isBankrupt(C.s) ? '<div class="fr"><span>💀 Falido(a)</span><b class="down">−30%</b></div>' : '') +
    (C.s.wear ? `<div class="fr"><span>⏳ Desgaste do império (${C.s.wear} temporada${C.s.wear > 1 ? 's' : ''} sem renascer)</span><b class="down">−${C.s.wear * 10}%</b></div>` : '') +
    `<p class="muted small">🦁 IR progressivo: 0% até R$ 2 mil/dia, depois 7,5% · 15% · 22,5% · 27,5% (acima de R$ 2 mi/dia). Venda de ações com lucro e IPO pagam 15%. Patrimônio acima de R$ 1 bi paga 1% por temporada e bens 2% por temporada, mas esses dois juntos nunca passam de 25% da sua renda. Total já pago: <b>${money(C.s.stats.taxPaid || 0)}</b>.</p>`;
}
function newsHTML(n) {
  const list = C.mk.news(n);
  if (!list.length) return '<p class="muted">Nada de novo por enquanto…</p>';
  return list.map((x) => `<div class="nitem ${x.dir > 0 ? 'pos' : 'neg'} ${x.kind}"><span class="ni">${x.icon}</span><div><p>${x.text}</p><small>${ago(tickToMs(x.t))}${x.kind === 'forecast' ? ' · palpite' : ''}</small></div></div>`).join('');
}

// ---------- CARREIRA ----------
const CNAME = (id) => (COURSES.find((c) => c.id === id) || { name: id }).name;
function courseNeeds(c) { return [...G.courseReqs(c).map(CNAME), ...(c.reqAny ? [c.reqAny.map(CNAME).join(' ou ')] : [])]; }
// Cursos que faltam (com pré-requisitos, em ordem) para ter a formação pedida
function pathFor(s, ids, out = []) {
  for (const id of ids) {
    if (s.edu.includes(id) || out.includes(id)) continue;
    const c = COURSES.find((x) => x.id === id);
    if (!c) continue;
    pathFor(s, G.courseReqs(c), out);
    if (c.reqAny && !c.reqAny.some((r) => s.edu.includes(r) || out.includes(r))) pathFor(s, [c.reqAny[0]], out);
    if (!out.includes(id)) out.push(id);
  }
  return out;
}
function courseRow(c) {
  const s = C.s;
  const done = s.edu.includes(c.id);
  const running = s.course && s.course.id === c.id;
  const reqOk = G.courseReqOk(s, c);
  let right;
  if (done) right = '<span class="pill ok">✓</span>';
  else if (running) right = '<span class="timer" data-live="coursetime"></span>';
  else if (!reqOk || s.course) right = '<span class="pill">🔒</span>';
  else right = costBtn('course', { id: c.id }, c.cost);
  const unlocks = JOBS.filter((j) => j.edu.includes(c.id)).length;
  return `<div class="item ${done ? 'done' : ''} ${!reqOk && !done ? 'dim' : ''}"><span class="bi">${c.icon}</span><div class="grow"><b>${c.name}</b><small>⏱️ ${c.mins} min${unlocks ? ` · libera ${unlocks} profiss${unlocks > 1 ? 'ões' : 'ão'}` : ''}${!reqOk && !done ? ` · precisa de ${courseNeeds(c).join(', ')}` : ''}</small>${running ? '<div class="bar"><i data-live-w="course"></i></div>' : ''}</div>${right}</div>`;
}
function vCarreira() {
  const s = C.s;
  const job = JOBS.find((j) => j.id === s.job);
  const lvl = G.level(s);
  const t = ui.car || 'profissoes';
  let body = '';
  if (t === 'profissoes') {
    const area = ui.area || job.area || 'basico';
    body = `<div class="subtabs vistabs">${JOB_AREAS.map((a) => `<button class="${area === a.id ? 'on' : ''}" data-act="pt" data-g="area" data-t="${a.id}"><span>${a.icon}</span>${a.name}</button>`).join('')}</div>
    ${JOBS.filter((j) => j.area === area).sort((a, b) => a.salary - b.salary).map((j) => {
      const cur = s.job === j.id;
      const ok = G.canTakeJob(s, j);
      const chips = [...j.edu.map((e) => `<span class="rq ${s.edu.includes(e) ? 'ok' : ''}">${s.edu.includes(e) ? '✓' : '○'} ${CNAME(e)}</span>`), j.lvl > 1 ? `<span class="rq ${lvl >= j.lvl ? 'ok' : ''}">${lvl >= j.lvl ? '✓' : '○'} Nível ${j.lvl}</span>` : ''].join('');
      return `<div class="item job ${cur ? 'cur' : ''}"><span class="bi">${j.icon}</span><div class="grow"><b>${j.name}</b><span class="pill money">💵 ${money(j.salary)}/dia <small>base</small></span>${chips ? `<div class="rqs">${chips}</div>` : ''}</div>
        ${cur ? '<span class="pill ok">Atual</span>' : ok ? `<button class="btn sm" data-act="job" data-id="${j.id}">Trabalhar</button>` : `<button class="btn ghost sm" data-act="jobpath" data-id="${j.id}">Ver caminho</button>`}</div>`;
    }).join('')}`;
  } else {
    body = COURSE_GROUPS.map((g) => `<h4 class="sec">${g.icon} ${g.name}</h4>${COURSES.filter((c) => c.grp === g.id).map(courseRow).join('')}`).join('');
  }
  return `
  <div class="hero job"><span class="hi">${job.icon}</span><div><small>Sua profissão</small><h3>${job.name}</h3><span class="pill money"><b data-live="salary"></b>/dia</span></div></div>
  ${salaryBreakdown()}
  ${s.course ? `<div class="box studying"><span class="bi">${COURSES.find((c) => c.id === s.course.id).icon}</span><div class="grow"><b>Estudando: ${CNAME(s.course.id)}</b><div class="bar"><i data-live-w="course"></i></div></div><span class="timer" data-live="coursetime"></span></div>` : ''}
  ${pillTabs('car', [['profissoes', '💼', 'Profissões'], ['estudos', '📚', 'Estudos']], t)}
  ${body}`;
}
function salaryBreakdown() {
  const s = C.s;
  const job = JOBS.find((j) => j.id === s.job);
  const vb = G.vehicleBonus(s);
  const veh = [...GOODS.veiculos, ...GOODS.ceumar].filter((g) => s.goods[g.id] && g.bonus === vb)[0];
  const lv = LEVEL_BONUS * (G.level(s) - 1);
  const life = G.lifeMult(s) - 1;
  const row = (icon, name, v, cls = 'up') => `<div class="fr"><span>${icon} ${name}</span><b class="${cls}">${v}</b></div>`;
  return `<details class="box col salbox"><summary><b>🧾 Como seu salário é calculado</b></summary>
    ${row('💵', `Salário-base de ${job.name}`, money(job.salary), '')}
    ${row('🚗', veh ? `Veículo: ${veh.name}` : 'Veículo (nenhum)', `+${Math.round(vb * 100)}%`, vb ? 'up' : 'muted')}
    ${G.legendBonus(s) ? row('🌟', `Skin lendária: ${LEGEND[s.look.lend].name}`, `+${Math.round(G.legendBonus(s) * 100)}%`) : ''}
    ${row('⭐', `Nível ${G.level(s)}`, `+${Math.round(lv * 100)}%`, lv ? 'up' : 'muted')}
    ${life ? row('😊', 'Felicidade e descanso', `+${Math.round(life * 100)}%`) : ''}
    <div class="fr total"><span>Você recebe</span><b class="up" data-live="salary"></b></div>
    <small class="muted">Os bônus se multiplicam. Do veículo vale só o melhor que você tiver. Na lista de profissões aparece o salário-base.</small></details>`;
}
function openJobPath(id) {
  const s = C.s;
  const j = JOBS.find((x) => x.id === id);
  ui.lastPath = id;
  const steps = pathFor(s, j.edu);
  const lvl = G.level(s);
  const total = steps.reduce((t, cid) => t + COURSES.find((c) => c.id === cid).cost, 0);
  const mins = steps.reduce((t, cid) => t + COURSES.find((c) => c.id === cid).mins, 0);
  modal(`<div id="jobpath"><h3>${j.icon} Quero ser ${j.name}</h3>
    <p class="muted">Salário: <b class="up">${money(j.salary)}/dia</b>${steps.length ? ` · faltam ${steps.length} curso(s): ${money(total)} e ${mins} min de estudo` : ''}</p>
    <div class="steps">${steps.map((cid, i) => { const c = COURSES.find((x) => x.id === cid); return `<div class="step"><span class="sn">${i + 1}</span>${courseRow(c)}</div>`; }).join('')}
    ${j.lvl > 1 ? `<div class="step"><span class="sn">⭐</span><div class="item ${lvl >= j.lvl ? 'done' : ''}"><span class="bi">⭐</span><div class="grow"><b>Nível ${j.lvl}</b><small>Você está no nível ${lvl}</small></div>${lvl >= j.lvl ? '<span class="pill ok">✓</span>' : '<span class="pill">🔒</span>'}</div></div>` : ''}</div>
    ${G.canTakeJob(s, j) ? `<button class="btn full" data-act="job" data-id="${j.id}">Começar a trabalhar como ${j.name}</button>` : '<p class="muted small">Só um curso por vez. Complete os passos em ordem!</p>'}</div>`);
}

// ---------- NEGÓCIOS ----------
function vEmpresas() {
  const sub = ui.sub.empresas || 'negocios';
  const head = subtabs([['negocios', '🏪', 'Negócios'], ['minhas', '🏢', 'Minhas Empresas']]);
  if (sub === 'minhas') return title('🏢', 'Minhas Empresas', 'companies') + head + (ui.comp && G.findComp(C.s, ui.comp) ? vCompany(ui.comp) : vCompanies());
  return vNegocios(head);
}
function vNegocios(head) {
  const s = C.s;
  const mk = C.mk;
  const total = BUSINESSES.reduce((t, b) => t + G.bizProfit(s, b, mk), 0) * (1 - G.corpFloat(s));
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
  return `${title('🏭', 'Negócios', 'empresas')}${head}
  ${G.corpFloat(s) > 0 ? `<p class="hint small">🏢 ${Math.round(G.corpFloat(s) * 100)}% dos lucros vão para os acionistas da ${esc(s.corp.name)}.</p>` : ''}
  <div class="bizhead"><div><small>Lucro total</small><b class="up">${money(total)}<small>/dia</small></b></div>
    <div class="seg">${[1, 10, 'max'].map((n) => `<button class="${ui.bizN === n ? 'on' : ''}" data-act="bizn" data-n="${n}">${n === 'max' ? 'MÁX' : 'x' + n}</button>`).join('')}</div></div>
  ${cards}`;
}

// ---------- INVESTIR ----------
function vInvestir() {
  const s = C.s;
  const sub = ui.sub.investir;
  const head = subtabs([['bolsa', '📈', 'Bolsa'], ['cripto', '🪙', 'Cripto'], ['renda', '🐷', 'Poupar'], ['imoveis', '🔑', 'Imóveis'], ['credito', '💳', 'Cartão']]);
  const L = G.level(s);
  let body = '';
  if (sub === 'bolsa') body = L < UNLOCKS.bolsa ? lockBox(UNLOCKS.bolsa, 'Bolsa de Valores') : vBolsa(STOCKS, true);
  if (sub === 'cripto') body = L < UNLOCKS.cripto ? lockBox(UNLOCKS.cripto, 'Criptomoedas') : vBolsa(CRYPTOS, false);
  if (sub === 'renda') body = vRenda();
  if (sub === 'imoveis') body = L < UNLOCKS.imoveis ? lockBox(UNLOCKS.imoveis, 'Imóveis') : vImoveis();
  if (sub === 'credito') body = vCredito();
  if (sub === 'holding') { ui.sub.investir = 'bolsa'; body = vBolsa(STOCKS, true); }
  const helpKey = { holding: 'companies', bolsa: 'bolsa', cripto: 'cripto', renda: 'renda', imoveis: 'imoveis', credito: 'credito' }[sub];
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
  <div class="wallet3"><div><small>💼 Investido</small><b data-live="inv:${k}"></b></div><div><small>📊 Vale agora</small><b data-live="pv:${k}"></b></div><div><small>Resultado</small><b data-live="pl:${k}"></b></div></div>
  <div class="wxhead"><b>Clima dos setores</b><small>muda em <span data-live="nextblock"></span></small></div>
  <div class="wxrow" data-live-html="${stocks ? 'sectors' : 'cryptosector'}"></div>
  ${assetFilters(list, stocks)}
  ${stocks ? playerCompaniesHTML() : ''}
  ${stocks && C.cloud && (ui.sf || 'all') !== 'jog' ? '<h4 class="sec">📈 Empresas do mercado</h4>' : ''}
  <div class="assets">${filterAssets(list, stocks).map((a) => `
    <div class="asset" data-act="asset" data-sym="${a.sym}">
      <span class="aico s-${a.sector}">${SECTOR[a.sector].icon}</span>
      <div class="grow"><b>${a.name}${a.div ? ' <em class="divtag">💸</em>' : ''}</b><small class="held" data-live="held:${a.sym}"></small><small class="plline" data-live="plrow:${a.sym}"></small>${a.shares && G.ownPct(C.s, a.sym) > 0 ? `<div class="ownmini"><i style="width:${Math.max(3, Math.min(100, G.ownPct(C.s, a.sym) / 0.51 * 100))}%"></i></div>` : ''}</div>
      <svg class="spark" data-spark="${a.sym}" viewBox="0 0 64 28" preserveAspectRatio="none"></svg>
      <div class="right"><b data-live="price:${a.sym}"></b><span class="chg" data-live="chg:${a.sym}"></span></div>
    </div>`).join('') || (stocks && ui.sf === 'jog' ? '' : '<p class="emptyf">Nenhum ativo aqui ainda 🙃</p>')}</div>
  <div class="box newsbox" data-act="news"><div class="nhead"><b>📺 Jornal do Mercado</b><span class="lnk">ver tudo ›</span></div><div class="news" data-live-html="news3"></div></div>`;
}
function assetFilters(list, stocks) {
  const key = stocks ? 'sf' : 'cf';
  const cur = ui[key] || 'all';
  const secs = [...new Set(list.map((a) => a.sector))];
  const opts = [['all', '📋', 'Todas'], ['mine', '🎒', 'Minhas'], ...(stocks && C.cloud ? [['jog', '🏢', 'Jogadores']] : []), ...(stocks ? secs.map((id) => [id, SECTOR[id].icon, SECTOR[id].name]) : [])];
  return `<div class="subtabs vistabs filt">${opts.map(([id, ic, n]) => `<button class="${cur === id ? 'on' : ''}" data-act="pt" data-g="${key}" data-t="${id}"><span>${ic}</span>${n}</button>`).join('')}</div>`;
}
function filterAssets(list, stocks) {
  const f = ui[stocks ? 'sf' : 'cf'] || 'all';
  if (f === 'jog') return [];
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
    <div class="posbox" data-live-html="pos:${sym}"></div>
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
  else if (r.profit >= 0) { toast(`💰 Lucro de ${money(r.profit)}!${r.tax ? ` <small>(🦁 IR ${money(r.tax)})</small>` : ''}`, 'gold'); confetti(); }
  else toast(`📉 Prejuízo de ${money(-r.profit)}`, 'err');
  closeModal(); render();
}

function vRenda() {
  const s = C.s;
  const cdi = C.mk.cdi();
  const now = Date.now();
  const list = (kind) => s[kind].map((x, i) => {
    const ready = now >= x.until;
    const gain = x.amt - (x.principal || x.amt);
    const fin = ready ? x.amt : projFixed(x.amt, G.fixedRate(kind, x), (x.until - now) / 60000);
    return `<div class="lock2">
      <div class="lrow"><b>${money(x.amt)}</b>${ready ? '<span class="pill ok">✓ Liberado</span>' : `<span class="timer sm">🔒 ${dur(x.until - now)}</span>`}</div>
      <small>Aplicou ${money(x.principal || x.amt)} · ${Math.round(G.fixedRate(kind, x) * 100)}% do CDI · <span class="up">já rendeu +${money(gain)}</span></small>
      ${ready ? '' : `<small class="up"><b>No vencimento: ≈ ${money(fin)}</b> (lucro +${money(fin - (x.principal || x.amt))})</small>`}
      ${ready ? `<button class="btn sm full" data-act="redeem" data-kind="${kind}" data-i="${i}">Resgatar ${money(x.amt)}</button>` : `<button class="lnk" data-act="redeemearly" data-kind="${kind}" data-i="${i}">resgatar antes (perde o rendimento)</button>`}
    </div>`;
  }).join('');
  const sum = (k) => s[k].reduce((t, x) => t + x.amt, 0);
  const terms = (k) => G.TERMS[k].map((t) => `<span>${t.mins >= 60 ? t.mins / 60 + 'h' : t.mins + ' min'}: <b>${Math.round(t.rate * 100)}%</b></span>`).join('');
  return `
  <p class="hint small">⏳ No CDB e no Tesouro você escolhe o prazo: quanto mais tempo o dinheiro fica preso, mais rende. Precisa antes? Dá para resgatar antes do prazo, mas você perde o rendimento.</p>
  <div class="vault pig"><span class="vi">🐷</span><div class="grow"><b>Poupança</b><small>70% do CDI (+${(cdi * 70).toFixed(3)}%/dia) · saque livre</small><span class="vv" data-live="poup"></span></div>
    <div class="vbtns"><button class="btn sm" data-act="fixed" data-kind="poup">Guardar</button><button class="btn ghost sm" data-act="fixed" data-kind="saque">Sacar</button></div></div>
  <div class="vault cdb"><span class="vi">📄</span><div class="grow"><b>CDB</b><div class="terms">${terms('cdb')}</div><span class="vv">${money(sum('cdb'))}</span>${list('cdb')}</div>
    <div class="vbtns"><button class="btn sm" data-act="fixed" data-kind="cdb">Aplicar</button></div></div>
  <div class="vault tes"><span class="vi">🏛️</span><div class="grow"><b>Tesouro</b><div class="terms">${terms('tes')}</div><span class="vv">${money(sum('tes'))}</span>${list('tes')}</div>
    <div class="vbtns"><button class="btn sm" data-act="fixed" data-kind="tes">Aplicar</button></div></div>
  <small class="muted center-block">CDI de hoje: ${(cdi * 100).toFixed(3)}% ao dia (muda a cada 6h)</small>`;
}
function readAmount() { return parseFloat(($('#amt') || {}).value) || 0; }
const projFixed = (amt, rate, mins) => amt * Math.pow(1 + C.mk.cdi() * rate, mins);
const durLabel = (m) => (m >= 60 ? m / 60 + (m === 60 ? ' hora' : ' horas') : m + ' min');
// Atualiza a simulação de lucro no modal de aplicação
function updProj() {
  const box = $('#proj'); if (!box) return;
  const v = parseFloat(($('#amt') || {}).value) || 0;
  const kind = box.dataset.kind;
  if (kind === 'poup') {
    box.innerHTML = v > 0 ? `<b>📈 Simulação</b><div class="fr"><span>Em 1 hora</span><b class="up">+${money(projFixed(v, 0.7, 60) - v)}</b></div><div class="fr"><span>Em 4 horas</span><b class="up">+${money(projFixed(v, 0.7, 240) - v)}</b></div><small class="muted">Saque quando quiser. Estimativa com o CDI de agora.</small>` : '<small class="muted">Digite um valor para ver quanto vai render.</small>';
    return;
  }
  const terms = G.TERMS[kind];
  document.querySelectorAll('.tp').forEach((b, i) => { const g = b.querySelector('.tpgain'); if (g) g.textContent = v > 0 ? `lucro +${money(projFixed(v, terms[i].rate, terms[i].mins) - v)}` : ''; });
  const t = terms[(ui.term || {})[kind] ?? 1];
  const fin = projFixed(v, t.rate, t.mins);
  box.innerHTML = v > 0 ? `<b>📈 Simulação</b><div class="fr"><span>Você aplica</span><b>${money(v)}</b></div><div class="fr"><span>Recebe em ${durLabel(t.mins)}</span><b class="up">≈ ${money(fin)}</b></div><div class="fr total"><span>Seu lucro</span><b class="up">+${money(fin - v)} (${pct(fin / v - 1, 2)})</b></div><small class="muted">Estimativa com o CDI de agora (ele muda a cada 6h). Resgatar antes do prazo devolve só o valor aplicado.</small>` : '<small class="muted">Digite um valor para ver quanto vai lucrar.</small>';
}
function amountModal(ttl, desc, base, go, kind, extra = '') {
  modal(`<h3>${ttl}</h3><p class="muted">${desc}</p>${extra}
    <input id="amt" type="number" inputmode="decimal" min="0" placeholder="Valor em R$">
    <div class="quick">${[0.25, 0.5, 1].map((p) => `<button class="chipbtn" data-act="pctamt" data-p="${p}" data-base="${Math.max(0, base)}">${p === 1 ? 'Tudo' : p * 100 + '%'}</button>`).join('')}</div>
    <div class="btns"><button class="btn ghost" data-act="close">Cancelar</button><button class="btn" data-act="${go}" data-kind="${kind}">Confirmar</button></div>`);
}
function openFixed(kind) {
  const s = C.s;
  if (kind === 'saque') return amountModal('🐷 Sacar da poupança', `Saldo: ${money(s.poup)}`, s.poup, 'fixedgo', 'saque');
  const names = { poup: '🐷 Guardar na poupança', cdb: '📄 Aplicar no CDB', tes: '🏛️ Investir no Tesouro' };
  let extra = '';
  if (G.TERMS[kind]) {
    const cdi = C.mk.cdi();
    ui.term = ui.term || {};
    const cur = ui.term[kind] ?? 1;
    extra = `<b class="lbl">Prazo de resgate</b><div class="termpick">${G.TERMS[kind].map((t, i) => `<button class="tp ${i === cur ? 'on' : ''}" data-act="term" data-k="${kind}" data-i="${i}"><b>${t.mins >= 60 ? t.mins / 60 + (t.mins === 60 ? ' hora' : ' horas') : t.mins + ' min'}</b><small>${Math.round(t.rate * 100)}% do CDI</small><small class="up">+${(cdi * t.rate * 100).toFixed(3)}%/dia</small><small class="tpgain"></small></button>`).join('')}</div>`;
  }
  amountModal(names[kind], `Você tem ${money(s.cash)}`, s.cash, 'fixedgo', kind, extra);
  const go = $('#modal-root .btns');
  if (go) { go.insertAdjacentHTML('beforebegin', `<div class="proj" id="proj" data-kind="${kind}"></div>`); updProj(); }
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
  const cc = s.cc || { fatura: 0, parcels: [] };
  const fut = cc.parcels.reduce((t, p) => t + p.amt * p.left, 0);
  const pct = (x) => Math.min(100, (x / c.limit) * 100);
  const locked = G.level(s) < UNLOCKS.credito;
  return `
  <div class="loanbox">
    ${bigCard(s.name, c, s.cardMax)}
    <div class="limit">
      <div class="lrow"><span>Limite disponível</span><b data-live="ccavail"></b></div>
      <div class="bar stack"><i class="f1" style="width:${pct(cc.fatura)}%"></i><i class="f2" style="width:${pct(fut)}%"></i><i class="f3" style="width:${pct(s.debt)}%"></i></div>
      <div class="legend"><span><i class="f1"></i>Fatura ${money(cc.fatura)}</span><span><i class="f2"></i>Parcelas ${money(fut)}</span><span><i class="f3"></i>Dívida ${money(s.debt)}</span></div>
      <small class="muted">Limite total ${money(c.limit)} · cashback de ${Math.round(c.cashback * 100)}% nas compras no cartão</small>
    </div>
    <div class="box col fatura">
      <div class="lrow"><b>🧾 Fatura atual</b><b>${money(cc.fatura + cc.parcels.reduce((t, p) => t + p.amt, 0))}</b></div>
      <small class="muted">Fecha e é paga automaticamente em <b data-live="ccclose"></b>. Se faltar dinheiro, o resto vai para o rotativo (com juros).</small>
      ${cc.parcels.length ? `<div class="parcs">${cc.parcels.map((p) => `<span>${money(p.amt)} · faltam ${p.left}/${p.n}</span>`).join('')}</div>` : ''}
      <div class="btns"><button class="btn sm" data-act="payfatura" data-all="0">Pagar fatura atual<br><small>${money(G.ccCurrent(s))}</small></button><button class="btn ghost sm" data-act="payfatura" data-all="1">Quitar tudo<br><small>${money(G.ccOwed(s))}</small></button></div>
    </div>
    <h4 class="sec">🏦 Empréstimo</h4>
    ${locked ? lockBox(UNLOCKS.credito, 'Empréstimos') : `<div class="limit"><div class="lrow"><span>Dívida (empréstimo + rotativo)</span><b class="down" data-live="debt"></b></div>
    <small class="muted">Juros: <b class="down" data-live="debtint"></b> por dia</small>
    <div class="btns"><button class="btn ghost" data-act="loan" data-kind="repay">Pagar dívida</button><button class="btn" data-act="loan" data-kind="borrow">Pegar emprestado</button></div></div>`}
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
  const list = GOODS[sub] || [];
  const owned = sub === 'marcas' ? G.pgoods(s).length : list.filter((g) => s.goods[g.id]).length;
  const head = title('💎', 'Coleção', 'bens') + subtabs([['veiculos', '🚗', 'Carros'], ['ceumar', '🛥️', 'Céu e Mar'], ['moradia', '🏠', 'Casas'], ['luxo', '💍', 'Luxo'], ['colecao', '🖼️', 'Coleção'], ['marcas', '🏷️', 'Marcas']]) + `
  <div class="wallet" data-act="status"><div><small>✨ Prestígio · ${G.statusOf(s).icon} ${G.statusOf(s).name} ›</small><b>${fmt(G.prestige(s))}</b></div><div class="right"><small>Coleção</small><b>${sub === 'marcas' ? owned : `${owned}/${list.length}`}</b></div></div>`;
  const ex = G.exclOwned(s);
  const exStrip = ex.length ? `<div class="exclshow mine"><b>💎 Seus exclusivos</b>${ex.map((x) => `<span class="pill gold">${x.icon} ${esc(x.name)} · ${esc(x.desc.split(',')[0])}</span>${HAND_ITEMS[x.id] ? `<button class="chipbtn" data-act="hand" data-id="${x.id}">${s.look && s.look.hand === x.id ? '🎒 Guardar' : '✋ Segurar na mão'}</button>` : ''}`).join('')}</div>` : '';
  if (sub === 'marcas') return head + exStrip + payBar() + `<div data-cardable>${vMarcas()}</div>`;
  if (sub === 'veiculos') return head + exStrip + payBar() + `<div data-cardable>${vCarros()}</div>`;
  return head + exStrip + payBar() + `
  <div class="goods" data-cardable>${list.map((g, i) => goodCard(g, RAR[i])).join('')}</div>`;
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
      <div class="gprice" data-cost="${own ? 0 : dp(g.cost)}">${own ? 'É seu!' : money(dp(g.cost))}</div></div>`;
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
  modal(`<div class="goodmodal ${r}" data-cardable><div class="gi">${g.brand ? vIcon(g) : g.icon}</div><span class="rar">${g.tier ? g.tier : RARN[r]}</span><h3>${g.name}</h3>${br ? `<p class="muted">${brandBadge(br)} ${br.name} · ${br.slogan}</p>` : ''}
    <div class="tags">${g.bonus ? `<span class="pill">💼 +${Math.round(g.bonus * 100)}% salário</span>` : ''}${g.hours ? `<span class="pill">🌙 +${g.hours}h offline</span><span class="pill">🏠 sem aluguel</span>` : ''}<span class="pill">✨ ${g.prestige} prestígio</span></div>
    ${own ? `<p class="muted">Você é dono disso! Se vender, recebe ${money(g.cost * rate)}.</p><button class="btn red full" data-act="sellgood" data-id="${id}">Vender</button>`
      : `<p class="muted">${s.payMode === 'card' ? `Pagando com 💳 cartão ${(s.parc || 1) === 1 ? 'à vista' : 'em ' + s.parc + 'x sem juros'} · cashback de ${Math.round(G.card(s).cashback * 100)}%` : 'Pagando com 💵 dinheiro (sem cashback)'}<br><small>Mude a forma de pagamento na barra "Pagar com".</small></p><button class="btn gold full" data-act="buygood" data-id="${id}" data-cost="${dp(g.cost)}"><em>Comprar</em><span>${money(dp(g.cost))}</span>${dp(g.cost) < g.cost ? ` <s class="old">${money(g.cost)}</s>` : ''}</button>`}</div>`);
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
  const fromProfile = (uid, p) => ({ look: p.look, partner: p.partner, n: p.name, w: p.nw, l: p.level, a: p.ach, c: p.card || 0, p: p.prestige, net: p.net, t: p.updated, id: uid, home: p.home, tag: p.tag, online: Date.now() - p.updated < 11 * 60_000 });
  const fr = s.friends.map((uid) => { const p = C.friends[uid]; return p ? fromProfile(uid, p) : { n: 'Carregando…', w: -1, l: 0, a: 0, c: 0, p: 0, id: uid, loading: true }; });
  const global = ui.rk === 'todos' && C.cloud;
  const yearMode = ui.rk === 'ano';
  const cy = G.calendar().year;
  if (yearMode) { me.w = G.seasonPct(s, C.mk); fr.forEach((f) => { const p = C.friends[f.id]; f.w = p && p.yr === cy ? p.pct || 0 : 0; }); }
  if (global && !ui.topList && !ui.topLoading) { ui.topLoading = true; C.topPlayers().then((l) => { ui.topList = l; ui.topAt = Date.now(); }).catch(() => { ui.topList = []; }).finally(() => { ui.topLoading = false; if (ui.tab === 'perfil' && !modalOpen()) keepScroll(render); }); }
  if (global && ui.topAt && Date.now() - ui.topAt > 60_000 && !ui.topLoading) ui.topList = null;
  const all = global ? (ui.topList || []).map((p) => (p.uid === C.uid ? me : { ...fromProfile(p.uid, p), stranger: !s.friends.includes(p.uid) })) : [me, ...fr].sort((a, b) => b.w - a.w);
  if (global && ui.topList && !all.includes(me)) all.push(me);
  if (global) all.sort((a, b) => b.w - a.w);
  // O criador do jogo fica num destaque à parte (fora da disputa)
  const ci = all.findIndex((p) => (p.me ? C.uid : p.id) === G.CREATOR);
  const creator = ci >= 0 ? all.splice(ci, 1)[0] : null;
  const pod = [all[1], all[0], all[2]];
  const medal = ['🥈', '🥇', '🥉'];
  const cls = ['p2', 'p1', 'p3'];
  return `
  <div class="mytag"><div><small>Sua tag de amigo</small><b>${C.cloud ? esc(s.tag || 'gerando…') : 'offline'}</b></div><button class="btn sm" data-act="copytag">Copiar</button></div>
  ${C.cloud ? `<div class="seg2 rkseg">${[['amigos', '👥 Amigos'], ['ano', '📅 Ano'], ['todos', '🌎 Todos']].map(([m, n]) => `<button class="${(ui.rk || 'amigos') === m ? 'on' : ''}" data-act="rkmode" data-m="${m}">${n}</button>`).join('')}</div>` : ''}
  ${global && !ui.topList ? '<p class="muted center">⏳ Carregando o ranking geral…</p>' : ''}
  ${yearMode ? `<p class="hint small" data-act="season">📅 <b>Temporada do Ano ${cy}</b> · vira em <b data-live="yearleft"></b>. 🔁 Quem renasceu disputa por <b>maior patrimônio</b>; 🏛️ quem não renasceu, por <b>maior crescimento em %</b>. Cada categoria tem seu pódio e prêmios. Toque para ver mais.</p>` : ''}
  ${championBanner()}
  ${creator && !creator.loading && !yearMode ? creatorCard(creator, false) : ''}
  ${yearMode ? seasonBoards(cy) : `<div class="podium">${pod.map((p, i) => p && !p.loading ? `<div class="pcol ${cls[i]} ${p.me ? 'me' : ''}"><div class="pav2" ${p.me ? '' : `data-act="friend" data-id="${p.id}"`}>${avatarSVG(p.look, { size: i === 1 ? 110 : 90 })}${p.online || p.me ? '<i class="on"></i>' : ''}</div><b>${esc(p.n)}</b><small>${yearMode ? pctTxt(p.w) : money(p.w)}</small><div class="pbar"><span>${medal[i]}</span></div></div>` : '<div class="pcol empty"><div class="pbar"></div></div>').join('')}</div>
  <div class="ranklist">${all.map((p, i) => `<div class="rank ${p.me ? 'me' : ''}" ${p.me || p.loading || p.stranger ? '' : `data-act="friend" data-id="${p.id}"`}><span class="pos">${i + 1}º</span><span class="rav">${p.loading ? '' : avatarSVG(p.look, { size: 52 })}</span>
      <div class="grow"><b>${p.home || ''} ${esc(p.n)}${p.me ? ' (você)' : ''}${((p.me ? Object.keys(s.excl || {}) : (C.friends[p.id] || {}).excl) || []).map((id) => (EXCL[id] ? ` <span class="exclmini">${EXCL[id].icon}</span>` : '')).join('')}${(p.me ? s.titles : (C.friends[p.id] || {}).titles) ? ` <span class="club">🏆${p.me ? s.titles : C.friends[p.id].titles}</span>` : ''}</b>${p.loading ? '' : `<small>⭐${p.l} · 💳${CARDS[p.c].name} · 🎖️${p.a} · ${G.STATUS[G.statusIdx(p.p || 0)].icon}${fmt(p.p)}${G.STATUS[G.statusIdx(p.p || 0)].club ? ' · <span class="club">👑 Clube</span>' : ''}</small><small class="${p.online || p.me ? 'up' : ''}">${p.me ? '🟢 você' : p.online ? '🟢 jogando agora' : '⚪ visto ' + ago(p.t)} · ${p.net >= 0 ? '+' : ''}${fmt(p.net || 0)}/dia</small>`}</div>
      <div class="right"><b class="${yearMode ? (p.w >= 0 ? 'up' : 'down') : ''}">${p.loading ? '…' : yearMode ? pctTxt(p.w) : money(p.w)}</b>${p.me ? '' : p.stranger ? (p.tag && !(s.sent || {})[p.id] ? `<button class="lnk" data-act="invitetag" data-tag="${esc(p.tag)}">+ convidar</button>` : (s.sent || {})[p.id] ? '<small class="muted">convidado</small>' : '') : global ? '' : `<button class="lnk" data-act="delfriend" data-id="${p.id}">remover</button>`}</div></div>`).join('')}</div>
  ${all.length > 6 ? `<small class="muted center rkcount">${all.length} jogadores · role a lista para ver todos ↕️</small>` : ''}`}
  ${s.friends.length ? '' : '<p class="muted center">Ainda só você aqui! Adicione a família pela tag 👇</p>'}
  ${invitesCard()}${sentCard()}
  ${C.cloud ? '<button class="btn full blue" data-act="friendadd">👥 Adicionar amigo pela tag</button>' : '<p class="muted center">Ranking online disponível quando as contas estiverem ativadas.</p>'}
  ${(s.pixLog || []).length ? `<div class="box col pixlog"><b>💸 Últimos Pix</b>${s.pixLog.slice(0, 6).map((x) => `<div class="fr"><span>${x.dir === 'in' ? '⬇️ de' : '⬆️ para'} ${esc(x.name)} <small class="muted">${ago(x.t)}</small>${x.desc ? `<small class="pixdesc">💬 “${esc(x.desc)}”</small>` : ''}</span><b class="${x.dir === 'in' ? 'up' : 'down'}">${x.dir === 'in' ? '+' : '-'}${money(x.amount)}</b></div>`).join('')}</div>` : ''}
  <p class="muted center small">💸 Toque num amigo para ver a vida dele e enviar Pix. O ranking atualiza ao vivo. O mercado é o mesmo para todos — vence quem decidir melhor! 😎</p>`;
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
  return `${C.uid === G.CREATOR ? creatorTools() : ''}<div class="box col"><b>✏️ Seu nome</b><input id="newname" maxlength="18" value="${esc(s.name)}"><button class="btn full" data-act="rename">Salvar</button></div>
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
    case 'cdevt': { const c = G.findComp(s, arg); return c && c.dev ? '⏳ ' + dur(c.dev.end - Date.now()) : '✅'; }
    case 'year': return G.calendar().year;
    case 'yday': return G.calendar().day;
    case 'yearleft': return dur(G.calendar().next - Date.now());
    case 'sgrow': { const g = G.seasonGrow(s, mk), p = G.seasonPct(s, mk); return { t: `${pctTxt(p)} (${g >= 0 ? '+' : ''}${money(g)})`, c: g >= 0 ? 'up' : 'down' }; }
    case 'falido': return s.bankrupt ? dur(s.bankrupt.until - Date.now()) : '';
    case 'insolv': return s.insolvent ? dur(s.insolvent + G.BANKRUPT.graceDays * DAY_MS - Date.now()) : '';
    case 'exclt': { const x = EXCL[arg]; return x ? dur(x.end - Date.now()) : ''; }
    case 'giftcd': { const t = ((s.love || {}).cd || {})[arg] || 0; return t > Date.now() ? '⏳ ' + dur(t - Date.now()) : '✅ pronto'; }
    case 'ccavail': return money(G.ccAvail(s));
    case 'ccclose': return s.cc ? dur(s.cc.nextClose - Date.now()) : '30:00';
    case 'insnext': return C.s.insNext && Object.keys(C.s.ins || {}).length ? dur(C.s.insNext - Date.now()) : '—';
    case 'coursetime': return s.course ? '⏱️ ' + dur(s.course.end - Date.now()) : '';
    case 'nextblock': return dur(mk.msToNextBlock());
    case 'price': return price(mk.price(arg));
    case 'chg': { const c = mk.change(arg); return { t: (c >= 0 ? '▲ ' : '▼ ') + pct(Math.abs(c)).slice(1) + ' 1h', c: c >= 0 ? 'up' : 'down' }; }
    case 'held': case 'heldfull': {
      const h = s.port[arg];
      if (!h || !(h.q > 0)) return k === 'heldfull' ? 'Você ainda não tem.' : G.isCrypto(arg) || !ASSETS.find((a) => a.sym === arg) ? arg : arg;
      const v = h.q * mk.price(arg);
      const pl = v / h.cost - 1;
      const q = G.isCrypto(arg) ? fmt(h.q, h.q < 10 ? 4 : 2) : fmt(h.q);
      const own = G.ownPct(s, arg); const tier = G.ownTier(own);
      return { t: k === 'heldfull' ? `Você tem ${q} = ${money(v)} (${pct(pl)})` : `${tier ? tier.icon : '🎒'} ${q}${G.isCrypto(arg) ? '' : ' ações'}${own ? ' · ' + fmtOwn(own) + ' da empresa' : ''}`, c: pl >= 0 ? 'up' : 'down' };
    }
    case 'plrow': {
      const h = s.port[arg];
      if (!h || !(h.q > 0)) return '';
      const v = h.q * mk.price(arg), d = v - h.cost, pc = d / h.cost;
      return { t: `${d >= 0 ? '▲ Lucro' : '▼ Prejuízo'} de ${money(Math.abs(d))} (${pct(pc)})`, c: d >= 0 ? 'up' : 'down' };
    }
    case 'inv': return money(portfolioValue(arg === 's' ? STOCKS : CRYPTOS).cost);
    case 'pv': case 'pl': {
      const r = portfolioValue(arg === 's' ? STOCKS : CRYPTOS);
      if (k === 'pv') return money(r.v);
      const d = r.v - r.cost;
      return { t: (d >= 0 ? '+' : '') + money(d) + (r.cost ? ` (${pct(d / r.cost)})` : ''), c: d >= 0 ? 'up' : 'down' };
    }
  }
  return '';
}
function posHTML(sym) {
  const s = C.s, mk = C.mk;
  const h = s.port[sym];
  if (!h || !(h.q > 0)) return '<p class="muted center">Você ainda não tem este ativo.</p>';
  const a = ASSETS.find((x) => x.sym === sym);
  const p = mk.price(sym), avg = h.cost / h.q, v = h.q * p, d = v - h.cost, pc = d / h.cost;
  const t = G.ownTier(G.ownPct(s, sym));
  const div = h.q * p * ((a.div || 0) + (t ? t.extra : 0)) * (t ? t.mult : 1);
  const q = G.isCrypto(sym) ? fmt(h.q, h.q < 10 ? 4 : 2) : fmt(h.q);
  return `<div class="pos ${d >= 0 ? 'win' : 'lose'}"><div class="posres"><small>Seu resultado</small><b>${d >= 0 ? '▲ +' : '▼ -'}${money(Math.abs(d))}</b><span>${pct(pc)}</span></div>
    <div class="posgrid"><div><small>Você tem</small><b>${q}</b></div><div><small>Preço médio pago</small><b>${price(avg)}</b></div><div><small>Investido</small><b>${money(h.cost)}</b></div><div><small>Vale agora</small><b>${money(v)}</b></div>
    ${div ? `<div><small>Dividendos</small><b class="up">+${money(div)}/dia</b></div>` : ''}<div><small>Preço atual</small><b>${price(p)}</b></div></div>
    <small class="muted">${d >= 0 ? 'Se vender agora, você sai no lucro (já descontando a compra).' : 'Se vender agora, você realiza o prejuízo. Dá para esperar o preço voltar.'}</small></div>`;
}
function liveHTML(key) {
  if (key.startsWith('pos:')) return posHTML(key.slice(4));
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
  if (key === 'year') { const c = G.calendar(); return (Date.now() - c.start) / c.len; }
  if (key.startsWith('cdev:')) { const c = G.findComp(s, key.slice(5)); return c && c.dev ? (Date.now() - c.dev.start) / (c.dev.end - c.dev.start) : 1; }
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
  const avail = C.s.payMode === 'card' ? G.ccAvail(C.s) : null;
  document.querySelectorAll('[data-cost]').forEach((el) => el.classList.toggle('cant', (avail !== null && el.closest('[data-cardable]') ? avail : C.s.cash) < +el.dataset.cost));
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
let lastCompRender = 0;
export function onCompanies() {
  const here = (ui.tab === 'investir' && ui.sub.investir === 'bolsa') || (ui.tab === 'bens' && ui.sub.bens === 'marcas') || (ui.tab === 'empresas' && ui.sub.empresas === 'minhas');
  if (!here || modalOpen() || Date.now() - lastCompRender < 4000) return;
  lastCompRender = Date.now();
  const sc = $('#view').scrollTop; render(); $('#view').scrollTop = sc;
}
export function onFriends() { if (((ui.tab === 'perfil' && ui.sub.perfil === 'ranking') || (ui.tab === 'investir' && ui.sub.investir === 'holding')) && !modalOpen()) { const sc = $('#view').scrollTop; render(); $('#view').scrollTop = sc; } }
export function slowRefresh() {
  document.querySelectorAll('[data-live-html="flow"]').forEach((el) => { el.innerHTML = flowHTML(); });
}
export { ui };
