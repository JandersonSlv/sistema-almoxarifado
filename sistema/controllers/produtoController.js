// Importando o módulo de conexão com o banco de dados
const db = require('../config/db');

// Função para buscar produtos
const listarProdutos = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM produtos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produtos: ' + error.message });
    }
};

// Função para cadastrar produto
const cadastrarProduto = async (req, res) => {
    const { nome, categoria, material_principal, material_cabo, tamanho, peso, caracteristicas, qtd_atual, estoque_minimo } = req.body;
    
    try {
        const [result] = await db.query(
            `INSERT INTO produtos (nome, categoria, material_principal, material_cabo, tamanho, peso, caracteristicas, qtd_atual, estoque_minimo) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nome, categoria, material_principal, material_cabo, tamanho, peso, caracteristicas, qtd_atual, estoque_minimo]
        );
        res.status(201).json({ id: result.insertId, message: 'Produto cadastrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar produto: ' + error.message });
    }
};

// Função para EDITAR um produto existente
const editarProduto = async (req, res) => {
    const { id } = req.params; // Pega o ID que vem na URL (ex: /api/produtos/5)
    const { nome, categoria, material_principal, material_cabo, tamanho, peso, caracteristicas, qtd_atual, estoque_minimo } = req.body;
    
    try {
        const [result] = await db.query(
            `UPDATE produtos 
             SET nome = ?, categoria = ?, material_principal = ?, material_cabo = ?, tamanho = ?, peso = ?, caracteristicas = ?, qtd_atual = ?, estoque_minimo = ? 
             WHERE id = ?`,
            [nome, categoria, material_principal, material_cabo, tamanho, peso, caracteristicas, qtd_atual, estoque_minimo, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        res.json({ message: 'Produto atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao editar produto: ' + error.message });
    }
};

// Função para EXCLUIR um produto
const excluirProduto = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM produtos WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        res.json({ message: 'Produto excluído com sucesso!' });
    } catch (error) {
        // Se o produto tiver histórico de movimentação, o MySQL vai impedir a exclusão por segurança (Chave Estrangeira)
        res.status(500).json({ error: 'Não é possível excluir este produto pois ele possui histórico de movimentações.' });
    }
};

// Exportamos as funções para que as rotas possam usá-las
module.exports = {
    listarProdutos,
    cadastrarProduto,
    editarProduto,
    excluirProduto
};
