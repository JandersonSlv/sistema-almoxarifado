// Script para lidar com o formulário de login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que a página recarregue

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const errorAlert = document.getElementById('loginError');

    try {
        // Envia os dados para a sua rota no backend
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        if (response.ok) {
            const data = await response.json();
            // Salva um "crachá" virtual no navegador para provar que está logado
            localStorage.setItem('usuarioLogado', JSON.stringify(data));
            // Redireciona para o Dashboard
            window.location.href = 'index.html';
        } else {
            // Mostra o erro se a senha estiver errada
            errorAlert.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        errorAlert.textContent = 'Erro de conexão com o servidor.';
        errorAlert.classList.remove('d-none');
    }
});