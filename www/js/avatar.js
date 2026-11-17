// ===== Personagem desenhado em SVG (estilo cartoon, cabeça grande) =====
export const SKINS = ['#ffe0c7', '#f6c9a0', '#e8b07f', '#c98b5e', '#a26a42', '#7a4a2c', '#5a3520'];
export const HAIR_COLORS = ['#2b1a12', '#5a3418', '#8a5a2b', '#d9a441', '#f2d27a', '#b8441e', '#9aa0a8', '#f5f5f5', '#e85d9a', '#4a7bff', '#7a4dff', '#2bc46f'];
export const EYE_COLORS = ['#3b2414', '#6b4423', '#2a6b3c', '#2a5bab', '#6a6f78', '#111111'];
export const HAIRS = [
  { id: 'curto', name: 'Curto' }, { id: 'espetado', name: 'Espetado' }, { id: 'lateral', name: 'De lado' },
  { id: 'longo', name: 'Longo' }, { id: 'rabo', name: 'Rabo de cavalo' }, { id: 'coque', name: 'Coque' },
  { id: 'cacheado', name: 'Cacheado' }, { id: 'black', name: 'Black power' }, { id: 'moicano', name: 'Moicano' }, { id: 'careca', name: 'Careca' },
];

// Roupas e acessórios. slot: top | bottom | shoes | head | face | neck
// top: sleeve short|long|none, kind camiseta|camisa|moletom|terno|vestido|jaqueta|regata
export const CLOTHES = [
  // Partes de cima
  { id: 't_branca', slot: 'top', name: 'Camiseta Branca', kind: 'camiseta', sleeve: 'short', c: '#f4f4f4', cost: 0, style: 0 },
  { id: 't_azul', slot: 'top', name: 'Camiseta Azul', kind: 'camiseta', sleeve: 'short', c: '#4da3ff', cost: 40, style: 1 },
  { id: 't_listrada', slot: 'top', name: 'Camiseta Listrada', kind: 'camiseta', sleeve: 'short', c: '#ff6b6b', c2: '#ffffff', stripes: true, cost: 90, style: 2 },
  { id: 't_regata', slot: 'top', name: 'Regata Esportiva', kind: 'regata', sleeve: 'none', c: '#2bc46f', cost: 70, style: 1 },
  { id: 't_moletom', slot: 'top', name: 'Moletom Roxo', kind: 'moletom', sleeve: 'long', c: '#8f6bff', cost: 250, style: 4 },
  { id: 't_xadrez', slot: 'top', name: 'Camisa Xadrez', kind: 'camisa', sleeve: 'long', c: '#c0392b', c2: '#2c3e50', stripes: true, cost: 400, style: 5 },
  { id: 't_social', slot: 'top', name: 'Camisa Social', kind: 'camisa', sleeve: 'long', c: '#e8f1ff', cost: 900, style: 8 },
  { id: 't_jaqueta', slot: 'top', name: 'Jaqueta de Couro', kind: 'jaqueta', sleeve: 'long', c: '#2a2a2a', c2: '#f4f4f4', cost: 3500, style: 14 },
  { id: 't_vestido', slot: 'top', name: 'Vestido Floral', kind: 'vestido', sleeve: 'short', c: '#ff8fb8', cost: 1800, style: 12 },
  { id: 't_terno', slot: 'top', name: 'Terno Executivo', kind: 'terno', sleeve: 'long', c: '#2c3e66', c2: '#ffffff', tie: '#c0392b', cost: 12000, style: 30 },
  { id: 't_gala', slot: 'top', name: 'Vestido de Gala', kind: 'vestido', sleeve: 'none', c: '#b0124a', cost: 45000, style: 60, shine: true },
  { id: 't_smoking', slot: 'top', name: 'Smoking de Grife', kind: 'terno', sleeve: 'long', c: '#111111', c2: '#ffffff', tie: '#111111', bow: true, cost: 90000, style: 90 },
  { id: 't_dourado', slot: 'top', name: 'Blazer Dourado', kind: 'terno', sleeve: 'long', c: '#d4a017', c2: '#fff3c4', tie: '#6b3d00', cost: 1.5e6, style: 300, shine: true },
  { id: 't_diamante', slot: 'top', name: 'Vestido de Diamantes', kind: 'vestido', sleeve: 'none', c: '#bfefff', cost: 8e6, style: 800, shine: true },
  // Partes de baixo
  { id: 'b_jeans', slot: 'bottom', name: 'Calça Jeans', kind: 'calca', c: '#3b5998', cost: 0, style: 0 },
  { id: 'b_short', slot: 'bottom', name: 'Bermuda', kind: 'short', c: '#c9a46b', cost: 50, style: 1 },
  { id: 'b_moletom', slot: 'bottom', name: 'Calça de Moletom', kind: 'calca', c: '#555b6e', cost: 120, style: 2 },
  { id: 'b_saia', slot: 'bottom', name: 'Saia Rodada', kind: 'saia', c: '#ffc93c', cost: 300, style: 4 },
  { id: 'b_social', slot: 'bottom', name: 'Calça Social', kind: 'calca', c: '#2b2b38', cost: 800, style: 8 },
  { id: 'b_branca', slot: 'bottom', name: 'Calça Branca de Linho', kind: 'calca', c: '#f1ece2', cost: 6000, style: 20 },
  { id: 'b_saiacouro', slot: 'bottom', name: 'Saia de Couro', kind: 'saia', c: '#1d1d1d', cost: 9000, style: 24 },
  // Calçados
  { id: 's_tenis', slot: 'shoes', name: 'Tênis Simples', c: '#ffffff', cost: 0, style: 0 },
  { id: 's_chinelo', slot: 'shoes', name: 'Chinelo', c: '#2bc46f', cost: 20, style: 0 },
  { id: 's_botas', slot: 'shoes', name: 'Botas', c: '#6b3d1e', cost: 500, style: 4 },
  { id: 's_social', slot: 'shoes', name: 'Sapato Social', c: '#1a1a1a', cost: 1500, style: 8 },
  { id: 's_salto', slot: 'shoes', name: 'Salto Alto Vermelho', c: '#d0103a', cost: 4000, style: 14 },
  { id: 's_ouro', slot: 'shoes', name: 'Tênis de Ouro', c: '#ffc93c', cost: 300000, style: 120, shine: true },
  // Cabeça
  { id: 'h_bone', slot: 'head', name: 'Boné', kind: 'bone', c: '#ff5d73', cost: 60, style: 1 },
  { id: 'h_gorro', slot: 'head', name: 'Gorro', kind: 'gorro', c: '#4da3ff', cost: 90, style: 2 },
  { id: 'h_laco', slot: 'head', name: 'Laço', kind: 'laco', c: '#ff5d9a', cost: 80, style: 2 },
  { id: 'h_chapeu', slot: 'head', name: 'Chapéu Panamá', kind: 'chapeu', c: '#efe0b9', cost: 2500, style: 12 },
  { id: 'h_cartola', slot: 'head', name: 'Cartola', kind: 'cartola', c: '#151515', cost: 20000, style: 35 },
  { id: 'h_tiara', slot: 'head', name: 'Tiara de Brilhantes', kind: 'tiara', c: '#cfe9ff', cost: 250000, style: 100, shine: true },
  { id: 'h_coroa', slot: 'head', name: 'Coroa de Ouro', kind: 'coroa', c: '#ffc93c', cost: 5e7, style: 1500, shine: true },
  // Rosto
  { id: 'f_oculos', slot: 'face', name: 'Óculos de Grau', kind: 'grau', c: '#222222', cost: 150, style: 2 },
  { id: 'f_sol', slot: 'face', name: 'Óculos de Sol', kind: 'sol', c: '#111111', cost: 400, style: 5 },
  { id: 'f_grife', slot: 'face', name: 'Óculos de Grife', kind: 'sol', c: '#7a2bff', cost: 15000, style: 25 },
  { id: 'f_barba', slot: 'face', name: 'Barba Bem Feita', kind: 'barba', c: null, cost: 100, style: 2 },
  // Pescoço
  { id: 'n_corrente', slot: 'neck', name: 'Correntinha', kind: 'corrente', c: '#c0c0c0', cost: 300, style: 3 },
  { id: 'n_colar', slot: 'neck', name: 'Colar de Pérolas', kind: 'perolas', c: '#fffaf0', cost: 7000, style: 18 },
  { id: 'n_ouro', slot: 'neck', name: 'Cordão de Ouro', kind: 'corrente', c: '#ffc93c', cost: 60000, style: 50, shine: true },
  { id: 'n_diamante', slot: 'neck', name: 'Colar de Diamante', kind: 'pingente', c: '#bfefff', cost: 2e6, style: 400, shine: true },
];
export const CLOTH = Object.fromEntries(CLOTHES.map((c) => [c.id, c]));
export const SLOTS = [
  { id: 'top', name: 'Roupas', icon: '👕' }, { id: 'bottom', name: 'Calças e saias', icon: '👖' }, { id: 'shoes', name: 'Calçados', icon: '👟' },
  { id: 'head', name: 'Cabeça', icon: '🧢' }, { id: 'face', name: 'Rosto', icon: '🕶️' }, { id: 'neck', name: 'Joias', icon: '📿' },
];

export function defaultLook(sex = 'm') {
  return {
    sex, skin: 1, hair: sex === 'f' ? 'longo' : 'curto', hairColor: 1, eyes: 0,
    top: 't_branca', bottom: 'b_jeans', shoes: 's_tenis', head: null, face: null, neck: null,
  };
}

const shade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, Math.round(((n >> 16) & 255) * f)));
  const g = Math.min(255, Math.max(0, Math.round(((n >> 8) & 255) * f)));
  const b = Math.min(255, Math.max(0, Math.round((n & 255) * f)));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
};

function hairBack(id, c) {
  switch (id) {
    case 'longo': return `<path d="M46,92 C40,30 160,30 154,92 L162,190 C134,204 66,204 38,190 Z" fill="${c}"/>`;
    case 'rabo': return `<ellipse cx="156" cy="118" rx="15" ry="36" fill="${c}" transform="rotate(-18 156 118)"/><circle cx="149" cy="80" r="9" fill="${shade(c, 0.8)}"/>`;
    case 'coque': return `<circle cx="100" cy="38" r="22" fill="${c}"/>`;
    case 'black': return `<circle cx="100" cy="80" r="70" fill="${c}"/>`;
    case 'cacheado': return [[52, 70], [148, 70], [44, 100], [156, 100], [48, 128], [152, 128]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17" fill="${c}"/>`).join('');
    default: return '';
  }
}
function hairFront(id, c) {
  const cap = `M47,98 C42,40 158,40 153,98 C146,72 120,62 100,64 C80,62 54,72 47,98 Z`;
  switch (id) {
    case 'curto': return `<path d="${cap}" fill="${c}"/>`;
    case 'espetado': return `<path d="M47,96 L50,56 L64,64 L70,36 L86,54 L100,28 L114,54 L130,36 L136,64 L150,56 L153,96 C146,72 120,64 100,66 C80,64 54,72 47,96 Z" fill="${c}"/>`;
    case 'lateral': return `<path d="M47,100 C40,38 160,36 153,96 C150,80 140,66 120,62 C110,76 80,84 56,82 C52,88 49,94 47,100 Z" fill="${c}"/>`;
    case 'longo': return `<path d="M47,104 C40,38 160,38 153,104 C148,80 132,64 110,62 C96,76 70,80 52,78 C50,86 48,94 47,104 Z" fill="${c}"/>`;
    case 'rabo': case 'coque': return `<path d="M47,96 C42,40 158,40 153,96 C146,70 120,58 100,58 C80,58 54,70 47,96 Z" fill="${c}"/>`;
    case 'cacheado': return `<path d="${cap}" fill="${c}"/>` + [[60, 52], [80, 42], [100, 38], [120, 42], [140, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="${c}"/>`).join('');
    case 'black': return `<path d="M50,94 C48,60 152,60 150,94 C140,74 60,74 50,94 Z" fill="${c}"/>`;
    case 'moicano': return `<path d="M86,70 C84,40 90,22 100,18 C110,22 116,40 114,70 C108,64 92,64 86,70 Z" fill="${c}"/>`;
    default: return '';
  }
}
function headwear(it) {
  if (!it) return '';
  const c = it.c;
  switch (it.kind) {
    case 'bone': return `<path d="M48,80 C48,36 152,36 152,80 Z" fill="${c}"/><path d="M48,80 L18,86 C20,78 34,74 52,74 Z" fill="${shade(c, 0.8)}"/><circle cx="100" cy="40" r="5" fill="${shade(c, 0.7)}"/>`;
    case 'gorro': return `<path d="M46,84 C44,30 156,30 154,84 Z" fill="${c}"/><rect x="42" y="76" width="116" height="16" rx="8" fill="${shade(c, 0.8)}"/><circle cx="100" cy="30" r="12" fill="#fff"/>`;
    case 'laco': return `<path d="M122,50 L104,40 L106,62 Z M122,50 L140,40 L138,62 Z" fill="${c}"/><circle cx="122" cy="51" r="6" fill="${shade(c, 0.8)}"/>`;
    case 'chapeu': return `<ellipse cx="100" cy="60" rx="78" ry="13" fill="${c}"/><path d="M62,60 C62,22 138,22 138,60 Z" fill="${c}"/><rect x="63" y="46" width="74" height="9" fill="#3a2a1a"/>`;
    case 'cartola': return `<ellipse cx="100" cy="56" rx="64" ry="11" fill="${c}"/><rect x="70" y="-6" width="60" height="62" rx="6" fill="${c}"/><rect x="70" y="38" width="60" height="9" fill="#b0124a"/>`;
    case 'tiara': return `<path d="M58,62 Q100,40 142,62" stroke="#d9e8f5" stroke-width="5" fill="none"/>${[70, 85, 100, 115, 130].map((x, i) => `<path d="M${x},${55 - (i === 2 ? 14 : 8)} l5,9 l-5,4 l-5,-4 Z" fill="${c}" stroke="#fff" stroke-width="1"/>`).join('')}`;
    case 'coroa': return `<path d="M60,62 L60,26 L78,44 L100,16 L122,44 L140,26 L140,62 Z" fill="${c}" stroke="#c98a00" stroke-width="3"/><circle cx="100" cy="46" r="6" fill="#ff3b6b"/><circle cx="76" cy="52" r="4" fill="#4da3ff"/><circle cx="124" cy="52" r="4" fill="#2bc46f"/>`;
  }
  return '';
}
function faceAcc(it, skin) {
  if (!it) return '';
  switch (it.kind) {
    case 'grau': return `<g fill="none" stroke="${it.c}" stroke-width="3.5"><circle cx="80" cy="100" r="14"/><circle cx="120" cy="100" r="14"/><path d="M94,100 L106,100"/></g>`;
    case 'sol': return `<g><path d="M62,92 h34 v8 c0,12 -6,16 -17,16 c-11,0 -17,-4 -17,-16 Z M104,92 h34 v8 c0,12 -6,16 -17,16 c-11,0 -17,-4 -17,-16 Z" fill="${it.c}"/><path d="M96,96 h8" stroke="${it.c}" stroke-width="4"/><path d="M68,97 l8,0" stroke="#ffffff66" stroke-width="3"/></g>`;
    case 'barba': return `<path d="M56,108 C60,146 140,146 144,108 C136,128 118,134 100,134 C82,134 64,128 56,108 Z" fill="${shade(SKINS[skin] ? '#3a2414' : '#3a2414', 1)}" opacity=".85"/>`;
  }
  return '';
}
function neckAcc(it) {
  if (!it) return '';
  switch (it.kind) {
    case 'corrente': return `<path d="M82,152 Q100,176 118,152" stroke="${it.c}" stroke-width="4" fill="none"/>`;
    case 'perolas': return [0, 1, 2, 3, 4, 5, 6].map((i) => { const t = i / 6; const x = 80 + 40 * t; const y = 152 + Math.sin(t * Math.PI) * 20; return `<circle cx="${x}" cy="${y}" r="4.5" fill="${it.c}" stroke="#e6dccb"/>`; }).join('');
    case 'pingente': return `<path d="M82,152 Q100,172 118,152" stroke="#e6eef5" stroke-width="3" fill="none"/><path d="M100,166 l9,9 l-9,12 l-9,-12 Z" fill="${it.c}" stroke="#fff" stroke-width="2"/>`;
  }
  return '';
}

// Desenha o personagem. opts: { size, pose }
export function avatarSVG(look, opts = {}) {
  const L = { ...defaultLook(), ...(look || {}) };
  const skin = SKINS[L.skin] || SKINS[1];
  const hair = HAIR_COLORS[L.hairColor] || HAIR_COLORS[0];
  const eye = EYE_COLORS[L.eyes] || EYE_COLORS[0];
  const top = CLOTH[L.top] || CLOTH.t_branca;
  const bot = CLOTH[L.bottom] || CLOTH.b_jeans;
  const shoe = CLOTH[L.shoes] || CLOTH.s_tenis;
  const dress = top.kind === 'vestido';
  const f = L.sex === 'f';
  const tc = top.c, td = shade(tc, 0.82);
  const id = 'a' + Math.random().toString(36).slice(2, 7);

  // pernas
  let legs = '';
  const legSkin = `<rect x="76" y="212" width="20" height="54" rx="9" fill="${skin}"/><rect x="104" y="212" width="20" height="54" rx="9" fill="${skin}"/>`;
  if (dress) legs = legSkin;
  else if (bot.kind === 'calca') legs = `<rect x="74" y="206" width="24" height="62" rx="10" fill="${bot.c}"/><rect x="102" y="206" width="24" height="62" rx="10" fill="${bot.c}"/>`;
  else if (bot.kind === 'short') legs = legSkin + `<path d="M70,204 h60 v30 h-28 l-2,-12 l-2,12 h-28 Z" fill="${bot.c}"/>`;
  else if (bot.kind === 'saia') legs = legSkin + `<path d="M72,202 h56 l14,40 h-84 Z" fill="${bot.c}"/>`;
  const shoes = `<ellipse cx="84" cy="270" rx="17" ry="9" fill="${shoe.c}" stroke="${shade(shoe.c, 0.75)}" stroke-width="2"/><ellipse cx="116" cy="270" rx="17" ry="9" fill="${shoe.c}" stroke="${shade(shoe.c, 0.75)}" stroke-width="2"/>`;

  // braços
  const armColor = top.sleeve === 'long' ? tc : skin;
  const sleeveCap = top.sleeve === 'short' ? `<rect x="46" y="150" width="22" height="24" rx="10" fill="${tc}"/><rect x="132" y="150" width="22" height="24" rx="10" fill="${tc}"/>` : '';
  const arms = `<rect x="46" y="150" width="22" height="64" rx="11" fill="${armColor}"/><rect x="132" y="150" width="22" height="64" rx="11" fill="${armColor}"/>${sleeveCap}<circle cx="57" cy="216" r="10" fill="${skin}"/><circle cx="143" cy="216" r="10" fill="${skin}"/>`;

  // tronco
  let torso;
  if (dress) torso = `<path d="M66,146 C66,140 134,140 134,146 L136,196 L156,252 C130,262 70,262 44,252 L64,196 Z" fill="${tc}"/><path d="M64,196 h72" stroke="${td}" stroke-width="5"/>`;
  else torso = `<rect x="64" y="142" width="72" height="72" rx="20" fill="${tc}"/>`;
  let detail = '';
  if (top.stripes) detail += `<g clip-path="url(#${id}t)">${[156, 172, 188, 204].map((y) => `<rect x="60" y="${y}" width="80" height="7" fill="${top.c2}" opacity=".9"/>`).join('')}</g>`;
  if (top.kind === 'camisa') detail += `<path d="M86,142 L100,160 L114,142" fill="${shade(tc, 0.9)}" stroke="${td}" stroke-width="2"/>${[168, 182, 196].map((y) => `<circle cx="100" cy="${y}" r="2.5" fill="${td}"/>`).join('')}`;
  if (top.kind === 'moletom') detail += `<path d="M78,190 h44 v16 h-44 Z" fill="${td}" rx="6"/><path d="M90,146 l2,18 M110,146 l-2,18" stroke="#fff" stroke-width="3"/>`;
  if (top.kind === 'terno' || top.kind === 'jaqueta') {
    const shirt = top.c2 || '#fff';
    detail += `<path d="M86,142 L100,176 L114,142 Z" fill="${shirt}"/>`;
    if (top.bow) detail += `<path d="M90,150 l10,5 l10,-5 l0,10 l-10,-5 l-10,5 Z" fill="${top.tie}"/>`;
    else if (top.tie) detail += `<path d="M96,148 h8 l3,6 l-5,24 l-2,3 l-2,-3 l-5,-24 Z" fill="${top.tie}"/>`;
    detail += `<path d="M86,142 L100,176 L92,214 M114,142 L100,176 L108,214" stroke="${td}" stroke-width="3" fill="none"/>`;
  }
  if (top.kind === 'regata') detail += `<path d="M76,142 v-4 M124,142 v-4" stroke="${tc}" stroke-width="8"/>`;
  const shine = top.shine ? `<path d="M74,158 l6,-6 M122,196 l6,-6" stroke="#ffffffcc" stroke-width="4" stroke-linecap="round"/>` : '';

  // rosto
  const lashes = f ? `<path d="M67,92 l-6,-5 M71,88 l-4,-7 M133,92 l6,-5 M129,88 l4,-7" stroke="#2b1a12" stroke-width="2.5" stroke-linecap="round"/>` : '';
  const brows = `<path d="M70,82 q10,-6 20,0 M110,82 q10,-6 20,0" stroke="${shade(hair, 0.9)}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const eyes = `<ellipse cx="80" cy="100" rx="8" ry="10" fill="${eye}"/><ellipse cx="120" cy="100" rx="8" ry="10" fill="${eye}"/><circle cx="83" cy="96" r="3" fill="#fff"/><circle cx="123" cy="96" r="3" fill="#fff"/>`;
  const mouth = `<path d="M88,122 Q100,134 112,122" stroke="#7a2e2e" stroke-width="4" fill="${f ? '#e2556f' : 'none'}" stroke-linecap="round"/>`;
  const blush = `<ellipse cx="66" cy="116" rx="9" ry="5" fill="#ff8a8a" opacity=".45"/><ellipse cx="134" cy="116" rx="9" ry="5" fill="#ff8a8a" opacity=".45"/>`;
  const ears = `<circle cx="50" cy="104" r="10" fill="${skin}"/><circle cx="150" cy="104" r="10" fill="${skin}"/>`;
  const earrings = f && !L.neck ? '' : '';

  const headIt = CLOTH[L.head];
  const hideFrontHair = headIt && ['bone', 'gorro', 'cartola'].includes(headIt.kind) && L.hair !== 'black';
  const size = opts.size || 160;
  return `<svg class="avatar" viewBox="0 -10 200 295" width="${size * 200 / 295}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="${id}t"><rect x="64" y="142" width="72" height="72" rx="20"/></clipPath></defs>
    <ellipse cx="100" cy="276" rx="56" ry="9" fill="#0003"/>
    ${hairBack(L.hair, hair)}
    ${legs}${shoes}${arms}${torso}${detail}${shine}${neckAcc(CLOTH[L.neck])}
    <rect x="88" y="132" width="24" height="16" fill="${shade(skin, 0.92)}"/>
    ${ears}<circle cx="100" cy="98" r="52" fill="${skin}"/>
    ${blush}${brows}${eyes}${lashes}${mouth}${earrings}
    ${hideFrontHair ? '' : hairFront(L.hair, hair)}
    ${faceAcc(CLOTH[L.face], L.skin)}
    ${headwear(headIt)}
  </svg>`;
}

// Visual aleatório (para parceiros)
export function randomLook(sex) {
  const r = (a) => a[Math.floor(Math.random() * a.length)];
  const tops = CLOTHES.filter((c) => c.slot === 'top' && c.cost < 5000 && (sex === 'f' || c.kind !== 'vestido'));
  const bots = CLOTHES.filter((c) => c.slot === 'bottom' && c.cost < 5000 && (sex === 'f' || c.kind !== 'saia'));
  return {
    sex, skin: Math.floor(Math.random() * SKINS.length),
    hair: r(sex === 'f' ? ['longo', 'rabo', 'coque', 'cacheado', 'black', 'lateral'] : ['curto', 'espetado', 'lateral', 'cacheado', 'black', 'moicano', 'careca']),
    hairColor: Math.floor(Math.random() * 7), eyes: Math.floor(Math.random() * EYE_COLORS.length),
    top: r(tops).id, bottom: r(bots).id, shoes: r(['s_tenis', 's_botas', 's_social', sex === 'f' ? 's_salto' : 's_chinelo']),
    head: Math.random() < 0.2 ? r(['h_bone', 'h_laco', 'h_chapeu']) : null, face: Math.random() < 0.25 ? r(['f_oculos', 'f_sol']) : null, neck: null,
  };
}
