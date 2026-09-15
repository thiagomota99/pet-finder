document.addEventListener("DOMContentLoaded", async function () {
  // ========================================
  // AUTENTICAÇÃO
  // ========================================

  if (!usuarioEstaLogado()) {
    window.location.href = "login.html";

    return;
  }

  // ========================================
  // CONFIGURAR BOTÃO
  // ========================================

  configurarCadastrar();

  // ========================================
  // CARREGAR PETS
  // ========================================

  await carregarMeusPets();
});

// ========================================
// CARREGAR MEUS PETS
// ========================================

async function carregarMeusPets() {
  const container = document.getElementById("animaisContainer");

  try {
    const animais = await apiRequest("/animais/meus");

    console.log("Meus pets:", animais);

    if (!animais || animais.length === 0) {
      mostrarEstadoVazio(container);

      return;
    }

    container.innerHTML = "";

    /*
     * Carrega os cards.
     */

    for (const animal of animais) {
      const foto = await buscarPrimeiraFoto(animal.id);

      const card = criarCardAnimal(animal, foto);

      container.appendChild(card);
    }
  } catch (error) {
    console.error("Erro ao carregar meus pets:", error);

    container.innerHTML = `
            <div class="error-state">

                <span>⚠️</span>

                <p>
                    Não foi possível carregar
                    seus pets.
                </p>

            </div>
        `;
  }
}

// ========================================
// BUSCAR PRIMEIRA FOTO
// ========================================

async function buscarPrimeiraFoto(animalId) {
  try {
    const fotos = await apiRequest(`/animais/${animalId}/fotos`);

    if (fotos && fotos.length > 0) {
      return fotos[0].url;
    }

    return null;
  } catch (error) {
    console.error(`Erro ao buscar foto do animal ${animalId}:`, error);

    return null;
  }
}

// ========================================
// CRIAR CARD
// ========================================

function criarCardAnimal(animal, foto) {
  const card = document.createElement("article");

  card.className = "pet-card";

  card.addEventListener("click", function () {
    window.location.href = `detalhes-pet.html?id=${animal.id}`;
  });

  const imagem = foto
    ? `
                <img
                    src="${foto}"
                    alt="Foto de ${escaparHTML(animal.nome)}"
                    class="pet-image"
                >
              `
    : `
                <div class="pet-image-placeholder">

                    <span>
                        🐾
                    </span>

                    <p>
                        Sem foto cadastrada
                    </p>

                </div>
              `;

  const status = animal.desaparecido ? "Desaparecido" : "Encontrado";

  const especie = formatarEspecie(animal.especie);

  const porte = formatarPorte(animal.porte);

  const temperamento = formatarTemperamento(animal.temperamento);

  card.innerHTML = `

        <div class="pet-image-container">

            ${imagem}

            <span class="pet-status">
                ${status}
            </span>

        </div>


        <div class="pet-info">

            <div class="pet-name-row">

                <h3 class="pet-name">
                    ${escaparHTML(animal.nome)}
                </h3>

                <span class="pet-arrow">
                    ›
                </span>

            </div>


            <p class="pet-breed">
                ${escaparHTML(animal.raca || "Raça não informada")}
            </p>


            <div class="pet-details">

                <span class="pet-tag">
                    ${especie}
                </span>

                <span class="pet-tag">
                    ${porte}
                </span>

                <span class="pet-tag">
                    ${temperamento}
                </span>

            </div>

        </div>

    `;

  return card;
}

// ========================================
// ESTADO VAZIO
// ========================================

function mostrarEstadoVazio(container) {
  container.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                🐾
            </div>

            <h3>
                Você ainda não possui pets cadastrados
            </h3>

            <p>
                Cadastre um animal para começar
                a ajudar na busca e localização.
            </p>

        </div>

    `;
}

// ========================================
// BOTÃO CADASTRAR
// ========================================

function configurarCadastrar() {
  const botao = document.getElementById("btnCadastrarPet");

  if (!botao) {
    return;
  }

  botao.addEventListener("click", function () {
    window.location.href = "cadastrar.html";
  });
}

// ========================================
// FORMATAÇÕES
// ========================================

function formatarEspecie(especie) {
  const especies = {
    CANINO: "Cão",

    FELINO: "Gato",

    EQUINO: "Cavalo",
  };

  return especies[especie] || especie || "Espécie";
}

function formatarPorte(porte) {
  const portes = {
    PEQUENO: "Pequeno",

    MEDIO: "Médio",

    GRANDE: "Grande",
  };

  return portes[porte] || porte || "Porte";
}

function formatarTemperamento(temperamento) {
  const temperamentos = {
    DOCIL: "Dócil",

    ASSUSTADO: "Assustado",

    FEROZ: "Feroz",
  };

  return temperamentos[temperamento] || temperamento || "Temperamento";
}

// ========================================
// SEGURANÇA HTML
// ========================================

function escaparHTML(valor) {
  if (valor === null || valor === undefined) {
    return "";
  }

  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
