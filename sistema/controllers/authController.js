// controllers/authController.js
const db = require('../config/db'); // ATENÇÃO: Ajuste este caminho se o seu arquivo de conexão com o banco tiver outro nome (ex: '../config/db')

const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Validando com os usuários cadastrados no banco de dados MySQL
        const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
        const [usuarios] = await db.query(sql, [email, senha]);

        if (usuarios.length > 0) {
            // Se encontrar o usuário, responde com sucesso e puxa o NOME REAL do banco
            return res.status(200).json({
                mensagem: 'Login realizado com sucesso!',
                usuario: {
                    nome: usuarios[0].nome, 
                    email: usuarios[0].email
                }
            });
        } else {
            // Se não encontrar ou a senha estiver errada, responde com 401
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

    } catch (error) {
        return res.status(500).json({ error: 'Erro ao processar o login: ' + error.message });
    }
};

module.exports = {
    login
};