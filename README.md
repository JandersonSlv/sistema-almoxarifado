======================================================
           SISTEMA DE GESTÃO DE ALMOXARIFADO
======================================================

1. DESCRIÇÃO DO PROJETO
------------------------------------------------------
O Sistema de Gestão de Almoxarifado é uma aplicação web completa desenvolvida para facilitar o controlo de stock, gestão de produtos e o registo histórico de entradas e saídas (movimentações) de um inventário. O sistema conta com autenticação de utilizadores, proteção de rotas e um painel (Dashboard) interativo.

2. TECNOLOGIAS UTILIZADAS
------------------------------------------------------
* Frontend: HTML5, CSS3, JavaScript (Vanilla) e Bootstrap 5.
* Backend: Node.js com o framework Express.js.
* Base de Dados: MySQL (com banco de dados relacional).
* Arquitetura: MVC (Model-View-Controller) adaptado para API REST.

3. FUNCIONALIDADES PRINCIPAIS
------------------------------------------------------
* Login e Autenticação de Utilizadores.
* Dashboard com visão geral do sistema e navegação.
* Gestão de Produtos (Cadastro, Edição, Consulta).
* Registo de Movimentações (Entradas e Saídas de stock).
* Atualização automática das quantidades de stock com base nas movimentações.
* Histórico completo de transações em ordem cronológica.

4. PRÉ-REQUISITOS
------------------------------------------------------
Para executar este projeto localmente, vai precisar de ter instalado no seu computador:
* Node.js (versão 18 ou superior).
* MySQL Server (versão 8.0 ou superior).
* MySQL Workbench ou phpMyAdmin (opcional, para visualização da base de dados).

5. COMO CONFIGURAR E EXECUTAR O PROJETO
------------------------------------------------------
Passo 1: Configurar a Base de Dados
  - Abra o seu cliente MySQL (ex: Workbench).
  - Execute o script SQL fornecido (ex: database.sql) para criar a base de dados "almoxarifado" e as tabelas "produtos", "movimentacoes" e "usuarios".
  - Certifique-se de que a base de dados está a correr corretamente.

Passo 2: Configurar o Backend
  - Abra a pasta do projeto no seu editor de código (ex: VS Code).
  - Aceda ao ficheiro "config/db.js" e verifique se as credenciais do MySQL (utilizador, palavra-passe, nome da base de dados) estão corretas para a sua máquina local.

Passo 3: Instalar as Dependências
  - Abra o terminal na raiz da pasta do projeto.
  - Execute o comando: 
    npm install

Passo 4: Iniciar o Servidor
  - Ainda no terminal, execute o comando:
    node server.js
  - Deverá ver uma mensagem indicando que o servidor está a correr na porta 3000 e que a base de dados foi conectada com sucesso.

Passo 5: Aceder ao Sistema
  - Abra o seu navegador web (Google Chrome, Edge, etc.).
  - Digite a seguinte URL: http://localhost:3000
  - Será redirecionado para a página de login.

6. CREDENCIAIS DE ACESSO (TESTE)
------------------------------------------------------
Para testar o sistema, utilize as credenciais padrão:
* E-mail: admin@teste.com
* Senha:  123456

7. ESTRUTURA DE PASTAS (RESUMO)
------------------------------------------------------
/config        -> Configurações de ligação à Base de Dados.
/controllers   -> Regras de negócio e comunicação com a base de dados.
/public        -> Ficheiros do Frontend (HTML, CSS, JS visíveis pelo utilizador).
/routes        -> Definição dos caminhos da API (URLs).
server.js      -> Ponto de entrada e configuração principal do servidor Node.js.
======================================================
