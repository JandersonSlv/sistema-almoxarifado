// Importando o módulo de conexão com o banco de dados
const db = require('../config/db');

// Função para listar o histórico
const listarMovimentacoes = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT m.*, p.nome as prodNome 
            FROM movimentacoes m 
            JOIN produtos p ON m.produto_id = p.id 
            ORDER BY m.data_hora DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar histórico: ' + error.message });
    }
};

// Função para registrar entrada/saída e atualizar o estoque
const registrarMovimentacao = async (req, res) => {
    const { produto_id, tipo, quantidade, responsavel, observacao } = req.body;
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction(); 

        // 1. Grava no histórico
        await connection.query(
            `INSERT INTO movimentacoes (produto_id, tipo, qtd, responsavel, observacao) VALUES (?, ?, ?, ?, ?)`,
            [produto_id, tipo, quantidade, responsavel, observacao]
        );

        // 2. Atualiza o estoque do produto
        const operador = tipo === 'entrada' ? '+' : '-';
        await connection.query(
            `UPDATE produtos SET qtd_atual = qtd_atual ${operador} ? WHERE id = ?`,
            [quantidade, produto_id]
        );

        await connection.commit();
        res.status(201).json({ message: 'Movimentação registrada com sucesso!' });
    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: 'Erro ao registrar movimentação: ' + error.message });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    listarMovimentacoes,
    registrarMovimentacao
};