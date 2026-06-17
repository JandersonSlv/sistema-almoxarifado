-- 1. Criação do Banco de Dados
CREATE DATABASE IF NOT EXISTS saep_db;
USE saep_db;

-- 2. Criação das Tabelas
-- Tabela de Usuários (Já preparando terreno para o nosso próximo passo: o Login)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('admin', 'operador') DEFAULT 'operador'
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    material_principal VARCHAR(50),
    material_cabo VARCHAR(50),
    tamanho VARCHAR(20),
    peso INT,
    caracteristicas TEXT,
    qtd_atual INT DEFAULT 0,
    estoque_minimo INT DEFAULT 0
);

-- Tabela de Histórico/Movimentações
CREATE TABLE IF NOT EXISTS movimentacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    tipo ENUM('entrada', 'saida') NOT NULL,
    qtd INT NOT NULL,
    responsavel VARCHAR(100),
    observacao TEXT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- A linha abaixo impede que um produto seja deletado se ele tiver histórico
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT
);

-- 3. População do Banco (Mock Data / Dados de Teste)
-- Em um ambiente real, essa senha estaria criptografada.
INSERT INTO usuarios (nome, email, senha, perfil) VALUES
('Administrador', 'admin@teste.com', '123456', 'admin'),
('Carlos Silva', 'carlos@teste.com', '123456', 'operador'),
('Maria Souza', 'maria@teste.com', '123456', 'operador');

-- Inserindo Produtos Iniciais
INSERT INTO produtos (nome, categoria, material_principal, material_cabo, tamanho, peso, caracteristicas, qtd_atual, estoque_minimo) VALUES
('Arco de serra', 'Serra', 'Aço Carbono', 'Plástico', '12cm', 100, 'Acabamento com pintura eletrostática na cor preta.', 20, 5),
('Martelo de Borracha', 'Martelo', 'Borracha Maciça', 'Madeira', 'Médio', 500, 'Alta absorção de impacto.', 8, 10), -- Vai gerar alerta (8 < 10)
('Chave Philips', 'Chave de fenda', 'Aço Cromo-Vanádio', 'Emborrachado', '15cm', 80, 'Ponta imantada.', 35, 15);

-- Inserindo Movimentações Iniciais (Histórico)
INSERT INTO movimentacoes (produto_id, tipo, qtd, responsavel, observacao) VALUES
(1, 'entrada', 20, 'Carlos Silva', 'Estoque inicial da ferramenta.'),
(2, 'entrada', 10, 'Maria Souza', 'Compra do mês.'),
(2, 'saida', 2, 'João Pedro', 'Retirada para manutenção do setor B.'),
(3, 'entrada', 35, 'Carlos Silva', 'Estoque inicial.');