// Verifica se o usuário tem o "crachá" no navegador
const usuario = localStorage.getItem('usuarioLogado');

if (!usuario) {
    // Se não tiver, expulsa para a tela de login
    window.location.href = 'login.html';
} else {
    // COMO VOCÊ SALVOU COMO JSON, PRECISAMOS CONVERTER DE VOLTA
    const dadosUsuario = JSON.parse(usuario);
    
    // Espera a tela carregar para colocar o nome lá em cima
    document.addEventListener('DOMContentLoaded', () => {
        const spanNome = document.getElementById('nome-utilizador');
        if (spanNome && dadosUsuario.usuario && dadosUsuario.usuario.nome) {
            spanNome.textContent = dadosUsuario.usuario.nome;
        }
    });
}

// FUNÇÃO DE LOGOUT (Chamada pelo botão Sair do HTML que fizemos antes)
function fazerLogout() {
    if (confirm("Deseja realmente sair do sistema?")) {
        localStorage.removeItem('usuarioLogado'); // Tira o crachá
        window.location.href = 'login.html'; // Volta pro login
    }
}


// VARIÁVEIS GLOBAIS (Agora vazias, pois vêm do Banco de Dados)

let produtos = [];
let historico = [];
let editingId = null;

// 1. FUNÇÃO PARA CARREGAR DADOS DA API

async function carregarDados() {
    try {
        // 1. Busca os Produtos do Node.js
        const respProd = await fetch('/api/produtos');
        const dbProdutos = await respProd.json();
        
        // "Traduz" os nomes do Banco de Dados para os nomes curtos que o seu HTML já usa
        produtos = dbProdutos.map(p => ({
            id: p.id,
            nome: p.nome,
            cat: p.categoria,
            material: p.material_principal,
            cabo: p.material_cabo,
            tamanho: p.tamanho,
            peso: p.peso,
            carac: p.caracteristicas,
            qtd: p.qtd_atual,
            min: p.estoque_minimo
        }));

        // 2. Busca o Histórico de Movimentações
        const respHist = await fetch('/api/movimentacoes');
        const dbHist = await respHist.json();

        historico = dbHist.map(h => ({
            id: h.id,
            tipo: h.tipo,
            prodId: h.produto_id,
            prodNome: h.prodNome, // Veio do JOIN
            qtd: h.qtd,
            resp: h.responsavel,
            obs: h.observacao,
            dt: new Date(h.data_hora) // Converte a data do banco para objeto Date do JS
        }));

        // 3. Atualiza a tela atual
        const secaoAtiva = document.querySelector('.section.active');
        if (secaoAtiva) {
            const secId = secaoAtiva.id.replace('sec-', '');
            navTo(secId); // Recarrega a tela que o usuário está vendo
        } else {
            navTo('dashboard');
        }
        updateAlertBadge();

    } catch (erro) {
        console.error("Erro ao carregar dados do banco:", erro);
        alert("Erro de conexão com o servidor.");
    }
}


// UTILITÁRIOS (Intactos)

function fmt(d) {
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function statusPill(p) {
    if (p.qtd === 0) return '<span class="pill critical"><i class="ti ti-alert-circle" style="font-size:11px"></i> Zerado</span>';
    if (p.qtd <= p.min) return '<span class="pill low"><i class="ti ti-alert-triangle" style="font-size:11px"></i> Abaixo mín.</span>';
    return '<span class="pill ok"><i class="ti ti-check" style="font-size:11px"></i> Normal</span>';
}

function getAlertas() {
    return produtos.filter(p => p.qtd <= p.min);
}

function updateAlertBadge() {
    const count = getAlertas().length;
    document.getElementById('alert-count').textContent = count;
    document.getElementById('m-alertas').textContent = count;
}


// NAVEGAÇÃO E VISUAL (Intactos)
function navTo(sec, el, extra) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('sec-' + sec).classList.add('active');

    const titles = { dashboard: 'Dashboard', produtos: 'Produtos', movimentacao: 'Movimentação', historico: 'Histórico', alertas: 'Alertas' };
    document.getElementById('page-title').textContent = titles[sec];

    if (el) {
        el.classList.add('active');
    } else {
        document.querySelectorAll('.nav-item').forEach(n => {
            if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'" + sec + "'")) n.classList.add('active');
        });
    }

    if (sec === 'dashboard') renderDashboard();
    if (sec === 'produtos') renderProdutos();
    if (sec === 'movimentacao') initMov(extra);
    if (sec === 'historico') renderHistorico();
    if (sec === 'alertas') renderAlertas();
}

function renderDashboard() {
    document.getElementById('m-total').textContent = produtos.length;

    const today = new Date().toDateString();
    const ent = historico.filter(h => h.tipo === 'entrada' && h.dt.toDateString() === today);
    const sai = historico.filter(h => h.tipo === 'saida' && h.dt.toDateString() === today);
    document.getElementById('m-entradas').textContent = ent.reduce((a, h) => a + h.qtd, 0);
    document.getElementById('m-saidas').textContent = sai.reduce((a, h) => a + h.qtd, 0);

    updateAlertBadge();

    const al = getAlertas();
    const ab = document.getElementById('alert-banners');
    ab.innerHTML = al.length
        ? al.map(p => `
      <div class="alert-banner${p.qtd === 0 ? ' critical' : ''}">
        <i class="ti ti-${p.qtd === 0 ? 'alert-circle' : 'alert-triangle'}" style="font-size:18px"></i>
        <div><strong>${p.nome}</strong> — estoque ${p.qtd === 0 ? 'zerado' : 'abaixo do mínimo'} (${p.qtd} un. / mín. ${p.min})</div>
        <button class="btn" style="margin-left:auto;padding:4px 10px;font-size:12px" onclick="navTo('movimentacao',null,'entrada')">Repor</button>
      </div>`).join('')
        : '';

    const dh = document.getElementById('dash-hist');
    const recent = [...historico].sort((a, b) => b.dt - a.dt).slice(0, 5);
    dh.innerHTML = recent.length
        ? recent.map(h => `<tr>
        <td>${h.prodNome}</td>
        <td><span class="pill ${h.tipo}">${h.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span></td>
        <td>${h.qtd}</td>
        <td>${h.resp}</td>
        <td>${fmt(h.dt)}</td>
      </tr>`).join('')
        : '<tr><td colspan="5" class="empty-state">Nenhuma movimentação</td></tr>';

    const dp = document.getElementById('dash-produtos');
    dp.innerHTML = produtos.map(p => `<tr>
    <td>${p.nome}</td>
    <td>${p.cat}</td>
    <td><strong>${p.qtd}</strong></td>
    <td>${p.min}</td>
    <td>${statusPill(p)}</td>
  </tr>`).join('');
}

function renderProdutos() {
    const tb = document.getElementById('tbl-produtos');
    
    // Pega o texto da barra de busca (se ela existir na tela) e transforma em minúsculas
    const inputBusca = document.getElementById('busca-produto');
    const termo = inputBusca ? inputBusca.value.toLowerCase() : '';

    // Filtra os produtos. Se o termo estiver vazio, ele mostra todos!
    const produtosFiltrados = produtos.filter(p => 
        p.nome.toLowerCase().includes(termo)
    );

    // Renderiza a tabela usando a lista filtrada
    tb.innerHTML = produtosFiltrados.map(p => `<tr>
    <td><strong>${p.nome}</strong></td>
    <td>${p.cat}</td>
    <td>${p.material}</td>
    <td>${p.tamanho || '-'} / ${p.peso ? p.peso + 'g' : '-'}</td>
    <td style="max-width:160px;font-size:12px;color:var(--text-secondary)">${p.carac || '-'}</td>
    <td><strong>${p.qtd}</strong></td>
    <td>${p.min}</td>
    <td>${statusPill(p)}</td>
    <td>
      <button class="btn" style="padding:4px 8px;font-size:12px" onclick="editProduto(${p.id})">
        <i class="ti ti-edit"></i>
      </button>
    </td>
  </tr>`).join('');
  
    // Mensagem de estado vazio caso a busca não encontre nada
    if (produtosFiltrados.length === 0) {
        tb.innerHTML = '<tr><td colspan="9" class="empty-state">Nenhum produto encontrado.</td></tr>';
    }

    updateAlertBadge();
}

function openModalProduto() {
    editingId = null;
    document.getElementById('modal-prod-title').textContent = 'Novo produto';
    ['prod-nome','prod-material','prod-cabo','prod-tamanho','prod-peso','prod-minimo','prod-carac','prod-qtd'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('prod-cat').value = 'Martelo';
    document.getElementById('prod-feedback').textContent = '';
    document.getElementById('modal-produto').classList.add('open');
    document.getElementById('btn-excluir').style.display = 'none'; // Esconde o botão de excluir quando for um novo produto
    document.getElementById('modal-produto').classList.add('open');
}

function closeModalProduto() {
    document.getElementById('modal-produto').classList.remove('open');
}

function editProduto(id) {
    const p = produtos.find(x => x.id === id);
    editingId = id;
    document.getElementById('modal-prod-title').textContent = 'Editar produto';
    document.getElementById('prod-nome').value = p.nome;
    document.getElementById('prod-cat').value = p.cat;
    document.getElementById('prod-material').value = p.material;
    document.getElementById('prod-cabo').value = p.cabo || '';
    document.getElementById('prod-tamanho').value = p.tamanho || '';
    document.getElementById('prod-peso').value = p.peso || '';
    document.getElementById('prod-minimo').value = p.min;
    document.getElementById('prod-carac').value = p.carac || '';
    document.getElementById('prod-qtd').value = p.qtd;
    document.getElementById('prod-feedback').textContent = '';
    document.getElementById('modal-produto').classList.add('open');
    document.getElementById('btn-excluir').style.display = 'block'; // Mostra o botão de excluir quando for edição
    document.getElementById('modal-produto').classList.add('open');
}


// 2. API PARA CADASTRAR OU EDITAR PRODUTO NO BANCO

async function salvarProduto() {
    const nome = document.getElementById('prod-nome').value.trim();
    const min = parseInt(document.getElementById('prod-minimo').value) || 0;
    const qtd = parseInt(document.getElementById('prod-qtd').value) || 0;
    const fb = document.getElementById('prod-feedback');

    if (!nome) { fb.innerHTML = '<span style="color:var(--red)">Informe o nome do produto.</span>'; return; }

    const payload = {
        nome: nome,
        categoria: document.getElementById('prod-cat').value,
        material_principal: document.getElementById('prod-material').value,
        material_cabo: document.getElementById('prod-cabo').value,
        tamanho: document.getElementById('prod-tamanho').value,
        peso: parseInt(document.getElementById('prod-peso').value) || null,
        caracteristicas: document.getElementById('prod-carac').value,
        qtd_atual: qtd,
        estoque_minimo: min
    };

    try {
        let url = '/api/produtos';
        let metodo = 'POST';

        // Se houver um editingId, significa que clicamos no botão Editar
        if (editingId) {
            url = `/api/produtos/${editingId}`;
            metodo = 'PUT';
        }

        const resposta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (resposta.ok) {
            closeModalProduto();
            await carregarDados(); // Recarrega o banco e atualiza a tela automaticamente
        } else {
            const erro = await resposta.json();
            fb.innerHTML = `<span style="color:var(--red)">Erro: ${erro.error}</span>`;
        }
        
    } catch (erro) {
        fb.innerHTML = '<span style="color:var(--red)">Erro ao conectar com o banco de dados.</span>';
    }
}

// FUNÇÃO PARA EXCLUIR PRODUTO DO BANCO

async function deletarProduto(id) {
    // Busca o nome do produto para fazer uma confirmação amigável
    const p = produtos.find(x => x.id === id);
    
    if (confirm(`Tem certeza que deseja excluir o produto "${p.nome}" definitivamente?`)) {
        try {
            const resposta = await fetch(`/api/produtos/${id}`, {
                method: 'DELETE'
            });

            if (resposta.ok) {
                alert('Produto excluído com sucesso!');
                closeModalProduto(); // Fecha o modal se estiver aberto
                await carregarDados(); // Recarrega a tela
            } else {
                const erro = await resposta.json();
                // Vai exibir o erro caso o produto tenha movimentações atreladas a ele
                alert('Erro ao excluir: ' + erro.error);
            }
        } catch (erro) {
            alert('Erro de conexão ao tentar excluir.');
        }
    }
}


// MOVIMENTAÇÃO E VISUAL

function initMov(tipo) {
    const sel = document.getElementById('mov-produto');
    
    // ALGORITMO DE ORDENAÇÃO ALFABÉTICA (Exigência da Entrega 7)
    // Cria uma cópia do array de produtos e ordena pelo nome (A-Z)
    const produtosOrdenados = [...produtos].sort((a, b) => {
        if (a.nome.toLowerCase() < b.nome.toLowerCase()) return -1;
        if (a.nome.toLowerCase() > b.nome.toLowerCase()) return 1;
        return 0;
    });

    sel.innerHTML = '<option value="">Selecione...</option>' +
        produtosOrdenados.map(p => `<option value="${p.id}">${p.nome} (${p.qtd} un.)</option>`).join('');

    if (tipo) document.getElementById('mov-tipo').value = tipo;
    updateMovTipo();

    document.getElementById('mov-saldo-box').style.display = 'none';
    document.getElementById('mov-qtd').value = '';
    document.getElementById('mov-resp').value = '';
    document.getElementById('mov-obs').value = '';
    
    // Preenche a data atual automaticamente no novo campo, mas deixa o usuário mudar
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
    document.getElementById('mov-data').value = agora.toISOString().slice(0, 16);
    
    document.getElementById('mov-feedback').textContent = '';

    sel.onchange = function () {
        const pid = parseInt(this.value);
        const p = produtos.find(x => x.id === pid);
        if (p) {
            document.getElementById('mov-saldo').value = p.qtd + ' unidades (Mín: ' + p.min + ')';
            document.getElementById('mov-saldo-box').style.display = 'block';
        } else {
            document.getElementById('mov-saldo-box').style.display = 'none';
        }
    };
}

function updateMovTipo() {
    const t = document.getElementById('mov-tipo').value;
    document.getElementById('btn-mov').textContent = 'Registrar ' + (t === 'entrada' ? 'entrada' : 'saída');
}


// 3. API: REGISTRAR MOVIMENTAÇÃO NO BANCO (Modificado)
async function registrarMov() {
    const pid = parseInt(document.getElementById('mov-produto').value);
    const qtd = parseInt(document.getElementById('mov-qtd').value);
    const resp = document.getElementById('mov-resp').value.trim();
    const tipo = document.getElementById('mov-tipo').value;
    const obs = document.getElementById('mov-obs').value.trim();
    const dataMov = document.getElementById('mov-data').value; // Captura a data
    const fb = document.getElementById('mov-feedback');

    if (!pid) { fb.innerHTML = '<span style="color:var(--red)">Selecione um produto.</span>'; return; }
    if (!qtd || qtd < 1) { fb.innerHTML = '<span style="color:var(--red)">Informe uma quantidade válida.</span>'; return; }
    if (!resp) { fb.innerHTML = '<span style="color:var(--red)">Informe o responsável.</span>'; return; }
    if (!dataMov) { fb.innerHTML = '<span style="color:var(--red)">Informe a data da movimentação.</span>'; return; }

    const p = produtos.find(x => x.id === pid);
    
    // Impede a saída se não tiver saldo
    if (tipo === 'saida' && qtd > p.qtd) {
        fb.innerHTML = `<span style="color:var(--red)">Saldo insuficiente. Disponível: ${p.qtd} un.</span>`;
        return;
    }

    // ALERTA DE ESTOQUE MÍNIMO (Exigência da Entrega 7)
    if (tipo === 'saida') {
        const saldoPosSaida = p.qtd - qtd;
        if (saldoPosSaida < p.min) {
            // Emite um alerta nativo do navegador para o usuário
            alert(`⚠️ ALERTA AUTOMÁTICO: A saída deste produto deixará o estoque (${saldoPosSaida} un.) abaixo do nível mínimo configurado (${p.min} un.)!`);
        }
    }

    const payload = {
        produto_id: pid,
        tipo: tipo,
        quantidade: qtd,
        responsavel: resp,
        observacao: obs,
        data_hora: dataMov // Envia a data para o backend
    };

    try {
        const resposta = await fetch('/api/movimentacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (resposta.ok) {
            fb.innerHTML = `<span style="color:var(--teal)"><i class="ti ti-check"></i> ${tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!</span>`;
            document.getElementById('mov-qtd').value = '';
            document.getElementById('mov-obs').value = '';
            
            await carregarDados(); // Puxa o saldo atualizado e o histórico novo do banco
            
            // Atualiza o select com o novo saldo sem recarregar tudo bruscamente
            const novoProduto = produtos.find(x => x.id === pid);
            document.getElementById('mov-saldo').value = novoProduto.qtd + ' unidades';
        } else {
            const erro = await resposta.json();
            fb.innerHTML = `<span style="color:var(--red)">Erro no servidor: ${erro.error}</span>`;
        }
    } catch (erro) {
        fb.innerHTML = '<span style="color:var(--red)">Erro ao conectar com a API.</span>';
    }
}

function limparMov() { initMov(document.getElementById('mov-tipo').value); }


// HISTÓRICO E ALERTAS (Intactos)

function renderHistorico() {
    const sel = document.getElementById('hist-filtro-prod');
    const cur = sel.value;
    sel.innerHTML = '<option value="">Todos os produtos</option>' +
        produtos.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    sel.value = cur;
    renderHistoricoFiltro();
}

function renderHistoricoFiltro() {
    const tipo = document.getElementById('hist-filtro-tipo').value;
    const pid = parseInt(document.getElementById('hist-filtro-prod').value) || null;
    let list = [...historico].sort((a, b) => b.dt - a.dt);
    
    if (tipo) list = list.filter(h => h.tipo === tipo);
    if (pid) list = list.filter(h => h.prodId === pid);

    const el = document.getElementById('hist-list');
    el.innerHTML = list.length 
        ? list.map(h => `
      <div class="hist-row" style="padding: 12px 16px;">
        <div class="hist-icon ${h.tipo === 'entrada' ? 'e' : 's'}">
          <i class="ti ti-arrow-${h.tipo === 'entrada' ? 'down' : 'up'}"></i>
        </div>
        <div class="hist-details">
          <div class="hist-title">${h.prodNome}</div>
          <div class="hist-sub">
            Resp: ${h.resp} • Data: ${fmt(h.dt)}
            ${h.obs ? '<br><i>Obs: ' + h.obs + '</i>' : ''}
          </div>
        </div>
        <div class="hist-qty ${h.tipo === 'entrada' ? 'e' : 's'}" style="font-size: 16px;">
          ${h.tipo === 'entrada' ? '+' : '-'}${h.qtd}
        </div>
      </div>
    `).join('') 
        : '<div class="empty-state">Nenhum registro encontrado.</div>';
}

function renderAlertas() {
    const list = getAlertas();
    const el = document.getElementById('alertas-list');
    el.innerHTML = list.length 
        ? list.map(p => `
      <div class="hist-row" style="padding: 12px 16px;">
        <div class="hist-icon s" style="background: var(--red-light); color: var(--red);">
          <i class="ti ti-${p.qtd === 0 ? 'alert-circle' : 'alert-triangle'}"></i>
        </div>
        <div class="hist-details">
          <div class="hist-title">${p.nome}</div>
          <div class="hist-sub" style="color: var(--red); font-weight: 600;">
            Estoque atual: ${p.qtd} (Mínimo exigido: ${p.min})
          </div>
        </div>
        <div>
          <button class="btn primary" onclick="navTo('movimentacao', null, 'entrada')">
            <i class="ti ti-arrow-bar-down"></i> Repor
          </button>
        </div>
      </div>
    `).join('') 
        : '<div class="empty-state">Estoque normalizado. Nenhum alerta pendente.</div>';
}


// INICIALIZAÇÃO

// Em vez de só navegar, agora ele busca os dados no Banco primeiro
window.onload = async () => {
    await carregarDados(); 
};