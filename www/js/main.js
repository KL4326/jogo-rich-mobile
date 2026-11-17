// ===== Inicialização e loop principal =====
import * as G from './game.js';
import { Market } from './market.js';
import * as UI from './ui.js';
import { money } from './ui.js';

const mk = new Market();
let s = G.load();
const ctx = { s, mk, afterAction };

function afterAction() {
  const nw = G.netWorth(ctx.s, mk);
  const newCard = G.checkCard(ctx.s, nw);
  const lvlBefore = G.level(ctx.s);
  const achs = G.checkAchievements(ctx.s);
  achs.forEach((a, i) => setTimeout(() => UI.toast(`🎖️ Conquista: <b>${a.name}</b>`, 'gold'), 400 * i));
  if (newCard) cardModal(newCard);
  G.save(ctx.s);
  if (G.level(ctx.s) > lvlBefore || achs.length || newCard) UI.render();
}

function cardModal(c) {
  UI.modal(`<div class="celebrate"><h3>🎉 Novo cartão desbloqueado!</h3>
    <div class="ccard ${c.cls} pop"><div class="cc-top"><span class="cc-bank">MAGNATA BANK</span><span class="cc-tier">${c.name.toUpperCase()}</span></div><div class="chip"></div><div class="cc-num">•••• •••• •••• ••••</div><div class="cc-bottom"><span>${ctx.s.name.toUpperCase()}</span><span>${money(c.min)}+</span></div></div>
    <p>Cashback de <b>${Math.round(c.cashback * 100)}%</b> · Limite de <b>${money(c.limit)}</b> · <b>${c.hours}h</b> de renda offline</p>
    <button class="btn full" data-act="close">Show! 😎</button></div>`);
}

let lastLevel = 0;
function tick() {
  const now = Date.now();
  const dt = Math.min(now - ctx.s.last, 5000);
  ctx.s.last = now;
  if (dt > 0) G.accrue(ctx.s, mk, dt);
  if (mk.update(now)) UI.onMarketTick();
  const done = G.checkCourse(ctx.s);
  if (done) { UI.toast(`🎓 Você concluiu: <b>${done.name}</b>!`, 'gold'); afterAction(); UI.render(); }
  const L = G.level(ctx.s);
  if (lastLevel && L > lastLevel) { UI.toast(`⭐ Subiu para o nível <b>${L}</b>! Renda +3%`, 'gold'); UI.render(); }
  lastLevel = L;
  UI.refresh();
}

function offlineProgress() {
  const now = Date.now();
  const away = now - ctx.s.last;
  if (away < 30_000) return;
  const cap = G.offlineHours(ctx.s) * 3600_000;
  const eff = Math.min(away, cap);
  const before = G.netWorth(ctx.s, mk);
  // aplica em pedaços de 1 min para os juros comporem
  let left = eff;
  while (left > 0) { const d = Math.min(left, 60_000); G.accrue(ctx.s, mk, d); left -= d; }
  ctx.s.last = now;
  const gain = G.netWorth(ctx.s, mk) - before;
  const h = (away / 3600_000);
  UI.modal(`<div class="celebrate"><h3>👋 Bem-vindo de volta!</h3>
    <p>Você ficou fora por <b>${h >= 1 ? h.toFixed(1) + ' horas' : Math.round(away / 60000) + ' minutos'}</b>.</p>
    <div class="offgain ${gain >= 0 ? 'up' : 'down'}">${gain >= 0 ? '+' : ''}${money(gain)}</div>
    <p class="muted">Variação do patrimônio (renda + mercado). ${away > cap ? `Sua renda offline está limitada a ${G.offlineHours(ctx.s)}h — melhore com cartões e moradia.` : ''}</p>
    <button class="btn full" data-act="close">Continuar</button></div>`);
}

function start() {
  ctx.s = s;
  UI.init(ctx);
  lastLevel = G.level(s);
  offlineProgress();
  afterAction();
  setInterval(tick, 250);
  setInterval(() => G.save(ctx.s), 5000);
  setInterval(UI.slowRefresh, 3000);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) G.save(ctx.s);
    else { mk.update(); offlineProgress(); UI.render(); }
  });
}

function onboarding() {
  document.getElementById('modal-root').innerHTML = `<div class="backdrop"></div><div class="sheet welcome">
    <div class="logo">💰</div><h2>Magnata</h2><p class="muted">Do zero ao bilhão — sem ficar tocando na tela.</p>
    <p>Você começa com <b>R$ 1.500</b> e um emprego de entregador. Estude, abra empresas, invista nos setores certos e compre seus bens. Quanto mais inteligente, mais rápido você cresce.</p>
    <label class="lbl">Como você quer ser chamado?</label>
    <input id="pname" maxlength="18" placeholder="Seu nome">
    <button class="btn full" id="startbtn">Começar minha jornada 🚀</button></div>`;
  document.getElementById('modal-root').classList.add('open');
  document.getElementById('startbtn').onclick = () => {
    const n = document.getElementById('pname').value.trim().slice(0, 18);
    if (!n) return;
    s = G.newState(n);
    G.save(s);
    UI.closeModal();
    start();
    UI.openHelp();
  };
}

if (s) start(); else onboarding();
