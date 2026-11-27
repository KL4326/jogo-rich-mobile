// ===== Rua das empresas: cada negócio tem seu prédio desenhado =====
// Janelas com classe "w" e letreiros com classe "sg" acendem à noite (CSS).
const win = (x, y, cols, rows, w, h, gx, gy, r = 1.2) => { let o = ''; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) o += `<rect class="w" x="${x + i * gx}" y="${y + j * gy}" width="${w}" height="${h}" rx="${r}"/>`; return o; };
const sign = (x, y, txt, bg = '#fff', fg = '#2e2453', fs = 7.5) => { const w = txt.length * fs * 0.62 + 8; return `<g class="sg"><rect x="${x - w / 2}" y="${y - 6.5}" width="${w}" height="13" rx="4" fill="${bg}" stroke="#0002"/><text x="${x}" y="${y + 2.7}" font-size="${fs}" font-family="Lilita, Fredoka, sans-serif" text-anchor="middle" fill="${fg}" letter-spacing=".3">${txt}</text></g>`; };
const awning = (x, y, w, h, c, n = 6) => { let o = ''; const sw = w / n; for (let i = 0; i < n; i++) o += `<path d="M${x + i * sw} ${y}h${sw}v${h}q${-sw / 4} 4 ${-sw / 2} 0q${-sw / 4} 4 ${-sw / 2} 0Z" fill="${i % 2 ? '#fff' : c}"/>`; return o; };
const door = (x, y, w, h, c = '#6b3d1e') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${c}"/><circle cx="${x + w - 3}" cy="${y + h / 2}" r="1" fill="#ffd23c"/>`;
const glassdoor = (x, y, w, h) => `<rect class="w" x="${x}" y="${y}" width="${w}" height="${h}" rx="1"/><path d="M${x + w / 2} ${y}v${h}" stroke="#ffffffaa" stroke-width="1"/>`;
const shade = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#tshade)"/>`;
const smoke = (x, y) => `<g class="tsmoke"><circle cx="${x}" cy="${y}" r="4"/><circle cx="${x + 3}" cy="${y - 7}" r="5"/><circle cx="${x - 1}" cy="${y - 15}" r="6"/></g>`;

const B = {
  pastel: () => ({ w: 62, h: 62, svg: `
    <path d="M8 22v40M54 22v40" stroke="#8a5a2b" stroke-width="3"/>
    ${awning(2, 14, 58, 10, '#e8384f')}<rect x="2" y="10" width="58" height="5" rx="2" fill="#b3263a"/>
    <rect x="6" y="40" width="50" height="22" rx="2" fill="#d9a066"/><rect x="6" y="40" width="50" height="5" fill="#b37a45"/>
    <path d="M18 38a8 8 0 0 1 16 0Z" fill="#ffd27a" stroke="#d99a2b"/><path d="M36 38a7 7 0 0 1 14 0Z" fill="#ffd27a" stroke="#d99a2b"/>
    ${sign(31, 52, 'PASTEL', '#fff4d6', '#b3263a')}${sign(31, 4, '★', '#ffc93c', '#b3263a', 8)}` }),
  sorvete: () => ({ w: 56, h: 68, svg: `
    <path d="M28 2 4 18h48Z" fill="#ff8fbf"/><path d="M28 2 16 18M28 2l12 16" stroke="#fff" stroke-width="3"/><path d="M28 18v18" stroke="#9aa0a8" stroke-width="3"/>
    <rect x="6" y="34" width="44" height="22" rx="5" fill="#fff" stroke="#ff8fbf" stroke-width="3"/>
    <path d="M24 40l4 10 4-10Z" fill="#e0a55a"/><circle cx="28" cy="38" r="4.5" fill="#ff8fbf"/><circle cx="25" cy="35" r="3.5" fill="#bff0d8"/>
    <circle cx="15" cy="62" r="5.5" fill="#444"/><circle cx="15" cy="62" r="2" fill="#ddd"/><circle cx="41" cy="62" r="5.5" fill="#444"/><circle cx="41" cy="62" r="2" fill="#ddd"/>
    ${sign(28, 26, 'SORVETE', '#fff', '#e0447f', 6.5)}` }),
  lavajato: () => ({ w: 76, h: 66, svg: `
    <rect x="4" y="16" width="68" height="50" rx="3" fill="#4da3ff"/>${shade(4, 16, 68, 50)}<path d="M0 18 38 4l38 14Z" fill="#2a74d1"/>
    <rect x="12" y="30" width="40" height="36" rx="2" fill="#1f4f8a"/>
    <g><rect x="16" y="50" width="32" height="10" rx="4" fill="#ff5d73"/><path d="M21 50l4-7h14l4 7Z" fill="#ff5d73"/><path d="M25 44h14l3 6H22Z" class="w"/><circle cx="22" cy="61" r="3.5" fill="#333"/><circle cx="42" cy="61" r="3.5" fill="#333"/></g>
    <g class="tbub" fill="#ffffffcc"><circle cx="20" cy="38" r="2.5"/><circle cx="32" cy="34" r="3"/><circle cx="44" cy="40" r="2"/></g>
    ${win(56, 32, 1, 2, 10, 10, 0, 14)}${sign(38, 24, 'LAVA-JATO', '#fff', '#2a74d1', 6.5)}` }),
  barbearia: () => ({ w: 60, h: 68, svg: `
    <rect x="4" y="14" width="52" height="54" rx="2" fill="#f4ede2"/>${shade(4, 14, 52, 54)}<rect x="2" y="10" width="56" height="7" rx="2" fill="#2e2453"/>
    ${awning(6, 28, 48, 7, '#2e2453', 6)}
    <rect class="w" x="8" y="40" width="22" height="18" rx="1.5"/>${door(36, 40, 14, 28, '#2e2453')}
    <rect x="50" y="30" width="6" height="26" rx="3" fill="#fff" stroke="#bbb"/><rect x="51" y="31" width="4" height="24" rx="2" fill="url(#tpole)" class="tpole"/>
    ${sign(30, 21, 'BARBEARIA', '#2e2453', '#fff', 6.5)}` }),
  lanchonete: () => ({ w: 68, h: 78, svg: `
    <rect x="4" y="26" width="60" height="52" rx="3" fill="#ffc93c"/>${shade(4, 26, 60, 52)}<rect x="4" y="52" width="60" height="4" fill="#e8384f"/>
    <g transform="translate(34 14)"><path d="M-14 0a14 10 0 0 1 28 0Z" fill="#e0a55a"/><rect x="-15" y="0" width="30" height="3" fill="#3fae4a"/><rect x="-14" y="3" width="28" height="4" rx="2" fill="#7a3d1e"/><path d="M-14 7h28a3 3 0 0 1-3 4h-22a3 3 0 0 1-3-4Z" fill="#e0a55a"/></g>
    ${win(8, 34, 3, 1, 15, 14, 18, 0)}${glassdoor(26, 58, 16, 20)}<rect x="8" y="60" width="14" height="10" rx="1" class="w"/><rect x="46" y="60" width="14" height="10" rx="1" class="w"/>
    ${sign(34, 30, 'LANCHES', '#e8384f', '#fff', 7)}` }),
  petshop: () => ({ w: 64, h: 70, svg: `
    <rect x="6" y="24" width="52" height="46" rx="2" fill="#2bc46f"/>${shade(6, 24, 52, 46)}<path d="M0 26 32 4l32 22Z" fill="#1a944f"/>
    <g fill="#fff" transform="translate(32 16)"><ellipse cx="0" cy="2" rx="4" ry="3.5"/><circle cx="-5" cy="-3" r="2"/><circle cx="-1.5" cy="-6" r="2"/><circle cx="2.5" cy="-6" r="2"/><circle cx="6" cy="-3" r="2"/></g>
    <rect class="w" x="10" y="42" width="22" height="18" rx="1.5"/><g transform="translate(21 57)"><ellipse cx="0" cy="0" rx="6" ry="3.5" fill="#d9a066"/><circle cx="5" cy="-3" r="3" fill="#d9a066"/><path d="M6-6l2 3" stroke="#8a5a33" stroke-width="2"/></g>
    ${door(38, 44, 14, 26)}${sign(32, 34, 'PET SHOP', '#fff', '#1a944f', 6.5)}` }),
  roupas: () => ({ w: 64, h: 72, svg: `
    <rect x="4" y="16" width="56" height="56" rx="2" fill="#ff6bb5"/>${shade(4, 16, 56, 56)}<rect x="2" y="12" width="60" height="6" rx="2" fill="#d94a92"/>
    ${awning(6, 30, 52, 7, '#ffd6ea', 6)}
    <rect class="w" x="8" y="42" width="26" height="26" rx="1.5"/><path d="M15 48l4-3h4l4 3-2 3h-2v10h-8V51h-2Z" fill="#fff" stroke="#d94a92"/><circle cx="21" cy="44" r="0"/>
    ${glassdoor(40, 42, 16, 30)}${sign(32, 23, 'MODA', '#fff', '#d94a92', 8)}` }),
  oficina: () => ({ w: 74, h: 66, svg: `
    <rect x="4" y="18" width="66" height="48" rx="2" fill="#7d8594"/>${shade(4, 18, 66, 48)}<rect x="2" y="14" width="70" height="6" rx="2" fill="#5a616e"/>
    <rect x="10" y="30" width="34" height="36" fill="#3a3f4a"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M10 ${31 + i * 3.5}h34" stroke="#9aa0a8" stroke-width="1.4"/>`).join('')}
    <g fill="#222"><circle cx="58" cy="60" r="6"/><circle cx="58" cy="50" r="6"/></g><circle cx="58" cy="60" r="2.5" fill="#777"/><circle cx="58" cy="50" r="2.5" fill="#777"/>
    <path d="M52 30l6 6m-1-9a4 4 0 1 0 4 4" stroke="#ffc93c" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${sign(37, 24, 'OFICINA', '#ffc93c', '#2e2453', 7)}` }),
  academia: () => ({ w: 66, h: 92, svg: `
    <rect x="4" y="22" width="58" height="70" rx="2" fill="#ff8a3c"/>${shade(4, 22, 58, 70)}
    <g transform="translate(33 10)"><rect x="-14" y="-2" width="28" height="4" rx="2" fill="#555"/><rect x="-20" y="-8" width="6" height="16" rx="2" fill="#2e2453"/><rect x="14" y="-8" width="6" height="16" rx="2" fill="#2e2453"/></g>
    ${win(8, 34, 2, 2, 24, 14, 26, 18, 1)}${glassdoor(24, 72, 18, 20)}
    ${sign(33, 26, 'ACADEMIA', '#2e2453', '#ff8a3c', 7)}` }),
  clinica: () => ({ w: 62, h: 94, svg: `
    <rect x="4" y="18" width="54" height="76" rx="2" fill="#f4f6fa"/>${shade(4, 18, 54, 76)}<rect x="4" y="40" width="54" height="4" fill="#4da3ff"/>
    <g transform="translate(31 9)"><rect x="-9" y="-9" width="18" height="18" rx="4" fill="#fff" stroke="#e8384f" stroke-width="1.5"/><path d="M-2.5-6h5v3.5h3.5v5h-3.5v3.5h-5v-3.5h-3.5v-5h3.5Z" fill="#e8384f"/></g>
    ${win(9, 50, 3, 2, 10, 10, 16, 14)}${glassdoor(22, 78, 18, 16)}
    ${sign(31, 30, 'CLÍNICA', '#4da3ff', '#fff', 7)}` }),
  restaurante: () => ({ w: 72, h: 84, svg: `
    <rect x="4" y="18" width="64" height="66" rx="2" fill="#8e1b3e"/>${shade(4, 18, 64, 66)}<rect x="2" y="14" width="68" height="6" rx="2" fill="#d4af37"/>
    ${awning(8, 44, 56, 8, '#5e0f28', 7)}
    ${win(10, 26, 3, 1, 14, 12, 19, 0)}<rect class="w" x="10" y="56" width="18" height="22" rx="8"/><rect class="w" x="44" y="56" width="18" height="22" rx="8"/>
    ${door(30, 56, 12, 28, '#3a0a18')}<circle class="tlamp" cx="8" cy="54" r="2.5" fill="#ffd86b"/><circle class="tlamp" cx="64" cy="54" r="2.5" fill="#ffd86b"/>
    <g transform="translate(36 6)"><path d="M-4-4h8a4 5 0 0 1-8 0Z" fill="#ff5d73"/><path d="M0 1v5M-3 6h6" stroke="#d4af37" stroke-width="1.4"/></g>
    ${sign(36, 40, 'RESTAURANTE', '#d4af37', '#5e0f28', 6)}` }),
  hotel: () => ({ w: 66, h: 124, svg: `
    <rect x="6" y="16" width="54" height="108" rx="2" fill="#e6cf9e"/>${shade(6, 16, 54, 108)}
    <text x="33" y="10" font-size="9" text-anchor="middle" fill="#ffc93c" class="sgstar">★★★★★</text>
    ${win(11, 30, 4, 6, 8, 9, 12, 13)}${[0, 1, 2, 3, 4, 5].map((j) => `<rect x="8" y="${40 + j * 13}" width="50" height="1.6" fill="#b99a5e"/>`).join('')}
    <path d="M18 108h30l-4-6H22Z" fill="#8e1b3e"/>${glassdoor(24, 108, 18, 16)}
    ${sign(33, 22, 'HOTEL', '#8e1b3e', '#ffe7a3', 7.5)}` }),
  startup: () => ({ w: 52, h: 132, svg: `
    <path d="M26 0v12" stroke="#9aa0a8" stroke-width="2"/><circle class="tblink" cx="26" cy="2" r="2.5" fill="#ff5d73"/>
    <path d="M6 132V22l40-10v120Z" fill="#5ec8ff"/><path d="M6 22l40-10v120H6Z" fill="url(#tglass)"/>
    ${win(10, 30, 3, 8, 9, 8, 12, 12, .8)}
    <g transform="translate(26 30)"><rect x="-5" y="-8" width="10" height="16" rx="2" fill="#fff"/><rect x="-3.5" y="-6" width="7" height="10" fill="#8f6bff"/></g>
    ${glassdoor(18, 116, 16, 16)}${sign(26, 108, 'APPS', '#8f6bff', '#fff', 7.5)}` }),
  fabrica: () => ({ w: 88, h: 100, svg: `
    <rect x="56" y="16" width="10" height="44" fill="#7d6a64"/><rect x="70" y="26" width="9" height="34" fill="#6b5a55"/>${smoke(61, 10)}${smoke(74, 20)}
    <path d="M4 60l18-14v14l18-14v14l18-14v54H4Z" fill="#c2654a"/><rect x="56" y="58" width="28" height="42" fill="#a8533a"/>${shade(4, 46, 80, 54)}
    ${win(8, 66, 4, 1, 9, 9, 12, 0)}${win(60, 66, 2, 2, 8, 8, 12, 12)}<rect x="12" y="82" width="22" height="18" fill="#5a3418"/>${[0, 1, 2, 3].map((i) => `<path d="M12 ${84 + i * 4}h22" stroke="#8a5a33" stroke-width="1"/>`).join('')}
    ${sign(44, 90, 'ELETRÔNICOS', '#ffc93c', '#2e2453', 5.6)}` }),
  mercado: () => ({ w: 96, h: 70, svg: `
    <rect x="4" y="20" width="88" height="50" rx="2" fill="#2bc46f"/>${shade(4, 20, 88, 50)}<rect x="2" y="16" width="92" height="6" rx="2" fill="#1a944f"/>
    ${awning(6, 36, 84, 7, '#ffc93c', 10)}
    ${glassdoor(36, 46, 24, 24)}<rect class="w" x="8" y="48" width="24" height="16" rx="1"/><rect class="w" x="64" y="48" width="24" height="16" rx="1"/>
    <g transform="translate(76 9)" stroke="#2e2453" stroke-width="1.6" fill="none"><path d="M-8-4h3l3 8h8l2-6h-12"/><circle cx="-1" cy="7" r="1.2" fill="#2e2453"/><circle cx="5" cy="7" r="1.2" fill="#2e2453"/></g>
    ${sign(44, 28, 'SUPERMERCADO', '#fff', '#1a944f', 6.5)}` }),
  aerea: () => ({ w: 78, h: 128, svg: `
    <rect x="12" y="40" width="14" height="88" fill="#cfd6de"/>${shade(12, 40, 14, 88)}<path d="M4 40h30l-4-14H8Z" fill="#4da3ff"/><path d="M8 26h22l-2-10H10Z" class="w"/><path d="M6 16h26" stroke="#2a74d1" stroke-width="3"/>
    <circle class="tblink" cx="19" cy="10" r="2.5" fill="#ff5d73"/><path d="M19 10v6" stroke="#9aa0a8" stroke-width="1.5"/>
    <path d="M30 128v-34q24-16 46 0v34Z" fill="#9aa8b8"/>${shade(30, 86, 46, 42)}<rect x="38" y="104" width="30" height="24" fill="#5c6878"/>
    <g class="tplane"><path d="M0 0h22l6-3-2 4 2 4-6-3H0Z" fill="#fff" stroke="#9aa0a8" stroke-width=".6"/><path d="M8 0l6-8h3l-3 8ZM8 1l6 6h3l-3-6Z" fill="#4da3ff"/></g>
    ${sign(53, 98, 'AÉREA', '#4da3ff', '#fff', 7)}` }),
  construtora: () => ({ w: 84, h: 134, svg: `
    <rect x="54" y="8" width="5" height="126" fill="#ffc93c"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M54 ${14 + i * 15}l5 15M59 ${14 + i * 15}l-5 15" stroke="#e09a12" stroke-width="1"/>`).join('')}
    <path d="M14 10h70" stroke="#ffc93c" stroke-width="5"/><rect x="62" y="12" width="12" height="8" fill="#7d8594"/>
    <g class="thook"><path d="M26 12v30" stroke="#555" stroke-width="1.4"/><rect x="18" y="42" width="16" height="6" fill="#c2654a"/></g>
    <rect x="4" y="66" width="44" height="68" fill="#c9ccd4"/>${shade(4, 66, 44, 68)}${win(8, 72, 3, 4, 8, 8, 13, 15)}
    <path d="M4 66v68M48 66v68M2 82h48M2 98h48M2 114h48" stroke="#e09a12" stroke-width="1.6"/>
    ${sign(26, 60, 'CONSTRUTORA', '#ffc93c', '#2e2453', 5.6)}` }),
  hospital: () => ({ w: 78, h: 116, svg: `
    <rect x="4" y="22" width="70" height="94" rx="2" fill="#f4f6fa"/>${shade(4, 22, 70, 94)}<rect x="4" y="22" width="70" height="5" fill="#e8384f"/>
    <ellipse cx="39" cy="16" rx="16" ry="5" fill="#9aa0a8"/><text x="39" y="19" font-size="8" font-family="Lilita, sans-serif" text-anchor="middle" fill="#fff">H</text>
    ${win(9, 36, 5, 5, 8, 8, 13, 13)}
    <g transform="translate(39 104)"><path d="M-14 12V0h28v12" fill="#e8384f"/>${glassdoor(-8, 2, 16, 10)}</g>
    ${sign(39, 31, 'HOSPITAL', '#e8384f', '#fff', 7)}` }),
  banco: () => ({ w: 80, h: 96, svg: `
    <path d="M40 4 2 30h76Z" fill="#e9e2cf" stroke="#b9a984" stroke-width="2"/><circle cx="40" cy="20" r="5" fill="#d4af37"/><text x="40" y="23" font-size="7" text-anchor="middle" fill="#7a5a00">$</text>
    <rect x="4" y="30" width="72" height="8" fill="#ddd3ba"/>${[10, 24, 38, 52, 66].map((x) => `<rect x="${x - 3}" y="38" width="7" height="44" fill="#fff" stroke="#d6cdb5"/>`).join('')}
    <rect class="w" x="14" y="44" width="6" height="30" rx="1"/><rect class="w" x="59" y="44" width="6" height="30" rx="1"/>
    ${door(33, 54, 14, 28, '#7a5a00')}<rect x="2" y="82" width="76" height="6" fill="#ddd3ba"/><rect x="0" y="88" width="80" height="8" fill="#cfc4a8"/>
    ${sign(40, 33, 'BANCO', '#d4af37', '#fff', 7)}` }),
  petroleo: () => ({ w: 88, h: 116, svg: `
    <path d="M6 116 18 20h6l12 96" fill="none" stroke="#5a5a66" stroke-width="3"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M${9 + i * 2.4} ${100 - i * 18}h${24 - i * 4.8}" stroke="#5a5a66" stroke-width="2"/>`).join('')}
    <path d="M10 96l22-18M32 96 10 78M13 74l16-14M29 74 13 60" stroke="#7d7d88" stroke-width="1.4"/><circle class="tblink" cx="21" cy="18" r="2.5" fill="#ff5d73"/>
    <g transform="translate(50 116)"><path d="M-4 0l6-22 6 22" fill="none" stroke="#3a3a44" stroke-width="3"/><g class="tpump"><path d="M-12-24h28" stroke="#2e2e38" stroke-width="5" stroke-linecap="round"/><path d="M14-30v12h5v-12Z" fill="#ffc93c"/></g><path d="M18-18v18" stroke="#3a3a44" stroke-width="1.5"/></g>
    <rect x="68" y="94" width="18" height="22" rx="3" fill="#cfd6de"/>${shade(68, 94, 18, 22)}<path d="M68 102h18" stroke="#aeb7c2" stroke-width="2"/>
    ${sign(60, 80, 'PETRÓLEO', '#2e2e38', '#ffc93c', 5.8)}` }),
  energia: () => ({ w: 94, h: 124, svg: `
    <path d="M70 124 72 34h4l2 90Z" fill="#f4f6fa" stroke="#cfd6de"/><g class="tspin" style="transform-origin:74px 34px"><path d="M74 34 72 4l4 0Z" fill="#fff" stroke="#cfd6de"/><path d="M74 34l28 14-2 3Z" fill="#fff" stroke="#cfd6de"/><path d="M74 34 47 50l-2-3Z" fill="#fff" stroke="#cfd6de"/></g><circle cx="74" cy="34" r="3" fill="#9aa0a8"/>
    ${[0, 1, 2].map((i) => `<g transform="translate(${4 + i * 20} 96)"><path d="M0 18 6 0h16l-6 18Z" fill="#2a5bab" stroke="#bfe6ff" stroke-width="1.2"/><path d="M3 9h16M11 0l-5 18" stroke="#bfe6ff" stroke-width=".8"/><path d="M11 18v10" stroke="#9aa0a8" stroke-width="2.4"/></g>`).join('')}
    ${sign(34, 88, 'SOLAR', '#ffc93c', '#2a5bab', 7)}` }),
  streaming: () => ({ w: 64, h: 150, svg: `
    <path d="M32 0v30" stroke="#9aa0a8" stroke-width="2"/><circle class="tblink" cx="32" cy="2" r="2.5" fill="#ff5d73"/><path d="M24 14q8-6 16 0M20 20q12-9 24 0" class="tsig" stroke="#8f6bff" stroke-width="1.6" fill="none"/>
    <path d="M22 150 28 30h8l6 120Z" fill="#6b49d6"/>${shade(22, 30, 20, 120)}
    <rect x="4" y="52" width="56" height="36" rx="4" fill="#2e2453"/><g class="tscreen">${['#ff5d73', '#ffc93c', '#2bc46f', '#4da3ff', '#8f6bff', '#ff8fbf'].map((c, i) => `<rect x="${8 + i * 8}" y="56" width="8" height="28" fill="${c}"/>`).join('')}</g>
    <rect x="12" y="126" width="40" height="24" rx="2" fill="#8f6bff"/>${glassdoor(24, 134, 16, 16)}
    ${sign(32, 96, 'TV', '#8f6bff', '#fff', 8)}` }),
  espacial: () => ({ w: 64, h: 156, svg: `
    <rect x="44" y="24" width="6" height="122" fill="#7d8594"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M44 ${30 + i * 16}l6 16M50 ${30 + i * 16}l-6 16" stroke="#5a616e" stroke-width="1"/>`).join('')}<path d="M36 50h10M36 90h10" stroke="#7d8594" stroke-width="2"/>
    <path d="M24 6c12 14 12 50 11 104H13C12 56 12 20 24 6Z" fill="#f4f6fa" stroke="#c9ccd4" stroke-width="1.5"/><path d="M24 6c5 6 8 14 9 22H15c1-8 4-16 9-22Z" fill="#e8384f"/>
    <circle cx="24" cy="46" r="6" class="w" stroke="#fff" stroke-width="2.4"/>
    <path d="M13 84 4 112l9-5ZM35 84l9 28-9-5Z" fill="#e8384f"/>
    <g class="tflame"><path d="M15 110q9 22 18 0Z" fill="#ffc93c"/><path d="M19 110q5 12 10 0Z" fill="#fff3b0"/></g>
    <rect x="0" y="138" width="64" height="18" fill="#7d8594"/>${shade(0, 138, 64, 18)}
    ${sign(32, 147, 'ESPACIAL', '#2e2453', '#fff', 6)}` }),
};
const lamp = (x) => `<g><path d="M${x} 150v-34q0-5 5-5h4" stroke="#4a4f5c" stroke-width="2" fill="none"/><path d="M${x + 6} 110h8l-1 3h-6Z" fill="#4a4f5c"/><ellipse class="tlampl" cx="${x + 10}" cy="114" rx="3" ry="1.6" fill="#fff4c0"/><path class="tbeam" d="M${x + 7} 114 ${x + 1} 150h18l-6-36Z" fill="#ffe9a0"/></g>`;
const car = (c) => `<g><rect x="0" y="-9" width="26" height="8" rx="3" fill="${c}"/><path d="M5-9l4-6h9l4 6Z" fill="${c}"/><path d="M8-9l3-4.5h3v4.5ZM15.5-9v-4.5h2l3 4.5Z" class="w"/><circle cx="6" cy="-1" r="3" fill="#222"/><circle cx="20" cy="-1" r="3" fill="#222"/><circle class="tlampl" cx="25.5" cy="-6" r="1.3" fill="#fff4c0"/></g>`;
const DEFS = `<defs>
  <linearGradient id="tshade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
  <linearGradient id="tglass" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#2a74d1" stop-opacity=".35"/></linearGradient>
  <pattern id="tpole" width="4" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><rect width="4" height="8" fill="#fff"/><rect width="4" height="2.7" fill="#e8384f"/><rect y="2.7" width="4" height="2.7" fill="#4da3ff"/></pattern>
</defs>`;

// Monta a rua com os negócios do jogador
export function townSVG(bizList) {
  let x = 8;
  const parts = [];
  bizList.forEach((b, i) => {
    const d = (B[b.id] || B.pastel)();
    parts.push(`<g transform="translate(${x} ${150 - d.h})">${d.svg}</g>`);
    x += d.w + 6;
    if (i % 2 === 1 && i < bizList.length - 1) { parts.push(lamp(x - 2)); x += 16; }
  });
  const W = Math.max(x + 8, 340);
  const dur = Math.max(8, W / 34).toFixed(1);
  const road = `<rect x="0" y="150" width="${W}" height="7" fill="#d9d3c7"/><rect x="0" y="150" width="${W}" height="1.5" fill="#fff"/><rect x="0" y="157" width="${W}" height="23" fill="#4a4f5c"/><path d="M0 168.5H${W}" stroke="#ffe066" stroke-width="1.6" stroke-dasharray="10 8"/>`;
  const cars = `<g transform="translate(0 165)"><g>${car('#ff5d73')}<animateTransform attributeName="transform" type="translate" from="-40 0" to="${W + 40} 0" dur="${dur}s" repeatCount="indefinite"/></g></g>
    <g transform="translate(0 178)"><g><g transform="scale(-1 1)">${car('#4da3ff')}</g><animateTransform attributeName="transform" type="translate" from="${W + 40} 0" to="-40 0" dur="${(dur * 1.3).toFixed(1)}s" begin="-${(dur / 2).toFixed(1)}s" repeatCount="indefinite"/></g></g>`;
  return `<svg class="townsvg" viewBox="0 -8 ${W} 188" height="188" xmlns="http://www.w3.org/2000/svg">${DEFS}${road}${parts.join('')}${cars}</svg>`;
}
