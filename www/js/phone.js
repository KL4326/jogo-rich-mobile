// ===== Celular: câmera, galeria, mensagens (Vapo-Vapo) e rede social (Instantâneo) =====
// Carregado só quando o jogador abre o celular. Os "fotos" são descrições leves
// (lugar + visual do personagem + filtro) desenhadas na hora, sem imagens pesadas.
import * as Cloud from './cloud.js';
import * as G from './game.js';
import * as A from './audio.js';
import { avatarSVG } from './avatar.js';
import { TRIPS, GOODS } from './data.js';
import { toast, esc, ago } from './ui.js';

const MAX_PHOTOS = 30, MAX_POSTS = 30;
const FILTERS = [['', 'Normal'], ['quente', 'Quente'], ['pb', 'P&B'], ['vintage', 'Vintage'], ['neon', 'Neon'], ['frio', 'Frio']];
let C, el = null, app = 'home';
const st = { chats: [], msgs: [], feed: null, chat: null, cam: { place: null, duo: true, f: '' }, share: null, offChats: null, offFeed: null, offMsgs: null };
const $ = (q) => el && el.querySelector(q);
const online = () => C.cloud && C.uid;

// ---------- fundo: escuta só a lista de conversas (para o aviso de mensagem nova) ----------
export function setup(ctx) {
  C = ctx;
  if (!online() || st.offChats) return;
  st.offChats = Cloud.watchChats(C.uid, (list) => {
    const before = unread();
    st.chats = list.sort((a, b) => ((b.last && b.last.t) || 0) - ((a.last && a.last.t) || 0));
    const after = unread();
    if (after > before && !(el && app === 'chat')) { A.sfx('notify'); const c = st.chats[0]; if (c && c.last) { const uid = other(c); toast(`💬 ${esc(nameOf(uid))}: ${esc(c.last.text).slice(0, 40)}`, 'gold', false, () => open(C, 'chat', { uid })); } }
    badge();
    if (el && app === 'papo') draw();
  });
  // Geral: no fundo escuta só a última mensagem (leve)
  st.offGeral = Cloud.watchGeral(1, (list) => {
    if (!list || !list.length) return;
    const m = list[0], was = st.geral && st.geral.id;
    st.geral = m;
    if (was && was !== m.id && m.from !== C.uid && !(el && app === 'chat' && st.chat && st.chat.cid === 'geral')) { A.sfx('notify'); toast(`🌎 ${esc(m.name || 'Jogador')}: ${esc(m.text || '📷 Foto').slice(0, 40)}`, 'gold', false, () => open(C, 'chat', { uid: 'geral' })); }
    badge();
    if (el && app === 'papo') draw();
  });
}
const geralUnread = () => !!(st.geral && st.geral.from !== C.uid && st.geral.t > (seen().geral || 0));
const other = (c) => c.members.find((u) => u !== C.uid);
const nameOf = (uid) => (C.friends[uid] && C.friends[uid].name) || 'Amigo';
const seen = () => (C.s.chatSeen = C.s.chatSeen || {});
const isUnread = (c) => c.last && c.last.from !== C.uid && c.last.t > (seen()[c.id] || 0);
export const unread = () => st.chats.filter(isUnread).length + (geralUnread() ? 1 : 0);
export function badge() {
  const n = unread();
  document.querySelectorAll('.phonebtn .pdot').forEach((d) => { d.textContent = n || ''; d.style.display = n ? '' : 'none'; });
}

// ---------- abrir / fechar ----------
export function open(ctx, start = 'home', data = {}) {
  C = ctx;
  setup(ctx);
  if (!el) {
    el = document.createElement('div');
    el.id = 'phone';
    el.innerHTML = `<div class="pback" data-pa="close"></div><div class="pframe"><div class="pnotch"></div><div class="pstatus"><b class="pclock"></b><span>📶 🔋</span></div><div class="pscreen"></div><div class="pnav"><button data-pa="home" aria-label="Início">⌂ Início</button><button class="pexit" data-pa="close">🎮 Voltar ao jogo</button></div></div>`;
    el.addEventListener('click', onClick);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('[data-enter]')) { e.preventDefault(); act(e.target.dataset.enter, e.target.dataset); } });
    el.addEventListener('input', (e) => { const c = e.target.dataset.count; if (c) $(c).textContent = `${e.target.value.length}/${e.target.maxLength}`; });
    document.body.appendChild(el);
    document.addEventListener('keydown', onEsc);
    // Botão "voltar" do Android/navegador fecha o celular em vez de sair do jogo
    try { history.pushState({ phone: 1 }, ''); } catch (e) { }
    window.addEventListener('popstate', onPop);
  }
  requestAnimationFrame(() => el.classList.add('on'));
  go(start, data);
}
const onEsc = (e) => { if (e.key === 'Escape') close(); };
const onPop = () => close(true);
export function close(fromPop) {
  if (!el) return;
  document.removeEventListener('keydown', onEsc);
  window.removeEventListener('popstate', onPop);
  if (fromPop !== true && history.state && history.state.phone) { try { history.back(); } catch (e) { } }
  stopFeed(); stopMsgs();
  el.classList.remove('on');
  const e = el; el = null;
  setTimeout(() => e.remove(), 250);
}
function stopFeed() { if (st.offFeed) { st.offFeed(); st.offFeed = null; } }
function stopMsgs() { if (st.offMsgs) { st.offMsgs(); st.offMsgs = null; } st.chat = null; }

function go(a, d = {}) {
  if (a !== 'chat') stopMsgs();
  if (a !== 'vitrine' && a !== 'post') stopFeed();
  app = a;
  if (a === 'vitrine') startFeed();
  if (a === 'chat') openChat(d.uid);
  draw();
}

function draw() {
  if (!el) return;
  $('.pclock').textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const v = { home, camera, galeria, papo, chat, vitrine, post }[app] || home;
  const scr = $('.pscreen');
  scr.className = 'pscreen app-' + app;
  $('.pframe').classList.toggle('lt', !['home', 'camera'].includes(app));
  scr.innerHTML = v();
  if (app === 'chat') { const m = $('.msgs'); if (m) m.scrollTop = m.scrollHeight; }
}
const bar = (t, back = 'home', extra = '') => `<div class="ptop"><button data-pa="go" data-a="${back}">‹</button><b>${t}</b>${extra || '<span></span>'}</div>`;
const needNet = (t) => `${bar(t)}<div class="pempty">📡<p>Esse app precisa de internet e de uma conta conectada.</p></div>`;

// ---------- tela inicial ----------
function home() {
  const n = unread();
  const apps = [['camera', '📷', 'Câmera', 'cam'], ['galeria', '🖼️', 'Galeria', 'gal'], ['papo', '💬', 'Vapo‑Vapo', 'papo', n], ['vitrine', '✨', 'Instantâneo', 'vit']];
  const d = new Date();
  return `<div class="pwall"><div class="pbig">${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div><small>${cap(d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }))}</small>
    <div class="papps">${apps.map(([a, i, t, c, b]) => `<button class="papp" data-pa="go" data-a="${a}"><span class="pico ${c}">${i}${b ? `<i>${b}</i>` : ''}</span>${t}</button>`).join('')}</div></div>`;
}

// ---------- fotos ----------
function places() {
  const s = C.s, out = [];
  const trip = s.trip ? TRIPS.find((x) => x.id === s.trip.id) : null;
  if (trip) out.push({ k: 'trip', id: trip.id, icon: trip.icon, name: trip.name, duo: s.trip.partner });
  const h = G.homeOf(s);
  if (!trip) out.push({ k: 'casa', id: 'casa', icon: h ? h.icon : '🏚️', name: h ? h.name : 'Em casa', duo: true });
  const veh = [...GOODS.veiculos, ...GOODS.ceumar].filter((g) => s.goods[g.id]).sort((a, b) => b.cost - a.cost)[0];
  if (veh && !trip) out.push({ k: 'veic', id: veh.id, icon: veh.icon, name: veh.name, hue: veh.hue, duo: true });
  out.push({ k: 'selfie', id: 'selfie', icon: '🤳', name: 'Selfie', duo: !s.trip || s.trip.partner });
  return out;
}
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const hash = (t) => [...String(t)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
export function photoHTML(p, big = false) {
  if (!p) return '';
  const hue = hash(p.id) % 360;
  const sz = big ? 150 : 104;
  return `<div class="pho ${p.k} f-${p.f || 'n'}" style="--h:${hue}">
    ${p.k !== 'selfie' ? `<span class="phl" ${p.k === 'veic' && p.hue ? `style="filter:hue-rotate(${p.hue}deg)"` : ''}>${p.icon}</span>` : ''}
    <div class="phc ${p.plook ? 'duo' : ''}">${avatarSVG(p.look, { size: sz })}${p.plook ? avatarSVG(p.plook, { size: sz * 0.88 }) : ''}</div>
    <span class="phtag">📍 ${esc(p.name)}</span></div>`;
}
function camera() {
  const s = C.s, list = places(), cam = st.cam;
  const pl = list.find((x) => x.id === cam.place) || list[0];
  cam.place = pl.id;
  const canDuo = s.love && pl.duo;
  const shot = { k: pl.k, id: pl.id, icon: pl.icon, name: pl.name, hue: pl.hue, f: cam.f, look: s.look, plook: canDuo && cam.duo ? s.love.partner.look : null };
  st.preview = shot;
  return `${bar('Câmera')}<div class="vf">${photoHTML(shot, true)}<div class="flash"></div></div>
    <div class="camrow">${list.map((x) => `<button class="${x.id === pl.id ? 'on' : ''}" data-pa="cam" data-k="place" data-v="${x.id}">${x.icon} ${esc(x.name.split(' (')[0])}</button>`).join('')}</div>
    ${canDuo ? `<div class="camrow">${[[0, '🙋 Só eu'], [1, `💞 Com ${esc(s.love.partner.name)}`]].map(([v, t]) => `<button class="${+cam.duo === v ? 'on' : ''}" data-pa="cam" data-k="duo" data-v="${v}">${t}</button>`).join('')}</div>` : ''}
    <div class="camrow">${FILTERS.map(([v, t]) => `<button class="${cam.f === v ? 'on' : ''}" data-pa="cam" data-k="f" data-v="${v}">${t}</button>`).join('')}</div>
    ${s.trip ? '' : '<small class="phint">💡 Viaje para tirar fotos em pontos turísticos!</small>'}
    <button class="shutter" data-pa="shoot" aria-label="Tirar foto"></button>`;
}
function galeria() {
  const ph = C.s.photos || [];
  return `${bar('Galeria', 'home', `<small>${ph.length}/${MAX_PHOTOS}</small>`)}${ph.length ? `<div class="pgrid">${ph.map((p) => `<button class="gth" data-pa="photo" data-t="${p.t}">${photoHTML(p)}</button>`).join('')}</div>` : '<div class="pempty">🖼️<p>Nenhuma foto ainda. Abra a 📷 Câmera!</p></div>'}`;
}
function photoView(t) {
  const p = (C.s.photos || []).find((x) => x.t === t);
  if (!p) return;
  st.sel = p;
  $('.pscreen').innerHTML = `${bar('Foto', 'galeria')}<div class="vf">${photoHTML(p, true)}</div><small class="phint">${new Date(p.t).toLocaleString('pt-BR')}</small>
    <div class="pbtns"><button class="btn" data-pa="go" data-a="post" data-use="1">✨ Postar no Instantâneo</button><button class="btn ghost" data-pa="sendphoto">💬 Enviar no Vapo-Vapo</button><button class="btn red sm" data-pa="delphoto">🗑️ Apagar</button></div>`;
}

// ---------- Vapo-Vapo (mensagens) ----------
function papo() {
  if (!online()) return needNet('Vapo-Vapo');
  const friends = C.s.friends || [];
  const g = st.geral;
  const geralRow = `<button class="chrow geral" data-pa="go" data-a="chat" data-uid="geral"><span class="fav gico">🌎</span>
      <div class="grow"><b>Geral <span class="gtag">todos os jogadores</span></b><small>${g ? `${g.from === C.uid ? 'Você' : esc(g.name || 'Jogador')}: ${esc(g.text || '📷 Foto')}` : 'Converse com todo mundo do jogo'}</small></div>
      <div class="cmeta">${g ? `<small>${ago(g.t)}</small>` : ''}${geralUnread() ? '<i class="udot"></i>' : ''}</div></button>`;
  if (!friends.length) return `${bar(st.share ? 'Enviar foto para…' : 'Vapo-Vapo')}<div class="clist">${geralRow}</div><div class="pempty sm">💬<p>Adicione amigos pela tag no 🏆 Perfil para conversar no privado.</p></div>`;
  const byUid = Object.fromEntries(st.chats.map((c) => [other(c), c]));
  const rows = friends.map((uid) => ({ uid, c: byUid[uid] })).sort((a, b) => ((b.c && b.c.last && b.c.last.t) || 0) - ((a.c && a.c.last && a.c.last.t) || 0));
  return `${bar(st.share ? 'Enviar foto para…' : 'Vapo-Vapo')}<div class="clist">${geralRow}${rows.map(({ uid, c }) => {
    const p = C.friends[uid];
    const on = p && Date.now() - p.updated < 3 * 60_000;
    return `<button class="chrow" data-pa="go" data-a="chat" data-uid="${uid}"><span class="fav ${on ? 'on' : ''}">${p && p.look ? avatarSVG(p.look, { size: 70 }) : '👤'}</span>
      <div class="grow"><b>${esc(p ? p.name : 'Carregando…')}</b><small>${c && c.last ? `${c.last.from === C.uid ? 'Você: ' : ''}${esc(c.last.text)}` : 'Toque para conversar'}</small></div>
      <div class="cmeta">${c && c.last ? `<small>${ago(c.last.t)}</small>` : ''}${c && isUnread(c) ? '<i class="udot"></i>' : ''}</div></button>`;
  }).join('')}</div>`;
}
function openChat(uid) {
  stopMsgs();
  const cid = uid === 'geral' ? 'geral' : Cloud.chatId(C.uid, uid);
  st.chat = { uid, cid }; st.msgs = [];
  const watch = cid === 'geral' ? (cb) => Cloud.watchGeral(80, cb) : (cb) => Cloud.watchMsgs(cid, cb);
  st.offMsgs = watch((list, err) => {
    if (!list) { st.msgs = []; st.err = err; } else { st.msgs = list; st.err = null; }
    seen()[cid] = Date.now(); badge();
    if (el && app === 'chat') { const box = $('.msgs'); if (box) { box.innerHTML = msgsHTML(); box.scrollTop = box.scrollHeight; } }
  });
  seen()[cid] = Date.now(); badge();
  if (st.share) { const p = st.share; st.share = null; send({ photo: p }); }
}
const msgsHTML = () => (st.err ? '<div class="pempty">⚠️<p>Sem acesso às mensagens. Peça para quem cuida do jogo publicar as regras novas do Firebase.</p></div>'
  : st.msgs.length ? st.msgs.map((m, i) => `<div class="msg ${m.from === C.uid ? 'me' : ''}">${st.chat.cid === 'geral' && m.from !== C.uid && (i === 0 || st.msgs[i - 1].from !== m.from) ? `<b class="mname" style="color:hsl(${hash(m.from) % 360} 60% 40%)">${esc(m.name || 'Jogador')}${m.tag ? ` <small>${esc(m.tag)}</small>` : ''}</b>` : ''}${m.photo ? photoHTML(m.photo) : ''}${m.text ? `<p>${esc(m.text)}</p>` : ''}<small>${new Date(m.t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small></div>`).join('')
    : '<div class="pempty sm">👋<p>Diga oi!</p></div>');
function chat() {
  if (!online() || !st.chat) return needNet('Vapo-Vapo');
  const p = C.friends[st.chat.uid];
  const head = st.chat.cid === 'geral' ? bar('🌎 Geral', 'papo', '<small>todos os jogadores</small>') : bar(esc(p ? p.name : 'Amigo'), 'papo', p && p.look ? `<span class="fav sm">${avatarSVG(p.look, { size: 52 })}</span>` : '');
  return `${head}
    <div class="msgs">${msgsHTML()}</div>
    <div class="compose"><input id="msgin" maxlength="300" placeholder="Mensagem" data-enter="sendmsg" autocomplete="off"><button data-pa="sendmsg">➤</button></div>`;
}
async function send(extra = {}) {
  const inp = $('#msgin');
  const text = extra.photo ? '' : (inp ? inp.value.trim() : '');
  if (!text && !extra.photo) return;
  const { cid, uid } = st.chat;
  const msg = { from: C.uid, text, t: Date.now(), ...extra };
  if (inp) inp.value = '';
  try { if (cid === 'geral') await Cloud.sendGeral({ ...msg, name: C.s.name, tag: C.s.tag || '' }); else await Cloud.sendMsg(cid, [C.uid, uid], msg); A.sfx('tick'); } catch (e) { toast('⚠️ ' + Cloud.errMsg(e), 'err'); if (inp) inp.value = text; }
}

// ---------- Instantâneo (rede social) ----------
function startFeed() {
  if (!online() || st.offFeed) return;
  st.offFeed = Cloud.watchFeed([C.uid, ...(C.s.friends || [])], (list, err) => {
    st.feed = list ? list.sort((a, b) => b.created - a.created).slice(0, 60) : null;
    st.feedErr = err;
    if (el && app === 'vitrine') { const f = $('.feed'); if (f) f.innerHTML = feedHTML(); }
  });
}
function vitrine() {
  if (!online()) return needNet('Instantâneo');
  return `${bar('Instantâneo', 'home', '<button class="pnew" data-pa="go" data-a="post">＋</button>')}<div class="feed">${feedHTML()}</div>`;
}
function feedHTML() {
  if (st.feedErr) return '<div class="pempty">⚠️<p>Sem acesso ao Instantâneo. Peça para quem cuida do jogo publicar as regras novas do Firebase.</p></div>';
  if (!st.feed) return '<div class="pempty sm">⏳<p>Carregando…</p></div>';
  if (!st.feed.length) return '<div class="pempty">✨<p>Ninguém postou ainda. Seja o primeiro! Toque em ＋.</p></div>';
  return st.feed.map((p) => {
    const likes = Object.keys(p.likes || {}), liked = !!(p.likes || {})[C.uid];
    const com = p.comments || [];
    return `<div class="post"><div class="phead"><span class="fav sm">${p.look ? avatarSVG(p.look, { size: 52 }) : '👤'}</span><div class="grow"><b>${esc(p.name)}</b><small>${ago(p.created)}</small></div>${p.uid === C.uid ? `<button class="pdel" data-pa="delpost" data-id="${p.id}">🗑️</button>` : ''}</div>
      ${p.photo ? `<div class="ppho" data-pa="like" data-id="${p.id}" data-dbl="1">${photoHTML(p.photo, true)}</div>` : ''}
      ${p.text ? `<p class="ptext ${p.photo ? '' : 'big'}">${esc(p.text)}</p>` : ''}
      <div class="pacts"><button class="${liked ? 'liked' : ''}" data-pa="like" data-id="${p.id}">${liked ? '❤️' : '🤍'} ${likes.length || ''}</button><span>💬 ${com.length || ''}</span></div>
      ${likes.length ? `<small class="plikes">Curtido por ${likes.slice(0, 3).map((u) => esc(u === C.uid ? 'você' : nameOf(u))).join(', ')}${likes.length > 3 ? ` e mais ${likes.length - 3}` : ''}</small>` : ''}
      <div class="pcoms">${com.slice(-4).map((c) => `<p><b>${esc(c.name)}</b> ${esc(c.text)}</p>`).join('')}${com.length > 4 ? `<small>+ ${com.length - 4} comentários anteriores</small>` : ''}</div>
      <div class="compose sm"><input maxlength="150" placeholder="Comentar…" data-enter="comment" data-id="${p.id}" autocomplete="off"><button data-pa="comment" data-id="${p.id}">➤</button></div></div>`;
  }).join('');
}
function post() {
  if (!online()) return needNet('Nova postagem');
  const p = st.draftPhoto;
  const ph = C.s.photos || [];
  return `${bar('Nova postagem', 'vitrine')}<div class="pnewpost">
    ${p ? `<div class="vf sm">${photoHTML(p, true)}<button class="rmph" data-pa="rmph">✕</button></div>` : ph.length ? `<small class="phint">Escolha uma foto (opcional):</small><div class="pstrip">${ph.map((x) => `<button class="gth" data-pa="pick" data-t="${x.t}">${photoHTML(x)}</button>`).join('')}</div>` : '<small class="phint">📷 Tire fotos na Câmera para postar aqui.</small>'}
    <textarea id="ptext" maxlength="300" rows="3" placeholder="No que você está pensando?" data-count="#pcount"></textarea><small id="pcount" class="cnt">0/300</small>
    <button class="btn full" data-pa="publish">✨ Publicar</button></div>`;
}

// ---------- ações ----------
function onClick(e) {
  const b = e.target.closest('[data-pa]');
  if (!b) return;
  e.preventDefault();
  A.unlock();
  if (!['shoot', 'like'].includes(b.dataset.pa)) A.sfx('click');
  act(b.dataset.pa, b.dataset, b);
}
let lastTap = 0;
async function act(a, d, b) {
  const s = C.s;
  if (a === 'close') return close();
  if (a === 'home') return go('home');
  if (a === 'go') { if (a === 'go' && d.a === 'post') st.draftPhoto = d.use ? st.sel : null; return go(d.a, d); }
  if (a === 'cam') { st.cam[d.k] = d.k === 'duo' ? !!+d.v : d.v; return draw(); }
  if (a === 'shoot') {
    const ph = { ...st.preview, t: Date.now() };
    s.photos = [ph, ...(s.photos || [])].slice(0, MAX_PHOTOS);
    G.save(s);
    A.sfx('tick'); setTimeout(() => A.sfx('click'), 60);
    const f = $('.flash'); if (f) { f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
    toast(`📸 Foto salva na Galeria${(s.photos.length >= MAX_PHOTOS) ? ' (as mais antigas são apagadas)' : ''}`, 'ok', false);
    return;
  }
  if (a === 'photo') return photoView(+d.t);
  if (a === 'delphoto') { s.photos = (s.photos || []).filter((x) => x.t !== st.sel.t); G.save(s); return go('galeria'); }
  if (a === 'sendphoto') { if (!online()) return toast('⚠️ Precisa de internet', 'err'); st.share = st.sel; return go('papo'); }
  if (a === 'pick') { st.draftPhoto = (s.photos || []).find((x) => x.t === +d.t); return draw(); }
  if (a === 'rmph') { st.draftPhoto = null; return draw(); }
  if (a === 'sendmsg') return send();
  if (a === 'publish') {
    const text = $('#ptext').value.trim();
    if (!text && !st.draftPhoto) return toast('⚠️ Escreva algo ou escolha uma foto', 'err');
    b.disabled = true;
    try {
      await Cloud.createPost({ uid: C.uid, name: s.name, tag: s.tag || '', look: s.look, text, photo: st.draftPhoto || null, created: Date.now(), likes: {}, comments: [] });
      A.sfx('coin'); toast('✨ Publicado no Instantâneo!', 'ok', false);
      st.draftPhoto = null;
      trimMine();
      go('vitrine');
    } catch (e) { b.disabled = false; toast('⚠️ ' + Cloud.errMsg(e), 'err'); }
    return;
  }
  if (a === 'like') {
    const p = (st.feed || []).find((x) => x.id === d.id); if (!p) return;
    const now = Date.now();
    if (d.dbl) { const dbl = now - lastTap < 350; lastTap = now; if (!dbl) return; if ((p.likes || {})[C.uid]) return; }
    const on = !(p.likes || {})[C.uid];
    if (on) A.sfx('love');
    Cloud.likePost(p.id, C.uid, on).catch((e) => toast('⚠️ ' + Cloud.errMsg(e), 'err'));
    return;
  }
  if (a === 'comment') {
    const inp = el.querySelector(`input[data-id="${d.id}"]`);
    const text = inp && inp.value.trim(); if (!text) return;
    inp.value = '';
    Cloud.commentPost(d.id, { uid: C.uid, name: s.name, text, t: Date.now() }).catch((e) => { toast('⚠️ ' + Cloud.errMsg(e), 'err'); inp.value = text; });
    return;
  }
  if (a === 'delpost') { if (confirm('Apagar esta postagem?')) Cloud.deletePost(d.id).catch((e) => toast('⚠️ ' + Cloud.errMsg(e), 'err')); return; }
}
// Mantém só as últimas postagens de cada jogador (o banco não cresce para sempre)
function trimMine() {
  setTimeout(() => {
    const mine = (st.feed || []).filter((p) => p.uid === C.uid).sort((a, b) => b.created - a.created);
    mine.slice(MAX_POSTS).forEach((p) => Cloud.deletePost(p.id).catch(() => {}));
  }, 1500);
}
