/* ==========================================================
   Aurora Café – lógica da loja (JavaScript puro, sem bibliotecas)

   Organização do arquivo:
   1. Dados (lista de produtos)
   2. Estado da aplicação
   3. Funções utilitárias
   4. Renderização (desenhar a tela a partir do estado)
   5. Ações do carrinho
   6. Eventos
   ========================================================== */

/* ---------- 1. DADOS ---------- */
// Em um projeto real, isso viria de uma API. Aqui usamos uma lista fixa.
const PRODUTOS = [
  { id: 1,  nome: "Café Bourbon Amarelo 250g",  categoria: "Cafés",      preco: 42.9,  emoji: "☕", cor: "#f2d9b8", nota: 4.8, selo: "Mais vendido", descricao: "Notas de caramelo e chocolate. Torra média." },
  { id: 2,  nome: "Café Catuaí Natural 250g",   categoria: "Cafés",      preco: 46.5,  emoji: "🫘", cor: "#e9c9a0", nota: 4.7, descricao: "Doce e frutado, com corpo cremoso." },
  { id: 3,  nome: "Café Geisha Especial 250g",  categoria: "Cafés",      preco: 89.9,  emoji: "🌸", cor: "#f6dfe0", nota: 5.0, selo: "Premium", descricao: "Floral e aromático. Edição limitada." },
  { id: 4,  nome: "Café Descafeinado 250g",     categoria: "Cafés",      preco: 39.9,  emoji: "🌙", cor: "#d9d7ee", nota: 4.4, descricao: "Todo o sabor, sem cafeína." },
  { id: 5,  nome: "Moedor Manual de Cerâmica",  categoria: "Acessórios", preco: 129.9, emoji: "⚙️", cor: "#d5e3dc", nota: 4.6, descricao: "Moagem uniforme e ajuste de finura." },
  { id: 6,  nome: "Coador de Pano Reutilizável",categoria: "Acessórios", preco: 24.9,  emoji: "🧺", cor: "#efe4cf", nota: 4.5, descricao: "Sustentável e fácil de lavar." },
  { id: 7,  nome: "Prensa Francesa 600ml",      categoria: "Acessórios", preco: 98.0,  emoji: "🫖", cor: "#d6e4f0", nota: 4.7, selo: "Novo", descricao: "Vidro borossilicato e filtro de aço." },
  { id: 8,  nome: "Caneca Térmica 350ml",       categoria: "Acessórios", preco: 69.9,  emoji: "🥤", cor: "#f0d3c4", nota: 4.3, descricao: "Mantém a temperatura por até 6 horas." },
  { id: 9,  nome: "Chaleira Bico de Ganso",     categoria: "Acessórios", preco: 159.0, emoji: "🫗", cor: "#dfe0e6", nota: 4.9, descricao: "Controle total do fluxo de água." },
  { id: 10, nome: "Kit Degustação (3 cafés)",   categoria: "Kits",       preco: 119.9, emoji: "🎁", cor: "#f5e3b8", nota: 4.9, selo: "Presente", descricao: "Três origens de 100g para descobrir seu favorito." },
  { id: 11, nome: "Kit Iniciante Coado",        categoria: "Kits",       preco: 169.9, emoji: "📦", cor: "#e6d5c3", nota: 4.8, descricao: "Café, coador e filtro para começar bem." },
  { id: 12, nome: "Assinatura Mensal",          categoria: "Kits",       preco: 79.9,  emoji: "🔁", cor: "#d3e8d5", nota: 4.6, descricao: "Um café especial novo todo mês na sua porta." }
];

// Regras da loja
const FRETE_GRATIS_A_PARTIR_DE = 150;
const VALOR_FRETE = 15;
const CUPONS = { AURORA10: 0.10, CAFE5: 0.05 }; // cupom -> percentual de desconto

/* ---------- 2. ESTADO ---------- */
// Tudo que muda na tela é guardado aqui. Quando o estado muda, redesenhamos a tela.
const estado = {
  categoria: "Todos",
  busca: "",
  ordem: "relevancia",
  carrinho: [],   // lista de { id, qtd }
  cupom: null     // ex.: { codigo: "AURORA10", percentual: 0.1 }
};

/* ---------- 3. UTILITÁRIOS ---------- */
// Atalho para buscar elementos pelo id
const $ = (id) => document.getElementById(id);

// Formata número como moeda brasileira: 1234.5 -> "R$ 1.234,50"
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatar = (valor) => moeda.format(valor);

const buscarProduto = (id) => PRODUTOS.find((p) => p.id === id);

// localStorage pode falhar (modo privado, por exemplo), por isso usamos try/catch
function salvar() {
  try {
    localStorage.setItem("aurora-carrinho", JSON.stringify({ carrinho: estado.carrinho, cupom: estado.cupom }));
  } catch (e) { /* sem problema: o carrinho só não será lembrado */ }
}
function carregar() {
  try {
    const dados = JSON.parse(localStorage.getItem("aurora-carrinho"));
    if (dados && Array.isArray(dados.carrinho)) {
      // só mantém itens cujo produto ainda existe e com quantidade válida
      estado.carrinho = dados.carrinho.filter((i) => buscarProduto(i.id) && i.qtd > 0);
      estado.cupom = dados.cupom && CUPONS[dados.cupom.codigo] ? dados.cupom : null;
    }
  } catch (e) { /* ignora dados corrompidos */ }
}

let temporizadorToast;
function avisar(mensagem) {
  const toast = $("toast");
  toast.textContent = mensagem;
  toast.classList.add("visivel");
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => toast.classList.remove("visivel"), 2200);
}

/* ---------- 4. RENDERIZAÇÃO ---------- */

// Aplica busca + filtro + ordenação e devolve a lista que deve aparecer
function produtosVisiveis() {
  const termo = estado.busca.trim().toLowerCase();

  let lista = PRODUTOS.filter((p) => {
    const naCategoria = estado.categoria === "Todos" || p.categoria === estado.categoria;
    const noTexto = p.nome.toLowerCase().includes(termo) || p.descricao.toLowerCase().includes(termo);
    return naCategoria && noTexto;
  });

  // [...lista] cria uma cópia, para não alterar o array original ao ordenar
  const ordenacoes = {
    menor: (a, b) => a.preco - b.preco,
    maior: (a, b) => b.preco - a.preco,
    nome: (a, b) => a.nome.localeCompare(b.nome, "pt-BR"),
    relevancia: (a, b) => b.nota - a.nota
  };
  return [...lista].sort(ordenacoes[estado.ordem]);
}

function renderFiltros() {
  const categorias = ["Todos", ...new Set(PRODUTOS.map((p) => p.categoria))];
  $("filtros").innerHTML = categorias
    .map((c) => `<button type="button" class="chip" data-categoria="${c}" aria-pressed="${c === estado.categoria}">${c}</button>`)
    .join("");
}

function renderProdutos() {
  const lista = produtosVisiveis();
  $("resultado").textContent = `${lista.length} ${lista.length === 1 ? "produto encontrado" : "produtos encontrados"}`;

  if (lista.length === 0) {
    $("grade").innerHTML = `<p class="vazio">Nenhum produto encontrado. Tente outra busca ou categoria.</p>`;
    return;
  }

  $("grade").innerHTML = lista
    .map((p) => `
      <article class="card">
        <div class="card__imagem" style="background:${p.cor}" aria-hidden="true">
          ${p.selo ? `<span class="card__selo">${p.selo}</span>` : ""}
          ${p.emoji}
        </div>
        <div class="card__corpo">
          <p class="card__categoria">${p.categoria}</p>
          <h3 class="card__titulo">${p.nome}</h3>
          <p class="card__descricao">${p.descricao}</p>
          <p class="card__avaliacao" aria-label="Nota ${p.nota} de 5">★ ${p.nota.toFixed(1)}</p>
          <p class="card__preco">${formatar(p.preco)}</p>
          <button type="button" class="btn btn--primario" data-adicionar="${p.id}">Adicionar ao carrinho</button>
        </div>
      </article>`)
    .join("");
}

// Calcula todos os valores do carrinho em um só lugar
function calcularTotais() {
  const subtotal = estado.carrinho.reduce((soma, item) => soma + buscarProduto(item.id).preco * item.qtd, 0);
  const desconto = estado.cupom ? subtotal * estado.cupom.percentual : 0;
  const baseFrete = subtotal - desconto;
  const frete = estado.carrinho.length === 0 || baseFrete >= FRETE_GRATIS_A_PARTIR_DE ? 0 : VALOR_FRETE;
  return { subtotal, desconto, frete, total: subtotal - desconto + frete, baseFrete };
}

function renderCarrinho() {
  const totais = calcularTotais();
  const quantidadeTotal = estado.carrinho.reduce((soma, i) => soma + i.qtd, 0);

  // Contador do ícone do carrinho
  $("contador").textContent = quantidadeTotal;

  // Itens
  if (estado.carrinho.length === 0) {
    $("itens").innerHTML = `<li class="carrinho__vazio">Seu carrinho está vazio.<br>Que tal conhecer nossos cafés?</li>`;
  } else {
    $("itens").innerHTML = estado.carrinho
      .map((item) => {
        const p = buscarProduto(item.id);
        return `
        <li class="item">
          <div class="item__imagem" style="background:${p.cor}" aria-hidden="true">${p.emoji}</div>
          <div>
            <p class="item__nome">${p.nome}</p>
            <p class="item__preco">${formatar(p.preco)} cada</p>
            <div class="qtd">
              <button type="button" data-menos="${p.id}" aria-label="Diminuir quantidade de ${p.nome}">−</button>
              <span aria-label="Quantidade">${item.qtd}</span>
              <button type="button" data-mais="${p.id}" aria-label="Aumentar quantidade de ${p.nome}">+</button>
            </div>
          </div>
          <div>
            <p class="item__total">${formatar(p.preco * item.qtd)}</p>
            <button type="button" class="item__remover" data-remover="${p.id}">Remover</button>
          </div>
        </li>`;
      })
      .join("");
  }

  // Barra de progresso do frete grátis
  const falta = FRETE_GRATIS_A_PARTIR_DE - totais.baseFrete;
  const percentual = Math.min(100, (totais.baseFrete / FRETE_GRATIS_A_PARTIR_DE) * 100);
  $("frete").innerHTML = estado.carrinho.length === 0
    ? "Frete grátis em compras acima de " + formatar(FRETE_GRATIS_A_PARTIR_DE)
    : falta > 0
      ? `Faltam <strong>${formatar(falta)}</strong> para o frete grátis!
         <div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(percentual)}"><div class="barra__preenchida" style="width:${percentual}%"></div></div>`
      : `🎉 Você ganhou <strong>frete grátis</strong>!
         <div class="barra"><div class="barra__preenchida" style="width:100%"></div></div>`;

  // Resumo de valores
  $("subtotal").textContent = formatar(totais.subtotal);
  $("linhaDesconto").hidden = !estado.cupom;
  $("desconto").textContent = "− " + formatar(totais.desconto);
  $("freteValor").textContent = totais.frete === 0 ? "Grátis" : formatar(totais.frete);
  $("total").textContent = formatar(totais.total);

  // Esconde o rodapé (cupom, total, botão) quando o carrinho está vazio
  $("rodapeCarrinho").hidden = estado.carrinho.length === 0;
}

/* ---------- 5. AÇÕES DO CARRINHO ---------- */
function adicionar(id) {
  const existente = estado.carrinho.find((i) => i.id === id);
  if (existente) existente.qtd += 1;
  else estado.carrinho.push({ id, qtd: 1 });

  atualizarCarrinho();
  avisar(`"${buscarProduto(id).nome}" adicionado ao carrinho`);

  // animação rápida no contador
  const contador = $("contador");
  contador.classList.remove("pulsar");
  void contador.offsetWidth; // força o navegador a reiniciar a animação
  contador.classList.add("pulsar");
}

function alterarQuantidade(id, variacao) {
  const item = estado.carrinho.find((i) => i.id === id);
  if (!item) return;
  item.qtd += variacao;
  if (item.qtd <= 0) remover(id);
  else atualizarCarrinho();
}

function remover(id) {
  estado.carrinho = estado.carrinho.filter((i) => i.id !== id);
  atualizarCarrinho();
}

function aplicarCupom(texto) {
  const codigo = texto.trim().toUpperCase();
  const msg = $("msgCupom");

  if (!codigo) {
    msg.textContent = "Digite um cupom.";
    msg.className = "cupom__msg erro";
    return;
  }
  if (!CUPONS[codigo]) {
    msg.textContent = "Cupom inválido.";
    msg.className = "cupom__msg erro";
    return;
  }
  estado.cupom = { codigo, percentual: CUPONS[codigo] };
  msg.textContent = `Cupom ${codigo} aplicado: ${CUPONS[codigo] * 100}% de desconto!`;
  msg.className = "cupom__msg ok";
  atualizarCarrinho();
}

// Sempre que o carrinho muda: redesenha e salva
function atualizarCarrinho() {
  renderCarrinho();
  salvar();
}

/* ---- Abrir/fechar a gaveta do carrinho ---- */
let ultimoFoco = null;
function abrirCarrinho() {
  ultimoFoco = document.activeElement;
  $("carrinho").classList.add("aberto");
  $("carrinho").setAttribute("aria-hidden", "false");
  $("fundo").hidden = false;
  $("fecharCarrinho").focus();
}
function fecharCarrinho() {
  $("carrinho").classList.remove("aberto");
  $("carrinho").setAttribute("aria-hidden", "true");
  $("fundo").hidden = true;
  if (ultimoFoco) ultimoFoco.focus(); // devolve o foco para quem abriu (acessibilidade)
}

/* ---------- 6. EVENTOS ---------- */

// Delegação de eventos: um único "ouvinte" na grade cuida de todos os botões.
$("grade").addEventListener("click", (e) => {
  const botao = e.target.closest("[data-adicionar]");
  if (botao) adicionar(Number(botao.dataset.adicionar));
});

$("filtros").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-categoria]");
  if (!chip) return;
  estado.categoria = chip.dataset.categoria;
  renderFiltros();
  renderProdutos();
});

$("busca").addEventListener("input", (e) => {
  estado.busca = e.target.value;
  renderProdutos();
});

$("ordem").addEventListener("change", (e) => {
  estado.ordem = e.target.value;
  renderProdutos();
});

$("itens").addEventListener("click", (e) => {
  const mais = e.target.closest("[data-mais]");
  const menos = e.target.closest("[data-menos]");
  const rem = e.target.closest("[data-remover]");
  if (mais) alterarQuantidade(Number(mais.dataset.mais), +1);
  if (menos) alterarQuantidade(Number(menos.dataset.menos), -1);
  if (rem) remover(Number(rem.dataset.remover));
});

$("abrirCarrinho").addEventListener("click", abrirCarrinho);
$("fecharCarrinho").addEventListener("click", fecharCarrinho);
$("fundo").addEventListener("click", fecharCarrinho);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("carrinho").classList.contains("aberto")) fecharCarrinho();
});

$("formCupom").addEventListener("submit", (e) => {
  e.preventDefault(); // evita recarregar a página
  aplicarCupom($("cupom").value);
});

$("limpar").addEventListener("click", () => {
  estado.carrinho = [];
  estado.cupom = null;
  $("msgCupom").textContent = "";
  atualizarCarrinho();
});

$("finalizar").addEventListener("click", () => {
  // Simulação: em uma loja real, aqui iria para o pagamento.
  const { total } = calcularTotais();
  estado.carrinho = [];
  estado.cupom = null;
  $("msgCupom").textContent = "";
  atualizarCarrinho();
  fecharCarrinho();
  avisar(`Pedido simulado de ${formatar(total)} realizado com sucesso! 🎉`);
});

// Validação do formulário de newsletter (sem depender só do navegador)
$("formNewsletter").addEventListener("submit", (e) => {
  e.preventDefault();
  const campo = $("email");
  const msg = $("msgNewsletter");
  const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campo.value.trim());

  campo.classList.toggle("invalido", !valido);
  if (!valido) {
    msg.textContent = "Digite um e-mail válido, por exemplo nome@email.com.";
    msg.className = "newsletter__msg erro";
    campo.focus();
    return;
  }
  msg.textContent = "Cadastro realizado! Use o cupom AURORA10 no carrinho.";
  msg.className = "newsletter__msg ok";
  campo.value = "";
});

/* ---------- INÍCIO ---------- */
carregar();
renderFiltros();
renderProdutos();
renderCarrinho();
