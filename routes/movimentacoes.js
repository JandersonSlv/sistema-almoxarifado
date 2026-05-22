const express = require('express');
const router = express.Router();

// Importa o controller das movimentações
const movimentacaoController = require('../controllers/movimentacaoController');

// Aponta as URLs para as funções do Controller
router.get('/', movimentacaoController.listarMovimentacoes);
router.post('/', movimentacaoController.registrarMovimentacao);

module.exports = router;