document.addEventListener("DOMContentLoaded", async function () {
  // Verifica autenticação

  if (!usuarioEstaLogado()) {
    window.location.href = "login.html";

    return;
  }

  // Obtém o ID da URL

  const params = new URLSearchParams(window.location.search);

  const animalId = params.get("id");

  // Verifica se existe ID

  if (!animalId) {
    alert("Animal não informado.");

    window.location.href = "explorar.html";

    return;
  }

  await carregarAnimal(animalId);
});

// ========================================
// CARREGAR ANIMAL
// ========================================

async function carregarAnimal(animalId) {
  try {
    const animal = await apiRequest(`/animais/${animalId}`);

    console.log("Animal recebido:", animal);

    preencherPagina(animal);
  } catch (error) {
    console.error("Erro ao carregar animal:", error);

    alert("Não foi possível carregar os dados do animal.");

    window.location.href = "explorar.html";
  }
}

// ========================================
// PREENCHER PÁGINA
// ========================================

function preencherPagina(animal) {
  /*
   * Nome
   */

  const nome = animal.nome || "Animal sem nome";

  document.getElementById("petNome").textContent = nome;

  /*
   * Raça
   */

  const raca = animal.raca || "Raça não informada";

  /*
   * Espécie
   */

  const especie = formatarEspecie(animal.especie);

  /*
   * Como ainda não temos sexo
   * na entidade Animal, não vamos
   * inventar essa informação.
   */

  document.getElementById("petDescricao").textContent =
    `🐾 ${raca}, ${especie}`;

  /*
   * Porte
   */

  document.getElementById("petPorte").textContent = formatarPorte(animal.porte);

  /*
   * Temperamento
   */

  document.getElementById("petTemperamento").textContent = formatarTemperamento(
    animal.temperamento,
  );

  /*
   * Status
   */

  const status = document.getElementById("petStatus");

  if (animal.desaparecido) {
    status.textContent = "⌖ Perdido";
  } else {
    status.textContent = "✓ Encontrado";
  }

  /*
   * Tutor
   *
   * Atualmente a API retorna
   * apenas tutorId.
   */

  const tutor = document.getElementById("petTutor");

  if (animal.tutorId) {
    tutor.textContent = `Tutor #${animal.tutorId}`;
  } else {
    tutor.textContent = "Tutor não informado";
  }

  /*
   * Localização
   *
   * Ainda não está presente
   * no JSON atual da API.
   */

  const localizacao = document.getElementById("petLocalizacao");

  localizacao.textContent = "Localização não informada";

  /*
   * Foto
   *
   * Ainda não temos fotos
   * retornadas pela API.
   *
   * Usamos uma imagem local
   * provisoriamente.
   */

  const foto = document.getElementById("petFoto");

  foto.src = obterFotoPadrao(animal.especie);

  foto.alt = `Foto de ${nome}`;
}

// ========================================
// ESPÉCIE
// ========================================

function formatarEspecie(especie) {
  switch (String(especie || "").toUpperCase()) {
    case "CANINO":
      return "Cão";

    case "FELINO":
      return "Gato";

    case "EQUINO":
      return "Cavalo";

    default:
      return "Espécie não informada";
  }
}

// ========================================
// PORTE
// ========================================

function formatarPorte(porte) {
  switch (String(porte || "").toUpperCase()) {
    case "PEQUENO":
      return "↗  Pequeno";

    case "MEDIO":
    case "MÉDIO":
      return "↗  Médio";

    case "GRANDE":
      return "↗  Grande";

    default:
      return "Não informado";
  }
}

// ========================================
// TEMPERAMENTO
// ========================================

function formatarTemperamento(temperamento) {
  switch (String(temperamento || "").toUpperCase()) {
    case "DOCIL":
    case "DÓCIL":
      return "Dócil";

    case "ASSUSTADO":
      return "Assustado";

    case "FEROZ":
      return "Feroz";

    default:
      return "Não informado";
  }
}

// ========================================
// FOTO PADRÃO
// ========================================

function obterFotoPadrao(especie) {
  switch (String(especie || "").toUpperCase()) {
    case "CANINO":
      return "assets/bolinha.jpg";

    case "FELINO":
      return "assets/luna.jpg";

    default:
      return "assets/bolinha.jpg";
  }
}

// ========================================
// COMPARTILHAR
// ========================================

const btnCompartilhar = document.getElementById("btnCompartilhar");

if (btnCompartilhar) {
  btnCompartilhar.addEventListener("click", async function () {
    try {
      await navigator.clipboard.writeText(window.location.href);

      alert("Link copiado!");
    } catch (error) {
      console.error("Erro ao copiar link:", error);

      alert("Não foi possível copiar o link.");
    }
  });
}
