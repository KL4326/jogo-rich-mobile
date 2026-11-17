// ===== Dados estáticos do jogo =====
// 1 dia de jogo = 1 minuto real. Todos os valores "por dia" seguem essa regra.
export const DAY_MS = 60_000;

export const SECTORS = [
  { id: 'tech', name: 'Tecnologia', icon: '💻' },
  { id: 'food', name: 'Alimentação', icon: '🍔' },
  { id: 'retail', name: 'Varejo', icon: '🛍️' },
  { id: 'energy', name: 'Energia', icon: '⚡' },
  { id: 'finance', name: 'Financeiro', icon: '🏦' },
  { id: 'realestate', name: 'Imobiliário', icon: '🏢' },
  { id: 'health', name: 'Saúde', icon: '🩺' },
  { id: 'services', name: 'Serviços', icon: '🧰' },
  { id: 'crypto', name: 'Cripto', icon: '🪙' },
];
export const SECTOR = Object.fromEntries(SECTORS.map((s, i) => [s.id, { ...s, idx: i }]));

// Ações (empresas fictícias). sigma = volatilidade por pregão, g = crescimento de longo prazo, div = dividendos por dia
export const STOCKS = [
  { sym: 'TECN3', name: 'TecNova', sector: 'tech', base: 42, sigma: 0.0042, g: 0.000003, div: 0 },
  { sym: 'NUVM3', name: 'Nuvem Mais', sector: 'tech', base: 18, sigma: 0.0056, g: 0.000004, div: 0 },
  { sym: 'PIXL3', name: 'Pixel Games', sector: 'tech', base: 9.5, sigma: 0.0077, g: 0.000005, div: 0 },
  { sym: 'SABR3', name: 'Sabor Brasil', sector: 'food', base: 27, sigma: 0.0028, g: 0.000001, div: 0.0002 },
  { sym: 'GRAO3', name: 'Grão Forte Agro', sector: 'food', base: 35, sigma: 0.0035, g: 0.000002, div: 0.00015 },
  { sym: 'MAGZ3', name: 'MegaLojas', sector: 'retail', base: 14, sigma: 0.0049, g: 0.000002, div: 0 },
  { sym: 'MODA3', name: 'Moda Viva', sector: 'retail', base: 8.2, sigma: 0.0063, g: 0.000003, div: 0 },
  { sym: 'VOLT3', name: 'Volta Energia', sector: 'energy', base: 31, sigma: 0.0032, g: 0.000001, div: 0.00025 },
  { sym: 'PETX3', name: 'PetroMar', sector: 'energy', base: 38, sigma: 0.0046, g: 0.000002, div: 0.0002 },
  { sym: 'BCOF4', name: 'Banco Forte', sector: 'finance', base: 24, sigma: 0.0032, g: 0.000002, div: 0.0002 },
  { sym: 'PAGU3', name: 'PagUp', sector: 'finance', base: 12, sigma: 0.007, g: 0.000005, div: 0 },
  { sym: 'CONS3', name: 'Constrular', sector: 'realestate', base: 16, sigma: 0.0053, g: 0.000002, div: 0.0001 },
  { sym: 'LAJE11', name: 'Fundo Laje', sector: 'realestate', base: 98, sigma: 0.0021, g: 0.000001, div: 0.0003 },
  { sym: 'VIDA3', name: 'VidaMed', sector: 'health', base: 52, sigma: 0.0035, g: 0.000003, div: 0.0001 },
  { sym: 'FARM3', name: 'FarmaJá', sector: 'health', base: 21, sigma: 0.0049, g: 0.000003, div: 0 },
  { sym: 'LOGX3', name: 'LogiExpress', sector: 'services', base: 19, sigma: 0.0053, g: 0.000003, div: 0 },
  { sym: 'BYTE3', name: 'ByteSul', sector: 'tech', base: 26, sigma: 0.005, g: 0.000004, div: 0 },
  { sym: 'ROBO3', name: 'RoboTech', sector: 'tech', base: 64, sigma: 0.006, g: 0.000005, div: 0 },
  { sym: 'DOCE3', name: 'Doce Lar', sector: 'food', base: 15, sigma: 0.003, g: 0.000001, div: 0.0002 },
  { sym: 'CAFE3', name: 'Café Serrano', sector: 'food', base: 11, sigma: 0.004, g: 0.000002, div: 0.0001 },
  { sym: 'PASS3', name: 'Passo Certo Calçados', sector: 'retail', base: 17, sigma: 0.0045, g: 0.000002, div: 0.0001 },
  { sym: 'EOLI3', name: 'Ventos do Sul', sector: 'energy', base: 22, sigma: 0.0035, g: 0.000003, div: 0.0002 },
  { sym: 'ATLS3', name: 'Seguradora Atlas', sector: 'finance', base: 33, sigma: 0.003, g: 0.000002, div: 0.00025 },
  { sym: 'SHOP11', name: 'Fundo Shopping', sector: 'realestate', base: 105, sigma: 0.002, g: 0.000001, div: 0.0003 },
  { sym: 'SAUD3', name: 'Rede Saúde Mais', sector: 'health', base: 44, sigma: 0.004, g: 0.000003, div: 0.0001 },
  { sym: 'CEUA3', name: 'Céu Aberto Aéreas', sector: 'services', base: 7.5, sigma: 0.0065, g: 0.000003, div: 0 },
];

export const CRYPTOS = [
  { sym: 'ODG', name: 'Ouro Digital', sector: 'crypto', base: 350000, sigma: 0.006, g: 0.000004, div: 0 },
  { sym: 'LMN', name: 'Lumen', sector: 'crypto', base: 12000, sigma: 0.0105, g: 0.000005, div: 0 },
  { sym: 'PATO', name: 'PatoCoin', sector: 'crypto', base: 0.8, sigma: 0.0192, g: 0.000002, div: 0 },
  { sym: 'NEB', name: 'Nebula', sector: 'crypto', base: 850, sigma: 0.012, g: 0.000004, div: 0 },
  { sym: 'MIAU', name: 'GatoCoin', sector: 'crypto', base: 0.03, sigma: 0.022, g: 0.000002, div: 0 },
];

export const ASSETS = [...STOCKS, ...CRYPTOS];

// Empresas próprias: custo inicial, lucro/dia por nível
export const BUSINESSES = [
  { id: 'pastel', name: 'Barraca de Pastel', icon: '🥟', sector: 'food', cost: 1000, profit: 25 },
  { id: 'sorvete', name: 'Carrinho de Sorvete', icon: '🍦', sector: 'food', cost: 4000, profit: 76.5 },
  { id: 'lavajato', name: 'Lava-Rápido', icon: '🚿', sector: 'services', cost: 12000, profit: 186 },
  { id: 'barbearia', name: 'Barbearia', icon: '💈', sector: 'services', cost: 35000, profit: 437 },
  { id: 'lanchonete', name: 'Lanchonete', icon: '🍔', sector: 'food', cost: 90000, profit: 919 },
  { id: 'petshop', name: 'Pet Shop', icon: '🐶', sector: 'retail', cost: 220000, profit: 1830 },
  { id: 'roupas', name: 'Loja de Roupas', icon: '👕', sector: 'retail', cost: 550000, profit: 3720 },
  { id: 'oficina', name: 'Oficina Mecânica', icon: '🔧', sector: 'services', cost: 1.4e6, profit: 7650 },
  { id: 'academia', name: 'Academia', icon: '🏋️', sector: 'health', cost: 3.5e6, profit: 15500 },
  { id: 'clinica', name: 'Clínica Médica', icon: '🩺', sector: 'health', cost: 9e6, profit: 31800 },
  { id: 'restaurante', name: 'Restaurante Chique', icon: '🍷', sector: 'food', cost: 2.4e7, profit: 66200 },
  { id: 'hotel', name: 'Hotel 5 Estrelas', icon: '🏨', sector: 'realestate', cost: 6.5e7, profit: 141000 },
  { id: 'startup', name: 'Startup de Apps', icon: '📱', sector: 'tech', cost: 1.8e8, profit: 297000 },
  { id: 'fabrica', name: 'Fábrica de Eletrônicos', icon: '🏭', sector: 'tech', cost: 5e8, profit: 635000 },
  { id: 'mercado', name: 'Rede de Supermercados', icon: '🛒', sector: 'retail', cost: 1.4e9, profit: 1.37e+06 },
  { id: 'aerea', name: 'Companhia Aérea', icon: '✈️', sector: 'services', cost: 4e9, profit: 2.99e+06 },
  { id: 'construtora', name: 'Construtora', icon: '🏗️', sector: 'realestate', cost: 1.15e10, profit: 6.49e+06 },
  { id: 'hospital', name: 'Rede de Hospitais', icon: '🏥', sector: 'health', cost: 3.3e10, profit: 1.42e+07 },
  { id: 'banco', name: 'Banco Digital', icon: '🏦', sector: 'finance', cost: 9.5e10, profit: 3.15e+07 },
  { id: 'petroleo', name: 'Petrolífera', icon: '🛢️', sector: 'energy', cost: 2.8e11, profit: 7.02e+07 },
  { id: 'energia', name: 'Usina Solar Gigante', icon: '☀️', sector: 'energy', cost: 8e11, profit: 1.58e+08 },
  { id: 'streaming', name: 'Rede de TV e Streaming', icon: '📺', sector: 'tech', cost: 2.4e12, profit: 3.5e+08 },
  { id: 'espacial', name: 'Empresa Espacial', icon: '🚀', sector: 'tech', cost: 7e12, profit: 7.88e+08 },
];
export const BIZ_GROWTH = 1.15;
export const BIZ_MILESTONES = [10, 25, 50, 100, 150, 200, 300, 400, 500];

// Educação
export const COURSES = [
  { id: 'medio', name: 'Ensino Médio (Supletivo)', icon: '📘', cost: 400, mins: 3, req: null },
  { id: 'tecnico', name: 'Curso Técnico', icon: '🛠️', cost: 4000, mins: 10, req: 'medio' },
  { id: 'faculdade', name: 'Faculdade', icon: '🎓', cost: 35000, mins: 30, req: 'medio' },
  { id: 'ingles', name: 'Inglês Fluente', icon: '🌎', cost: 20000, mins: 20, req: 'medio' },
  { id: 'mba', name: 'MBA Executivo', icon: '💼', cost: 300000, mins: 90, req: 'faculdade' },
  { id: 'mestrado', name: 'Mestrado no Exterior', icon: '🏛️', cost: 2.5e6, mins: 180, req: 'mba' },
];

// Empregos
export const JOBS = [
  { id: 'entregador', name: 'Entregador de App', icon: '🛵', salary: 60, edu: [], lvl: 1 },
  { id: 'atendente', name: 'Atendente', icon: '☎️', salary: 110, edu: ['medio'], lvl: 1 },
  { id: 'vendedor', name: 'Vendedor', icon: '🤝', salary: 180, edu: ['medio'], lvl: 3 },
  { id: 'tecnico', name: 'Técnico de TI', icon: '🖥️', salary: 380, edu: ['tecnico'], lvl: 4 },
  { id: 'analista', name: 'Analista', icon: '📊', salary: 750, edu: ['faculdade'], lvl: 6 },
  { id: 'gerente', name: 'Gerente', icon: '🧑‍💼', salary: 1600, edu: ['faculdade', 'ingles'], lvl: 9 },
  { id: 'diretor', name: 'Diretor', icon: '👔', salary: 5000, edu: ['mba', 'ingles'], lvl: 13 },
  { id: 'ceo', name: 'CEO de Multinacional', icon: '🏆', salary: 18000, edu: ['mestrado', 'mba', 'ingles'], lvl: 18 },
];

// Imóveis para aluguel (investimento)
export const PROPERTIES = [
  { id: 'kitnet', name: 'Kitnet', icon: '🚪', cost: 80000, rent: 300 },
  { id: 'apto', name: 'Apartamento', icon: '🏢', cost: 260000, rent: 1000 },
  { id: 'sala', name: 'Sala Comercial', icon: '🏬', cost: 650000, rent: 2600 },
  { id: 'praia', name: 'Casa de Temporada', icon: '🏖️', cost: 1.6e6, rent: 6600 },
  { id: 'galpao', name: 'Galpão Logístico', icon: '🏭', cost: 3.2e7, rent: 130000 },
  { id: 'predio', name: 'Prédio Residencial', icon: '🏙️', cost: 9e7, rent: 360000 },
  { id: 'shopping', name: 'Shopping Center', icon: '🛍️', cost: 1.2e9, rent: 4.8e6 },
];

// Bens. bonus = bônus no salário (veículos, só o melhor conta). hours = horas extras de renda offline (moradia, só a melhor conta)
export const GOODS = {
  veiculos: [
    { id: 'bike', name: 'Bicicleta', icon: '🚲', cost: 900, prestige: 1, bonus: 0.05 },
    { id: 'patinete', name: 'Patinete Elétrico', icon: '🛴', cost: 3500, prestige: 2, bonus: 0.07 },
    { id: 'moto', name: 'Moto', icon: '🏍️', cost: 14000, prestige: 3, bonus: 0.10 },
    { id: 'popular', name: 'Carro Popular', icon: '🚗', cost: 60000, prestige: 6, bonus: 0.15 },
    { id: 'picape', name: 'Picape', icon: '🛻', cost: 180000, prestige: 10, bonus: 0.18 },
    { id: 'suv', name: 'SUV', icon: '🚙', cost: 350000, prestige: 14, bonus: 0.20 },
    { id: 'sedan', name: 'Sedan de Luxo', icon: '🚘', cost: 900000, prestige: 25, bonus: 0.25 },
    { id: 'esportivo', name: 'Superesportivo', icon: '🏎️', cost: 4e6, prestige: 60, bonus: 0.30 },
    { id: 'limusine', name: 'Limusine', icon: '🚐', cost: 1.2e7, prestige: 100, bonus: 0.33 },
    { id: 'hipercarro', name: 'Hipercarro', icon: '🏁', cost: 3.5e7, prestige: 180, bonus: 0.36 },
  ],
  ceumar: [
    { id: 'jetski', name: 'Jet Ski', icon: '🌊', cost: 90000, prestige: 6, bonus: 0.12 },
    { id: 'lancha', name: 'Lancha', icon: '🚤', cost: 1.5e6, prestige: 35, bonus: 0.22 },
    { id: 'veleiro', name: 'Veleiro', icon: '⛵', cost: 6e6, prestige: 70, bonus: 0.28 },
    { id: 'heli', name: 'Helicóptero', icon: '🚁', cost: 2.5e7, prestige: 150, bonus: 0.40 },
    { id: 'jato', name: 'Jatinho Particular', icon: '🛩️', cost: 1.5e8, prestige: 400, bonus: 0.50 },
    { id: 'iate', name: 'Iate', icon: '🛥️', cost: 6e8, prestige: 900, bonus: 0.55 },
    { id: 'aviao', name: 'Avião Executivo Grande', icon: '✈️', cost: 2.5e9, prestige: 2000, bonus: 0.60 },
    { id: 'megaiate', name: 'Megaiate', icon: '🚢', cost: 1.2e10, prestige: 5000, bonus: 0.70 },
    { id: 'submarino', name: 'Submarino Particular', icon: '🤿', cost: 6e10, prestige: 12000, bonus: 0.80 },
  ],
  moradia: [
    { id: 'aptosimples', name: 'Apartamento Próprio', icon: '🏠', cost: 180000, prestige: 8, hours: 1 },
    { id: 'casa', name: 'Casa com Quintal', icon: '🏡', cost: 550000, prestige: 18, hours: 2 },
    { id: 'chacara', name: 'Chácara', icon: '🌳', cost: 1.4e6, prestige: 30, hours: 2 },
    { id: 'cobertura', name: 'Cobertura', icon: '🌆', cost: 3e6, prestige: 50, hours: 3 },
    { id: 'mansao', name: 'Mansão', icon: '🏰', cost: 2e7, prestige: 140, hours: 4 },
    { id: 'fazenda', name: 'Fazenda Gigante', icon: '🐄', cost: 6e7, prestige: 230, hours: 4 },
    { id: 'mansaopraia', name: 'Mansão na Praia', icon: '🏝️', cost: 1.2e8, prestige: 350, hours: 5 },
    { id: 'castelo', name: 'Castelo Europeu', icon: '🏯', cost: 9e8, prestige: 900, hours: 6 },
    { id: 'ilha', name: 'Ilha Particular', icon: '🗺️', cost: 8e9, prestige: 2500, hours: 8 },
    { id: 'lua', name: 'Base na Lua', icon: '🌕', cost: 5e11, prestige: 20000, hours: 10 },
  ],
  luxo: [
    { id: 'celular', name: 'Celular Top', icon: '📱', cost: 9000, prestige: 2 },
    { id: 'tenis', name: 'Tênis Colecionável', icon: '👟', cost: 25000, prestige: 4 },
    { id: 'relogio', name: 'Relógio Suíço', icon: '⌚', cost: 90000, prestige: 8 },
    { id: 'bolsa', name: 'Bolsa de Grife', icon: '👜', cost: 250000, prestige: 14 },
    { id: 'joias', name: 'Coleção de Joias', icon: '💍', cost: 1.2e6, prestige: 30 },
    { id: 'vinhos', name: 'Adega de Vinhos Raros', icon: '🍷', cost: 4e6, prestige: 55 },
    { id: 'diamante', name: 'Diamante Rosa', icon: '💎', cost: 2.5e7, prestige: 160 },
    { id: 'coroa', name: 'Coroa Real Antiga', icon: '👑', cost: 1.8e8, prestige: 500 },
  ],
  colecao: [
    { id: 'arte', name: 'Obra de Arte', icon: '🖼️', cost: 1.5e7, prestige: 110 },
    { id: 'classico', name: 'Carro Clássico', icon: '🚕', cost: 3e7, prestige: 170 },
    { id: 'cavalo', name: 'Cavalo de Corrida', icon: '🐎', cost: 6e7, prestige: 250 },
    { id: 'dinossauro', name: 'Fóssil de Dinossauro', icon: '🦖', cost: 2e8, prestige: 550 },
    { id: 'vinicola', name: 'Vinícola na Toscana', icon: '🍇', cost: 4e8, prestige: 700 },
    { id: 'time', name: 'Time de Futebol', icon: '⚽', cost: 3e9, prestige: 2000 },
    { id: 'estadio', name: 'Estádio Próprio', icon: '🏟️', cost: 1.5e10, prestige: 6000 },
    { id: 'satelite', name: 'Satélite Próprio', icon: '🛰️', cost: 4e10, prestige: 9000 },
    { id: 'estacao', name: 'Estação Espacial', icon: '🌌', cost: 2e12, prestige: 50000 },
  ],
};
export const ALL_GOODS = Object.entries(GOODS).flatMap(([cat, list]) => list.map((g) => ({ ...g, cat })));
export const GOOD = Object.fromEntries(ALL_GOODS.map((g) => [g.id, g]));
export const RENT_NO_HOME = 15; // aluguel por dia se não tiver moradia própria

// Cartões: desbloqueados pelo maior patrimônio já alcançado
export const CARDS = [
  { name: 'Estudante', min: 0, cashback: 0, limit: 2000, hours: 2, cls: 'c0' },
  { name: 'Prata', min: 1e4, cashback: 0.01, limit: 2e4, hours: 3, cls: 'c1' },
  { name: 'Ouro', min: 1e5, cashback: 0.02, limit: 2e5, hours: 4, cls: 'c2' },
  { name: 'Platinum', min: 1e6, cashback: 0.03, limit: 2e6, hours: 5, cls: 'c3' },
  { name: 'Black', min: 1e7, cashback: 0.04, limit: 2e7, hours: 6, cls: 'c4' },
  { name: 'Infinite', min: 1e8, cashback: 0.05, limit: 2e8, hours: 7, cls: 'c5' },
  { name: 'Diamante', min: 1e9, cashback: 0.06, limit: 2e9, hours: 8, cls: 'c6' },
  { name: 'Esmeralda', min: 1e10, cashback: 0.07, limit: 2e10, hours: 9, cls: 'c7' },
  { name: 'Obsidiana', min: 1e11, cashback: 0.08, limit: 2e11, hours: 10, cls: 'c8' },
  { name: 'Titânio', min: 1e12, cashback: 0.09, limit: 2e12, hours: 11, cls: 'c9' },
  { name: 'Magnata', min: 1e13, cashback: 0.1, limit: 2e13, hours: 12, cls: 'c10' },
];

// Níveis: recursos liberados
export const UNLOCKS = { bolsa: 2, renda: 1, credito: 3, imoveis: 4, cripto: 6 };
export const LEVEL_BONUS = 0.03; // +3% de renda por nível

export const TRADE_FEE = 0.005; // corretagem 0,5%
export const LOAN_RATE = 0.0012; // juros do empréstimo por dia

// ===== Vida: viagens e amor =====
// days = minutos reais (1 dia = 1 minuto)
export const TRIPS = [
  { id: 'praia', name: 'Praia no Nordeste', icon: '🏖️', days: 3, cost: 2500 },
  { id: 'serra', name: 'Serra Gaúcha', icon: '🍷', days: 4, cost: 6000 },
  { id: 'rio', name: 'Rio de Janeiro', icon: '🌴', days: 5, cost: 9000 },
  { id: 'amazonia', name: 'Amazônia', icon: '🦜', days: 6, cost: 18000 },
  { id: 'baires', name: 'Buenos Aires', icon: '💃', days: 5, cost: 30000 },
  { id: 'caribe', name: 'Caribe', icon: '🏝️', days: 7, cost: 70000 },
  { id: 'florida', name: 'Parques na Flórida', icon: '🎢', days: 10, cost: 140000 },
  { id: 'paris', name: 'Paris', icon: '🗼', days: 8, cost: 220000 },
  { id: 'italia', name: 'Itália', icon: '🍝', days: 10, cost: 320000 },
  { id: 'egito', name: 'Egito', icon: '🐪', days: 9, cost: 400000 },
  { id: 'japao', name: 'Japão', icon: '🗾', days: 12, cost: 550000 },
  { id: 'maldivas', name: 'Maldivas', icon: '🐠', days: 10, cost: 1.4e6 },
  { id: 'dubai', name: 'Dubai', icon: '🌇', days: 7, cost: 3e6 },
  { id: 'safari', name: 'Safári na África', icon: '🦁', days: 12, cost: 5e6 },
  { id: 'antartida', name: 'Antártida', icon: '🐧', days: 15, cost: 2e7 },
  { id: 'mundo', name: 'Volta ao Mundo', icon: '🌍', days: 60, cost: 1.5e8 },
  { id: 'espaco', name: 'Viagem ao Espaço', icon: '🚀', days: 10, cost: 3e9 },
];
export const REST_BONUS = 0.10; // +10% de renda depois de viajar
export const REST_HOURS = 3;

export const LOVE_STAGES = [
  { name: 'Solteiro(a)', icon: '🙂', bonus: 0 },
  { name: 'Ficando', icon: '😊', bonus: 0.02 },
  { name: 'Namorando', icon: '💑', bonus: 0.05 },
  { name: 'Noivos', icon: '💍', bonus: 0.08 },
  { name: 'Casados', icon: '💒', bonus: 0.12 },
];
export const DATES = [
  { id: 'cafe', name: 'Café e passeio no parque', icon: '☕', mins: 2, cost: 80, aff: 8 },
  { id: 'cinema', name: 'Cinema e pizza', icon: '🍿', mins: 3, cost: 350, aff: 12 },
  { id: 'show', name: 'Show da banda favorita', icon: '🎸', mins: 4, cost: 2500, aff: 18 },
  { id: 'jantar', name: 'Jantar à luz de velas', icon: '🕯️', mins: 4, cost: 15000, aff: 24 },
  { id: 'balao', name: 'Passeio de balão', icon: '🎈', mins: 5, cost: 120000, aff: 32 },
  { id: 'iatepasseio', name: 'Pôr do sol num iate', icon: '🛥️', mins: 6, cost: 1.5e6, aff: 45 },
];
export const GIFTS = [
  { id: 'chocolate', name: 'Caixa de bombons', icon: '🍫', cost: 60, aff: 3 },
  { id: 'flores', name: 'Buquê de flores', icon: '💐', cost: 200, aff: 5 },
  { id: 'perfume', name: 'Perfume importado', icon: '🧴', cost: 3000, aff: 9 },
  { id: 'pelucia', name: 'Urso de pelúcia gigante', icon: '🧸', cost: 900, aff: 7 },
  { id: 'joia', name: 'Joia exclusiva', icon: '💎', cost: 80000, aff: 18 },
  { id: 'carrop', name: 'Um carro de presente', icon: '🎁', cost: 1.2e6, aff: 35 },
];
export const RING_COST = 25000;
export const WEDDINGS = [
  { id: 'simples', name: 'Casamento simples', icon: '⛪', cost: 40000, mins: 5, prestige: 20 },
  { id: 'festao', name: 'Festão com 300 convidados', icon: '🎉', cost: 600000, mins: 8, prestige: 120 },
  { id: 'praia', name: 'Casamento na praia paradisíaca', icon: '🏝️', cost: 8e6, mins: 10, prestige: 500 },
  { id: 'castelo', name: 'Casamento real num castelo', icon: '🏰', cost: 2e8, mins: 15, prestige: 3000 },
];
export const NAMES_F = ['Ana', 'Bia', 'Carla', 'Duda', 'Elisa', 'Fernanda', 'Gabi', 'Helena', 'Isa', 'Júlia', 'Larissa', 'Mari', 'Nina', 'Paula', 'Rafa', 'Sofia', 'Taís', 'Vivi', 'Yasmin', 'Lara', 'Clara', 'Bruna'];
export const NAMES_M = ['Arthur', 'Bruno', 'Caio', 'Davi', 'Enzo', 'Felipe', 'Gui', 'Heitor', 'Igor', 'João', 'Léo', 'Matheus', 'Nico', 'Otávio', 'Pedro', 'Rafa', 'Samuel', 'Theo', 'Vitor', 'Lucas', 'Miguel', 'Diego'];
