// ===== Construções desenhadas para os negócios (cidade no horizonte da cena) =====
const TYPE = {
  pastel: ['barraca', '#e8384f'], sorvete: ['carrinho', '#ff8fbf'], lavajato: ['loja', '#4da3ff'], barbearia: ['loja', '#e8384f'],
  lanchonete: ['loja', '#ffc93c'], petshop: ['loja', '#2bc46f'], roupas: ['loja', '#ff6bb5'], oficina: ['loja', '#7d8594'],
  academia: ['predio', '#ff8a3c'], clinica: ['predio', '#f4f6fa'], restaurante: ['loja', '#8e1b3e'], hotel: ['predio', '#d9b26f'],
  startup: ['torre', '#5ec8ff'], fabrica: ['fabrica', '#c2654a'], mercado: ['loja', '#2bc46f'], aerea: ['predio', '#4da3ff'],
  construtora: ['guindaste', '#ffc93c'], hospital: ['predio', '#f4f6fa'], banco: ['banco', '#e9e2cf'], petroleo: ['fabrica', '#5a5a66'],
  energia: ['solar', '#2a5bab'], streaming: ['torre', '#8f6bff'], espacial: ['foguete', '#f4f6fa'],
};
const sign = (x, y, icon, w = 22) => `<rect x="${x - w / 2}" y="${y - 9}" width="${w}" height="18" rx="5" fill="#fff" stroke="#0002"/><text x="${x}" y="${y + 5}" font-size="13" text-anchor="middle">${icon}</text>`;
const stripes = (x, y, w, h, c, n = 5) => Array.from({ length: n }, (_, i) => `<rect x="${x + (w / n) * i}" y="${y}" width="${w / n}" height="${h}" fill="${i % 2 ? '#fff' : c}"/>`).join('') + Array.from({ length: n }, (_, i) => `<path d="M${x + (w / n) * i},${y + h} q${w / n / 2},${h * 0.7} ${w / n},0" fill="${i % 2 ? '#fff' : c}"/>`).join('');
const windows = (x, y, cols, rows, w, h, gx, gy, c = '#bfe6ff') => { let o = ''; for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) o += `<rect x="${x + k * gx}" y="${y + r * gy}" width="${w}" height="${h}" rx="1.5" fill="${c}"/>`; return o; };

function draw(type, c, icon) {
  switch (type) {
    case 'barraca': return { w: 56, h: 58, svg: `<rect x="6" y="30" width="44" height="26" rx="2" fill="#d9a066"/><rect x="6" y="30" width="44" height="6" fill="#b37a45"/><path d="M10,16 v16 M46,16 v16" stroke="#8a5a2b" stroke-width="3"/>${stripes(2, 8, 52, 10, c, 6)}${sign(28, 44, icon)}` };
    case 'carrinho': return { w: 52, h: 58, svg: `<path d="M26,4 L4,18 L48,18 Z" fill="${c}"/><path d="M26,4 L15,18 M26,4 L37,18" stroke="#fff" stroke-width="3"/><path d="M26,18 v14" stroke="#8a8a8a" stroke-width="3"/><rect x="6" y="30" width="40" height="18" rx="4" fill="#fff" stroke="${c}" stroke-width="3"/><circle cx="14" cy="52" r="5" fill="#444"/><circle cx="38" cy="52" r="5" fill="#444"/>${sign(26, 39, icon)}` };
    case 'loja': return { w: 62, h: 64, svg: `<rect x="4" y="12" width="54" height="50" rx="3" fill="${c}"/><rect x="4" y="8" width="54" height="8" rx="2" fill="#0003"/>${sign(31, 20, icon, 26)}${stripes(2, 30, 58, 7, c === '#f4f6fa' ? '#4da3ff' : '#ffffff', 6).replace(/fill="#fff"/g, `fill="${c}"`)}<rect x="10" y="44" width="18" height="14" rx="2" fill="#bfe6ff"/><rect x="36" y="42" width="14" height="20" rx="2" fill="#6b3d1e"/>` };
    case 'predio': return { w: 54, h: 96, svg: `<rect x="4" y="14" width="46" height="82" rx="3" fill="${c}" stroke="#0002"/>${windows(10, 34, 3, 5, 8, 8, 13, 12)}<rect x="20" y="84" width="14" height="12" fill="#6b3d1e"/>${sign(27, 22, icon, 28)}` };
    case 'torre': return { w: 44, h: 128, svg: `<path d="M22,0 v14" stroke="#9aa0a8" stroke-width="3"/><circle cx="22" cy="2" r="3" fill="#ff5d73"/><rect x="4" y="14" width="36" height="114" rx="3" fill="${c}"/>${windows(9, 36, 2, 7, 11, 8, 15, 12, '#ffffffaa')}${sign(22, 24, icon, 26)}` };
    case 'banco': return { w: 66, h: 66, svg: `<path d="M33,4 L2,22 H64 Z" fill="${c}" stroke="#b9a984" stroke-width="2"/><rect x="6" y="24" width="54" height="8" fill="${c}"/>${[10, 22, 34, 46].map((x) => `<rect x="${x}" y="32" width="8" height="26" fill="#fff" stroke="#d6cdb5"/>`).join('')}<rect x="2" y="58" width="62" height="8" fill="${c}"/>${sign(33, 16, icon, 22)}` };
    case 'fabrica': return { w: 76, h: 78, svg: `<rect x="50" y="6" width="12" height="40" fill="#7d6a64"/><circle cx="58" cy="0" r="7" fill="#ffffffaa"/><circle cx="66" cy="-6" r="5" fill="#ffffff88"/><path d="M4,40 L22,28 V40 L40,28 V40 L58,28 V78 H4 Z" fill="${c}"/><rect x="62" y="40" width="12" height="38" fill="${c}"/>${windows(10, 52, 3, 1, 10, 9, 16, 0, '#ffd23c')}${sign(31, 70, icon, 26)}` };
    case 'guindaste': return { w: 74, h: 110, svg: `<rect x="40" y="10" width="6" height="100" fill="${c}"/><path d="M10,12 H72" stroke="${c}" stroke-width="6"/><path d="M18,12 v26" stroke="#555" stroke-width="2"/><rect x="12" y="38" width="12" height="8" fill="#7d8594"/><rect x="4" y="62" width="34" height="48" fill="#c9ccd4"/>${windows(8, 68, 3, 3, 6, 6, 10, 12, '#8a93a6')}${sign(22, 56, icon, 24)}` };
    case 'solar': return { w: 76, h: 46, svg: `${[0, 1, 2].map((i) => `<g transform="translate(${4 + i * 24},10)"><path d="M0,22 L8,0 H22 L14,22 Z" fill="${c}" stroke="#bfe6ff" stroke-width="1.5"/><path d="M11,22 v14" stroke="#9aa0a8" stroke-width="3"/></g>`).join('')}${sign(38, 40, icon, 24)}` };
    case 'foguete': return { w: 50, h: 132, svg: `<path d="M25,0 C40,20 40,60 38,96 H12 C10,60 10,20 25,0 Z" fill="${c}" stroke="#c9ccd4" stroke-width="2"/><circle cx="25" cy="44" r="8" fill="#4da3ff" stroke="#fff" stroke-width="3"/><path d="M12,74 L2,104 L12,98 Z M38,74 L48,104 L38,98 Z" fill="#e8384f"/><rect x="4" y="110" width="42" height="22" fill="#7d8594"/>${sign(25, 120, icon, 24)}` };
  }
  return { w: 40, h: 40, svg: sign(20, 20, icon) };
}

// Monta a cidadezinha com os últimos negócios abertos
export function townSVG(bizList) {
  let x = 0;
  const parts = bizList.map((b) => {
    const [type, c] = TYPE[b.id] || ['loja', '#8f6bff'];
    const d = draw(type, c, b.icon);
    const g = `<g transform="translate(${x},${140 - d.h})">${d.svg}</g>`;
    x += d.w + 4;
    return g;
  });
  return `<svg class="townsvg" viewBox="0 -12 ${Math.max(1, x)} 152" height="104" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;
}
