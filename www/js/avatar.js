// ===== Personagem desenhado em SVG (estilo cartoon, cabeça grande) =====
export const SKINS = ['#ffe0c7', '#f6c9a0', '#e8b07f', '#c98b5e', '#a26a42', '#7a4a2c', '#5a3520'];
export const HAIR_COLORS = ['#2b1a12', '#5a3418', '#8a5a2b', '#d9a441', '#f2d27a', '#b8441e', '#9aa0a8', '#f5f5f5', '#e85d9a', '#4a7bff', '#7a4dff', '#2bc46f'];
export const EYE_COLORS = ['#3b2414', '#6b4423', '#2a6b3c', '#2a5bab', '#6a6f78', '#111111'];
export const HAIRS = [
  { id: 'curto', name: 'Curto' }, { id: 'espetado', name: 'Espetado' }, { id: 'lateral', name: 'De lado' },
  { id: 'longo', name: 'Longo' }, { id: 'rabo', name: 'Rabo de cavalo' }, { id: 'coque', name: 'Coque' },
  { id: 'cacheado', name: 'Cacheado' }, { id: 'black', name: 'Black power' }, { id: 'moicano', name: 'Moicano' }, { id: 'anime', name: 'Anime' }, { id: 'franja', name: 'Franjinha' },
  { id: 'topete', name: 'Topete' }, { id: 'raspado', name: 'Raspadinho' }, { id: 'samurai', name: 'Samurai' }, { id: 'rasta', name: 'Dreads' },
  { id: 'ondulado', name: 'Ondulado' }, { id: 'chanel', name: 'Chanel' }, { id: 'chiquinhas', name: 'Chiquinhas' }, { id: 'tranca', name: 'Trança' },
  { id: 'careca', name: 'Careca' },
];

// Roupas e acessórios. slot: top | bottom | shoes | head | face | neck
// top: sleeve short|long|none, kind camiseta|camisa|moletom|terno|vestido|jaqueta|regata
export const BEARDS = [
  { id: null, name: 'Nenhuma' }, { id: 'bigode', name: 'Bigode' }, { id: 'bigodao', name: 'Bigodão' }, { id: 'fino', name: 'Bigode fino' },
  { id: 'cavanhaque', name: 'Cavanhaque' }, { id: 'barbicha', name: 'Barbicha' }, { id: 'curta', name: 'Barba curta' },
  { id: 'cheia', name: 'Barba cheia' }, { id: 'lenhador', name: 'Barba de lenhador' }, { id: 'costeletas', name: 'Costeletas' },
];
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
  // ---- Mais roupas comuns ----
  { id: 't_preta', slot: 'top', name: 'Camiseta Preta', kind: 'camiseta', sleeve: 'short', c: '#262626', cost: 40, style: 1 },
  { id: 't_amarela', slot: 'top', name: 'Camiseta Amarela', kind: 'camiseta', sleeve: 'short', c: '#ffd23c', cost: 40, style: 1 },
  { id: 't_rosa', slot: 'top', name: 'Camiseta Rosa', kind: 'camiseta', sleeve: 'short', c: '#ff8fbf', cost: 40, style: 1 },
  { id: 't_futebol', slot: 'top', name: 'Camisa de Futebol', kind: 'camiseta', sleeve: 'short', c: '#ffd23c', c2: '#2bc46f', stripes: true, cost: 150, style: 3 },
  { id: 't_polo', slot: 'top', name: 'Camisa Polo', kind: 'camisa', sleeve: 'short', c: '#2bc46f', cost: 180, style: 3 },
  { id: 't_moletomcinza', slot: 'top', name: 'Moletom Cinza', kind: 'moletom', sleeve: 'long', c: '#9aa0a8', cost: 220, style: 3 },
  { id: 't_moletomverm', slot: 'top', name: 'Moletom Vermelho', kind: 'moletom', sleeve: 'long', c: '#e8384f', cost: 220, style: 3 },
  { id: 't_jeans', slot: 'top', name: 'Jaqueta Jeans', kind: 'jaqueta', sleeve: 'long', c: '#4a74b8', c2: '#ffffff', cost: 900, style: 8 },
  { id: 't_vestidoazul', slot: 'top', name: 'Vestido Azul', kind: 'vestido', sleeve: 'short', c: '#4da3ff', cost: 1200, style: 10 },
  { id: 't_vestidoverde', slot: 'top', name: 'Vestido Verde', kind: 'vestido', sleeve: 'none', c: '#2bc46f', cost: 1500, style: 11 },
  { id: 't_ternocinza', slot: 'top', name: 'Terno Cinza', kind: 'terno', sleeve: 'long', c: '#7d8594', c2: '#ffffff', tie: '#2c3e66', cost: 9000, style: 26 },
  { id: 't_ternobranco', slot: 'top', name: 'Terno Branco', kind: 'terno', sleeve: 'long', c: '#f4f1ea', c2: '#ffffff', tie: '#d4a017', cost: 25000, style: 40 },
  { id: 'b_jeanspreto', slot: 'bottom', name: 'Jeans Preto', kind: 'calca', c: '#2a2a33', cost: 80, style: 2 },
  { id: 'b_cargo', slot: 'bottom', name: 'Calça Cargo', kind: 'calca', c: '#6b7a4b', cost: 150, style: 3 },
  { id: 'b_saiajeans', slot: 'bottom', name: 'Saia Jeans', kind: 'saia', c: '#4a74b8', cost: 120, style: 3 },
  { id: 'b_saiarosa', slot: 'bottom', name: 'Saia Rosa', kind: 'saia', c: '#ff8fbf', cost: 150, style: 3 },
  { id: 'b_shortpreto', slot: 'bottom', name: 'Short Preto', kind: 'short', c: '#262626', cost: 60, style: 1 },
  { id: 's_vermelho', slot: 'shoes', name: 'Tênis Vermelho', c: '#e8384f', cost: 150, style: 2 },
  { id: 's_preto', slot: 'shoes', name: 'Tênis Preto', c: '#262626', cost: 150, style: 2 },
  { id: 's_neon', slot: 'shoes', name: 'Tênis de Corrida Neon', c: '#b6ff3c', cost: 600, style: 5 },
  { id: 's_sapatilha', slot: 'shoes', name: 'Sapatilha', c: '#ffb3cf', cost: 250, style: 3 },
  { id: 'h_bonepreto', slot: 'head', name: 'Boné Preto', kind: 'bone', c: '#262626', cost: 60, style: 1 },
  { id: 'h_cowboy', slot: 'head', name: 'Chapéu de Cowboy', kind: 'cowboy', c: '#8a5a2b', cost: 1200, style: 8 },
  { id: 'f_redondo', slot: 'face', name: 'Óculos Redondo', kind: 'grau', c: '#b8860b', cost: 300, style: 3 },
  { id: 'f_coracao', slot: 'face', name: 'Óculos de Coração', kind: 'coracao', c: '#ff4f8f', cost: 500, style: 5 },
  { id: 'f_bigode', slot: 'face', name: 'Bigodão', kind: 'bigode', c: null, cost: 100, style: 2 },
  { id: 'n_cachecol', slot: 'neck', name: 'Cachecol', kind: 'cachecol', c: '#e8384f', cost: 200, style: 3 },
  { id: 'n_gravata', slot: 'neck', name: 'Gravata Borboleta', kind: 'borboleta', c: '#b0124a', cost: 400, style: 4 },
  // ---- Luxo ----
  { id: 't_seda', slot: 'top', name: 'Terno de Seda Italiana', kind: 'terno', sleeve: 'long', c: '#5a1a4a', c2: '#fff3fb', tie: '#ffc93c', cost: 400000, style: 160, shine: true },
  { id: 't_altacostura', slot: 'top', name: 'Vestido de Alta-Costura', kind: 'vestido', sleeve: 'none', c: '#111111', cost: 600000, style: 200, shine: true },
  { id: 'b_couro', slot: 'bottom', name: 'Calça de Couro de Grife', kind: 'calca', c: '#1a1a1a', cost: 120000, style: 60 },
  { id: 's_diamante', slot: 'shoes', name: 'Sapato de Diamante', c: '#d6f6ff', cost: 3e7, style: 900, shine: true },
  { id: 'f_ouro', slot: 'face', name: 'Óculos de Ouro', kind: 'sol', c: '#c99a00', cost: 900000, style: 260 },
  // ---- Costas ----
  { id: 'k_mochila', slot: 'back', name: 'Mochila', kind: 'mochila', c: '#4da3ff', cost: 120, style: 2 },
  { id: 'k_violao', slot: 'back', name: 'Violão nas Costas', kind: 'violao', c: '#c27a3a', cost: 900, style: 6 },
  { id: 'k_prancha', slot: 'back', name: 'Prancha de Surfe', kind: 'prancha', c: '#ff8a3c', cost: 1500, style: 8 },
  { id: 'k_capavermelha', slot: 'back', name: 'Capa de Herói', kind: 'capa', c: '#e8263f', cost: 3000, style: 12 },
  { id: 'k_capapreta', slot: 'back', name: 'Capa Sombria', kind: 'capa', c: '#1d1030', c2: '#b0124a', cost: 6000, style: 16 },
  { id: 'k_espada', slot: 'back', name: 'Espada nas Costas', kind: 'espada', c: '#cfd6e0', cost: 4000, style: 14 },
  { id: 'k_katana', slot: 'back', name: 'Katana', kind: 'katana', c: '#e9eef5', cost: 8000, style: 20 },
  { id: 'k_asasanjo', slot: 'back', name: 'Asas de Anjo', kind: 'asas', c: '#ffffff', cost: 15000, style: 30 },
  { id: 'k_asasmorcego', slot: 'back', name: 'Asas de Morcego', kind: 'morcego', c: '#3a1d4a', cost: 15000, style: 30 },
  { id: 'k_asasfada', slot: 'back', name: 'Asas de Fada', kind: 'fada', c: '#9be7ff', cost: 20000, style: 34 },
  { id: 'k_rabo', slot: 'back', name: 'Rabo de Dinossauro', kind: 'rabo', c: '#5bc85b', cost: 5000, style: 12 },
  { id: 'k_jetpack', slot: 'back', name: 'Mochila a Jato', kind: 'jetpack', c: '#9aa0a8', cost: 250000, style: 120 },
  { id: 'k_capareal', slot: 'back', name: 'Manto Real', kind: 'capa', c: '#7a1fbf', c2: '#ffc93c', cost: 2e7, style: 700, shine: true },
  // ---- Fantasias (peças) ----
  { id: 't_ninja', slot: 'top', name: 'Roupa de Ninja', kind: 'ninja', sleeve: 'long', c: '#25253a', c2: '#e8384f', cost: 2500, style: 14, fant: 1 },
  { id: 'b_ninja', slot: 'bottom', name: 'Calça de Ninja', kind: 'calca', c: '#25253a', cost: 800, style: 4, fant: 1 },
  { id: 'h_bandana', slot: 'head', name: 'Faixa Ninja', kind: 'faixa', c: '#9aa0a8', cost: 600, style: 4, fant: 1 },
  { id: 'f_mascninja', slot: 'face', name: 'Máscara Ninja', kind: 'mascninja', c: '#25253a', cost: 600, style: 4, fant: 1 },
  { id: 't_samurai', slot: 'top', name: 'Kimono de Samurai', kind: 'kimono', sleeve: 'long', c: '#2c3e66', c2: '#e8384f', cost: 6000, style: 22, fant: 1 },
  { id: 'b_hakama', slot: 'bottom', name: 'Hakama', kind: 'largo', c: '#1d1d2a', cost: 2500, style: 8, fant: 1 },
  { id: 't_colegial', slot: 'top', name: 'Uniforme Escolar de Anime', kind: 'marinheiro', sleeve: 'short', c: '#ffffff', c2: '#2c3e8a', tie: '#e8384f', cost: 1800, style: 12, fant: 1 },
  { id: 'b_pregas', slot: 'bottom', name: 'Saia de Pregas Azul', kind: 'saia', c: '#2c3e8a', cost: 500, style: 4, fant: 1 },
  { id: 't_heroi', slot: 'top', name: 'Uniforme de Super-Herói', kind: 'heroi', sleeve: 'long', c: '#2a6bff', c2: '#ffd23c', cost: 5000, style: 20, fant: 1 },
  { id: 'b_heroi', slot: 'bottom', name: 'Calça de Herói', kind: 'calca', c: '#2a6bff', cost: 1500, style: 5, fant: 1 },
  { id: 'f_mascara', slot: 'face', name: 'Máscara de Herói', kind: 'mascara', c: '#e8263f', cost: 1000, style: 5, fant: 1 },
  { id: 't_pirata', slot: 'top', name: 'Roupa de Pirata', kind: 'pirata', sleeve: 'long', c: '#f4efe2', c2: '#7a3a1a', cost: 3000, style: 14, fant: 1 },
  { id: 'h_tricornio', slot: 'head', name: 'Chapéu de Pirata', kind: 'tricornio', c: '#1d1d1d', cost: 1800, style: 8, fant: 1 },
  { id: 'f_tapaolho', slot: 'face', name: 'Tapa-olho', kind: 'tapaolho', c: '#111', cost: 300, style: 3, fant: 1 },
  { id: 't_astronauta', slot: 'top', name: 'Traje de Astronauta', kind: 'astronauta', sleeve: 'long', c: '#f2f4f8', c2: '#ff8a3c', cost: 40000, style: 45, fant: 1 },
  { id: 'b_astronauta', slot: 'bottom', name: 'Calça Espacial', kind: 'calca', c: '#e6e9f0', cost: 10000, style: 15, fant: 1 },
  { id: 'h_capacete', slot: 'head', name: 'Capacete Espacial', kind: 'capacete', c: '#bfe6ff', cost: 25000, style: 30, fant: 1 },
  { id: 't_princesa', slot: 'top', name: 'Vestido de Princesa', kind: 'princesa', sleeve: 'short', c: '#ff9ccf', c2: '#ffd23c', cost: 12000, style: 35, fant: 1 },
  { id: 't_cavaleiro', slot: 'top', name: 'Armadura de Cavaleiro', kind: 'armadura', sleeve: 'long', c: '#b8c0cc', c2: '#e8384f', cost: 30000, style: 40, fant: 1 },
  { id: 'b_armadura', slot: 'bottom', name: 'Pernas de Armadura', kind: 'calca', c: '#9aa3b0', cost: 10000, style: 12, fant: 1 },
  { id: 'h_elmo', slot: 'head', name: 'Elmo de Cavaleiro', kind: 'elmo', c: '#b8c0cc', cost: 15000, style: 20, fant: 1 },
  { id: 't_mago', slot: 'top', name: 'Túnica de Mago', kind: 'mago', sleeve: 'long', c: '#3b2a8f', c2: '#ffd23c', cost: 8000, style: 28, fant: 1 },
  { id: 'h_mago', slot: 'head', name: 'Chapéu de Mago', kind: 'magochapeu', c: '#3b2a8f', c2: '#ffd23c', cost: 4000, style: 14, fant: 1 },
  { id: 't_vampiro', slot: 'top', name: 'Traje de Vampiro', kind: 'terno', sleeve: 'long', c: '#141018', c2: '#b0124a', tie: '#b0124a', bow: true, cost: 7000, style: 24, fant: 1 },
  { id: 't_robo', slot: 'top', name: 'Corpo de Robô', kind: 'robo', sleeve: 'long', c: '#9aa3b0', c2: '#4dd2ff', cost: 20000, style: 34, fant: 1 },
  { id: 'b_robo', slot: 'bottom', name: 'Pernas de Robô', kind: 'calca', c: '#7d8594', cost: 8000, style: 10, fant: 1 },
  { id: 'h_antena', slot: 'head', name: 'Antena de Robô', kind: 'antena', c: '#ff5d73', cost: 3000, style: 6, fant: 1 },
  { id: 't_dino', slot: 'top', name: 'Macacão de Dinossauro', kind: 'dino', sleeve: 'long', c: '#5bc85b', c2: '#d8f5b0', cost: 4000, style: 16, fant: 1 },
  { id: 'b_dino', slot: 'bottom', name: 'Pernas de Dinossauro', kind: 'calca', c: '#5bc85b', cost: 1500, style: 4, fant: 1 },
  { id: 'h_dino', slot: 'head', name: 'Capuz de Dinossauro', kind: 'dinocapuz', c: '#5bc85b', cost: 2500, style: 8, fant: 1 },
  { id: 't_anjo', slot: 'top', name: 'Túnica de Anjo', kind: 'vestido', sleeve: 'none', c: '#ffffff', cost: 5000, style: 18, fant: 1 },
  { id: 'h_aureola', slot: 'head', name: 'Auréola', kind: 'aureola', c: '#ffd23c', cost: 8000, style: 20, fant: 1 },
  { id: 'h_chifres', slot: 'head', name: 'Chifrinhos', kind: 'chifres', c: '#e8263f', cost: 3000, style: 10, fant: 1 },
  { id: 't_diabinho', slot: 'top', name: 'Roupa de Diabinho', kind: 'camiseta', sleeve: 'long', c: '#c81d3a', cost: 3000, style: 10, fant: 1 },
  { id: 't_palhaco', slot: 'top', name: 'Roupa de Palhaço', kind: 'palhaco', sleeve: 'long', c: '#ffd23c', c2: '#e8384f', cost: 2500, style: 12, fant: 1 },
  { id: 'f_nariz', slot: 'face', name: 'Nariz de Palhaço', kind: 'nariz', c: '#e8263f', cost: 100, style: 2, fant: 1 },
  { id: 'h_gato', slot: 'head', name: 'Orelhas de Gatinho', kind: 'gato', c: '#2a2a2a', cost: 500, style: 5, fant: 1 },
  { id: 'h_coelho', slot: 'head', name: 'Orelhas de Coelho', kind: 'coelho', c: '#ffffff', cost: 500, style: 5, fant: 1 },
  { id: 'h_viking', slot: 'head', name: 'Capacete Viking', kind: 'viking', c: '#9aa3b0', cost: 6000, style: 16, fant: 1 },
];
// Fantasias completas (vestem tudo de uma vez)
export const SETS = [
  { id: 'ninja', name: 'Ninja', icon: '🥷', pieces: { top: 't_ninja', bottom: 'b_ninja', head: 'h_bandana', face: 'f_mascninja', back: 'k_katana', shoes: 's_preto' } },
  { id: 'samurai', name: 'Samurai', icon: '⚔️', pieces: { top: 't_samurai', bottom: 'b_hakama', back: 'k_katana', head: null, face: null } },
  { id: 'colegial', name: 'Estudante de Anime', icon: '🎒', pieces: { top: 't_colegial', bottom: 'b_pregas', back: 'k_mochila', shoes: 's_social' } },
  { id: 'heroi', name: 'Super-Herói', icon: '🦸', pieces: { top: 't_heroi', bottom: 'b_heroi', face: 'f_mascara', back: 'k_capavermelha', shoes: 's_vermelho', head: null } },
  { id: 'pirata', name: 'Pirata', icon: '🏴‍☠️', pieces: { top: 't_pirata', bottom: 'b_jeanspreto', head: 'h_tricornio', face: 'f_tapaolho', shoes: 's_botas', back: 'k_espada' } },
  { id: 'astronauta', name: 'Astronauta', icon: '👩‍🚀', pieces: { top: 't_astronauta', bottom: 'b_astronauta', head: 'h_capacete', back: 'k_jetpack', face: null } },
  { id: 'princesa', name: 'Princesa', icon: '👸', pieces: { top: 't_princesa', head: 'h_tiara', shoes: 's_sapatilha', neck: 'n_colar', back: null } },
  { id: 'cavaleiro', name: 'Cavaleiro', icon: '🛡️', pieces: { top: 't_cavaleiro', bottom: 'b_armadura', head: 'h_elmo', back: 'k_espada', shoes: 's_botas' } },
  { id: 'mago', name: 'Mago', icon: '🧙', pieces: { top: 't_mago', head: 'h_mago', back: null, face: null } },
  { id: 'vampiro', name: 'Vampiro', icon: '🧛', pieces: { top: 't_vampiro', bottom: 'b_social', back: 'k_capapreta', shoes: 's_social', head: null } },
  { id: 'robo', name: 'Robô', icon: '🤖', pieces: { top: 't_robo', bottom: 'b_robo', head: 'h_antena', face: null, back: null } },
  { id: 'dino', name: 'Dinossauro', icon: '🦖', pieces: { top: 't_dino', bottom: 'b_dino', head: 'h_dino', back: 'k_rabo', face: null } },
  { id: 'anjo', name: 'Anjo', icon: '😇', pieces: { top: 't_anjo', head: 'h_aureola', back: 'k_asasanjo', shoes: 's_sapatilha' } },
  { id: 'diabinho', name: 'Diabinho', icon: '😈', pieces: { top: 't_diabinho', bottom: 'b_jeanspreto', head: 'h_chifres', back: 'k_asasmorcego' } },
  { id: 'palhaco', name: 'Palhaço', icon: '🤡', pieces: { top: 't_palhaco', bottom: 'b_moletom', face: 'f_nariz', shoes: 's_vermelho', head: null } },
  { id: 'viking', name: 'Viking', icon: '🪓', pieces: { top: 't_jaqueta', bottom: 'b_cargo', head: 'h_viking', face: 'f_barba', back: 'k_espada', shoes: 's_botas' } },
];
export const CLOTH = Object.fromEntries(CLOTHES.map((c) => [c.id, c]));
export const SLOTS = [
  { id: 'sets', name: 'Fantasias', icon: '🎭' },
  { id: 'top', name: 'Roupas', icon: '👕' }, { id: 'bottom', name: 'Calças e saias', icon: '👖' }, { id: 'shoes', name: 'Calçados', icon: '👟' },
  { id: 'head', name: 'Cabeça', icon: '🧢' }, { id: 'face', name: 'Rosto', icon: '🕶️' }, { id: 'back', name: 'Costas', icon: '🎒' }, { id: 'neck', name: 'Pescoço', icon: '📿' },
];

export function defaultLook(sex = 'm') {
  return {
    sex, skin: 1, hair: sex === 'f' ? 'longo' : 'curto', hairColor: 1, eyes: 0,
    top: 't_branca', bottom: 'b_jeans', shoes: 's_tenis', head: null, face: null, neck: null, back: null,
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
    case 'franja': return `<path d="M44,96 C38,34 162,34 156,96 L158,150 C140,158 120,150 120,150 L80,150 C80,150 60,158 42,150 Z" fill="${c}"/>`;
    case 'anime': return `<path d="M40,120 L30,90 L44,92 L36,60 L54,70 L58,40 L150,40 L146,70 L164,60 L156,92 L170,90 L160,120 Z" fill="${c}"/>`;
    case 'chiquinhas': return `<ellipse cx="34" cy="122" rx="15" ry="32" fill="${c}" transform="rotate(14 34 122)"/><ellipse cx="166" cy="122" rx="15" ry="32" fill="${c}" transform="rotate(-14 166 122)"/><circle cx="46" cy="92" r="6" fill="#ff5d9a"/><circle cx="154" cy="92" r="6" fill="#ff5d9a"/>`;
    case 'tranca': return [0, 1, 2, 3, 4, 5].map((i) => `<ellipse cx="${150 + i * 2}" cy="${112 + i * 18}" rx="${12 - i}" ry="11" fill="${i % 2 ? shade(c, 0.85) : c}"/>`).join('') + `<circle cx="162" cy="222" r="5" fill="#ff5d9a"/>`;
    case 'rasta': return [44, 56, 68, 132, 144, 156].map((x, i) => `<rect x="${x - 6}" y="70" width="12" height="${110 + (i % 3) * 14}" rx="6" fill="${i % 2 ? shade(c, 0.85) : c}"/>`).join('');
    case 'ondulado': return `<path d="M46,92 C40,30 160,30 154,92 Q166,120 154,146 Q166,172 150,196 Q100,210 50,196 Q34,172 46,146 Q34,120 46,92 Z" fill="${c}"/>`;
    case 'chanel': return `<path d="M44,96 C38,34 162,34 156,96 L158,140 Q150,150 138,142 L62,142 Q50,150 42,140 Z" fill="${c}"/>`;
    case 'samurai': return `<circle cx="100" cy="36" r="13" fill="${c}"/><rect x="92" y="44" width="16" height="6" rx="2" fill="#e8384f"/>`;
    case 'cacheado': return [[52, 70], [148, 70], [44, 100], [156, 100], [48, 128], [152, 128]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17" fill="${c}"/>`).join('');
    default: return '';
  }
}
function hairFront(id, c) {
  const cap = `M47,98 C42,18 158,18 153,98 C146,72 120,62 100,64 C80,62 54,72 47,98 Z`;
  switch (id) {
    case 'curto': return `<path d="${cap}" fill="${c}"/>`;
    case 'espetado': return `<path d="M47,96 L46,58 L62,50 L68,30 L86,40 L100,22 L114,40 L132,30 L138,50 L154,58 L153,96 C146,72 120,64 100,66 C80,64 54,72 47,96 Z" fill="${c}"/>`;
    case 'lateral': return `<path d="M47,100 C40,16 160,14 153,96 C150,80 140,66 120,62 C110,76 80,84 56,82 C52,88 49,94 47,100 Z" fill="${c}"/>`;
    case 'longo': return `<path d="M47,104 C40,18 160,18 153,104 C148,80 132,64 110,62 C96,76 70,80 52,78 C50,86 48,94 47,104 Z" fill="${c}"/>`;
    case 'rabo': case 'coque': return `<path d="M47,96 C42,18 158,18 153,96 C146,70 120,58 100,58 C80,58 54,70 47,96 Z" fill="${c}"/>`;
    case 'cacheado': return `<path d="${cap}" fill="${c}"/>` + [[60, 52], [80, 42], [100, 38], [120, 42], [140, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="${c}"/>`).join('');
    case 'black': return `<path d="M50,94 C48,60 152,60 150,94 C140,74 60,74 50,94 Z" fill="${c}"/>`;
    case 'franja': return `<path d="M47,100 C42,14 158,14 153,100 L153,84 L47,84 Z" fill="${c}"/><path d="M50,86 C50,60 150,60 150,86 L150,88 L50,88 Z" fill="${c}"/>`;
    case 'anime': return `<path d="M46,100 L38,72 L54,66 L50,40 L72,48 L78,22 L94,40 L104,12 L114,40 L132,24 L134,48 L156,40 L146,64 L162,72 L154,100 C146,76 124,66 100,74 C80,64 56,74 46,100 Z" fill="${c}"/>`;
    case 'topete': return `<path d="M47,96 C42,50 58,30 88,24 C118,16 152,26 152,48 C142,42 124,42 112,50 C136,46 156,66 153,96 C146,72 120,64 100,66 C80,64 54,72 47,96 Z" fill="${c}"/>`;
    case 'raspado': return `<path d="M48,92 C46,22 154,22 152,92 C146,64 54,64 48,92 Z" fill="${c}" opacity=".8"/>`;
    case 'samurai': return `<path d="M48,92 C46,24 154,24 152,92 C146,66 54,66 48,92 Z" fill="${c}"/>`;
    case 'rasta': return `<path d="M47,96 C42,18 158,18 153,96 C146,72 120,62 100,64 C80,62 54,72 47,96 Z" fill="${c}"/>` + [60, 76, 92, 108, 124, 140].map((x) => `<circle cx="${x}" cy="${54 + Math.abs(100 - x) / 5}" r="8" fill="${shade(c, 0.9)}"/>`).join('');
    case 'ondulado': return `<path d="M47,102 C40,16 160,16 153,102 C150,82 138,66 116,62 C106,74 88,80 70,78 C60,86 52,94 47,102 Z" fill="${c}"/>`;
    case 'chanel': return `<path d="M47,100 C42,16 158,16 153,100 C150,80 140,68 124,64 C112,76 80,80 58,78 C52,86 48,94 47,100 Z" fill="${c}"/>`;
    case 'chiquinhas': case 'tranca': return `<path d="M47,96 C42,18 158,18 153,96 C146,70 120,60 100,62 C80,60 54,70 47,96 Z" fill="${c}"/><path d="M100,48 L100,64" stroke="${shade(c, 0.75)}" stroke-width="3"/>`;
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
    case 'cowboy': return `<ellipse cx="100" cy="58" rx="80" ry="14" fill="${c}"/><path d="M28,56 Q40,40 60,52 M172,56 Q160,40 140,52" stroke="${c}" stroke-width="10" fill="none"/><path d="M62,58 C60,18 140,18 138,58 Z" fill="${c}"/><path d="M100,24 L100,46" stroke="${shade(c, 0.75)}" stroke-width="4"/><rect x="63" y="44" width="74" height="7" fill="#3a2a1a"/>`;
    case 'faixa': return `<path d="M48,70 Q100,52 152,70 L152,84 Q100,66 48,84 Z" fill="#2a2a33"/><rect x="88" y="62" width="24" height="16" rx="3" fill="${c}"/><path d="M93,70 h14" stroke="#555" stroke-width="2"/><path d="M152,74 l22,10 l-6,6 Z M152,78 l18,20 l-8,3 Z" fill="#2a2a33"/>`;
    case 'tricornio': return `<path d="M30,66 Q100,30 170,66 Q150,76 100,58 Q50,76 30,66 Z" fill="${c}"/><path d="M56,62 C56,20 144,20 144,62 Z" fill="${c}"/><circle cx="100" cy="44" r="7" fill="#fff"/><path d="M95,50 h10" stroke="#fff" stroke-width="3"/><path d="M30,66 Q100,30 170,66" stroke="#ffd23c" stroke-width="3" fill="none"/>`;
    case 'capacete': return `<circle cx="100" cy="96" r="70" fill="${c}" opacity=".28"/><circle cx="100" cy="96" r="70" fill="none" stroke="#f2f4f8" stroke-width="7"/><path d="M60,52 q20,-16 44,-14" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/><rect x="60" y="160" width="80" height="12" rx="6" fill="#f2f4f8"/>`;
    case 'elmo': return `<path d="M44,110 C40,30 160,30 156,110 L156,150 L44,150 Z" fill="${c}" stroke="${shade(c, 0.7)}" stroke-width="3"/><rect x="60" y="92" width="80" height="12" rx="4" fill="#2a2a33"/><path d="M100,40 L100,150" stroke="${shade(c, 0.75)}" stroke-width="4"/>${[118, 128, 138].map((y) => `<path d="M70,${y} h60" stroke="${shade(c, 0.8)}" stroke-width="2"/>`).join('')}<path d="M100,40 C110,20 130,14 140,20 C126,24 116,32 108,44 Z" fill="#e8384f"/>`;
    case 'magochapeu': return `<ellipse cx="100" cy="58" rx="72" ry="13" fill="${c}"/><path d="M58,58 L118,-20 L142,58 Z" fill="${c}"/><path d="M118,-20 L128,-8" stroke="${c}" stroke-width="10" stroke-linecap="round"/><path d="M96,24 l3,6 l6,1 l-5,4 l1,6 l-5,-3 l-5,3 l1,-6 l-5,-4 l6,-1 Z" fill="${it.c2}"/><circle cx="120" cy="44" r="4" fill="${it.c2}"/>`;
    case 'antena': return `<path d="M100,46 L100,14" stroke="#7d8594" stroke-width="5"/><circle cx="100" cy="12" r="9" fill="${c}"/><rect x="40" y="94" width="14" height="22" rx="4" fill="#7d8594"/><rect x="146" y="94" width="14" height="22" rx="4" fill="#7d8594"/>`;
    case 'dinocapuz': return `<path d="M38,120 C30,30 170,30 162,120 L162,160 L148,160 C150,120 146,74 100,72 C54,74 50,120 52,160 L38,160 Z" fill="${c}"/>${[[70, 40], [100, 30], [130, 40]].map(([x, y]) => `<path d="M${x - 10},${y + 10} L${x},${y - 12} L${x + 10},${y + 10} Z" fill="#ffd23c"/>`).join('')}<circle cx="74" cy="60" r="7" fill="#fff"/><circle cx="126" cy="60" r="7" fill="#fff"/><circle cx="74" cy="60" r="3.5" fill="#222"/><circle cx="126" cy="60" r="3.5" fill="#222"/>`;
    case 'aureola': return `<ellipse cx="100" cy="28" rx="34" ry="9" fill="none" stroke="${c}" stroke-width="6"/><ellipse cx="100" cy="28" rx="34" ry="9" fill="none" stroke="#fff6b0" stroke-width="2"/>`;
    case 'chifres': return `<path d="M62,60 Q54,36 66,24 Q68,42 78,52 Z M138,60 Q146,36 134,24 Q132,42 122,52 Z" fill="${c}"/>`;
    case 'gato': return `<path d="M54,64 L58,26 L84,50 Z M146,64 L142,26 L116,50 Z" fill="${c}"/><path d="M60,56 L62,36 L76,50 Z M140,56 L138,36 L124,50 Z" fill="#ff9ccf"/>`;
    case 'coelho': return `<ellipse cx="80" cy="20" rx="12" ry="34" fill="${c}" stroke="#e6e6e6" stroke-width="2" transform="rotate(-10 80 20)"/><ellipse cx="120" cy="20" rx="12" ry="34" fill="${c}" stroke="#e6e6e6" stroke-width="2" transform="rotate(10 120 20)"/><ellipse cx="80" cy="22" rx="6" ry="24" fill="#ffc2dc" transform="rotate(-10 80 22)"/><ellipse cx="120" cy="22" rx="6" ry="24" fill="#ffc2dc" transform="rotate(10 120 22)"/>`;
    case 'viking': return `<path d="M46,84 C44,30 156,30 154,84 Z" fill="${c}" stroke="${shade(c, 0.7)}" stroke-width="3"/><rect x="44" y="76" width="112" height="12" rx="4" fill="#8a5a2b"/><path d="M48,64 C30,58 22,40 26,22 C34,38 44,44 56,48 Z M152,64 C170,58 178,40 174,22 C166,38 156,44 144,48 Z" fill="#f4efe2" stroke="#cfc6b0" stroke-width="2"/>`;
    case 'coroa': return `<path d="M60,62 L60,26 L78,44 L100,16 L122,44 L140,26 L140,62 Z" fill="${c}" stroke="#c98a00" stroke-width="3"/><circle cx="100" cy="46" r="6" fill="#ff3b6b"/><circle cx="76" cy="52" r="4" fill="#4da3ff"/><circle cx="124" cy="52" r="4" fill="#2bc46f"/>`;
  }
  return '';
}
function faceAcc(it, skin) {
  if (!it) return '';
  switch (it.kind) {
    case 'grau': return `<g fill="none" stroke="${it.c}" stroke-width="3.5"><circle cx="80" cy="100" r="14"/><circle cx="120" cy="100" r="14"/><path d="M94,100 L106,100"/></g>`;
    case 'sol': return `<g><path d="M62,92 h34 v8 c0,12 -6,16 -17,16 c-11,0 -17,-4 -17,-16 Z M104,92 h34 v8 c0,12 -6,16 -17,16 c-11,0 -17,-4 -17,-16 Z" fill="${it.c}"/><path d="M96,96 h8" stroke="${it.c}" stroke-width="4"/><path d="M68,97 l8,0" stroke="#ffffff66" stroke-width="3"/></g>`;
    case 'coracao': return `<g fill="${it.c}"><path d="M80,116 C62,104 62,88 72,88 C77,88 80,92 80,95 C80,92 83,88 88,88 C98,88 98,104 80,116 Z"/><path d="M120,116 C102,104 102,88 112,88 C117,88 120,92 120,95 C120,92 123,88 128,88 C138,88 138,104 120,116 Z"/></g><path d="M96,98 h8" stroke="${it.c}" stroke-width="4"/>`;
    case 'bigode': return `<path d="M100,114 C92,108 76,110 70,120 C80,118 90,122 100,118 C110,122 120,118 130,120 C124,110 108,108 100,114 Z" fill="#3a2414"/>`;
    case 'mascninja': return `<path d="M50,108 C54,150 146,150 150,108 Z" fill="${it.c}"/>`;
    case 'mascara': return `<path d="M58,92 C70,84 90,86 100,94 C110,86 130,84 142,92 L140,108 C128,114 112,110 100,104 C88,110 72,114 60,108 Z" fill="${it.c}"/><ellipse cx="80" cy="99" rx="8" ry="6" fill="#fff"/><ellipse cx="120" cy="99" rx="8" ry="6" fill="#fff"/><circle cx="80" cy="99" r="3.5" fill="#222"/><circle cx="120" cy="99" r="3.5" fill="#222"/>`;
    case 'tapaolho': return `<path d="M50,80 L150,112" stroke="#111" stroke-width="3"/><ellipse cx="120" cy="101" rx="13" ry="12" fill="${it.c}"/>`;
    case 'nariz': return `<circle cx="100" cy="112" r="10" fill="${it.c}"/><circle cx="97" cy="108" r="3" fill="#fff" opacity=".7"/>`;
    case 'barba': return `<path d="M56,108 C60,146 140,146 144,108 C136,128 118,134 100,134 C82,134 64,128 56,108 Z" fill="${shade(SKINS[skin] ? '#3a2414' : '#3a2414', 1)}" opacity=".85"/>`;
  }
  return '';
}
function beardSVG(id, c) {
  const col = shade(c, 0.95);
  const must = {
    bigode: `<path d="M100,116 C92,111 80,112 76,120 C86,119 94,121 100,119 C106,121 114,119 124,120 C120,112 108,111 100,116 Z" fill="${col}"/>`,
    bigodao: `<path d="M100,116 C88,108 72,112 66,120 C64,112 56,112 57,119 C62,129 82,126 100,120 C118,126 138,129 143,119 C144,112 136,112 134,120 C128,112 112,108 100,116 Z" fill="${col}"/>`,
    fino: `<path d="M82,118 Q100,111 118,118" stroke="${col}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
  };
  const under = {
    curta: `<path d="M52,104 C54,152 146,152 148,104 C140,128 120,140 100,140 C80,140 60,128 52,104 Z" fill="${col}" opacity=".45"/>`,
    cheia: `<path d="M50,100 C50,164 150,164 150,100 C142,124 124,132 100,132 C76,132 58,124 50,100 Z" fill="${col}"/>`,
    lenhador: `<path d="M48,98 C42,184 158,184 152,98 C144,126 124,134 100,134 C76,134 56,126 48,98 Z" fill="${col}"/>`,
    cavanhaque: `<path d="M88,134 Q100,160 112,134 Q100,140 88,134 Z" fill="${col}"/>`,
    barbicha: `<path d="M94,140 Q100,158 106,140 Z" fill="${col}"/>`,
    costeletas: `<path d="M50,90 h9 v34 h-9 Z M141,90 h9 v34 h-9 Z" fill="${col}"/>`,
  };
  const withMust = { cheia: 'bigode', lenhador: 'bigodao', cavanhaque: 'bigode' };
  return { under: under[id] || '', over: must[id] || must[withMust[id]] || '' };
}
function backAcc(it) {
  if (!it) return '';
  const c = it.c;
  switch (it.kind) {
    case 'mochila': return `<rect x="58" y="146" width="84" height="66" rx="16" fill="${shade(c, 0.85)}"/>`;
    case 'violao': return `<g transform="rotate(-35 100 180)"><ellipse cx="100" cy="226" rx="30" ry="34" fill="${c}"/><ellipse cx="100" cy="192" rx="22" ry="24" fill="${c}"/><rect x="94" y="90" width="12" height="100" fill="#5a3418"/><rect x="90" y="80" width="20" height="16" rx="3" fill="#3a2414"/></g>`;
    case 'prancha': return `<ellipse cx="100" cy="160" rx="26" ry="118" fill="${c}" transform="rotate(20 100 160)"/><path d="M100,48 L100,272" stroke="#fff" stroke-width="5" transform="rotate(20 100 160)"/>`;
    case 'capa': return `<path d="M68,144 L132,144 L166,266 Q100,280 34,266 Z" fill="${c}"/>${it.c2 ? `<path d="M68,144 L132,144 L150,200 Q100,206 50,200 Z" fill="${it.c2}" opacity=".35"/>` : ''}${it.shine ? '<path d="M36,262 Q100,276 164,262" stroke="#ffd23c" stroke-width="6" fill="none"/>' : ''}`;
    case 'espada': return `<g transform="rotate(35 100 160)"><rect x="95" y="60" width="10" height="150" rx="2" fill="${c}"/><rect x="80" y="196" width="40" height="8" rx="3" fill="#8a5a2b"/><rect x="95" y="204" width="10" height="26" fill="#5a3418"/><circle cx="100" cy="234" r="6" fill="#ffd23c"/></g>`;
    case 'katana': return `<g transform="rotate(-35 100 160)"><path d="M96,56 Q104,120 100,206 L94,206 Q98,120 90,58 Z" fill="${c}"/><rect x="86" y="204" width="20" height="5" fill="#ffd23c"/><rect x="92" y="208" width="8" height="32" fill="#1d1d2a"/></g>`;
    case 'asas': return `<path d="M70,164 C30,120 2,140 8,170 C14,196 40,206 70,190 Z M130,164 C170,120 198,140 192,170 C186,196 160,206 130,190 Z" fill="${c}" stroke="#dfe6f0" stroke-width="3"/><path d="M60,170 C40,160 24,164 18,176 M140,170 C160,160 176,164 182,176" stroke="#dfe6f0" stroke-width="3" fill="none"/>`;
    case 'morcego': return `<path d="M72,160 L18,128 L28,158 L8,166 L30,178 L22,198 L72,186 Z M128,160 L182,128 L172,158 L192,166 L170,178 L178,198 L128,186 Z" fill="${c}"/>`;
    case 'fada': return `<ellipse cx="46" cy="150" rx="34" ry="22" fill="${c}" opacity=".7" transform="rotate(-25 46 150)"/><ellipse cx="154" cy="150" rx="34" ry="22" fill="${c}" opacity=".7" transform="rotate(25 154 150)"/><ellipse cx="52" cy="196" rx="24" ry="15" fill="${c}" opacity=".7" transform="rotate(20 52 196)"/><ellipse cx="148" cy="196" rx="24" ry="15" fill="${c}" opacity=".7" transform="rotate(-20 148 196)"/>`;
    case 'rabo': return `<path d="M120,200 C150,210 176,236 196,260 C170,256 140,240 112,226 Z" fill="${c}"/>${[[148, 214], [166, 230], [182, 246]].map(([x, y]) => `<path d="M${x - 6},${y + 4} L${x},${y - 10} L${x + 6},${y + 4} Z" fill="#ffd23c"/>`).join('')}`;
    case 'jetpack': return `<rect x="58" y="140" width="30" height="64" rx="12" fill="${c}"/><rect x="112" y="140" width="30" height="64" rx="12" fill="${c}"/><path d="M62,206 l11,26 l11,-26 Z M116,206 l11,26 l11,-26 Z" fill="#ff8a3c"/><path d="M67,206 l6,14 l6,-14 Z M121,206 l6,14 l6,-14 Z" fill="#ffd23c"/>`;
  }
  return '';
}
function neckAcc(it) {
  if (!it) return '';
  switch (it.kind) {
    case 'corrente': return `<path d="M82,152 Q100,176 118,152" stroke="${it.c}" stroke-width="4" fill="none"/>`;
    case 'cachecol': return `<path d="M76,140 Q100,156 124,140 L126,152 Q100,168 74,152 Z" fill="${it.c}"/><rect x="108" y="150" width="14" height="34" rx="4" fill="${it.c}"/><path d="M108,176 h14" stroke="#fff" stroke-width="3"/>`;
    case 'borboleta': return `<path d="M88,146 l12,6 l12,-6 l0,14 l-12,-6 l-12,6 Z" fill="${it.c}"/><circle cx="100" cy="153" r="4" fill="${shade(it.c, 0.8)}"/>`;
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
  const dress = ['vestido', 'princesa', 'mago'].includes(top.kind);
  const f = L.sex === 'f';
  const tc = top.c, td = shade(tc, 0.82);
  const id = 'a' + Math.random().toString(36).slice(2, 7);

  // pernas
  let legs = '';
  const legSkin = `<rect x="76" y="212" width="20" height="54" rx="9" fill="${skin}"/><rect x="104" y="212" width="20" height="54" rx="9" fill="${skin}"/>`;
  if (dress) legs = legSkin;
  else if (bot.kind === 'calca') legs = `<rect x="74" y="206" width="24" height="62" rx="10" fill="${bot.c}"/><rect x="102" y="206" width="24" height="62" rx="10" fill="${bot.c}"/>`;
  else if (bot.kind === 'short') legs = legSkin + `<path d="M70,204 h60 v30 h-28 l-2,-12 l-2,12 h-28 Z" fill="${bot.c}"/>`;
  else if (bot.kind === 'largo') legs = `<path d="M70,204 h60 l8,64 h-34 l-4,-40 l-4,40 h-34 Z" fill="${bot.c}"/>`;
  else if (bot.kind === 'saia') legs = legSkin + `<path d="M72,202 h56 l14,40 h-84 Z" fill="${bot.c}"/>`;
  const shoes = `<ellipse cx="84" cy="270" rx="17" ry="9" fill="${shoe.c}" stroke="${shade(shoe.c, 0.75)}" stroke-width="2"/><ellipse cx="116" cy="270" rx="17" ry="9" fill="${shoe.c}" stroke="${shade(shoe.c, 0.75)}" stroke-width="2"/>`;

  // braços
  const armColor = top.sleeve === 'long' ? tc : skin;
  const sleeveCap = top.sleeve === 'short' ? `<rect x="46" y="150" width="22" height="24" rx="10" fill="${tc}"/><rect x="132" y="150" width="22" height="24" rx="10" fill="${tc}"/>` : '';
  const arms = `<rect x="46" y="150" width="22" height="64" rx="11" fill="${armColor}"/><rect x="132" y="150" width="22" height="64" rx="11" fill="${armColor}"/>${sleeveCap}<circle cx="57" cy="216" r="10" fill="${skin}"/><circle cx="143" cy="216" r="10" fill="${skin}"/>`;

  // tronco
  let torso;
  if (top.kind === 'mago') torso = `<path d="M66,146 C66,140 134,140 134,146 L150,268 C120,276 80,276 50,268 Z" fill="${tc}"/>${[[80, 190], [118, 214], [92, 244], [124, 254], [76, 226]].map(([x, y]) => `<path d="M${x},${y - 6} l2,4 l5,1 l-4,3 l1,5 l-4,-3 l-4,3 l1,-5 l-4,-3 l5,-1 Z" fill="${top.c2}"/>`).join('')}`;
  else if (dress) torso = `<path d="M66,146 C66,140 134,140 134,146 L136,196 L156,252 C130,262 70,262 44,252 L64,196 Z" fill="${tc}"/><path d="M64,196 h72" stroke="${td}" stroke-width="5"/>${top.kind === 'princesa' ? `<path d="M46,250 C70,262 130,262 154,250" stroke="${top.c2}" stroke-width="6" fill="none"/><circle cx="58" cy="152" r="15" fill="${tc}"/><circle cx="142" cy="152" r="15" fill="${tc}"/><path d="M84,150 Q100,164 116,150" stroke="${top.c2}" stroke-width="4" fill="none"/>` : ''}`;
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
  const c2 = top.c2 || '#fff';
  if (top.kind === 'ninja') detail += `<path d="M64,150 L100,180 L136,150 M100,180 L100,212" stroke="${shade(tc, 1.4)}" stroke-width="3" fill="none"/><rect x="62" y="192" width="76" height="10" fill="${c2}"/>`;
  if (top.kind === 'kimono') detail += `<path d="M80,142 L112,200 M120,142 L100,176" stroke="${c2}" stroke-width="5" fill="none"/><rect x="62" y="186" width="76" height="16" fill="${c2}"/><rect x="62" y="192" width="76" height="4" fill="${shade(c2, 0.7)}"/>`;
  if (top.kind === 'marinheiro') detail += `<path d="M64,146 L100,176 L136,146 L136,160 L100,186 L64,160 Z" fill="${c2}"/><path d="M90,176 l10,6 l10,-6 l-4,14 l-6,-5 l-6,5 Z" fill="${top.tie}"/><path d="M68,152 L100,178 L132,152" stroke="#fff" stroke-width="2" fill="none"/>`;
  if (top.kind === 'heroi') detail += `<circle cx="100" cy="170" r="15" fill="${c2}"/><path d="M100,159 l3.5,7 l7.5,1 l-5.5,5 l1.5,7.5 l-7,-3.5 l-7,3.5 l1.5,-7.5 l-5.5,-5 l7.5,-1 Z" fill="${tc}"/><rect x="62" y="198" width="76" height="9" fill="${c2}"/>`;
  if (top.kind === 'pirata') detail += `<path d="M64,150 L88,150 L84,214 L64,214 Z M136,150 L112,150 L116,214 L136,214 Z" fill="${c2}"/><rect x="62" y="196" width="76" height="9" fill="#2a1a10"/><rect x="94" y="195" width="12" height="11" fill="#ffd23c"/><path d="M90,144 L100,162 L110,144" stroke="#d8cfba" stroke-width="3" fill="none"/>`;
  if (top.kind === 'astronauta') detail += `<rect x="80" y="164" width="40" height="28" rx="5" fill="#d7dce6"/><circle cx="90" cy="174" r="4" fill="#ff5d73"/><circle cx="102" cy="174" r="4" fill="#2bc46f"/><circle cx="112" cy="174" r="4" fill="#4da3ff"/><rect x="86" y="182" width="28" height="5" rx="2" fill="${c2}"/><rect x="66" y="150" width="14" height="10" fill="${c2}"/>`;
  if (top.kind === 'armadura') detail += `<path d="M66,170 h68 M66,190 h68" stroke="${shade(tc, 0.75)}" stroke-width="3"/><circle cx="57" cy="154" r="15" fill="${shade(tc, 1.1)}" stroke="${shade(tc, 0.7)}" stroke-width="3"/><circle cx="143" cy="154" r="15" fill="${shade(tc, 1.1)}" stroke="${shade(tc, 0.7)}" stroke-width="3"/><path d="M100,150 l12,8 v14 c0,10 -6,16 -12,20 c-6,-4 -12,-10 -12,-20 v-14 Z" fill="${c2}"/>`;
  if (top.kind === 'robo') detail += `<rect x="78" y="156" width="44" height="40" rx="4" fill="${shade(tc, 0.85)}"/><circle cx="90" cy="168" r="5" fill="${c2}"/><circle cx="110" cy="168" r="5" fill="#ffd23c"/><rect x="86" y="180" width="28" height="8" rx="2" fill="#2a2a33"/><path d="M88,184 h4 M96,184 h4 M104,184 h4" stroke="${c2}" stroke-width="3"/>`;
  if (top.kind === 'dino') detail += `<ellipse cx="100" cy="182" rx="22" ry="28" fill="${c2}"/><path d="M90,166 h20 M88,180 h24 M90,194 h20" stroke="${shade(c2, 0.85)}" stroke-width="2"/>`;
  if (top.kind === 'palhaco') detail += `<g clip-path="url(#${id}t)">${[[76, 160], [116, 166], [92, 186], [124, 196], [72, 200], [106, 208]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${c2}"/>`).join('')}</g><path d="M70,146 q8,10 15,0 q8,10 15,0 q8,10 15,0 q8,10 15,0" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>`;
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
  const beard = beardSVG(L.beard, hair);
  const hideFrontHair = headIt && ['bone', 'gorro', 'cartola', 'elmo', 'viking', 'dinocapuz', 'faixa'].includes(headIt.kind) && L.hair !== 'black';
  const hideBackHair = headIt && ['elmo', 'dinocapuz'].includes(headIt.kind);
  const size = opts.size || 160;
  return `<svg class="avatar" viewBox="0 -10 200 295" width="${size * 200 / 295}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="${id}t"><rect x="64" y="142" width="72" height="72" rx="20"/></clipPath></defs>
    <ellipse cx="100" cy="276" rx="56" ry="9" fill="#0003"/>
    ${backAcc(CLOTH[L.back])}
    ${hideBackHair ? '' : hairBack(L.hair, hair)}
    ${legs}${shoes}${arms}${torso}${detail}${shine}${neckAcc(CLOTH[L.neck])}
    <rect x="88" y="132" width="24" height="16" fill="${shade(skin, 0.92)}"/>
    ${ears}<circle cx="100" cy="98" r="52" fill="${skin}"/>
    ${blush}${brows}${eyes}${lashes}${beard.under}${mouth}${beard.over}${earrings}
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
