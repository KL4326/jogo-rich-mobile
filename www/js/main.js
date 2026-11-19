// ===== Inicialização, login e loop principal =====
import * as G from './game.js';
import { Market } from './market.js';
import * as UI from './ui.js';
import { money } from './ui.js';
import * as Cloud from './cloud.js';
import * as A from './audio.js';
import { JOBS, GOODS, SEGMENT } from './data.js';

const mk = new Market();
const ctx = { s: null, mk, afterAction, friends: {}, companies: {}, cloud: Cloud.enabled, uid: null, addFriend, removeFriend, logout, answerEvent, sendPix };
const $ = (id) => document.getElementById(id);
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- Abertura: chuva de dinheiro ----------
function startRain() {
  const rain = $('rain');
  const glyphs = ['💵', '💰', '🪙', '💸', '💵', '🪙', '💎'];
  let html = '';
  for (let i = 0; i < 34; i++) {
    const size = 18 + Math.random() * 26;
    html += `<span style="left:${Math.random() * 100}%;font-size:${size}px;animation-duration:${3 + Math.random() * 4}s;animation-delay:-${Math.random() * 7}s;--sw:${(Math.random() * 60 - 30).toFixed(0)}px">${glyphs[i % glyphs.length]}</span>`;
  }
  rain.innerHTML = html;
}
function splashMsg(text) {
  $('splash-box').innerHTML = `<div class="brand"><div class="bcoin">🪙</div><h1>Magnata</h1><p class="tagline">Do zero ao bilhão</p></div><div class="loading"><span></span><span></span><span></span></div><p class="smsg">${text}</p>`;
}
function hideSplash() {
  const sp = $('splash');
  sp.classList.add('out');
  setTimeout(() => { sp.style.display = 'none'; $('rain').innerHTML = ''; }, 600);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Tela de login ----------
function loginScreen(mode = 'login', msg = '') {
  const signup = mode === 'signup';
  $('splash-box').innerHTML = `
    <div class="brand small"><div class="bcoin">🪙</div><h1>Magnata</h1></div>
    <div class="loginbox">
      <h3>${signup ? 'Criar conta' : 'Entrar'}</h3>
      ${signup ? '<input id="lname" maxlength="18" placeholder="Seu nome no jogo" autocomplete="nickname">' : ''}
      <input id="lemail" type="email" placeholder="E-mail" autocomplete="email" inputmode="email">
      <input id="lpass" type="password" placeholder="Senha${signup ? ' (mín. 6 caracteres)' : ''}" autocomplete="${signup ? 'new-password' : 'current-password'}">
      <p class="lerr" id="lerr">${msg}</p>
      <button class="btn full" id="lgo">${signup ? 'Criar minha conta 🚀' : 'Entrar 💰'}</button>
      ${signup ? '<button class="lnk2" id="lswap">Já tenho conta → Entrar</button>' : '<button class="lnk2" id="lswap">Não tem conta? <b>Criar conta</b></button><button class="lnk2 sm" id="lforgot">Esqueci minha senha</button>'}
    </div>`;
  const err = (t) => { $('lerr').textContent = t; $('lerr').classList.toggle('ok', t.startsWith('✅')); };
  $('lswap').onclick = () => loginScreen(signup ? 'login' : 'signup');
  $('lpass').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('lgo').click(); });
  if (!signup) $('lforgot').onclick = async () => {
    const email = $('lemail').value;
    if (!email) return err('Digite seu e-mail acima e toque de novo.');
    try { await Cloud.resetPassword(email); err('✅ Enviamos um link para redefinir a senha no seu e-mail.'); } catch (e) { err(Cloud.errMsg(e)); }
  };
  $('lgo').onclick = async () => {
    const email = $('lemail').value, pw = $('lpass').value;
    const name = signup ? $('lname').value.trim().slice(0, 18) : '';
    if (signup && !name) return err('Escolha um nome.');
    if (!email || !pw) return err('Preencha e-mail e senha.');
    $('lgo').disabled = true;
    splashMsg(signup ? 'Criando sua conta…' : 'Carregando sua fortuna…');
    try {
      const user = signup ? await Cloud.signUp(email, pw, name) : await Cloud.signIn(email, pw);
      await enterGame(user, name);
    } catch (e) {
      loginScreen(mode, Cloud.errMsg(e));
      if ($('lemail')) $('lemail').value = email;
    }
  };
}

// ---------- Entrar no jogo com a conta ----------
async function enterGame(user, newName) {
  const t0 = Date.now();
  splashMsg('Carregando sua fortuna…');
  const local = G.load();
  let remote = null;
  try { remote = await Cloud.withTimeout(Cloud.loadSave(user.uid), 10000); } catch (e) { /* offline: usa o local */ }
  let s;
  if (remote && (!local || local.uid !== user.uid || (remote.last || 0) >= (local.last || 0))) s = remote;
  else if (local && (local.uid === user.uid || !local.uid)) s = local; // aproveita o progresso deste celular
  else s = G.newState(newName || user.displayName || 'Jogador');
  s.uid = user.uid;
  if (!Array.isArray(s.friends) || s.friends.some((f) => typeof f !== 'string')) s.friends = [];
  if (!s.tag) {
    try { s.tag = await Cloud.reserveTag(user.uid, s.name); } catch (e) { /* tenta de novo depois */ }
  }
  ctx.uid = user.uid;
  G.save(s);
  const isNew = !remote && !(local && local.stats && local.stats.earned > 0);
  await sleep(Math.max(0, 1800 - (Date.now() - t0)));
  hideSplash();
  start(s);
  pushCloud(true).catch(() => {});
  if (isNew && s.look) UI.openHelp();
}

async function logout() {
  await pushCloud(true).catch(() => {});
  await Cloud.logout();
  localStorage.removeItem('magnata_save_v1');
  location.reload();
}

// ---------- Sincronização ----------
function profileOf(s) {
  const home = G.homeOf(s);
  return {
    name: s.name, tag: s.tag || '', nw: Math.round(G.netWorth(s, mk)), level: G.level(s), card: s.cardMax,
    ach: Object.keys(s.ach).length, prestige: G.prestige(s), net: Math.round(G.incomeBreakdown(s, mk).net),
    job: s.job, home: home ? home.icon : '🏚️', updated: Date.now(),
    corp: s.corp ? { name: s.corp.name, ticker: s.corp.ticker, float: s.corp.float, price: G.corpPrice(s, mk), profit: G.grossBizProfit(s, mk) } : null,
    look: s.look || null, partner: s.love ? { name: s.love.partner.name, look: s.love.partner.look, stage: s.love.stage } : null,
    trips: Object.keys(s.trips || {}).length, ctrl: G.controlled(s), jobName: (JOBS.find((j) => j.id === s.job) || {}).name, jobIcon: (JOBS.find((j) => j.id === s.job) || {}).icon,
    yr: (s.season || {}).year || 0, grow: Math.round(G.seasonGrow(s, mk)),
    lastYr: (s.lastSeason || {}).year || 0, lastGrow: Math.round((s.lastSeason || {}).grow || 0),
    titles: s.titles || 0, legacy: G.legacyPts(s),
    veh: ([...GOODS.veiculos, ...GOODS.ceumar].filter((g) => s.goods[g.id]).concat(G.pgoods(s).filter((g) => g.bonus)).sort((a, b) => a.cost - b.cost).pop() || {}).icon || '',
  };
}
// Economia de cota do Firebase (plano grátis: 50 mil leituras/dia para todos os jogadores juntos):
// salva no máximo a cada 20 s e só reenvia o perfil/empresas quando algo mudou de verdade.
let lastPush = 0, pushTimer = null, lastProfSig = '', lastProfAt = 0;
const sig2 = (n) => (n ? Number(Number(n).toPrecision(2)) : 0); // 2 algarismos: 36,4 bi -> 36 bi
async function pushCloud(force = false) {
  if (!ctx.uid || !ctx.s) return;
  const wait = 20_000 - (Date.now() - lastPush);
  if (!force && wait > 0) { if (!pushTimer) pushTimer = setTimeout(() => { pushTimer = null; pushCloud(true).catch(() => {}); }, wait); return; }
  lastPush = Date.now();
  G.save(ctx.s);
  const prof = profileOf(ctx.s);
  const sig = JSON.stringify({ ...prof, updated: 0, nw: sig2(prof.nw), net: sig2(prof.net), prestige: sig2(prof.prestige) });
  const sendProf = sig !== lastProfSig || Date.now() - lastProfAt > 10 * 60_000;
  await Cloud.pushSave(ctx.uid, ctx.s, sendProf ? prof : null);
  if (sendProf) { lastProfSig = sig; lastProfAt = Date.now(); }
  pushCompanies().catch(() => {});
}
// ---------- Empresas na bolsa (todos os jogadores) ----------
const compDocId = (c) => `${ctx.uid}_${c.id}`;
const compSent = {};
ctx.compDocId = (c) => compDocId(c);
ctx.holdingDocId = () => `${ctx.uid}_h`;
async function pushCompanies() {
  const s = ctx.s;
  if (!ctx.uid) return;
  const base = { owner: ctx.uid, ownerName: s.name };
  const jobs = [];
  const put = (id, data) => {
    // só envia se mudou (preço/lucro com 2 algarismos) ou a cada 15 min
    const sig = JSON.stringify({ ...data, price: sig2(data.price), profit: sig2(data.profit) });
    const last = compSent[id];
    if (last && last.sig === sig && Date.now() - last.t < 15 * 60_000) return;
    compSent[id] = { sig, t: Date.now() };
    jobs.push(Cloud.putCompany(id, { ...data, updated: Date.now() }));
  };
  for (const c of s.companies || []) put(compDocId(c), { ...G.compPublic(s, c, mk), ...base });
  if (s.corp) put(ctx.holdingDocId(), { ...G.holdingPublic(s, mk), ...base });
  // empresas fechadas saem da bolsa
  for (const [id, d] of Object.entries(ctx.companies)) {
    if (d.owner !== ctx.uid) continue;
    const alive = id === ctx.holdingDocId() ? !!s.corp : (s.companies || []).some((c) => compDocId(c) === id);
    if (!alive) jobs.push(Cloud.delCompany(id));
  }
  await Promise.all(jobs);
}
ctx.pushCompanies = () => pushCompanies().catch(() => {});
function watchCompanies() {
  if (!ctx.uid) return;
  Cloud.watchCompanies((list) => {
    if (!list) return;
    ctx.companies = Object.fromEntries(list.map((d) => [d.id, d]));
    // Empresa que saiu da bolsa (fechou ou o dono renasceu): suas ações são recompradas pelo último preço
    for (const [id, h] of Object.entries(ctx.s.fport || {})) {
      if (ctx.companies[id] || !h.seen) continue;
      const got = h.q * h.price;
      ctx.s.cash += got;
      delete ctx.s.fport[id];
      notify('🏢', `A <b>${esc(h.name)}</b> saiu da bolsa. Suas ${h.q.toLocaleString('pt-BR')} ações foram recompradas por <b class="up">${money(got)}</b>.`);
      UI.toast(`🏢 ${esc(h.name)} saiu da bolsa: +${money(got)}`, 'gold');
    }
    for (const d of list) {
      G.syncHolding(ctx.s, d);
      // ações antigas (de antes da bolsa compartilhada): registra que são suas
      const h = (ctx.s.fport || {})[d.id];
      if (h && h.q > 0 && (d.holders || {})[ctx.uid] !== h.q) Cloud.setHolder(d.id, ctx.uid, h.q).catch(() => {});
    }
    UI.onCompanies();
  });
}
const heldByOthers = (doc) => Object.entries((doc && doc.holders) || {}).reduce((t, [u, q]) => t + (u === ctx.uid ? 0 : q), 0);
ctx.heldByOthers = heldByOthers;
// Compra/venda de ações de empresa de jogador
ctx.tradeCompany = async (id, qty, side) => {
  const doc = ctx.companies[id];
  if (!doc) return 'Empresa não encontrada';
  const r = G.tradeCompany(ctx.s, doc, qty, side, heldByOthers(doc));
  if (typeof r === 'string') return r;
  Cloud.setHolder(id, ctx.uid, r.q).catch(() => {});
  afterAction();
  pushCloud().catch(() => {});
  return r;
};
// Comprar um bem da marca de outro jogador: 20% do preço vai para o dono da empresa
ctx.buyPlayerGood = (id, tier) => {
  const doc = ctx.companies[id];
  const prod = doc && (doc.products || []).find((p) => p.tier === tier);
  if (!prod) return 'Produto não encontrado';
  const r = G.buyPlayerGood(ctx.s, { ...doc, id }, prod);
  if (typeof r === 'string') return r;
  if (doc.owner !== ctx.uid) {
    const cut = Math.floor(prod.price * G.COMP.margin);
    Cloud.sendPix(ctx.uid, ctx.s.name, doc.owner, cut, `Venda: ${doc.name} ${prod.model}`.slice(0, 50), { kind: 'sale', comp: id, item: `${prod.kind} ${prod.model}` }).catch(() => {});
  }
  afterAction();
  pushCloud().catch(() => {});
  return r;
};
ctx.compBuyback = (c, pct) => G.compBuyback(ctx.s, mk, c.id, pct, heldByOthers(ctx.companies[compDocId(c)]));
let topCache = { t: 0, list: null };
ctx.topPlayers = async () => {
  if (Date.now() - topCache.t < 5 * 60_000 && topCache.list) return topCache.list;
  const list = await Cloud.topProfiles(50);
  topCache = { t: Date.now(), list };
  return list;
};
function watchFriends() {
  if (!ctx.uid) return;
  Cloud.watchFriends(ctx.s.friends, (uid, p) => {
    if (p) ctx.friends[uid] = p; else delete ctx.friends[uid];
    if (p && p.corp) G.updateFriendCorp(ctx.s, uid, p.corp);
    UI.onFriends();
  });
}
async function addFriend(raw) {
  const tag = Cloud.normalizeTag(raw);
  if (!tag) return 'Digite a tag no formato NOME#1234';
  if (tag === ctx.s.tag) return 'Essa é a sua própria tag 😅';
  let uid;
  try { uid = await Cloud.findTag(tag); } catch (e) { return Cloud.errMsg(e); }
  if (!uid) return 'Ninguém encontrado com essa tag.';
  if (ctx.s.friends.includes(uid)) return 'Essa pessoa já é sua amiga.';
  const s = ctx.s;
  s.sent = s.sent || {};
  // Se a pessoa já me convidou, aceita direto
  const theirs = ctx.invites.find((i) => i.from === uid);
  if (theirs) { await acceptInvite(theirs.id); return null; }
  if (s.sent[uid]) return 'Convite já enviado. Aguarde a resposta 😉';
  try {
    await Cloud.withTimeout(Cloud.sendInvite({ from: ctx.uid, fromName: s.name, fromTag: s.tag || '', fromLook: s.look || null, to: uid, toTag: tag, status: 'pending', created: Date.now() }), 10000);
  } catch (e) { return e && e.code === 'permission-denied' ? 'Convites ainda não liberados no servidor (falta atualizar as regras do Firebase).' : Cloud.errMsg(e); }
  s.sent[uid] = { tag, t: Date.now() };
  G.save(s);
  UI.render();
  return 'sent';
}
// ---------- Convites de amizade ----------
ctx.invites = [];
function makeFriend(uid) {
  if (!ctx.s.friends.includes(uid)) ctx.s.friends.push(uid);
  if (ctx.s.sent) delete ctx.s.sent[uid];
  G.save(ctx.s);
  watchFriends();
  pushCloud().catch(() => {});
}
async function acceptInvite(id) {
  const inv = ctx.invites.find((i) => i.id === id); if (!inv) return;
  try { await Cloud.answerInvite(id, 'accepted'); } catch (e) { UI.toast('⚠️ ' + Cloud.errMsg(e), 'err'); return; }
  makeFriend(inv.from);
  ctx.invites = ctx.invites.filter((i) => i.id !== id);
  UI.toast(`🤝 Agora você e <b>${esc(inv.fromName)}</b> são amigos!`, 'gold');
  afterAction(); UI.render();
}
async function declineInvite(id) {
  try { await Cloud.answerInvite(id, 'declined'); } catch (e) { UI.toast('⚠️ ' + Cloud.errMsg(e), 'err'); return; }
  ctx.invites = ctx.invites.filter((i) => i.id !== id);
  UI.render();
}
ctx.acceptInvite = acceptInvite; ctx.declineInvite = declineInvite;
function watchInvites() {
  if (!ctx.uid) return;
  // Recebidos
  Cloud.watchInvites(ctx.uid, 'to', (list) => {
    const before = new Set(ctx.invites.map((i) => i.id));
    const pend = list.filter((i) => i.status === 'pending');
    // Já era amigo (sistema antigo) ou também convidei: aceita sozinho
    const auto = pend.filter((i) => ctx.s.friends.includes(i.from) || (ctx.s.sent || {})[i.from]);
    ctx.invites = pend.filter((i) => !auto.includes(i));
    auto.forEach((i) => Cloud.answerInvite(i.id, 'accepted').then(() => makeFriend(i.from)).catch(() => {}));
    const fresh = ctx.invites.filter((i) => !before.has(i.id));
    if (fresh.length) { A.sfx('notify'); fresh.forEach((i) => UI.toast(`👥 <b>${esc(i.fromName)}</b> quer ser seu amigo!`, 'gold', false)); }
    UI.onEvent();
  });
  // Enviados: quando respondem
  Cloud.watchInvites(ctx.uid, 'from', (list) => {
    for (const i of list) {
      if (i.status === 'pending') continue;
      const tag = i.toTag || 'Seu convite';
      if (i.status === 'accepted') { makeFriend(i.to); notify('🤝', `<b>${esc(tag)}</b> aceitou seu convite de amizade!`); }
      else { if (ctx.s.sent) delete ctx.s.sent[i.to]; G.save(ctx.s); notify('🙅', `<b>${esc(tag)}</b> recusou seu convite de amizade.`); }
      Cloud.deleteInvite(i.id).catch(() => {});
      UI.render();
    }
  });
}
// ---------- Notificações (ficam no Início até o jogador ver) ----------
function notify(icon, text) {
  const s = ctx.s;
  s.inbox = [{ icon, text, t: Date.now() }, ...(s.inbox || [])].slice(0, 15);
  UI.onEvent();
}
ctx.clearInbox = () => { ctx.s.inbox = []; G.save(ctx.s); };

// ---------- Pix ----------
function pixLog(s, e) { s.pixLog = [e, ...(s.pixLog || [])].slice(0, 20); }
async function sendPix(uid, amount, desc = '') {
  desc = String(desc || '').replace(/\s+/g, ' ').trim().slice(0, 50);
  const s = ctx.s;
  amount = Math.floor(amount);
  if (!ctx.uid) return 'Pix só funciona com internet e conta conectada.';
  if (!(amount >= 1)) return 'Digite um valor válido.';
  if (amount > s.cash) return 'Dinheiro insuficiente.';
  const f = ctx.friends[uid];
  if (!f) return 'Amigo não encontrado.';
  s.cash -= amount;
  G.save(s);
  try {
    await Cloud.withTimeout(Cloud.sendPix(ctx.uid, s.name, uid, amount, desc), 10000);
  } catch (e) {
    s.cash += amount; G.save(s);
    return e && e.code === 'permission-denied' ? 'O Pix ainda não foi liberado no servidor (falta atualizar as regras do Firebase).' : Cloud.errMsg(e);
  }
  s.stats.pixOut = (s.stats.pixOut || 0) + amount;
  pixLog(s, { dir: 'out', name: f.name, amount, desc, t: Date.now() });
  afterAction();
  pushCloud().catch(() => {});
  return null;
}
const claiming = new Set();
const pendingPix = new Set(); // Pix que falharam (ex.: servidor sem cota): tenta de novo a cada 2 min
setInterval(() => { for (const id of [...pendingPix]) claimOne(id); }, 120_000);
function watchPix() {
  if (!ctx.uid) return;
  Cloud.watchIncoming(ctx.uid, (id) => claimOne(id));
}
async function claimOne(id) {
    if (claiming.has(id)) return;
    claiming.add(id);
    try {
      const t = await Cloud.claimPix(id);
      ctx.s.cash += t.amount;
      if (t.kind === 'prestige' && Number.isFinite(t.prestige)) {
        ctx.s.bonusPrestige = Math.max(0, (ctx.s.bonusPrestige || 0) + t.prestige);
        G.statusRefresh();
        UI.toast(`✨ Você recebeu <b>${t.prestige.toLocaleString('pt-BR')}</b> de prestígio (teste)!`, 'gold');
        notify('✨', `Prestígio de teste: <b>${t.prestige > 0 ? '+' : ''}${t.prestige.toLocaleString('pt-BR')}</b>`);
        UI.confetti(); afterAction(); UI.render(); pushCloud().catch(() => {});
        pendingPix.delete(id);
      return;
      }
      if (t.kind === 'sale') {
        ctx.s.stats.pSales = (ctx.s.stats.pSales || 0) + 1;
        const c = (ctx.s.companies || []).find((x) => compDocId(x) === t.comp);
        if (c) c.sales = (c.sales || 0) + t.amount;
        UI.toast(`🛒 <b>${esc(t.fromName)}</b> comprou ${esc(t.item || 'um produto')} da sua marca! +${money(t.amount)}`, 'gold');
        notify('🛒', `<b>${esc(t.fromName)}</b> comprou <b>${esc(t.item || 'um produto')}</b>${c ? ` da ${esc(c.name)}` : ''}: <b class="up">+${money(t.amount)}</b> (sua margem de ${Math.round(G.COMP.margin * 100)}%)`);
        afterAction(); UI.render(); pushCloud().catch(() => {});
        pendingPix.delete(id);
        return;
      }
      ctx.s.stats.pixIn = (ctx.s.stats.pixIn || 0) + t.amount;
      const desc = String(t.desc || '').slice(0, 50);
      pixLog(ctx.s, { dir: 'in', name: t.fromName, amount: t.amount, desc, t: Date.now() });
      UI.toast(`💸 Pix recebido de <b>${esc(t.fromName)}</b>: +${money(t.amount)}!${desc ? `<br><i>“${esc(desc)}”</i>` : ''}`, 'gold');
      notify('💸', `Você recebeu um Pix de <b>${esc(t.fromName)}</b>: <b class="up">+${money(t.amount)}</b>${desc ? `<span class="pixdesc">💬 “${esc(desc)}”</span>` : ''}`);
      UI.confetti();
      afterAction();
      UI.render();
      pushCloud().catch(() => {});
      pendingPix.delete(id);
    } catch (e) {
      if (e && e.message === 'já resgatado') pendingPix.delete(id); // outro aparelho já resgatou
      else { pendingPix.add(id); claiming.delete(id); }
    }
}
function removeFriend(uid) {
  ctx.s.friends = ctx.s.friends.filter((f) => f !== uid);
  delete ctx.friends[uid];
  watchFriends();
  afterAction();
}

// ---------- Jogo ----------
function afterAction() {
  const nw = G.netWorth(ctx.s, mk);
  const newCard = G.checkCard(ctx.s, nw);
  const lvlBefore = G.level(ctx.s);
  const achs = G.checkAchievements(ctx.s);
  achs.forEach((a, i) => setTimeout(() => UI.toast(`🎖️ Conquista: <b>${a.name}</b>`, 'gold'), 400 * i));
  if (newCard) { cardModal(newCard); UI.confetti(); }
  else if (achs.length) UI.confetti();
  // Subiu de status social?
  G.statusRefresh();
  const st = G.statusOf(ctx.s);
  let stUp = false;
  if (ctx.s.statusMax === undefined) ctx.s.statusMax = st.idx;
  else if (st.idx > ctx.s.statusMax) {
    ctx.s.statusMax = st.idx; stUp = true;
    UI.confetti(); UI.toast(`${st.icon} Novo status: <b>${st.name}</b>! Veja suas vantagens.`, 'gold');
    notify(st.icon, `Você virou <b>${st.name}</b>! Toque no seu status na tela inicial para ver as vantagens.`);
  }
  G.save(ctx.s);
  if (G.level(ctx.s) > lvlBefore || achs.length || newCard || stUp) UI.render();
}

function answerEvent(yes) {
  const r = G.answerEvent(ctx.s, yes);
  if (typeof r === 'string') { UI.toast('⚠️ ' + r, 'err'); if (!ctx.s.event) UI.render(); return; }
  if (r && r.msg) UI.toast(r.msg + (r.gain ? ` +${money(r.gain)}` : ''), r.win || r.gain ? 'gold' : 'ok');
  if (r && (r.win || r.gain)) UI.confetti();
  if (r && r.tip) UI.modal(`<div class="celebrate"><h3>🕵️ A dica</h3><p class="tipbig">${r.msg.slice(3)}</p><p class="muted">Ele acerta 9 em cada 10 vezes. Use com sabedoria!</p><button class="btn full" data-act="close">Valeu!</button></div>`);
  afterAction();
  UI.render();
}

function cardModal(c) {
  UI.modal(`<div class="celebrate"><h3>🎉 Novo cartão desbloqueado!</h3>
    <div class="ccard ${c.cls} pop"><div class="cc-top"><span class="cc-bank">MAGNATA</span><span class="cc-tier">${c.name.toUpperCase()}</span></div><div class="chip"></div><div class="cc-num">•••• •••• •••• ••••</div><div class="cc-bottom"><span>${esc(ctx.s.name.toUpperCase())}</span><span>${money(c.min)}+</span></div></div>
    <p>Cashback de <b>${Math.round(c.cashback * 100)}%</b> · Limite de <b>${money(c.limit)}</b> · <b>${c.hours}h</b> de renda offline</p>
    <button class="btn full" data-act="close">Show! 😎</button></div>`);
}

// ---------- Temporada (ano) ----------
let lastSeasonCheck = 0, pendingSeason = null, startedAt = Date.now();
function seasonCheck() {
  const s = ctx.s;
  const r = G.seasonTick(s, mk);
  if (r) pendingSeason = r;
  // espera os perfis dos amigos carregarem para saber a colocação
  if (pendingSeason && (!ctx.uid || Date.now() - startedAt > 8000)) { const ps = pendingSeason; pendingSeason = null; finishSeason(ps); }
}
function finishSeason({ ended, grow }) {
  const s = ctx.s;
  if (ctx.uid === G.CREATOR) return; // o criador não disputa a temporada
  const rivals = s.friends.filter((uid) => uid !== G.CREATOR).map((uid) => ctx.friends[uid]).filter(Boolean)
    .map((p) => (p.yr === ended ? p.grow : p.lastYr === ended ? p.lastGrow : null)).filter((g) => g !== null && g !== undefined);
  const place = 1 + rivals.filter((g) => g > grow).length;
  const n = rivals.length + 1;
  let pts = 0;
  if (n >= 2 && grow > 0 && place <= 3) pts = G.seasonPrize(s, place, ended);
  const medal = ['🥇', '🥈', '🥉'][place - 1] || '🎖️';
  notify('🎆', `Fim do <b>Ano ${ended}</b>! Você cresceu <b class="${grow >= 0 ? 'up' : 'down'}">${money(grow)}</b>${n >= 2 ? ` e ficou em <b>${place}º de ${n}</b>` : ''}.${pts ? ` Prêmio: <b>+${pts} de legado</b> (+${pts * 2}% de renda para sempre)!` : ''}`);
  UI.modal(`<div class="celebrate"><h3>🎆 Feliz Ano ${ended + 1}!</h3>
    <p>O <b>Ano ${ended}</b> acabou. No ano você cresceu</p>
    <div class="offgain ${grow >= 0 ? 'up' : 'down'}">${grow >= 0 ? '+' : ''}${money(grow)}</div>
    ${n >= 2 ? `<p class="bigmedal">${medal}</p><p>Você ficou em <b>${place}º lugar</b> entre ${n} jogadores.</p>` : '<p class="muted">Adicione amigos para disputar a temporada!</p>'}
    ${pts ? `<p class="up"><b>Prêmio: +${pts} pontos de legado</b> = +${pts * 2}% de renda para sempre${place === 1 ? ' e o título 🏆 Campeão do Ano' : ''}!</p>` : ''}
    <p class="muted small">Um novo ano começou: todo mundo volta a disputar do zero. Vence quem mais crescer até a próxima virada.</p>
    <button class="btn full" data-act="close">Bora! 🚀</button></div>`);
  UI.confetti();
  afterAction(); UI.render(); pushCloud(true).catch(() => {});
}
ctx.rebirth = () => {
  const r = G.rebirth(ctx.s, mk);
  if (typeof r === 'string') return r;
  for (const id of r.sold) Cloud.setHolder(id, ctx.uid, 0).catch(() => {});
  notify('🔁', `Você renasceu! Ganhou <b>+${r.gain} de legado</b>. Agora sua renda tem <b>+${Math.round((G.legacyMult(ctx.s) - 1) * 100)}%</b> para sempre.`);
  afterAction(); UI.render(); pushCloud(true).catch(() => {});
  return r;
};

let lastLevel = 0;
function tick() {
  const s = ctx.s;
  const now = Date.now();
  // Em segundo plano não conta aqui: tudo é calculado de uma vez ao voltar (com o limite offline)
  if (document.hidden) return;
  // Se o app ficou congelado (celular bloqueado / outro app), trata como tempo offline
  if (now - s.last > 15_000) { offlineProgress(); return; }
  const dt = Math.min(now - s.last, 5000);
  s.last = now;
  if (dt > 0) G.accrue(s, mk, dt);
  if (mk.update(now)) UI.onMarketTick();
  if (now - lastSeasonCheck > 3000) { lastSeasonCheck = now; seasonCheck(); }
  const done = G.checkCourse(s);
  if (done) { notify('🎓', `Você concluiu o curso <b>${done.name}</b>!`); UI.toast(`🎓 Você concluiu: <b>${done.name}</b>!`, 'gold'); afterAction(); UI.render(); }
  const tr = G.checkTrip(s);
  if (tr) { notify('🧳', `Você voltou de <b>${tr.trip.name}</b> descansado(a): +10% de renda por 3h.`); UI.toast(`🧳 Você voltou de <b>${tr.trip.name}</b>! Descansado: +10% de renda por 3h${tr.first ? ' · 🛂 novo carimbo!' : ''}`, 'gold'); UI.confetti(); afterAction(); UI.render(); }
  const lv = G.checkLove(s);
  if (lv) {
    if (lv.broke) { notify('💔', `<b>${esc(lv.broke)}</b> foi embora… o carinho acabou.`); UI.toast(`💔 ${lv.broke} foi embora… o carinho acabou.`, 'err'); }
    else if (lv.wedding) { notify('💒', 'Vocês se casaram! Felicidades!'); UI.toast('💒 Vocês se casaram! Felicidades! 🎉', 'gold'); UI.confetti(); }
    else if (lv.firstDate) UI.toast(`😊 O encontro foi ótimo! Vocês estão ficando.`, 'gold');
    else UI.toast('💕 Programa a dois concluído! Carinho aumentou.', 'ok');
    afterAction(); UI.render();
  }
  for (const r of G.compTick(s)) {
    const what = `${r.kind.icon} <b>${esc(r.c.name)} ${esc(r.p.model)}</b>`;
    if (r.version) { notify('🆕', `Nova versão lançada: ${what} (v${r.p.v}). As vendas voltaram a crescer!`); UI.toast(`🆕 Nova versão: ${what}!`, 'gold'); }
    else { notify('🚀', `Lançamento! ${what} (${r.kind.name}) já está à venda${SEGMENT[r.c.seg].cat ? ' e aparece em 💎 Bens → Marcas para todos os jogadores' : ''}.`); UI.toast(`🚀 Lançamento: ${what}!`, 'gold'); UI.confetti(); }
    afterAction(); UI.render(); pushCloud().catch(() => {});
  }
  const insPaid = G.insTick(s, mk);
  if (insPaid) { notify('🛡️', `Mensalidade dos seguros: <b>${money(insPaid)}</b>`); afterAction(); }
  for (const r of G.ccTick(s)) {
    if (r.paid) notify('💳', `Fatura do cartão de <b>${money(r.paid)}</b> paga automaticamente.`);
    else { notify('⚠️', `Faltou dinheiro para a fatura do cartão: <b class="down">${money(r.late)}</b> foi para o rotativo (com juros). Pague em Investir → Cartão.`); UI.toast('⚠️ Fatura sem saldo: parte foi para o rotativo!', 'err'); }
    afterAction();
  }
  for (const ev of G.eventTick(s, mk)) {
    if (typeof ev === 'string') { notify('📌', ev); UI.toast(ev, 'err'); }
    else if (ev.newEvent) { UI.toast(`📨 Nova oportunidade: <b>${s.event.title}</b>`, 'gold'); UI.onEvent(); }
    else if (ev.pay) { notify('💰', `${ev.label} rendeu <b class="up">+${money(ev.pay)}</b>!`); UI.toast(`💰 ${ev.label}: +${money(ev.pay)}!`, 'gold'); }
    else if (ev.fail) { notify('😢', `${ev.label === 'Seu amigo' ? 'Seu amigo não pagou o empréstimo' : ev.fail + ' não deu certo'}… o dinheiro foi perdido.`); UI.toast(`😢 ${ev.fail} não pagou…`, 'err'); }
  }
  const L = G.level(s);
  if (lastLevel && L > lastLevel) { UI.toast(`⭐ Subiu para o nível <b>${L}</b>! Renda +3%`, 'gold'); UI.confetti(); UI.render(); }
  lastLevel = L;
  UI.refresh();
}

function offlineProgress() {
  const s = ctx.s;
  const now = Date.now();
  const away = now - s.last;
  if (away < 1000) return;
  const cap = G.offlineHours(s) * 3600_000;
  const counted = Math.min(away, cap);
  const full = Math.min(counted, G.OFFLINE.fullMins * 60_000);
  const nw0 = G.netWorth(s, mk);
  // primeiros minutos: 100%; depois: metade (quem está jogando sempre rende mais)
  let left = counted;
  while (left > 0) {
    const done = counted - left;
    const d = Math.min(left, 60_000, done < full ? full - done : 60_000);
    G.accrue(s, mk, d, done < full ? 1 : G.OFFLINE.eff);
    left -= d;
  }
  const nw1 = G.netWorth(s, mk);
  s.last = now;
  mk.update(now);
  const renda = nw1 - nw0, mercado = G.netWorth(s, mk) - nw1;
  const h = away / 3600_000;
  if (away < 120_000) return; // ausências curtas: soma em silêncio
  UI.modal(`<div class="celebrate"><h3>👋 Bem-vindo de volta!</h3>
    <p>Você ficou fora por <b>${h >= 1 ? h.toFixed(1) + ' horas' : Math.round(away / 60000) + ' minutos'}</b>.</p>
    <div class="offgain ${renda >= 0 ? 'up' : 'down'}">${renda >= 0 ? '+' : ''}${money(renda)}</div>
    <p class="muted">Renda enquanto esteve fora${Math.abs(mercado) >= 1 ? ` · Mercado (ações e cripto): <b class="${mercado >= 0 ? 'up' : 'down'}">${mercado >= 0 ? '+' : ''}${money(mercado)}</b>` : ''}</p>
    <p class="muted small">⏳ Fora do jogo os primeiros ${G.OFFLINE.fullMins} min rendem 100% e o resto rende ${Math.round(G.OFFLINE.eff * 100)}%, por até <b>${G.offlineHours(s)}h</b>${away > cap ? ' (seu limite acabou antes de você voltar)' : ''}. Aumente o limite com cartões e moradia.</p>
    <button class="btn full" data-act="close">Continuar</button></div>`);
}

let started = false;
function start(s) {
  ctx.s = s;
  UI.init(ctx);
  started = true;
  lastLevel = G.level(s);
  offlineProgress();
  afterAction();
  watchFriends();
  watchPix();
  watchInvites();
  watchCompanies();
  // Celular: só carrega o módulo se o jogador tiver um (escuta apenas a lista de conversas)
  if (ctx.cloud && ctx.uid && G.hasPhone(s)) import('./phone.js').then((m) => { ctx.phone = m; m.setup(ctx); m.badge(); }).catch(() => {});
  if (!s.look) UI.openCreator();
  setInterval(tick, 250);
  setInterval(() => G.save(ctx.s), 5000);
  setInterval(UI.slowRefresh, 3000);
  setInterval(() => { if (Date.now() - lastPush > 120_000) pushCloud(true).catch(() => {}); }, 15_000);
  // Capacitor (app Android) avisa ao voltar do segundo plano
  document.addEventListener('resume', () => { offlineProgress(); UI.render(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { A.pause(); G.save(ctx.s); pushCloud(true).catch(() => {}); }
    else { A.resume(); offlineProgress(); UI.render(); checkUpdate(); }
  });
  checkUpdate();
  setInterval(checkUpdate, 10 * 60_000);
}

// ---------- atualização automática ----------
let loadedVersion = null;
async function checkUpdate() {
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
    const { v } = await r.json();
    if (loadedVersion === null) { loadedVersion = v; window.GAME_VERSION = v; return; }
    if (v !== loadedVersion && started) {
      G.save(ctx.s);
      await pushCloud(true).catch(() => {});
      UI.toast('🔄 Nova versão do jogo! Atualizando...', 'gold');
      setTimeout(() => location.reload(), 1500);
    }
  } catch (e) { /* sem internet */ }
}
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ---------- Modo sem conta (se o Firebase ainda não estiver configurado) ----------
function localOnboarding() {
  $('splash-box').innerHTML = `
    <div class="brand small"><div class="bcoin">🪙</div><h1>Magnata</h1></div>
    <div class="loginbox"><h3>Como você quer ser chamado?</h3>
    <input id="pname" maxlength="18" placeholder="Seu nome">
    <button class="btn full" id="startbtn">Começar minha jornada 🚀</button></div>`;
  $('pname').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('startbtn').click(); });
  $('startbtn').onclick = () => {
    const n = $('pname').value.trim().slice(0, 18);
    if (!n) return;
    const s = G.newState(n);
    G.save(s);
    hideSplash();
    start(s);
  };
}

// ---------- Boot ----------
async function boot() {
  document.addEventListener('pointerdown', () => A.unlock(), { passive: true });
  startRain();
  splashMsg('Carregando…');
  const t0 = Date.now();
  if (!Cloud.enabled) {
    await sleep(1500);
    const s = G.load();
    if (s) { hideSplash(); start(s); } else localOnboarding();
    return;
  }
  let user = null;
  try {
    await Cloud.init();
    user = await Cloud.withTimeout(Cloud.currentUser(), 8000);
  } catch (e) {
    // sem internet: se já jogou neste celular, joga offline e sincroniza depois
    const s = G.load();
    if (s && s.uid) { ctx.uid = null; await sleep(1200); hideSplash(); start(s); UI.toast('📡 Sem internet: jogando offline', ''); return; }
    splashMsg('Sem conexão. Conecte-se à internet e abra o jogo de novo.');
    return;
  }
  await sleep(Math.max(0, 1500 - (Date.now() - t0)));
  if (user) await enterGame(user);
  else loginScreen(G.load() ? 'login' : 'signup');
}
boot();
