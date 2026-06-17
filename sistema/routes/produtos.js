const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

// Rotas para listar e cadastrar produtos
router.get('/', produtoController.listarProdutos);
router.post('/', produtoController.cadastrarProduto);

// Rotas para editar e excluir produtos
router.put('/:id', produtoController.editarProduto);
router.delete('/:id', produtoController.excluirProduto);

module.exports = router;