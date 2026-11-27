// ===== Moradias desenhadas (cena do Início) =====
// Todas no mesmo quadro 160×140, chão em y=136. Janelas com classe "w" acendem à noite (CSS).
const W = (x, y, w = 12, h = 14, r = 1.5) => `<rect class="w" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
const WF = (x, y, w = 12, h = 14) => `<g>${W(x, y, w, h)}<path d="M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}" stroke="#ffffffaa" stroke-width="1.2"/></g>`;
const smoke = (x, y) => `<g class="smoke"><circle cx="${x}" cy="${y}" r="4"/><circle cx="${x + 3}" cy="${y - 8}" r="5"/><circle cx="${x - 1}" cy="${y - 18}" r="6"/></g>`;
const tree = (x, y, s = 1, c = '#3fae4a') => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="-4" width="6" height="18" rx="2" fill="#8a5a33"/><circle cx="0" cy="-14" r="13" fill="${c}"/><circle cx="-8" cy="-6" r="9" fill="${c}"/><circle cx="8" cy="-6" r="9" fill="${c}"/><circle cx="-4" cy="-18" r="5" fill="#ffffff22"/></g>`;
const palm = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0q-2-22 4-40" stroke="#a8743f" stroke-width="5" fill="none" stroke-linecap="round"/><g fill="#2fa84f"><path d="M4-40q-16-6-26 4q12-2 26-4Z"/><path d="M4-40q16-8 26 2q-12-3-26-2Z"/><path d="M4-40q-6-14-20-14q10 6 20 14Z"/><path d="M4-40q8-14 22-12q-12 4-22 12Z"/></g><circle cx="2" cy="-38" r="3" fill="#8a5a33"/></g>`;
const bush = (x, y, c = '#3fae4a') => `<g fill="${c}"><circle cx="${x}" cy="${y}" r="7"/><circle cx="${x + 8}" cy="${y - 2}" r="8"/><circle cx="${x + 16}" cy="${y}" r="7"/></g>`;
const flag = (x, y, c = '#ff5d73') => `<path d="M${x} ${y}v-16" stroke="#555" stroke-width="1.6"/><path class="flag" d="M${x} ${y - 16}l13 4-13 4Z" fill="${c}"/>`;

const ART = {
  barraco: `
    <path d="M30 136V84l52-4 2 56Z" fill="#b58457"/>
    <path d="M30 136V84l52-4 2 56Z" fill="url(#hwood)"/>
    <rect x="38" y="96" width="14" height="20" fill="#8fb3c9" transform="rotate(-3 45 106)"/>
    <path d="M38 96l14 20M52 95l-13 21" stroke="#6b4a2a" stroke-width="2"/>
    <rect x="58" y="100" width="18" height="36" rx="1" fill="#6b4a2a" transform="rotate(2 67 118)"/>
    <circle cx="72" cy="119" r="1.6" fill="#ffd23c"/>
    <path d="M22 88 86 72l6 10-66 10Z" fill="#9aa3ad"/><path d="M22 88 86 72" stroke="#c9d0d8" stroke-width="2"/>
    <path d="M34 85v6M48 82v6M62 78v6M76 75v6" stroke="#7d858f" stroke-width="2"/>
    <rect x="62" y="64" width="6" height="14" fill="#7d6a64"/>${smoke(65, 58)}
    <rect x="96" y="120" width="16" height="16" rx="2" fill="#4da3ff"/><path d="M96 124h16" stroke="#2a74d1" stroke-width="2"/>`,
  aptosimples: `
    <rect x="34" y="34" width="92" height="102" rx="4" fill="#f2c9a0"/><rect x="34" y="34" width="92" height="102" rx="4" fill="url(#hshade)"/>
    <rect x="30" y="28" width="100" height="9" rx="3" fill="#c98a5a"/>
    ${[46, 72, 98].map((y) => `${WF(44, y)}${WF(74, y)}${WF(104, y)}<rect x="70" y="${y + 15}" width="20" height="4" rx="1" fill="#c98a5a"/>`).join('')}
    <rect x="68" y="112" width="24" height="24" rx="2" fill="#8a5a33"/><path d="M80 112v24" stroke="#6b4426" stroke-width="1.5"/>
    <rect x="62" y="108" width="36" height="5" rx="2" fill="#4da3ff"/>
    ${bush(18, 132)}${bush(126, 132)}`,
  casa: `
    <rect x="102" y="44" width="12" height="26" fill="#a85a4a"/>${smoke(108, 38)}
    <rect x="30" y="76" width="100" height="60" fill="#fff3d6"/><rect x="30" y="76" width="100" height="60" fill="url(#hshade)"/>
    <path d="M22 80 80 36l58 44Z" fill="#e2574c"/><path d="M22 80 80 36l58 44" fill="none" stroke="#b33d34" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="80" cy="62" r="7" class="w"/>
    ${WF(40, 92, 18, 18)}${WF(102, 92, 18, 18)}
    <rect x="68" y="98" width="24" height="38" rx="3" fill="#8a5a33"/><circle cx="87" cy="118" r="2" fill="#ffd23c"/>
    <path d="M0 122h28M132 122h28" stroke="#fff" stroke-width="3"/>${[4, 12, 20, 136, 144, 152].map((x) => `<rect x="${x - 2}" y="116" width="4" height="20" rx="1" fill="#fff"/>`).join('')}
    ${tree(148, 110, .8)}`,
  chacara: `
    ${tree(18, 104, 1.1, '#2f9c45')}${tree(144, 100, 1.2, '#3fae4a')}
    <rect x="34" y="78" width="92" height="58" fill="#c98a5a"/><rect x="34" y="78" width="92" height="58" fill="url(#hwood)"/>
    <path d="M26 82 80 46l54 36Z" fill="#7a4a2a"/><path d="M26 82 80 46l54 36" fill="none" stroke="#5a3418" stroke-width="4" stroke-linejoin="round"/>
    <rect x="28" y="104" width="104" height="5" fill="#8a5a33"/>${[32, 56, 104, 128].map((x) => `<rect x="${x - 2}" y="106" width="4" height="30" fill="#8a5a33"/>`).join('')}
    ${WF(44, 86, 16, 14)}${WF(100, 86, 16, 14)}
    <rect x="70" y="100" width="20" height="36" rx="2" fill="#5a3418"/>
    <path d="M28 128h104" stroke="#8a5a33" stroke-width="3"/>
    <rect x="96" y="54" width="10" height="16" fill="#8a7f78"/>${smoke(101, 48)}`,
  cobertura: `
    <rect x="44" y="30" width="72" height="106" rx="3" fill="#7f9bb8"/><rect x="44" y="30" width="72" height="106" rx="3" fill="url(#hshade)"/>
    ${[44, 62, 80, 98].map((y) => [52, 68, 84, 100].map((x) => W(x, y, 10, 12, 1)).join('')).join('')}
    <rect x="68" y="116" width="24" height="20" rx="2" fill="#2e3b4e"/><rect x="62" y="112" width="36" height="5" rx="2" fill="#ffc93c"/>
    <rect x="38" y="24" width="84" height="8" rx="3" fill="#5c7590"/>
    <path d="M50 24V6h56v18Z" class="w" opacity=".95"/><path d="M50 6h56M64 6v18M78 6v18M92 6v18" stroke="#ffffffcc" stroke-width="1.5"/>
    <path d="M46 6h64" stroke="#e9eef4" stroke-width="4" stroke-linecap="round"/>
    ${bush(112, 22, '#3fae4a')}<rect x="38" y="20" width="84" height="3" fill="#cfd8e3"/>`,
  mansao: `
    <rect x="14" y="74" width="40" height="62" fill="#f6efe2"/><rect x="106" y="74" width="40" height="62" fill="#f6efe2"/>
    <path d="M10 76h48v-8H10ZM102 76h48v-8h-48Z" fill="#8f6bff"/>
    <rect x="44" y="54" width="72" height="82" fill="#fffaf0"/><rect x="44" y="58" width="72" height="78" fill="url(#hshade)"/><rect x="14" y="76" width="40" height="60" fill="url(#hshade)"/><rect x="106" y="76" width="40" height="60" fill="url(#hshade)"/>
    <path d="M38 58 80 30l42 28Z" fill="#8f6bff"/><path d="M38 58 80 30l42 28Z" fill="none" stroke="#6b49d6" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="80" cy="46" r="5" class="w"/>
    ${[50, 64, 96, 110].map((x) => `<rect x="${x}" y="62" width="5" height="74" fill="#efe5d2"/>`).join('')}
    ${WF(22, 84, 12, 16)}${WF(124, 84, 12, 16)}${WF(22, 110, 12, 16)}${WF(124, 110, 12, 16)}
    ${WF(70, 66, 20, 18)}
    <path d="M70 136v-30a10 10 0 0 1 20 0v30Z" fill="#6b4426"/><circle cx="85" cy="122" r="2" fill="#ffd23c"/>
    <rect x="62" y="132" width="36" height="4" fill="#d9cdb8"/>
    ${bush(0, 132, '#2f9c45')}${bush(146, 132, '#2f9c45')}`,
  fazenda: `
    <rect x="114" y="54" width="26" height="82" rx="13" fill="#c9ccd4"/><path d="M114 66a13 13 0 0 1 26 0" fill="#9aa0a8"/><path d="M114 84h26M114 102h26M114 120h26" stroke="#aeb3bb" stroke-width="2"/>
    <rect x="16" y="72" width="90" height="64" fill="#c8412f"/><rect x="16" y="72" width="90" height="64" fill="url(#hshade)"/>
    <path d="M8 76 61 42l53 34Z" fill="#7a2a1f"/><path d="M8 76 61 42l53 34" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
    <rect x="44" y="96" width="34" height="40" fill="#fff"/><rect x="47" y="99" width="28" height="37" fill="#a8342a"/><path d="M47 99l28 37M75 99l-28 37" stroke="#fff" stroke-width="3"/>
    ${W(53, 56, 16, 14)}<path d="M61 56v14" stroke="#fff" stroke-width="2"/>
    ${W(24, 90, 12, 12)}${W(86, 90, 12, 12)}
    <g transform="translate(140 124)"><ellipse cx="0" cy="0" rx="9" ry="6" fill="#fff"/><circle cx="-3" cy="-1" r="2.5" fill="#333"/><circle cx="9" cy="-4" r="4" fill="#fff"/><path d="M-6 5v5M5 5v5" stroke="#333" stroke-width="2"/></g>
    <path d="M0 126h14" stroke="#c9a06a" stroke-width="3"/>`,
  mansaopraia: `
    <rect x="0" y="122" width="160" height="14" fill="#4fd1e8"/><path d="M0 122h160" stroke="#bff2ff" stroke-width="2"/><path class="wave" d="M8 128q6-3 12 0t12 0M90 130q6-3 12 0t12 0" stroke="#fff" stroke-width="1.6" fill="none"/>
    <rect x="22" y="78" width="96" height="44" fill="#ffffff"/><rect x="50" y="52" width="74" height="28" fill="#fbfbfb"/>
    <rect x="16" y="74" width="108" height="6" rx="2" fill="#e8dccb"/><rect x="44" y="48" width="86" height="6" rx="2" fill="#e8dccb"/>
    <rect x="22" y="80" width="96" height="42" fill="url(#hshade)"/><rect x="50" y="54" width="74" height="20" fill="url(#hshade)"/>
    ${W(28, 86, 40, 30, 1)}<path d="M48 86v30" stroke="#ffffffcc" stroke-width="1.5"/>${W(74, 86, 38, 30, 1)}<path d="M93 86v30" stroke="#ffffffcc" stroke-width="1.5"/>
    ${W(56, 58, 62, 16, 1)}
    ${palm(10, 122, 1.05)}${palm(146, 122, .95)}`,
  castelo: `
    <rect x="34" y="62" width="92" height="74" fill="#b9b4ad"/><rect x="34" y="62" width="92" height="74" fill="url(#hstone)"/>
    ${[34, 50, 66, 82, 98, 114].map((x) => `<rect x="${x}" y="54" width="10" height="10" fill="#b9b4ad"/>`).join('')}
    <rect x="12" y="44" width="28" height="92" fill="#a9a39b"/><rect x="120" y="44" width="28" height="92" fill="#a9a39b"/>
    <path d="M8 46 26 14l18 32ZM116 46l18-32 18 32Z" fill="#c8412f"/>
    <rect x="64" y="30" width="32" height="40" fill="#a9a39b"/><path d="M60 32 80 4l20 28Z" fill="#c8412f"/>
    ${flag(26, 14)}${flag(134, 14, '#ffc93c')}${flag(80, 4, '#4da3ff')}
    ${W(20, 60, 10, 16, 5)}${W(130, 60, 10, 16, 5)}${W(74, 42, 12, 16, 6)}${W(46, 78, 10, 14, 5)}${W(104, 78, 10, 14, 5)}
    <path d="M66 136v-26a14 14 0 0 1 28 0v26Z" fill="#6b4426"/><path d="M66 120h28M66 128h28M80 96v40" stroke="#4a2e18" stroke-width="2"/>
    <rect x="12" y="46" width="28" height="90" fill="url(#hshade)"/><rect x="120" y="46" width="28" height="90" fill="url(#hshade)"/>`,
  ilha: `
    <ellipse cx="80" cy="132" rx="80" ry="10" fill="#4fd1e8"/><path class="wave" d="M6 132q6-3 12 0t12 0M124 134q6-3 12 0t12 0" stroke="#fff" stroke-width="1.6" fill="none"/>
    <path d="M16 130q10-26 64-28t64 28Z" fill="#f2d68b"/><path d="M30 120q20-20 50-20t52 18q-20 6-52 6t-50-4Z" fill="#5cc65c"/>
    <rect x="52" y="78" width="56" height="30" fill="#fff"/><rect x="46" y="72" width="68" height="7" rx="2" fill="#2ec4d6"/>
    ${W(58, 84, 18, 16, 1)}${W(84, 84, 18, 16, 1)}
    <rect x="58" y="108" width="44" height="6" rx="2" fill="#4da3ff"/>
    ${palm(30, 116, .9)}${palm(132, 116, 1)}${palm(120, 112, .7)}
    <path d="M136 90l12 6-12 6Z" fill="#fff"/><path d="M136 90v24" stroke="#777" stroke-width="1.5"/>`,
  lua: `
    <path d="M0 136q20-16 80-18t80 18Z" fill="#b8bcc6"/><ellipse cx="34" cy="130" rx="10" ry="3" fill="#9a9fab"/><ellipse cx="126" cy="132" rx="8" ry="2.5" fill="#9a9fab"/>
    <path d="M36 124a26 26 0 0 1 52 0Z" class="w" opacity=".9"/><path d="M36 124a26 26 0 0 1 52 0" fill="none" stroke="#e9eef4" stroke-width="3"/><path d="M49 103v21M62 98v26M75 103v21M38 114h48" stroke="#ffffff99" stroke-width="1.2"/>
    <path d="M92 124a18 18 0 0 1 36 0Z" class="w" opacity=".9"/><path d="M92 124a18 18 0 0 1 36 0" fill="none" stroke="#e9eef4" stroke-width="3"/>
    <rect x="84" y="114" width="12" height="8" rx="2" fill="#dfe4ea"/>
    <path d="M24 124V82" stroke="#cfd6de" stroke-width="2.5"/><path d="M14 86a12 12 0 0 0 20 0Z" fill="#e9eef4"/><circle class="blink" cx="24" cy="80" r="2.6" fill="#ff5d73"/>
    <g transform="translate(128 40)"><circle r="14" fill="#4da3ff"/><path d="M-8-6q6-4 8 2t8 0q2 6-6 8t-8-4Z" fill="#3fae4a"/><circle r="14" fill="none" stroke="#bfe6ff" stroke-width="2"/></g>
    ${flag(140, 124, '#ffc93c')}`,
};
const DEFS = `<defs>
  <linearGradient id="hshade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
  <pattern id="hwood" width="10" height="8" patternUnits="userSpaceOnUse"><path d="M0 7.5h10" stroke="#0000001f" stroke-width="1"/></pattern>
  <pattern id="hstone" width="16" height="10" patternUnits="userSpaceOnUse"><path d="M0 9.5h16M8 0v5M0 5h16M0 5v5" stroke="#00000018" stroke-width="1"/></pattern>
</defs>`;

// Escolhe o desenho da moradia (inclui imóveis de construtoras de jogadores)
const BY_NAME = [[/castelo/i, 'castelo'], [/ilha/i, 'ilha'], [/lua/i, 'lua'], [/praia|resort|condom/i, 'mansaopraia'], [/mans/i, 'mansao'], [/fazenda/i, 'fazenda'], [/ch[aá]cara/i, 'chacara'], [/cobertura|arranha|cidade/i, 'cobertura'], [/apart/i, 'aptosimples'], [/casa/i, 'casa']];
const COSTS = [['aptosimples', 1.8e5], ['casa', 5.5e5], ['chacara', 1.4e6], ['cobertura', 3e6], ['mansao', 2e7], ['fazenda', 6e7], ['mansaopraia', 1.2e8], ['castelo', 9e8], ['ilha', 8e9], ['lua', 5e11]];
export function homeKey(home) {
  if (!home) return 'barraco';
  if (ART[home.id]) return home.id;
  const m = BY_NAME.find(([re]) => re.test(home.name || ''));
  if (m) return m[1];
  let k = 'aptosimples';
  for (const [id, c] of COSTS) if ((home.cost || 0) >= c) k = id;
  return k;
}
export function homeSVG(key) {
  return `<svg class="homesvg h-${key}" viewBox="0 0 160 140" xmlns="http://www.w3.org/2000/svg">${DEFS}${ART[key] || ART.casa}</svg>`;
}
