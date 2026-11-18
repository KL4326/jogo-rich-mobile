// ===== Som: música de fundo e efeitos gerados na hora (Web Audio, sem arquivos) =====
const KEY = 'magnata_audio';
let cfg = { music: true, sfx: true, mvol: 0.5, svol: 0.7 };
try { Object.assign(cfg, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { }
const saveCfg = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) { } };

let ctx = null, master, musicBus, sfxBus, noiseBuf;
export const settings = () => ({ ...cfg });

function init() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  musicBus = ctx.createGain(); musicBus.connect(master);
  sfxBus = ctx.createGain(); sfxBus.connect(master);
  applyVolumes();
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return true;
}
function applyVolumes() {
  if (!ctx) return;
  musicBus.gain.value = cfg.music ? cfg.mvol * 0.55 : 0;
  sfxBus.gain.value = cfg.sfx ? cfg.svol : 0;
}

// Precisa de um toque do jogador para liberar o áudio (regra dos navegadores)
export function unlock() {
  if (!init()) return;
  if (ctx.state === 'suspended') ctx.resume();
  if (cfg.music) startMusic();
}
export function pause() { if (ctx && ctx.state === 'running') ctx.suspend(); }
export function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

export function setMusic(on) { cfg.music = on; saveCfg(); applyVolumes(); if (on) unlock(); }
export function setSfx(on) { cfg.sfx = on; saveCfg(); applyVolumes(); }
export function setVol(kind, v) { cfg[kind] = v; saveCfg(); applyVolumes(); }

// ---------- efeitos ----------
function tone(freq, start, dur, { type = 'square', gain = 0.08, to = null, bus = sfxBus, attack = 0.005 } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (to) o.frequency.exponentialRampToValueAtTime(to, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g); g.connect(bus);
  o.start(start); o.stop(start + dur + 0.02);
}
function noise(start, dur, { gain = 0.05, hp = 6000, bus = sfxBus } = {}) {
  const src = ctx.createBufferSource(); src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, start); g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(f); f.connect(g); g.connect(bus);
  src.start(start); src.stop(start + dur + 0.02);
}
const N = (n) => 440 * Math.pow(2, (n - 69) / 12); // nota MIDI -> Hz

const SFX = {
  click: (t) => tone(1100, t, 0.045, { gain: 0.035, to: 700 }),
  coin: (t) => { tone(988, t, 0.08, { gain: 0.07 }); tone(1319, t + 0.07, 0.28, { gain: 0.07 }); },
  cash: (t) => { noise(t, 0.06, { gain: 0.06 }); tone(1568, t + 0.03, 0.12, { type: 'triangle', gain: 0.08 }); tone(2093, t + 0.1, 0.3, { type: 'triangle', gain: 0.08 }); },
  error: (t) => { tone(220, t, 0.12, { type: 'sawtooth', gain: 0.05, to: 150 }); tone(165, t + 0.12, 0.18, { type: 'sawtooth', gain: 0.05, to: 110 }); },
  notify: (t) => { tone(N(76), t, 0.14, { type: 'triangle', gain: 0.09 }); tone(N(81), t + 0.12, 0.3, { type: 'triangle', gain: 0.09 }); },
  fanfare: (t) => { [72, 76, 79, 84].forEach((n, i) => tone(N(n), t + i * 0.09, i === 3 ? 0.45 : 0.12, { type: 'triangle', gain: 0.09 })); tone(N(88), t + 0.36, 0.4, { type: 'sine', gain: 0.04 }); },
  tick: (t) => tone(2200, t, 0.018, { gain: 0.025 }),
  win: (t) => { [72, 76, 79, 84, 88].forEach((n, i) => tone(N(n), t + i * 0.07, 0.18, { type: 'square', gain: 0.05 })); noise(t + 0.35, 0.25, { gain: 0.03, hp: 8000 }); },
  lose: (t) => tone(392, t, 0.45, { type: 'triangle', gain: 0.07, to: 160 }),
  love: (t) => { tone(N(79), t, 0.15, { type: 'sine', gain: 0.08 }); tone(N(84), t + 0.13, 0.35, { type: 'sine', gain: 0.08 }); },
};
export function sfx(name) {
  if (!cfg.sfx || !ctx || ctx.state !== 'running') return;
  const f = SFX[name];
  if (f) f(ctx.currentTime + 0.01);
}

// ---------- música (sequenciador simples: I–vi–IV–V em Dó maior, ~96 bpm) ----------
const BPM = 96, STEP = 60 / BPM / 2; // colcheias
const CHORDS = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]]; // C, Am, F, G
const SCALE = [60, 62, 64, 67, 69, 72, 74, 76, 79]; // pentatônica
let playing = false, nextTime = 0, step = 0, timer = null, phrase = [];
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
function newPhrase() {
  // 32 colcheias (4 compassos); notas da escala ou pausa, com tendência a passos curtos
  const out = []; let idx = 4;
  for (let i = 0; i < 32; i++) {
    if (rnd() < 0.42) { out.push(null); continue; }
    idx = Math.max(0, Math.min(SCALE.length - 1, idx + Math.round((rnd() - 0.5) * 4)));
    out.push(SCALE[idx]);
  }
  out[31] = null;
  return out;
}
function schedule(t, i) {
  const bar = Math.floor(i / 8) % 4, beat = i % 8;
  const ch = CHORDS[bar];
  if (beat === 0) ch.forEach((n) => tone(N(n + 12), t, STEP * 7.5, { type: 'triangle', gain: 0.022, bus: musicBus, attack: 0.08 }));
  if (beat === 0 || beat === 4) { tone(N(ch[0] - 12), t, STEP * 3.5, { type: 'sine', gain: 0.09, bus: musicBus, attack: 0.01 }); tone(140, t, 0.12, { type: 'sine', gain: 0.07, to: 50, bus: musicBus }); }
  if (beat % 2 === 1) noise(t, 0.04, { gain: 0.012, hp: 7000, bus: musicBus });
  if (beat === 2 || beat === 6) noise(t, 0.09, { gain: 0.018, hp: 2500, bus: musicBus });
  const m = phrase[i % 32];
  if (m) tone(N(m), t, STEP * 1.6, { type: 'square', gain: 0.018, bus: musicBus, attack: 0.01 });
}
function loop() {
  while (nextTime < ctx.currentTime + 0.15) {
    if (step % 32 === 0) phrase = (step / 32) % 2 === 1 ? phrase : newPhrase(); // repete cada frase 2x
    schedule(nextTime, step);
    nextTime += STEP; step++;
  }
}
function startMusic() {
  if (playing || !ctx) return;
  playing = true;
  nextTime = ctx.currentTime + 0.1;
  timer = setInterval(loop, 40);
}
