const ligaHamburguer = document.getElementById("liga-hamburguer");
const xHamburguer = document.getElementById("x-hamburguer");
const menuHamburguer = document.getElementById("menu");

if (ligaHamburguer && xHamburguer && menuHamburguer) {
  ligaHamburguer.addEventListener("click", () => {
    menuHamburguer.style.display = "flex";
    ligaHamburguer.style.display = "none";
    xHamburguer.style.display = "flex";
  });

  xHamburguer.addEventListener("click", () => {
    menuHamburguer.style.display = "none";
    ligaHamburguer.style.display = "flex";
    xHamburguer.style.display = "none";
  });
}

const CHAVE_CARRINHO = "extech-carrinho";
const botaoCarrinho = document.getElementById("btn-carrinho");
let carrinho = lerCarrinho();

function lerCarrinho() {
  try {
    const carrinhoSalvo = JSON.parse(localStorage.getItem(CHAVE_CARRINHO));
    return Array.isArray(carrinhoSalvo) ? carrinhoSalvo : [];
  } catch {
    return [];
  }
}

function salvarCarrinho() {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}

function formatarPreco(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function converterPreco(texto) {
  return Number(
    texto
      .replace(/[^\d,]/g, "")
      .replace(/\./g, "")
      .replace(",", "."),
  );
}

function criarPainelCarrinho() {
  const painel = document.createElement("aside");
  painel.id = "painel-carrinho";
  painel.className = "painel-carrinho";
  painel.setAttribute("aria-hidden", "true");
  painel.setAttribute("aria-labelledby", "titulo-carrinho");
  painel.innerHTML = `
    <div class="cabecalho-carrinho">
      <h2 id="titulo-carrinho">Seu carrinho</h2>
      <button class="fechar-carrinho" type="button" aria-label="Fechar carrinho">×</button>
    </div>
    <p class="mensagem-carrinho" aria-live="polite"></p>
    <ul class="itens-carrinho"></ul>
    <div class="resumo-carrinho">
      <div class="linha-total"><span>Total</span><strong class="valor-total">R$ 0,00</strong></div>
      <button class="finalizar-pedido" type="button">Finalizar pedido</button>
      <button class="limpar-carrinho" type="button">Limpar carrinho</button>
    </div>
  `;

  document.body.appendChild(painel);
  return painel;
}

const painelCarrinho = criarPainelCarrinho();
const listaCarrinho = painelCarrinho.querySelector(".itens-carrinho");
const valorTotal = painelCarrinho.querySelector(".valor-total");
const mensagemCarrinho = painelCarrinho.querySelector(".mensagem-carrinho");
const botaoFecharCarrinho = painelCarrinho.querySelector(".fechar-carrinho");
const botaoLimparCarrinho = painelCarrinho.querySelector(".limpar-carrinho");
const botaoFinalizarPedido = painelCarrinho.querySelector(".finalizar-pedido");

function quantidadeTotal() {
  return carrinho.reduce((total, item) => total + item.quantidade, 0);
}

function atualizarContador() {
  if (!botaoCarrinho) return;

  let contador = botaoCarrinho.querySelector(".contador-carrinho");
  if (!contador) {
    contador = document.createElement("span");
    contador.className = "contador-carrinho";
    contador.setAttribute("aria-live", "polite");
    botaoCarrinho.appendChild(contador);
  }

  const quantidade = quantidadeTotal();
  contador.textContent = quantidade;
  contador.hidden = quantidade === 0;
  botaoCarrinho.setAttribute(
    "aria-label",
    quantidade ? `Abrir carrinho com ${quantidade} item(ns)` : "Abrir carrinho vazio",
  );
}

function mostrarMensagem(texto) {
  mensagemCarrinho.textContent = texto;
}

function renderizarCarrinho() {
  listaCarrinho.innerHTML = "";
  const total = carrinho.reduce(
    (soma, item) => soma + item.preco * item.quantidade,
    0,
  );

  if (!carrinho.length) {
    const vazio = document.createElement("li");
    vazio.className = "carrinho-vazio";
    vazio.textContent = "Seu carrinho está vazio.";
    listaCarrinho.appendChild(vazio);
    botaoLimparCarrinho.disabled = true;
    botaoFinalizarPedido.disabled = true;
  } else {
    carrinho.forEach((item) => {
      const linha = document.createElement("li");
      linha.className = "item-carrinho";
      linha.innerHTML = `
        <img src="${item.imagem}" alt="${item.nome}" />
        <div class="dados-item-carrinho">
          <h3>${item.nome}</h3>
          <span>${formatarPreco(item.preco)}</span>
          <div class="controle-quantidade" aria-label="Quantidade de ${item.nome}">
            <button type="button" data-acao="diminuir" aria-label="Diminuir quantidade de ${item.nome}">−</button>
            <strong>${item.quantidade}</strong>
            <button type="button" data-acao="aumentar" aria-label="Aumentar quantidade de ${item.nome}">+</button>
          </div>
        </div>
        <button class="remover-item" type="button" aria-label="Remover ${item.nome}">Remover</button>
      `;

      linha.querySelector('[data-acao="diminuir"]').addEventListener("click", () => {
        alterarQuantidade(item.id, -1);
      });
      linha.querySelector('[data-acao="aumentar"]').addEventListener("click", () => {
        alterarQuantidade(item.id, 1);
      });
      linha.querySelector(".remover-item").addEventListener("click", () => {
        removerDoCarrinho(item.id);
      });
      listaCarrinho.appendChild(linha);
    });

    botaoLimparCarrinho.disabled = false;
    botaoFinalizarPedido.disabled = false;
  }

  valorTotal.textContent = formatarPreco(total);
  atualizarContador();
}

function adicionarAoCarrinho(produto) {
  const produtoExistente = carrinho.find((item) => item.id === produto.id);

  if (produtoExistente) {
    produtoExistente.quantidade += 1;
  } else {
    carrinho.push({ ...produto, quantidade: 1 });
  }

  salvarCarrinho();
  renderizarCarrinho();
  mostrarMensagem(`${produto.nome} foi adicionado ao carrinho.`);
}

function alterarQuantidade(id, mudanca) {
  const produto = carrinho.find((item) => item.id === id);
  if (!produto) return;

  produto.quantidade += mudanca;
  if (produto.quantidade <= 0) {
    carrinho = carrinho.filter((item) => item.id !== id);
  }

  salvarCarrinho();
  renderizarCarrinho();
}

function removerDoCarrinho(id) {
  const produto = carrinho.find((item) => item.id === id);
  carrinho = carrinho.filter((item) => item.id !== id);
  salvarCarrinho();
  renderizarCarrinho();
  mostrarMensagem(`${produto?.nome || "Produto"} foi removido do carrinho.`);
}

function abrirCarrinho() {
  painelCarrinho.classList.add("aberto");
  painelCarrinho.setAttribute("aria-hidden", "false");
  botaoCarrinho?.setAttribute("aria-expanded", "true");
}

function fecharCarrinho() {
  painelCarrinho.classList.remove("aberto");
  painelCarrinho.setAttribute("aria-hidden", "true");
  botaoCarrinho?.setAttribute("aria-expanded", "false");
}

function ativarProdutos() {
  const seletor =
    "#lancamentos > #produtos article, main#produtos .categorias article";

  document.querySelectorAll(seletor).forEach((cartao, indice) => {
    if (cartao.querySelector(".adicionar-carrinho")) return;

    const titulo = cartao.querySelector(".texto-produto h3")?.textContent.trim();
    const precoTexto = cartao.querySelector(".texto-produto h4")?.textContent.trim();
    const imagem = cartao.querySelector(".img-produto img");
    const preco = converterPreco(precoTexto || "");

    if (!titulo || !imagem || !Number.isFinite(preco)) return;

    cartao.classList.add("produto-card");
    const produto = {
      id: `${titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${indice}`,
      nome: titulo,
      preco,
      imagem: imagem.getAttribute("src"),
    };

    const botaoAdicionar = document.createElement("button");
    botaoAdicionar.type = "button";
    botaoAdicionar.className = "adicionar-carrinho";
    botaoAdicionar.textContent = "Adicionar ao carrinho";
    botaoAdicionar.setAttribute("aria-label", `Adicionar ${titulo} ao carrinho`);

    botaoAdicionar.addEventListener("click", () => {
      adicionarAoCarrinho(produto);
      cartao.classList.add("produto-adicionado");
      window.setTimeout(() => cartao.classList.remove("produto-adicionado"), 650);
    });

    cartao.addEventListener("pointerdown", () => {
      cartao.classList.add("produto-ativo");
    });
    cartao.addEventListener("pointerup", () => {
      cartao.classList.remove("produto-ativo");
    });
    cartao.addEventListener("pointercancel", () => {
      cartao.classList.remove("produto-ativo");
    });
    cartao.addEventListener("pointerleave", () => {
      cartao.classList.remove("produto-ativo");
    });

    cartao.querySelector(".texto-produto")?.appendChild(botaoAdicionar);
  });
}

if (botaoCarrinho) {
  botaoCarrinho.type = "button";
  botaoCarrinho.setAttribute("aria-controls", "painel-carrinho");
  botaoCarrinho.setAttribute("aria-expanded", "false");
  botaoCarrinho.addEventListener("click", () => {
    painelCarrinho.classList.contains("aberto") ? fecharCarrinho() : abrirCarrinho();
  });
}

botaoFecharCarrinho.addEventListener("click", fecharCarrinho);
botaoLimparCarrinho.addEventListener("click", () => {
  carrinho = [];
  salvarCarrinho();
  renderizarCarrinho();
  mostrarMensagem("Carrinho limpo.");
});
botaoFinalizarPedido.addEventListener("click", () => {
  mostrarMensagem("Pedido pronto para finalizar. Entre em contato com a EXTech para concluir a compra.");
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") fecharCarrinho();
});

ativarProdutos();
renderizarCarrinho();


// Busca produtos pelo cabeçalho em qualquer página do site.
const campoBusca = document.getElementById("form-pesquisa");
const botaoBuscar = document.getElementById("btn-pesquisar");
const paginaCatalogo = document.querySelector("main#produtos");

function normalizarTextoBusca(texto) {
  return texto
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function executarBusca() {
  if (!campoBusca) return;

  const termo = campoBusca.value.trim();
  const destino = new URL("Produtos.html", window.location.href);

  if (termo) destino.searchParams.set("q", termo);
  window.location.assign(destino.href);
}

let cacheLancamentosBusca;

function obterLancamentosParaBusca() {
  if (!cacheLancamentosBusca) {
    const seletor = "#lancamentos > #produtos article";
    const lancamentosLocais = document.querySelectorAll(seletor);

    if (lancamentosLocais.length) {
      cacheLancamentosBusca = Promise.resolve(
        [...lancamentosLocais].map((cartao) => cartao.cloneNode(true)),
      );
    } else {
      cacheLancamentosBusca = fetch(new URL("index.html", window.location.href))
        .then((resposta) => {
          if (!resposta.ok) throw new Error("Não foi possível carregar os lançamentos.");
          return resposta.text();
        })
        .then((html) => {
          const documento = new DOMParser().parseFromString(html, "text/html");
          return [...documento.querySelectorAll(seletor)].map((cartao) =>
            cartao.cloneNode(true),
          );
        })
        .catch(() => []);
    }
  }

  return cacheLancamentosBusca;
}

async function filtrarCatalogo(termo) {
  if (!paginaCatalogo) return;

  let resumo = paginaCatalogo.querySelector(".resultado-busca");
  if (!resumo) {
    resumo = document.createElement("section");
    resumo.className = "resultado-busca";
    resumo.setAttribute("aria-live", "polite");
    paginaCatalogo.prepend(resumo);
  }

  const busca = normalizarTextoBusca(termo);
  paginaCatalogo.querySelector(".resultado-lancamentos")?.remove();
  const cartoes = [...paginaCatalogo.querySelectorAll(".categorias article")];
  let encontrados = 0;

  cartoes.forEach((cartao) => {
    const corresponde = !busca || normalizarTextoBusca(cartao.textContent).includes(busca);
    cartao.hidden = !corresponde;
    if (corresponde) encontrados += 1;
  });

  paginaCatalogo.querySelectorAll(".categorias").forEach((categoria) => {
    const temResultado = [...categoria.querySelectorAll("article")].some(
      (cartao) => !cartao.hidden,
    );
    categoria.hidden = !temResultado;
    const titulo = categoria.previousElementSibling;
    if (titulo?.tagName === "H1") titulo.hidden = !temResultado;
  });

  if (busca) {
    const lancamentos = await obterLancamentosParaBusca();
    const correspondencias = lancamentos.filter((cartao) =>
      normalizarTextoBusca(cartao.textContent).includes(busca),
    );

    if (correspondencias.length) {
      const secaoLancamentos = document.createElement("section");
      secaoLancamentos.className = "resultado-lancamentos";

      const tituloLancamentos = document.createElement("h2");
      tituloLancamentos.textContent = "Lançamentos";
      secaoLancamentos.appendChild(tituloLancamentos);

      const gradeLancamentos = document.createElement("div");
      gradeLancamentos.className = "categorias";

      correspondencias.forEach((cartao) => {
        cartao.querySelector(".adicionar-carrinho")?.remove();
        gradeLancamentos.appendChild(cartao);
      });

      secaoLancamentos.appendChild(gradeLancamentos);
      resumo.after(secaoLancamentos);
      encontrados += correspondencias.length;
      ativarProdutos();
    }
  }

  resumo.replaceChildren();
  if (busca) {
    const texto = document.createElement("p");
    texto.textContent = encontrados
      ? `${encontrados} produto(s) encontrado(s) para “${termo}”.`
      : `Nenhum produto encontrado para “${termo}”.`;
    resumo.appendChild(texto);

    const limpar = document.createElement("button");
    limpar.type = "button";
    limpar.className = "limpar-busca";
    limpar.textContent = "Ver todos os produtos";
    limpar.addEventListener("click", () => {
      const destino = new URL("Produtos.html", window.location.href);
      window.location.assign(destino.href);
    });
    resumo.appendChild(limpar);
  }
}

if (campoBusca && botaoBuscar) {
  const parametrosBusca = new URLSearchParams(window.location.search);
  const termoInicial = parametrosBusca.get("q") || "";

  campoBusca.value = termoInicial;
  botaoBuscar.type = "button";
  botaoBuscar.setAttribute("aria-label", "Buscar produtos");
  botaoBuscar.addEventListener("click", executarBusca);
  campoBusca.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
      evento.preventDefault();
      executarBusca();
    }
  });

  if (paginaCatalogo && termoInicial) filtrarCatalogo(termoInicial);
}
