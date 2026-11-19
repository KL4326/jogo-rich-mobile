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

// Total de ações de cada empresa (define quanto custa ser dono de uma fatia)
const SHARES = { TECN3: 2e8, NUVM3: 1.5e8, PIXL3: 8e7, SABR3: 1.2e8, GRAO3: 1e8, MAGZ3: 1.8e8, MODA3: 6e7, VOLT3: 2.5e8, PETX3: 5e8, BCOF4: 4e8, PAGU3: 1e8, CONS3: 7e7, LAJE11: 1e7, VIDA3: 9e7, FARM3: 8e7, LOGX3: 6e7, BYTE3: 5e7, ROBO3: 4e7, DOCE3: 3e7, CAFE3: 2e7, PASS3: 3e7, EOLI3: 6e7, ATLS3: 1e8, SHOP11: 8e6, SAUD3: 6e7, CEUA3: 1.2e8 };
STOCKS.forEach((a) => { a.shares = SHARES[a.sym]; });
// Marcos de participação: bônus nos dividendos (extra = dividendos que passam a vir mesmo de empresas que não pagam)
export const OWN_TIERS = [
  { min: 0.01, name: 'Acionista', icon: '📜', mult: 1, extra: 0 },
  { min: 0.10, name: 'Conselheiro', icon: '🪑', mult: 1.1, extra: 0.00005 },
  { min: 0.25, name: 'Sócio', icon: '🤝', mult: 1.25, extra: 0.0001 },
  { min: 0.51, name: 'Controlador', icon: '👑', mult: 1.5, extra: 0.0002 },
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

// Educação. grp: base | tecnico | faculdade | espec. req = cursos necessários antes
export const COURSE_GROUPS = [
  { id: 'base', name: 'Básico', icon: '📘' }, { id: 'tecnico', name: 'Cursos técnicos', icon: '🛠️' },
  { id: 'faculdade', name: 'Faculdades', icon: '🎓' }, { id: 'espec', name: 'Especializações', icon: '🏅' },
];
export const COURSES = [
  { id: 'medio', grp: 'base', name: 'Ensino Médio (Supletivo)', icon: '📘', cost: 400, mins: 3, req: [] },
  { id: 'ingles', grp: 'base', name: 'Inglês Fluente', icon: '🌎', cost: 20000, mins: 20, req: ['medio'] },
  { id: 'tecnico', grp: 'tecnico', name: 'Técnico em Informática', icon: '🛠️', cost: 4000, mins: 10, req: ['medio'] },
  { id: 'tec_enf', grp: 'tecnico', name: 'Técnico em Enfermagem', icon: '💉', cost: 5000, mins: 12, req: ['medio'] },
  { id: 'gastronomia', grp: 'tecnico', name: 'Gastronomia', icon: '👨‍🍳', cost: 9000, mins: 15, req: ['medio'] },
  { id: 'policia', grp: 'tecnico', name: 'Academia de Polícia', icon: '🚓', cost: 3000, mins: 15, req: ['medio'] },
  { id: 'bombeiro', grp: 'tecnico', name: 'Curso de Bombeiro', icon: '🚒', cost: 3000, mins: 12, req: ['medio'] },
  { id: 'piloto', grp: 'tecnico', name: 'Escola de Aviação', icon: '🛩️', cost: 150000, mins: 45, req: ['medio'] },
  { id: 'faculdade', grp: 'faculdade', name: 'Administração', icon: '📊', cost: 35000, mins: 30, req: ['medio'] },
  { id: 'contabeis', grp: 'faculdade', name: 'Ciências Contábeis', icon: '🧮', cost: 30000, mins: 30, req: ['medio'] },
  { id: 'economia', grp: 'faculdade', name: 'Economia', icon: '📈', cost: 40000, mins: 35, req: ['medio'] },
  { id: 'direito', grp: 'faculdade', name: 'Direito', icon: '⚖️', cost: 50000, mins: 40, req: ['medio'] },
  { id: 'medicina', grp: 'faculdade', name: 'Medicina', icon: '🩺', cost: 180000, mins: 90, req: ['medio'] },
  { id: 'odonto', grp: 'faculdade', name: 'Odontologia', icon: '🦷', cost: 90000, mins: 50, req: ['medio'] },
  { id: 'enfermagem', grp: 'faculdade', name: 'Enfermagem', icon: '👩‍⚕️', cost: 35000, mins: 30, req: ['medio'] },
  { id: 'psicologia', grp: 'faculdade', name: 'Psicologia', icon: '🧠', cost: 40000, mins: 35, req: ['medio'] },
  { id: 'veterinaria', grp: 'faculdade', name: 'Medicina Veterinária', icon: '🐾', cost: 70000, mins: 45, req: ['medio'] },
  { id: 'computacao', grp: 'faculdade', name: 'Ciência da Computação', icon: '💻', cost: 45000, mins: 35, req: ['medio'] },
  { id: 'engenharia', grp: 'faculdade', name: 'Engenharia', icon: '⚙️', cost: 60000, mins: 45, req: ['medio'] },
  { id: 'arquitetura', grp: 'faculdade', name: 'Arquitetura', icon: '📐', cost: 50000, mins: 40, req: ['medio'] },
  { id: 'biologia', grp: 'faculdade', name: 'Biologia', icon: '🧬', cost: 30000, mins: 30, req: ['medio'] },
  { id: 'pedagogia', grp: 'faculdade', name: 'Pedagogia / Licenciatura', icon: '📚', cost: 20000, mins: 25, req: ['medio'] },
  { id: 'jornalismo', grp: 'faculdade', name: 'Jornalismo', icon: '🎙️', cost: 30000, mins: 30, req: ['medio'] },
  { id: 'artes', grp: 'faculdade', name: 'Artes Cênicas', icon: '🎭', cost: 40000, mins: 35, req: ['medio'] },
  { id: 'pf', grp: 'espec', name: 'Concurso da Polícia Federal', icon: '🛡️', cost: 150000, mins: 60, req: ['policia'] },
  { id: 'oficial', grp: 'espec', name: 'Academia de Oficiais', icon: '🎖️', cost: 400000, mins: 90, req: [], reqAny: ['policia', 'bombeiro'] },
  { id: 'oab', grp: 'espec', name: 'Exame da OAB', icon: '📜', cost: 15000, mins: 20, req: ['direito'] },
  { id: 'concurso_jur', grp: 'espec', name: 'Concurso de Carreiras Jurídicas', icon: '🏛️', cost: 120000, mins: 90, req: ['oab'] },
  { id: 'residencia', grp: 'espec', name: 'Residência Médica', icon: '🏥', cost: 250000, mins: 120, req: ['medicina'] },
  { id: 'mba', grp: 'espec', name: 'MBA Executivo', icon: '💼', cost: 300000, mins: 90, req: ['faculdade'] },
  { id: 'mestrado', grp: 'espec', name: 'Mestrado', icon: '🏛️', cost: 2.5e6, mins: 180, req: ['mba'] },
  { id: 'mestrado_ci', grp: 'espec', name: 'Mestrado em Ciências', icon: '🔬', cost: 800000, mins: 120, req: [], reqAny: ['biologia', 'computacao', 'engenharia', 'medicina'] },
  { id: 'doutorado', grp: 'espec', name: 'Doutorado', icon: '🎓', cost: 4e6, mins: 240, req: [], reqAny: ['mestrado', 'mestrado_ci'] },
];
export const JOB_AREAS = [
  { id: 'basico', name: 'Básicos', icon: '🧰' }, { id: 'saude', name: 'Saúde', icon: '🩺' }, { id: 'direito', name: 'Direito', icon: '⚖️' },
  { id: 'tech', name: 'Tecnologia', icon: '💻' }, { id: 'negocios', name: 'Negócios', icon: '💼' }, { id: 'eng', name: 'Engenharia', icon: '⚙️' },
  { id: 'ciencia', name: 'Ciências', icon: '🔬' }, { id: 'educacao', name: 'Educação', icon: '📚' }, { id: 'comunicacao', name: 'Comunicação', icon: '🎙️' },
  { id: 'seguranca', name: 'Segurança', icon: '🚓' }, { id: 'aviacao', name: 'Aviação', icon: '✈️' },
];
// Profissões. salary = por dia (1 min). edu = formação exigida; lvl = nível mínimo
export const JOBS = [
  { id: 'entregador', area: 'basico', name: 'Entregador(a) de App', icon: '🛵', salary: 60, edu: [], lvl: 1 },
  { id: 'garcom', area: 'basico', name: 'Garçom / Garçonete', icon: '🍽️', salary: 70, edu: [], lvl: 1 },
  // Empregos de entrada (sem estudo), um por área: o jogador novo começa num deles, sorteado
  { id: 'farmacia', area: 'saude', name: 'Atendente de Farmácia', icon: '💊', salary: 65, edu: [], lvl: 1 },
  { id: 'mensageiro', area: 'direito', name: 'Mensageiro(a) de Escritório', icon: '📨', salary: 60, edu: [], lvl: 1 },
  { id: 'montador', area: 'tech', name: 'Montador(a) de Computadores', icon: '🔌', salary: 65, edu: [], lvl: 1 },
  { id: 'repositor', area: 'negocios', name: 'Repositor(a) de Mercado', icon: '🛒', salary: 60, edu: [], lvl: 1 },
  { id: 'ajudante_obra', area: 'eng', name: 'Ajudante de Obras', icon: '👷', salary: 65, edu: [], lvl: 1 },
  { id: 'aux_lab', area: 'ciencia', name: 'Auxiliar de Laboratório', icon: '🧫', salary: 60, edu: [], lvl: 1 },
  { id: 'monitor', area: 'educacao', name: 'Monitor(a) de Recreação', icon: '🎈', salary: 55, edu: [], lvl: 1 },
  { id: 'promotor_ev', area: 'comunicacao', name: 'Promotor(a) de Eventos', icon: '🎪', salary: 60, edu: [], lvl: 1 },
  { id: 'vigia', area: 'seguranca', name: 'Vigia Noturno(a)', icon: '🔦', salary: 65, edu: [], lvl: 1 },
  { id: 'bagagem', area: 'aviacao', name: 'Carregador(a) de Bagagens', icon: '🧳', salary: 65, edu: [], lvl: 1 },
  { id: 'atendente', area: 'basico', name: 'Atendente', icon: '☎️', salary: 110, edu: ['medio'], lvl: 1 },
  { id: 'recepcionista', area: 'basico', name: 'Recepcionista', icon: '🛎️', salary: 130, edu: ['medio'], lvl: 2 },
  { id: 'vendedor', area: 'basico', name: 'Vendedor(a)', icon: '🤝', salary: 180, edu: ['medio'], lvl: 3 },
  { id: 'supervisor', area: 'basico', name: 'Supervisor(a) de Loja', icon: '🏪', salary: 420, edu: ['medio'], lvl: 6 },
  { id: 'influencer', area: 'comunicacao', name: 'Influenciador(a) Digital', icon: '🤳', salary: 350, edu: ['medio'], lvl: 5 },
  { id: 'tec_enf', area: 'saude', name: 'Técnico(a) de Enfermagem', icon: '💉', salary: 300, edu: ['tec_enf'], lvl: 3 },
  { id: 'enfermeiro', area: 'saude', name: 'Enfermeiro(a)', icon: '👩‍⚕️', salary: 650, edu: ['enfermagem'], lvl: 5 },
  { id: 'psicologo', area: 'saude', name: 'Psicólogo(a)', icon: '🧠', salary: 750, edu: ['psicologia'], lvl: 5 },
  { id: 'veterinario', area: 'saude', name: 'Veterinário(a)', icon: '🐾', salary: 950, edu: ['veterinaria'], lvl: 6 },
  { id: 'dentista', area: 'saude', name: 'Dentista', icon: '🦷', salary: 1500, edu: ['odonto'], lvl: 7 },
  { id: 'medico', area: 'saude', name: 'Médico(a) Clínico(a)', icon: '🩺', salary: 2400, edu: ['medicina'], lvl: 8 },
  { id: 'cirurgiao', area: 'saude', name: 'Cirurgião(ã)', icon: '🔪', salary: 9000, edu: ['residencia'], lvl: 12 },
  { id: 'dir_medico', area: 'saude', name: 'Diretor(a) Médico(a) de Hospital', icon: '🏥', salary: 15500, edu: ['residencia', 'mestrado_ci'], lvl: 18 },
  { id: 'estagiario', area: 'direito', name: 'Estagiário(a) de Direito', icon: '📁', salary: 300, edu: ['direito'], lvl: 3 },
  { id: 'advogado', area: 'direito', name: 'Advogado(a)', icon: '💼', salary: 1300, edu: ['oab'], lvl: 6 },
  { id: 'delegado', area: 'direito', name: 'Delegado(a)', icon: '🕵️', salary: 3600, edu: ['oab', 'policia'], lvl: 10 },
  { id: 'promotor', area: 'direito', name: 'Promotor(a) de Justiça', icon: '📢', salary: 5000, edu: ['concurso_jur'], lvl: 12 },
  { id: 'juiz', area: 'direito', name: 'Juiz(a)', icon: '👩‍⚖️', salary: 7500, edu: ['concurso_jur'], lvl: 14 },
  { id: 'desembargador', area: 'direito', name: 'Desembargador(a)', icon: '🏛️', salary: 13500, edu: ['concurso_jur', 'doutorado'], lvl: 17 },
  { id: 'ministro', area: 'direito', name: 'Ministro(a) do Supremo', icon: '⚖️', salary: 16500, edu: ['concurso_jur', 'doutorado'], lvl: 20 },
  { id: 'tecnico', area: 'tech', name: 'Técnico(a) de TI', icon: '🖥️', salary: 380, edu: ['tecnico'], lvl: 4 },
  { id: 'programador', area: 'tech', name: 'Programador(a)', icon: '👩‍💻', salary: 950, edu: ['computacao'], lvl: 5 },
  { id: 'dev_senior', area: 'tech', name: 'Dev Sênior', icon: '🧑‍💻', salary: 2300, edu: ['computacao', 'ingles'], lvl: 9 },
  { id: 'cientista_dados', area: 'tech', name: 'Cientista de Dados', icon: '📊', salary: 3200, edu: ['computacao', 'mestrado_ci'], lvl: 11 },
  { id: 'cto', area: 'tech', name: 'Diretor(a) de Tecnologia (CTO)', icon: '🚀', salary: 15000, edu: ['computacao', 'mba', 'ingles'], lvl: 17 },
  { id: 'analista', area: 'negocios', name: 'Analista', icon: '📈', salary: 750, edu: ['faculdade'], lvl: 6 },
  { id: 'contador', area: 'negocios', name: 'Contador(a)', icon: '🧮', salary: 850, edu: ['contabeis'], lvl: 6 },
  { id: 'economista', area: 'negocios', name: 'Economista', icon: '💹', salary: 1100, edu: ['economia'], lvl: 7 },
  { id: 'gerente', area: 'negocios', name: 'Gerente', icon: '🧑‍💼', salary: 1600, edu: ['faculdade', 'ingles'], lvl: 9 },
  { id: 'operador', area: 'negocios', name: 'Operador(a) da Bolsa', icon: '📉', salary: 2600, edu: ['economia', 'ingles'], lvl: 10 },
  { id: 'diretor', area: 'negocios', name: 'Diretor(a)', icon: '👔', salary: 5000, edu: ['mba', 'ingles'], lvl: 13 },
  { id: 'ceo', area: 'negocios', name: 'CEO de Multinacional', icon: '🏆', salary: 18000, edu: ['mestrado', 'mba', 'ingles'], lvl: 18 },
  { id: 'engenheiro', area: 'eng', name: 'Engenheiro(a)', icon: '⚙️', salary: 1300, edu: ['engenharia'], lvl: 6 },
  { id: 'arquiteto', area: 'eng', name: 'Arquiteto(a)', icon: '📐', salary: 1150, edu: ['arquitetura'], lvl: 6 },
  { id: 'eng_petroleo', area: 'eng', name: 'Engenheiro(a) de Petróleo', icon: '🛢️', salary: 2800, edu: ['engenharia', 'ingles'], lvl: 9 },
  { id: 'eng_chefe', area: 'eng', name: 'Engenheiro(a)-Chefe', icon: '🏗️', salary: 6500, edu: ['engenharia', 'mba'], lvl: 12 },
  { id: 'pres_construtora', area: 'eng', name: 'Presidente de Construtora', icon: '🌆', salary: 14500, edu: ['engenharia', 'mba', 'ingles'], lvl: 17 },
  { id: 'biologo', area: 'ciencia', name: 'Biólogo(a)', icon: '🧬', salary: 800, edu: ['biologia'], lvl: 5 },
  { id: 'pesquisador', area: 'ciencia', name: 'Pesquisador(a)', icon: '🔬', salary: 2200, edu: ['mestrado_ci'], lvl: 9 },
  { id: 'cientista', area: 'ciencia', name: 'Cientista Renomado(a)', icon: '🧪', salary: 6500, edu: ['doutorado'], lvl: 14 },
  { id: 'astronauta', area: 'ciencia', name: 'Astronauta', icon: '👩‍🚀', salary: 15500, edu: ['doutorado', 'piloto', 'ingles'], lvl: 18 },
  { id: 'professor', area: 'educacao', name: 'Professor(a)', icon: '🧑‍🏫', salary: 550, edu: ['pedagogia'], lvl: 4 },
  { id: 'coordenador', area: 'educacao', name: 'Coordenador(a) Escolar', icon: '📋', salary: 1200, edu: ['pedagogia'], lvl: 8 },
  { id: 'prof_univ', area: 'educacao', name: 'Professor(a) Universitário(a)', icon: '🎓', salary: 3000, edu: ['doutorado'], lvl: 12 },
  { id: 'reitor', area: 'educacao', name: 'Reitor(a)', icon: '🏫', salary: 9000, edu: ['doutorado', 'mba'], lvl: 15 },
  { id: 'ministro_edu', area: 'educacao', name: 'Ministro(a) da Educação', icon: '🏛️', salary: 14000, edu: ['doutorado', 'mba', 'ingles'], lvl: 18 },
  { id: 'jornalista', area: 'comunicacao', name: 'Jornalista', icon: '🎙️', salary: 700, edu: ['jornalismo'], lvl: 5 },
  { id: 'chef', area: 'comunicacao', name: 'Chef de Cozinha', icon: '👨‍🍳', salary: 1400, edu: ['gastronomia'], lvl: 7 },
  { id: 'apresentador', area: 'comunicacao', name: 'Apresentador(a) de TV', icon: '📺', salary: 7500, edu: ['jornalismo', 'ingles'], lvl: 13 },
  { id: 'ator', area: 'comunicacao', name: 'Ator / Atriz de Novela', icon: '🎭', salary: 2500, edu: ['artes'], lvl: 8 },
  { id: 'estrela', area: 'comunicacao', name: 'Estrela de Cinema Internacional', icon: '🎬', salary: 14500, edu: ['artes', 'ingles'], lvl: 17 },
  { id: 'bombeiro', area: 'seguranca', name: 'Bombeiro(a)', icon: '🚒', salary: 650, edu: ['bombeiro'], lvl: 4 },
  { id: 'policial', area: 'seguranca', name: 'Policial', icon: '👮', salary: 700, edu: ['policia'], lvl: 4 },
  { id: 'sargento', area: 'seguranca', name: 'Sargento', icon: '🪖', salary: 1400, edu: ['policia'], lvl: 7 },
  { id: 'agente_pf', area: 'seguranca', name: 'Agente da Polícia Federal', icon: '🛡️', salary: 3500, edu: ['pf'], lvl: 10 },
  { id: 'cmt_bombeiros', area: 'seguranca', name: 'Comandante dos Bombeiros', icon: '🚒', salary: 6500, edu: ['bombeiro', 'oficial'], lvl: 13 },
  { id: 'coronel', area: 'seguranca', name: 'Coronel', icon: '🎖️', salary: 7500, edu: ['policia', 'oficial'], lvl: 14 },
  { id: 'chefe_intel', area: 'seguranca', name: 'Diretor(a) de Inteligência Nacional', icon: '🕶️', salary: 14000, edu: ['pf', 'oficial', 'ingles'], lvl: 18 },
  { id: 'piloto', area: 'aviacao', name: 'Piloto(a) de Avião', icon: '🧑‍✈️', salary: 4500, edu: ['piloto', 'ingles'], lvl: 9 },
  { id: 'comandante', area: 'aviacao', name: 'Comandante de Voo', icon: '✈️', salary: 9000, edu: ['piloto', 'ingles'], lvl: 14 },
  { id: 'pres_aerea', area: 'aviacao', name: 'Presidente de Companhia Aérea', icon: '🛫', salary: 15000, edu: ['piloto', 'mba', 'ingles'], lvl: 17 },
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
    { id: 'bike', brand: 'pedala', tier: 'Entrada', name: 'Pedala Urbana', icon: '🚲', hue: 0, cost: 900, prestige: 1, bonus: 0.05 },
    { id: 'patinete', brand: 'pedala', tier: 'Entrada', name: 'Pedala Patinete Elétrico', icon: '🛴', hue: 0, cost: 3500, prestige: 2, bonus: 0.093 },
    { id: 'ebike', brand: 'pedala', tier: 'Intermediário', name: 'Pedala Bike Elétrica', icon: '🚲', hue: 140, cost: 9000, prestige: 3, bonus: 0.123 },
    { id: 'moto', brand: 'trovao', tier: 'Entrada', name: 'Trovão 150', icon: '🛵', hue: 0, cost: 14000, prestige: 4, bonus: 0.138 },
    { id: 'moto600', brand: 'trovao', tier: 'Intermediário', name: 'Trovão 600', icon: '🏍️', hue: 0, cost: 45000, prestige: 7, bonus: 0.175 },
    { id: 'mototour', brand: 'trovao', tier: 'Luxo', name: 'Trovão Touring', icon: '🏍️', hue: 200, cost: 95000, prestige: 10, bonus: 0.199 },
    { id: 'motoesp', brand: 'trovao', tier: 'Esportivo', name: 'Trovão Raio 1000', icon: '🏍️', hue: 100, cost: 160000, prestige: 13, bonus: 0.215 },
    { id: 'popular', brand: 'volta', tier: 'Entrada', name: 'Volta Pingo', icon: '🚗', hue: 0, cost: 60000, prestige: 8, bonus: 0.184 },
    { id: 'volta_urb', brand: 'volta', tier: 'Entrada', name: 'Volta Urbano', icon: '🚗', hue: 200, cost: 85000, prestige: 10, bonus: 0.195 },
    { id: 'volta_avanti', brand: 'volta', tier: 'Intermediário', name: 'Volta Avanti Sedan', icon: '🚘', hue: 0, cost: 130000, prestige: 12, bonus: 0.209 },
    { id: 'volta_trilha', brand: 'volta', tier: 'Intermediário', name: 'Volta Trilha SUV', icon: '🚙', hue: 150, cost: 170000, prestige: 14, bonus: 0.217 },
    { id: 'kaz_haru', brand: 'kazumi', tier: 'Entrada', name: 'Kazumi Haru', icon: '🚗', hue: 110, cost: 90000, prestige: 10, bonus: 0.197 },
    { id: 'kaz_sora', brand: 'kazumi', tier: 'Intermediário', name: 'Kazumi Sora Sedan', icon: '🚘', hue: 180, cost: 160000, prestige: 13, bonus: 0.215 },
    { id: 'kaz_kumo', brand: 'kazumi', tier: 'Luxo', name: 'Kazumi Kumo Híbrido', icon: '🚙', hue: 260, cost: 420000, prestige: 22, bonus: 0.246 },
    { id: 'kaz_ryu', brand: 'kazumi', tier: 'Esportivo', name: 'Kazumi Ryu Turbo', icon: '🏎️', hue: 200, cost: 650000, prestige: 27, bonus: 0.26 },
    { id: 'picape', brand: 'brutus', tier: 'Intermediário', name: 'Brutus Ranchão', icon: '🛻', hue: 0, cost: 180000, prestige: 14, bonus: 0.219 },
    { id: 'suv', brand: 'brutus', tier: 'Luxo', name: 'Brutus Colosso SUV', icon: '🚙', hue: 0, cost: 350000, prestige: 20, bonus: 0.24 },
    { id: 'brutus_selva', brand: 'brutus', tier: 'Luxo', name: 'Brutus Selva 4x4', icon: '🚙', hue: 80, cost: 600000, prestige: 26, bonus: 0.258 },
    { id: 'brutus_monstro', brand: 'brutus', tier: 'Esportivo', name: 'Brutus Monstro V8', icon: '🛻', hue: 300, cost: 950000, prestige: 32, bonus: 0.272 },
    { id: 'ele_faisca', brand: 'eletrika', tier: 'Entrada', name: 'Elétrika Faísca', icon: '🚗', hue: 90, cost: 110000, prestige: 11, bonus: 0.203 },
    { id: 'ele_volt', brand: 'eletrika', tier: 'Intermediário', name: 'Elétrika Volt S', icon: '🚘', hue: 190, cost: 380000, prestige: 21, bonus: 0.243 },
    { id: 'ele_raio', brand: 'eletrika', tier: 'Luxo', name: 'Elétrika Raio GT', icon: '🏎️', hue: 170, cost: 1.4e+06, prestige: 39, bonus: 0.285 },
    { id: 'sedan', brand: 'lumiere', tier: 'Luxo', name: 'Lumière Étoile', icon: '🚘', hue: 0, cost: 900000, prestige: 32, bonus: 0.27 },
    { id: 'lum_coupe', brand: 'lumiere', tier: 'Luxo', name: 'Lumière Coupé', icon: '🏎️', hue: 240, cost: 1.6e+06, prestige: 42, bonus: 0.289 },
    { id: 'lum_conv', brand: 'lumiere', tier: 'Esportivo', name: 'Lumière Conversível', icon: '🏎️', hue: 320, cost: 2.6e+06, prestige: 54, bonus: 0.304 },
    { id: 'limusine', brand: 'lumiere', tier: 'Luxo', name: 'Lumière Grand Limusine', icon: '🚘', hue: 250, cost: 1.2e+07, prestige: 115, bonus: 0.353 },
    { id: 'vit_strada', brand: 'vittoria', tier: 'Esportivo', name: 'Vittoria Strada', icon: '🏎️', hue: 40, cost: 2.2e+06, prestige: 49, bonus: 0.299 },
    { id: 'esportivo', brand: 'vittoria', tier: 'Esportivo', name: 'Vittoria Furia', icon: '🏎️', hue: 0, cost: 4e+06, prestige: 67, bonus: 0.318 },
    { id: 'vit_aperta', brand: 'vittoria', tier: 'Esportivo', name: 'Vittoria Aperta', icon: '🏎️', hue: 60, cost: 9e+06, prestige: 100, bonus: 0.344 },
    { id: 'hipercarro', brand: 'vittoria', tier: 'Esportivo', name: 'Vittoria Tempesta', icon: '🏁', hue: 0, cost: 3.5e+07, prestige: 197, bonus: 0.387 },
    { id: 'reg_imperial', brand: 'regalis', tier: 'Luxo', name: 'Regalis Imperial', icon: '🚘', hue: 220, cost: 6e+06, prestige: 82, bonus: 0.331 },
    { id: 'reg_soberano', brand: 'regalis', tier: 'Luxo', name: 'Regalis Soberano', icon: '🚘', hue: 280, cost: 1.8e+07, prestige: 141, bonus: 0.366 },
    { id: 'reg_ouro', brand: 'regalis', tier: 'Luxo', name: 'Regalis Edição Ouro', icon: '🚘', hue: 30, cost: 8e+07, prestige: 298, bonus: 0.4 },
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
    { id: 'celular0', name: 'Celular Básico', icon: '📱', cost: 500, prestige: 0 },
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
// Marcas fictícias de veículos
export const BRANDS = [
  { id: 'pedala', name: 'Pedala', mono: 'P', c1: '#2bc46f', c2: '#1a944f', slogan: 'Mobilidade leve e esperta' },
  { id: 'trovao', name: 'Trovão Motos', mono: 'T', c1: '#ffd23c', c2: '#e09a12', slogan: 'Duas rodas, muita emoção' },
  { id: 'volta', name: 'Volta', mono: 'V', c1: '#4da3ff', c2: '#2a74d1', slogan: 'O carro do dia a dia' },
  { id: 'kazumi', name: 'Kazumi', mono: 'K', c1: '#ff5d73', c2: '#c93a4f', slogan: 'Confiável como relógio' },
  { id: 'brutus', name: 'Brutus', mono: 'B', c1: '#8a5a2b', c2: '#5a3418', slogan: 'Força para qualquer terreno' },
  { id: 'eletrika', name: 'Elétrika', mono: 'E', c1: '#5ee0e0', c2: '#1fa6a6', slogan: 'Zero emissão, muito torque' },
  { id: 'lumiere', name: 'Lumière', mono: 'L', c1: '#b8c0cc', c2: '#6b7280', slogan: 'Elegância francesa sobre rodas' },
  { id: 'vittoria', name: 'Vittoria', mono: 'V', c1: '#e8263f', c2: '#8e0f26', slogan: 'Paixão italiana a 350 km/h' },
  { id: 'regalis', name: 'Regalis', mono: 'R', c1: '#3b2a8f', c2: '#ffc93c', slogan: 'Para quem nasceu para reinar' },
];
export const TIERS = ['Entrada', 'Intermediário', 'Luxo', 'Esportivo'];
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
export const UNLOCKS = { bolsa: 2, renda: 1, credito: 3, imoveis: 4, cripto: 6, cassino: 3 };
export const LEVEL_BONUS = 0.03; // +3% de renda por nível

export const TRADE_FEE = 0.005; // corretagem 0,5%
export const LOAN_RATE = 0.0012; // juros do empréstimo por dia

// ===== Vida: viagens e amor =====
// days = minutos reais (1 dia = 1 minuto)
export const TRIP_CATS = [
  { id: 'cidades', name: 'Cidades', icon: '🏙️' },
  { id: 'estados', name: 'Estados', icon: '🗺️' },
  { id: 'paises', name: 'Países', icon: '🌍' },
  { id: 'pontos', name: 'Pontos turísticos', icon: '🏛️' },
];
export const TRIPS = [
  // Cidades
  { id: 'praia', cat: 'cidades', name: 'Porto de Galinhas (PE)', icon: '🏖️', days: 3, cost: 2500 },
  { id: 'serra', cat: 'cidades', name: 'Gramado (RS)', icon: '🍫', days: 4, cost: 6000 },
  { id: 'rio', cat: 'cidades', name: 'Rio de Janeiro (RJ)', icon: '🌴', days: 5, cost: 9000 },
  { id: 'floripa', cat: 'cidades', name: 'Florianópolis (SC)', icon: '🏄', days: 4, cost: 8000 },
  { id: 'salvador', cat: 'cidades', name: 'Salvador (BA)', icon: '🥁', days: 4, cost: 7000 },
  { id: 'amazonia', cat: 'cidades', name: 'Manaus (AM)', icon: '🦜', days: 6, cost: 18000 },
  { id: 'bonito', cat: 'cidades', name: 'Bonito (MS)', icon: '🐠', days: 5, cost: 15000 },
  { id: 'jeri', cat: 'cidades', name: 'Jericoacoara (CE)', icon: '🪁', days: 5, cost: 12000 },
  { id: 'baires', cat: 'cidades', name: 'Buenos Aires', icon: '💃', days: 5, cost: 30000 },
  { id: 'lisboa', cat: 'cidades', name: 'Lisboa', icon: '🚋', days: 6, cost: 90000 },
  { id: 'caribe', cat: 'cidades', name: 'Cancún', icon: '🏝️', days: 7, cost: 70000 },
  { id: 'florida', cat: 'cidades', name: 'Orlando', icon: '🎢', days: 10, cost: 140000 },
  { id: 'paris', cat: 'cidades', name: 'Paris', icon: '🥐', days: 8, cost: 220000 },
  { id: 'nova_york', cat: 'cidades', name: 'Nova York', icon: '🗽', days: 7, cost: 260000 },
  { id: 'londres', cat: 'cidades', name: 'Londres', icon: '💂', days: 7, cost: 240000 },
  { id: 'toquio', cat: 'cidades', name: 'Tóquio', icon: '🍣', days: 10, cost: 480000 },
  { id: 'dubai', cat: 'cidades', name: 'Dubai', icon: '🌇', days: 7, cost: 3e6 },
  // Estados do Brasil
  { id: 'e_ba', cat: 'estados', name: 'Bahia', icon: '🥥', days: 8, cost: 20000 },
  { id: 'e_mg', cat: 'estados', name: 'Minas Gerais', icon: '🧀', days: 8, cost: 16000 },
  { id: 'e_sc', cat: 'estados', name: 'Santa Catarina', icon: '🌊', days: 8, cost: 22000 },
  { id: 'e_rs', cat: 'estados', name: 'Rio Grande do Sul', icon: '🧉', days: 8, cost: 20000 },
  { id: 'e_pe', cat: 'estados', name: 'Pernambuco', icon: '🎭', days: 7, cost: 18000 },
  { id: 'e_ce', cat: 'estados', name: 'Ceará', icon: '☀️', days: 7, cost: 17000 },
  { id: 'e_rn', cat: 'estados', name: 'Rio Grande do Norte', icon: '🏜️', days: 6, cost: 15000 },
  { id: 'e_al', cat: 'estados', name: 'Alagoas', icon: '🐚', days: 6, cost: 16000 },
  { id: 'e_pr', cat: 'estados', name: 'Paraná', icon: '🌲', days: 7, cost: 14000 },
  { id: 'e_ma', cat: 'estados', name: 'Maranhão', icon: '🏝️', days: 7, cost: 19000 },
  { id: 'e_am', cat: 'estados', name: 'Amazonas', icon: '🛶', days: 10, cost: 40000 },
  { id: 'e_mt', cat: 'estados', name: 'Mato Grosso (Pantanal)', icon: '🐊', days: 9, cost: 35000 },
  // Países
  { id: 'p_ar', cat: 'paises', name: 'Argentina', icon: '🥩', days: 8, cost: 45000 },
  { id: 'p_cl', cat: 'paises', name: 'Chile', icon: '🏔️', days: 8, cost: 55000 },
  { id: 'p_pt', cat: 'paises', name: 'Portugal', icon: '🍷', days: 10, cost: 120000 },
  { id: 'p_es', cat: 'paises', name: 'Espanha', icon: '🥘', days: 10, cost: 150000 },
  { id: 'italia', cat: 'paises', name: 'Itália', icon: '🍝', days: 10, cost: 320000 },
  { id: 'p_fr', cat: 'paises', name: 'França', icon: '🧀', days: 10, cost: 300000 },
  { id: 'p_us', cat: 'paises', name: 'Estados Unidos', icon: '🍔', days: 12, cost: 350000 },
  { id: 'p_mx', cat: 'paises', name: 'México', icon: '🌮', days: 9, cost: 130000 },
  { id: 'egito', cat: 'paises', name: 'Egito', icon: '🐪', days: 9, cost: 400000 },
  { id: 'p_gr', cat: 'paises', name: 'Grécia', icon: '🏺', days: 10, cost: 380000 },
  { id: 'japao', cat: 'paises', name: 'Japão', icon: '🗾', days: 12, cost: 550000 },
  { id: 'p_th', cat: 'paises', name: 'Tailândia', icon: '🐘', days: 12, cost: 420000 },
  { id: 'p_au', cat: 'paises', name: 'Austrália', icon: '🦘', days: 14, cost: 900000 },
  { id: 'p_ca', cat: 'paises', name: 'Canadá', icon: '🍁', days: 12, cost: 600000 },
  { id: 'p_is', cat: 'paises', name: 'Islândia', icon: '🌋', days: 9, cost: 1.1e6 },
  { id: 'maldivas', cat: 'paises', name: 'Maldivas', icon: '🐠', days: 10, cost: 1.4e6 },
  { id: 'safari', cat: 'paises', name: 'África do Sul (safári)', icon: '🦁', days: 12, cost: 5e6 },
  // Pontos turísticos famosos
  { id: 't_cristo', cat: 'pontos', name: 'Cristo Redentor', icon: '⛰️', days: 3, cost: 12000 },
  { id: 't_iguacu', cat: 'pontos', name: 'Cataratas do Iguaçu', icon: '💦', days: 4, cost: 15000 },
  { id: 't_lencois', cat: 'pontos', name: 'Lençóis Maranhenses', icon: '🏜️', days: 5, cost: 20000 },
  { id: 't_noronha', cat: 'pontos', name: 'Fernando de Noronha', icon: '🐬', days: 6, cost: 60000 },
  { id: 't_machu', cat: 'pontos', name: 'Machu Picchu', icon: '🦙', days: 7, cost: 90000 },
  { id: 't_eiffel', cat: 'pontos', name: 'Torre Eiffel', icon: '🗼', days: 5, cost: 250000 },
  { id: 't_coliseu', cat: 'pontos', name: 'Coliseu', icon: '🏟️', days: 5, cost: 260000 },
  { id: 't_bigben', cat: 'pontos', name: 'Big Ben', icon: '🕰️', days: 5, cost: 250000 },
  { id: 't_liberdade', cat: 'pontos', name: 'Estátua da Liberdade', icon: '🗽', days: 5, cost: 280000 },
  { id: 't_chichen', cat: 'pontos', name: 'Chichén Itzá', icon: '🛕', days: 5, cost: 150000 },
  { id: 't_santorini', cat: 'pontos', name: 'Santorini', icon: '🏝️', days: 6, cost: 420000 },
  { id: 't_piramides', cat: 'pontos', name: 'Pirâmides de Gizé', icon: '🔺', days: 6, cost: 450000 },
  { id: 't_petra', cat: 'pontos', name: 'Petra', icon: '🏜️', days: 6, cost: 480000 },
  { id: 't_fuji', cat: 'pontos', name: 'Monte Fuji', icon: '🗻', days: 6, cost: 600000 },
  { id: 't_taj', cat: 'pontos', name: 'Taj Mahal', icon: '🕌', days: 7, cost: 650000 },
  { id: 't_muralha', cat: 'pontos', name: 'Grande Muralha da China', icon: '🧱', days: 8, cost: 700000 },
  { id: 't_grandcanyon', cat: 'pontos', name: 'Grand Canyon', icon: '🏞️', days: 6, cost: 500000 },
  { id: 't_opera', cat: 'pontos', name: 'Ópera de Sydney', icon: '🎶', days: 8, cost: 950000 },
  { id: 't_burj', cat: 'pontos', name: 'Burj Khalifa', icon: '🏙️', days: 5, cost: 3.2e6 },
  { id: 't_aurora', cat: 'pontos', name: 'Aurora Boreal na Lapônia', icon: '🌌', days: 7, cost: 2e6 },
  { id: 'antartida', cat: 'pontos', name: 'Antártida', icon: '🐧', days: 15, cost: 2e7 },
  { id: 'mundo', cat: 'pontos', name: 'Volta ao Mundo', icon: '🌍', days: 60, cost: 1.5e8 },
  { id: 'espaco', cat: 'pontos', name: 'Viagem ao Espaço', icon: '🚀', days: 10, cost: 3e9 },
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
// Programas a dois: ocupam tempo. Quanto mais caro, mais carinho por minuto. Repetir o último programa rende 40% menos.
export const DATES = [
  { id: 'cafe', name: 'Café e passeio no parque', icon: '☕', mins: 2, cost: 80, aff: 6 },
  { id: 'cinema', name: 'Cinema e pizza', icon: '🍿', mins: 3, cost: 350, aff: 10 },
  { id: 'show', name: 'Show da banda favorita', icon: '🎸', mins: 4, cost: 2500, aff: 17 },
  { id: 'jantar', name: 'Jantar à luz de velas', icon: '🕯️', mins: 4, cost: 15000, aff: 25 },
  { id: 'spa', name: 'Dia de spa a dois', icon: '💆', mins: 4, cost: 45000, aff: 30 },
  { id: 'balao', name: 'Passeio de balão', icon: '🎈', mins: 5, cost: 120000, aff: 38 },
  { id: 'iatepasseio', name: 'Pôr do sol num iate', icon: '🛥️', mins: 6, cost: 1.5e6, aff: 55 },
  { id: 'paris_jantar', name: 'Jantar no topo de um arranha-céu', icon: '🌃', mins: 6, cost: 2e7, aff: 75 },
];
export const REPEAT_PENALTY = 0.6;
// Presentes: instantâneos, mas cada um tem um tempo de espera (cd, em minutos) para dar de novo
export const GIFTS = [
  { id: 'chocolate', name: 'Caixa de bombons', icon: '🍫', cost: 60, aff: 4, cd: 20 },
  { id: 'flores', name: 'Buquê de flores', icon: '💐', cost: 250, aff: 7, cd: 30 },
  { id: 'pelucia', name: 'Urso de pelúcia gigante', icon: '🧸', cost: 900, aff: 10, cd: 45 },
  { id: 'perfume', name: 'Perfume importado', icon: '🧴', cost: 3000, aff: 14, cd: 60 },
  { id: 'bolsa', name: 'Bolsa de grife', icon: '👜', cost: 15000, aff: 19, cd: 90 },
  { id: 'joia', name: 'Joia exclusiva', icon: '💎', cost: 80000, aff: 26, cd: 120 },
  { id: 'carrop', name: 'Um carro de presente', icon: '🚗', cost: 1.2e6, aff: 45, cd: 360 },
  { id: 'mansaop', name: 'Uma mansão de presente', icon: '🏰', cost: 5e7, aff: 80, cd: 1440 },
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

// ===== Empresas criadas pelos jogadores =====
// k = escala de dinheiro do segmento (receitas, custos e preços multiplicam por ele).
// cat = categoria em 💎 Bens onde os produtos aparecem para todos comprarem (null = vende só para o mercado).
// Nos produtos que viram bens: price/prestige/bonus/hours são o que o comprador paga e ganha.
export const SEGMENTS = [
  { id: 'alimentos', name: 'Alimentos', icon: '🍔', sector: 'food', k: 1, cat: null, color: '#ff8a3d', products: [
    { name: 'Salgadinho', icon: '🍿' }, { name: 'Refrigerante', icon: '🥤' }, { name: 'Chocolate Gourmet', icon: '🍫' }, { name: 'Linha de Congelados', icon: '🧊' }, { name: 'Marca Global de Alimentos', icon: '🌎' }] },
  { id: 'moda', name: 'Moda', icon: '👗', sector: 'retail', k: 1.5, cat: null, color: '#ff6b9a', products: [
    { name: 'Camisetas', icon: '👕' }, { name: 'Tênis', icon: '👟' }, { name: 'Jeans de Grife', icon: '👖' }, { name: 'Bolsas de Couro', icon: '👜' }, { name: 'Coleção de Passarela', icon: '💃' }] },
  { id: 'tech', name: 'Tecnologia', icon: '📱', sector: 'tech', k: 3, cat: 'luxo', color: '#4da3ff', products: [
    { name: 'Fone sem Fio', icon: '🎧', price: 9000, prestige: 3 }, { name: 'Smartphone', icon: '📱', price: 25000, prestige: 5 }, { name: 'Notebook Gamer', icon: '💻', price: 90000, prestige: 9 },
    { name: 'Óculos de Realidade Virtual', icon: '🥽', price: 250000, prestige: 15 }, { name: 'Robô Doméstico', icon: '🤖', price: 1.2e6, prestige: 32 }] },
  { id: 'joias', name: 'Joalheria', icon: '💍', sector: 'retail', k: 3, cat: 'luxo', color: '#c08bff', products: [
    { name: 'Relógio', icon: '⌚', price: 90000, prestige: 9 }, { name: 'Pulseira de Ouro', icon: '📿', price: 250000, prestige: 15 }, { name: 'Anel de Diamante', icon: '💍', price: 1.2e6, prestige: 32 },
    { name: 'Colar de Safiras', icon: '💎', price: 4e6, prestige: 58 }, { name: 'Tiara Real', icon: '👑', price: 2.5e7, prestige: 170 }] },
  { id: 'farma', name: 'Farmacêutica', icon: '💊', sector: 'health', k: 4, cat: null, color: '#3ddc84', products: [
    { name: 'Vitaminas', icon: '💊' }, { name: 'Xarope', icon: '🧴' }, { name: 'Vacina', icon: '💉' }, { name: 'Remédio Inovador', icon: '🧪' }, { name: 'Cura Revolucionária', icon: '🧬' }] },
  { id: 'auto', name: 'Montadora', icon: '🚗', sector: 'services', k: 6, cat: 'veiculos', color: '#ff5d73', products: [
    { name: 'Moto Urbana', icon: '🏍️', price: 45000, prestige: 7, bonus: 0.175 }, { name: 'Carro Compacto', icon: '🚗', price: 130000, prestige: 12, bonus: 0.209 }, { name: 'SUV', icon: '🚙', price: 650000, prestige: 27, bonus: 0.26 },
    { name: 'Esportivo', icon: '🏎️', price: 4e6, prestige: 70, bonus: 0.318 }, { name: 'Hipercarro', icon: '🏁', price: 3.5e7, prestige: 205, bonus: 0.387 }] },
  { id: 'construtora', name: 'Construtora', icon: '🏗️', sector: 'realestate', k: 8, cat: 'moradia', color: '#e0a14a', products: [
    { name: 'Apartamento', icon: '🏢', price: 180000, prestige: 8, hours: 1 }, { name: 'Casa', icon: '🏡', price: 550000, prestige: 19, hours: 2 }, { name: 'Cobertura', icon: '🌆', price: 3e6, prestige: 52, hours: 3 },
    { name: 'Mansão', icon: '🏰', price: 2e7, prestige: 145, hours: 4 }, { name: 'Condomínio de Luxo', icon: '🏝️', price: 1.2e8, prestige: 360, hours: 5 }] },
  { id: 'fintech', name: 'Banco Digital', icon: '🏦', sector: 'finance', k: 10, cat: null, color: '#8f6bff', products: [
    { name: 'Conta Digital', icon: '💳' }, { name: 'Cartão de Crédito', icon: '💳' }, { name: 'Plataforma de Investimentos', icon: '📈' }, { name: 'Seguros', icon: '🛡️' }, { name: 'Super-App Financeiro', icon: '🏦' }] },
  { id: 'energia', name: 'Energia', icon: '⚡', sector: 'energy', k: 25, cat: null, color: '#ffc93c', products: [
    { name: 'Painéis Solares', icon: '☀️' }, { name: 'Parque Eólico', icon: '🌬️' }, { name: 'Hidrelétrica', icon: '💧' }, { name: 'Usina de Hidrogênio', icon: '⚗️' }, { name: 'Fusão Nuclear', icon: '⚛️' }] },
  { id: 'nautica', name: 'Náutica e Aviação', icon: '🛩️', sector: 'services', k: 40, cat: 'ceumar', color: '#2ec4d6', products: [
    { name: 'Jet Ski', icon: '🌊', price: 90000, prestige: 6, bonus: 0.12 }, { name: 'Lancha', icon: '🚤', price: 1.5e6, prestige: 37, bonus: 0.22 }, { name: 'Helicóptero', icon: '🚁', price: 2.5e7, prestige: 158, bonus: 0.4 },
    { name: 'Jatinho', icon: '🛩️', price: 1.5e8, prestige: 420, bonus: 0.5 }, { name: 'Iate', icon: '🛥️', price: 6e8, prestige: 945, bonus: 0.55 }] },
];
export const SEGMENT = Object.fromEntries(SEGMENTS.map((x) => [x.id, x]));
// Funcionários: salário por dia = pct × receita-base do produto mais avançado já lançado
export const STAFF = [
  { id: 'prod', name: 'Produção', icon: '🏭', pct: 0.015, desc: 'Fabricam os produtos. Sem gente suficiente, a empresa vende menos.' },
  { id: 'vendas', name: 'Vendas', icon: '🤝', pct: 0.015, desc: '+5% de receita cada (até 4 por produto lançado).' },
  { id: 'mkt', name: 'Marketing', icon: '📣', pct: 0.02, desc: '+4% de receita cada (até 3 por produto lançado).' },
  { id: 'pd', name: 'Pesquisa (P&D)', icon: '🧪', pct: 0.03, desc: 'Desenvolvem produtos mais rápido. Produtos avançados exigem pesquisadores.' },
];
// Escada de produtos (igual em todo segmento, multiplicada por k)
export const PRODUCT_TIERS = [
  { rev: 600, mins: 5, need: 2, pd: 0 },
  { rev: 3000, mins: 10, need: 4, pd: 1 },
  { rev: 15000, mins: 20, need: 6, pd: 2 },
  { rev: 75000, mins: 40, need: 10, pd: 4 },
  { rev: 400000, mins: 60, need: 15, pd: 6 },
];
