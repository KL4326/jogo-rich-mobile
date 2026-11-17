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
];

export const CRYPTOS = [
  { sym: 'ODG', name: 'Ouro Digital', sector: 'crypto', base: 350000, sigma: 0.006, g: 0.000004, div: 0 },
  { sym: 'LMN', name: 'Lumen', sector: 'crypto', base: 12000, sigma: 0.0105, g: 0.000005, div: 0 },
  { sym: 'PATO', name: 'PatoCoin', sector: 'crypto', base: 0.8, sigma: 0.0192, g: 0.000002, div: 0 },
];

export const ASSETS = [...STOCKS, ...CRYPTOS];

// Empresas próprias: custo inicial, lucro/dia por nível
export const BUSINESSES = [
  { id: 'pastel', name: 'Barraca de Pastel', icon: '🥟', sector: 'food', cost: 1000, profit: 25 },
  { id: 'lavajato', name: 'Lava-Rápido', icon: '🚿', sector: 'services', cost: 12000, profit: 160 },
  { id: 'lanchonete', name: 'Lanchonete', icon: '🍔', sector: 'food', cost: 80000, profit: 900 },
  { id: 'roupas', name: 'Loja de Roupas', icon: '👕', sector: 'retail', cost: 450000, profit: 4200 },
  { id: 'academia', name: 'Academia', icon: '🏋️', sector: 'health', cost: 2.5e6, profit: 19000 },
  { id: 'restaurante', name: 'Restaurante Chique', icon: '🍷', sector: 'food', cost: 1.5e7, profit: 95000 },
  { id: 'startup', name: 'Startup de Apps', icon: '📱', sector: 'tech', cost: 9e7, profit: 480000 },
  { id: 'mercado', name: 'Rede de Supermercados', icon: '🛒', sector: 'retail', cost: 6e8, profit: 2.7e6 },
  { id: 'construtora', name: 'Construtora', icon: '🏗️', sector: 'realestate', cost: 4e9, profit: 1.5e7 },
  { id: 'banco', name: 'Banco Digital', icon: '🏦', sector: 'finance', cost: 3e10, profit: 9e7 },
  { id: 'energia', name: 'Usina Solar', icon: '☀️', sector: 'energy', cost: 2.5e11, profit: 6e8 },
  { id: 'espacial', name: 'Empresa Espacial', icon: '🚀', sector: 'tech', cost: 2.5e12, profit: 5e9 },
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
    { id: 'moto', name: 'Moto', icon: '🏍️', cost: 14000, prestige: 3, bonus: 0.10 },
    { id: 'popular', name: 'Carro Popular', icon: '🚗', cost: 60000, prestige: 6, bonus: 0.15 },
    { id: 'suv', name: 'SUV', icon: '🚙', cost: 220000, prestige: 12, bonus: 0.20 },
    { id: 'sedan', name: 'Sedan de Luxo', icon: '🚘', cost: 800000, prestige: 25, bonus: 0.25 },
    { id: 'esportivo', name: 'Superesportivo', icon: '🏎️', cost: 4e6, prestige: 60, bonus: 0.30 },
    { id: 'heli', name: 'Helicóptero', icon: '🚁', cost: 2.5e7, prestige: 150, bonus: 0.40 },
    { id: 'jato', name: 'Jatinho Particular', icon: '🛩️', cost: 1.5e8, prestige: 400, bonus: 0.50 },
    { id: 'iate', name: 'Iate', icon: '🛥️', cost: 6e8, prestige: 900, bonus: 0.50 },
  ],
  moradia: [
    { id: 'aptosimples', name: 'Apartamento Próprio', icon: '🏠', cost: 180000, prestige: 8, hours: 1 },
    { id: 'casa', name: 'Casa com Quintal', icon: '🏡', cost: 550000, prestige: 18, hours: 2 },
    { id: 'cobertura', name: 'Cobertura', icon: '🌆', cost: 3e6, prestige: 50, hours: 3 },
    { id: 'mansao', name: 'Mansão', icon: '🏰', cost: 2e7, prestige: 140, hours: 4 },
    { id: 'mansaopraia', name: 'Mansão na Praia', icon: '🏝️', cost: 1.2e8, prestige: 350, hours: 5 },
    { id: 'castelo', name: 'Castelo Europeu', icon: '🏯', cost: 9e8, prestige: 900, hours: 6 },
    { id: 'ilha', name: 'Ilha Particular', icon: '🗺️', cost: 8e9, prestige: 2500, hours: 8 },
  ],
  luxo: [
    { id: 'celular', name: 'Celular Top', icon: '📱', cost: 9000, prestige: 2 },
    { id: 'relogio', name: 'Relógio Suíço', icon: '⌚', cost: 90000, prestige: 8 },
    { id: 'joias', name: 'Coleção de Joias', icon: '💎', cost: 1.2e6, prestige: 30 },
    { id: 'arte', name: 'Obra de Arte', icon: '🖼️', cost: 1.5e7, prestige: 110 },
    { id: 'cavalo', name: 'Cavalo de Corrida', icon: '🐎', cost: 6e7, prestige: 250 },
    { id: 'vinicola', name: 'Vinícola na Toscana', icon: '🍇', cost: 4e8, prestige: 700 },
    { id: 'time', name: 'Time de Futebol', icon: '⚽', cost: 3e9, prestige: 2000 },
    { id: 'satelite', name: 'Satélite Próprio', icon: '🛰️', cost: 4e10, prestige: 6000 },
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

export const TRADE_FEE = 0.005; // corretagem 0,3%
export const LOAN_RATE = 0.0012; // juros do empréstimo por dia
