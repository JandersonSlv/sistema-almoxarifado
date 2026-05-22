// controllers/authController.js
const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Validando com as credenciais padrão do seu sistema
        if (email === 'admin@teste.com' && senha === '123456') {
            
            // Se estiver correto, responde com sucesso e os dados do usuário
            return res.status(200).json({
                mensagem: 'Login realizado com sucesso!',
                usuario: {
                    nome: 'Administrador',
                    email: email
                }
            });
        } else {
            // Se estiver errado, responde com o código 401 (Não autorizado)
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

    } catch (error) {
        return res.status(500).json({ error: 'Erro ao processar o login: ' + error.message });
    }
};

module.exports = {
    login
};