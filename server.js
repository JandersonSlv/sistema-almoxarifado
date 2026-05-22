// Importando as dependências necessárias
require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

// Permite que o Node entenda dados enviados no formato JSON
app.use(express.json());

// Diz para o Express servir os arquivos do seu frontend que estão na pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Importando os arquivos de rotas
const rotasProdutos = require('./routes/produtos');
const rotasMovimentacoes = require('./routes/movimentacoes');
const rotasAuth = require('./routes/auth');

// Conectando as rotas às URLs da API
app.use('/api/produtos', rotasProdutos);
app.use('/api/movimentacoes', rotasMovimentacoes);
app.use('/api/auth', rotasAuth);

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(
    `\x1b[32m✅ Servidor rodando com sucesso!\x1b[0m\n` + // Verde
    `\x1b[36m🌐 Acesse em: http://localhost:${PORT}/\x1b[0m\n` + // Ciano
    `\x1b[33m🔑 Use: admin@teste.com // para login\x1b[0m\n` + // Amarelo
    `\x1b[33m🔑 Use: 123456 // senha\x1b[0m` // Amarelo
  );
});