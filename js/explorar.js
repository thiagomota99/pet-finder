let todosAnimais = [];

let filtroAtual = "TODOS";

let textoBusca = "";

const FOTO_PADRAO = "assets/bolinha.jpg";

document.addEventListener("DOMContentLoaded", async function () {
  // Verifica se o usuário está logado
  if (!usuarioEstaLogado()) {
    window.location.href = "login.html";

    return;
  }

  atualizarSaudacao();

  await carregarAnimais();

  configurarBusca();

  configurarFiltros();
});

// ========================================
// SAUDAÇÃO
// ========================================

function atualizarSaudacao() {
  const nome = obterNomeUsuario();

  const saudacao = document.getElementById("saudacao");

  if (nome) {
    saudacao.textContent = `Olá, ${nome}!`;
  } else {
    saudacao.textContent = "Bom dia!";
  }
}

// ========================================
// CARREGAR ANIMAIS
// ========================================

async function carregarAnimais() {
  const container = document.getElementById("animaisContainer");

  try {
    const resposta = await apiRequest("/animais");

    console.log("Animais recebidos:", resposta);

    todosAnimais = Array.isArray(resposta) ? resposta : [];

    aplicarFiltros();
  } catch (error) {
    console.error("Erro ao carregar animais:", error);

    container.innerHTML = `

      <div class="error-state">

        <h3>
          Não foi possível carregar os animais.
        </h3>

        <p>
          Tente novamente mais tarde.
        </p>

      </div>

    `;
  }
}

// ========================================
// APLICAR FILTROS
// ========================================

function aplicarFiltros() {
  let animais = [...todosAnimais];

  // Filtro por espécie

  if (filtroAtual === "CANINO" || filtroAtual === "FELINO") {
    animais = animais.filter(
      (animal) => normalizar(animal.especie) === filtroAtual,
    );
  }

  // Busca

  if (textoBusca.length > 0) {
    const busca = normalizarTexto(textoBusca);

    animais = animais.filter((animal) => {
      const nome = normalizarTexto(animal.nome);

      const raca = normalizarTexto(animal.raca);

      const especie = normalizarTexto(animal.especie);

      return (
        nome.includes(busca) || raca.includes(busca) || especie.includes(busca)
      );
    });
  }

  renderizarAnimais(animais);
}

// ========================================
// RENDERIZAR ANIMAIS
// ========================================

async function renderizarAnimais(animais) {
  const container = document.getElementById("animaisContainer");

  container.innerHTML = "";

  if (!animais || animais.length === 0) {
    container.innerHTML = `

      <div class="empty-state">

        <h3>
          Nenhum animal encontrado
        </h3>

        <p>
          Tente alterar os filtros
          ou sua busca.
        </p>

      </div>

    `;

    return;
  }

  /*
   * Mostra os cards imediatamente
   * utilizando a imagem padrão.
   *
   * Depois substituímos pela imagem
   * real quando ela for carregada.
   */

  animais.forEach((animal) => {
    const card = criarCardAnimal(animal);

    container.appendChild(card);
  });

  /*
   * Agora buscamos as fotos reais.
   */

  for (const animal of animais) {
    try {
      const foto = await obterFotoAnimal(animal.id);

      if (!foto) {
        continue;
      }

      const card = container.querySelector(`[data-animal-id="${animal.id}"]`);

      if (!card) {
        continue;
      }

      const imagem = card.querySelector(".photo img");

      if (imagem) {
        imagem.src = foto;
      }
    } catch (error) {
      console.error(`Erro ao carregar foto do animal ${animal.id}:`, error);

      /*
       * Se der erro, mantém a imagem padrão.
       */
    }
  }
}

// ========================================
// BUSCAR FOTO DO ANIMAL
// ========================================

async function obterFotoAnimal(animalId) {
  const fotos = await apiRequest(`/animais/${animalId}/fotos`);

  /*
   * Se não houver fotos,
   * usamos a imagem padrão.
   */

  if (!Array.isArray(fotos) || fotos.length === 0) {
    return FOTO_PADRAO;
  }

  /*
   * Utiliza a primeira foto cadastrada.
   */

  return fotos[0].url || FOTO_PADRAO;
}

// ========================================
// CRIAR CARD
// ========================================

function criarCardAnimal(animal) {
  const article = document.createElement("article");

  article.classList.add("card");

  /*
   * Guardamos o ID no próprio card.
   *
   * Isso permite encontrar o card
   * depois que a foto for carregada.
   */

  article.dataset.animalId = animal.id;

  const nome = animal.nome || "Animal sem nome";

  const raca = animal.raca || "Raça não informada";

  const especie = formatarEspecie(animal.especie);

  /*
   * Enquanto a foto real não chega,
   * utilizamos a imagem padrão.
   */

  const foto = obterFotoPadrao(animal.especie);

  article.innerHTML = `

    <div class="photo">

      <img
        src="${foto}"
        alt="${nome}"
      >

      <span class="badge ${animal.desaparecido ? "lost" : "reward"}">

        ${animal.desaparecido ? "⌕ Perdido" : "✓ Encontrado"}

      </span>

      <button
        type="button"
        class="heart"
        onclick="event.stopPropagation()"
      >
        ♡
      </button>

    </div>

    <div class="card-body">

      <div class="row">

        <h2>
          ${nome}
        </h2>

        <span class="time">
          PetFinder
        </span>

      </div>

      <p>
        ${raca} • ${especie}
      </p>

      <div class="location">

        <span>
          ⌖ Localização não informada
        </span>

      </div>

    </div>

  `;

  /*
   * Abre a tela de detalhes.
   */

  article.addEventListener("click", function () {
    window.location.href = `detalhes-pet.html?id=${animal.id}`;
  });

  return article;
}

// ========================================
// IMAGEM PADRÃO
// ========================================

function obterFotoPadrao(especie) {
  const tipo = normalizar(especie);

  if (tipo === "CANINO") {
    return "assets/bolinha.jpg";
  }

  if (tipo === "FELINO") {
    return "assets/luna.jpg";
  }

  return "assets/bolinha.jpg";
}

// ========================================
// FORMATAR ESPÉCIE
// ========================================

function formatarEspecie(especie) {
  const valor = normalizar(especie);

  switch (valor) {
    case "CANINO":
      return "Cão";

    case "FELINO":
      return "Gato";

    case "EQUINO":
      return "Cavalo";

    default:
      return especie || "Espécie não informada";
  }
}

// ========================================
// NORMALIZAÇÃO
// ========================================

function normalizar(valor) {
  return String(valor || "")
    .trim()
    .toUpperCase();
}

function normalizarTexto(valor) {
  return String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ========================================
// BUSCA
// ========================================

function configurarBusca() {
  const campoBusca = document.getElementById("campoBusca");

  if (!campoBusca) {
    return;
  }

  campoBusca.addEventListener("input", function () {
    textoBusca = campoBusca.value.trim();

    aplicarFiltros();
  });
}

// ========================================
// FILTROS
// ========================================

function configurarFiltros() {
  const botoes = document.querySelectorAll(".filters button");

  botoes.forEach((botao) => {
    botao.addEventListener("click", function () {
      botoes.forEach((b) => b.classList.remove("active"));

      botao.classList.add("active");

      filtroAtual = botao.dataset.filtro;

      aplicarFiltros();
    });
  });
}
