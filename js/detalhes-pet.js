let mapa = null;
let marcador = null;
let telefoneTutor = null;

document.addEventListener("DOMContentLoaded", async function () {
  if (!usuarioEstaLogado()) {
    window.location.href = "login.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);

  const animalId = params.get("id");

  if (!animalId) {
    alert("Animal não informado.");
    window.location.href = "explorar.html";
    return;
  }

  configurarCompartilhamento();
  configurarContato();
  configurarEdicao();

  await carregarAnimal(animalId);
});

/* =========================================================
   CARREGAR ANIMAL
========================================================= */

async function carregarAnimal(animalId) {
  try {
    const animal = await apiRequest(`/animais/${animalId}`);

    console.log("Animal recebido:", animal);

    preencherPagina(animal);

    await Promise.all([carregarFotos(animalId), carregarLocalizacao(animalId)]);
  } catch (error) {
    console.error("Erro ao carregar animal:", error);

    alert("Não foi possível carregar os dados do animal.");

    window.location.href = "explorar.html";
  }
}

/* =========================================================
   FOTO
========================================================= */

async function carregarFotos(animalId) {
  const foto = document.getElementById("petFoto");

  try {
    const fotos = await apiRequest(`/animais/${animalId}/fotos`);

    console.log("Fotos recebidas:", fotos);

    if (!Array.isArray(fotos) || fotos.length === 0) {
      return;
    }

    const primeiraFoto = fotos.find((item) => item && item.url);

    if (!primeiraFoto) {
      return;
    }

    foto.src = primeiraFoto.url;
  } catch (error) {
    console.error("Erro ao carregar fotos:", error);
  }
}

/* =========================================================
   LOCALIZAÇÃO
========================================================= */

async function carregarLocalizacao(animalId) {
  const elementoLocalizacao = document.getElementById("petLocalizacao");

  try {
    const localizacao = await apiRequest(
      `/animais/${animalId}/localizacoes/ultima`,
    );

    console.log("Última localização:", localizacao);

    if (!localizacao) {
      elementoLocalizacao.textContent = "Localização não informada";

      mostrarMapaIndisponivel();

      return;
    }

    const latitude = Number(localizacao.latitude);

    const longitude = Number(localizacao.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      elementoLocalizacao.textContent = "Localização não informada";

      mostrarMapaIndisponivel();

      return;
    }

    elementoLocalizacao.textContent =
      localizacao.descricao ||
      `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    inicializarMapa(latitude, longitude);
  } catch (error) {
    console.error("Erro ao carregar localização:", error);

    elementoLocalizacao.textContent = "Localização não informada";

    mostrarMapaIndisponivel();
  }
}

/* =========================================================
   MAPA
========================================================= */

function inicializarMapa(latitude, longitude) {
  const elementoMapa = document.getElementById("petMapa");

  if (!elementoMapa) {
    return;
  }

  if (mapa) {
    mapa.remove();

    mapa = null;
    marcador = null;
  }

  mapa = L.map("petMapa", {
    zoomControl: true,
    scrollWheelZoom: false,
  }).setView([latitude, longitude], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(mapa);

  marcador = L.marker([latitude, longitude]).addTo(mapa);

  marcador.bindPopup("Última localização registrada");

  setTimeout(() => {
    mapa.invalidateSize();
  }, 100);
}

function mostrarMapaIndisponivel() {
  const elementoMapa = document.getElementById("petMapa");

  if (!elementoMapa) {
    return;
  }

  elementoMapa.innerHTML = `
        <div class="map-empty">
            <span>⌖</span>
            <p>Localização não informada</p>
        </div>
    `;
}

/* =========================================================
   PREENCHER PÁGINA
========================================================= */

function preencherPagina(animal) {
  const nome = animal.nome || "Animal sem nome";

  document.getElementById("petNome").textContent = nome;

  const raca = animal.raca || "Raça não informada";

  const especie = formatarEspecie(animal.especie);

  document.getElementById("petDescricao").textContent =
    `🐾 ${raca}, ${especie}`;

  document.getElementById("petPorte").textContent = formatarPorte(animal.porte);

  document.getElementById("petTemperamento").textContent = formatarTemperamento(
    animal.temperamento,
  );

  /* =====================================================
       STATUS
    ===================================================== */

  const status = document.getElementById("petStatus");

  if (animal.desaparecido) {
    status.textContent = "⌖ Perdido";
  } else {
    status.textContent = "✓ Encontrado";
  }

  /* =====================================================
       TUTOR
    ===================================================== */

  const tutor = document.getElementById("petTutor");

  if (animal.tutor && animal.tutor.nome) {
    tutor.textContent = animal.tutor.nome;

    telefoneTutor = animal.tutor.telefone || null;
  } else {
    tutor.textContent = "Tutor não informado";

    telefoneTutor = null;
  }

  /* =====================================================
       FOTO PADRÃO
    ===================================================== */

  const foto = document.getElementById("petFoto");

  foto.src = obterFotoPadrao(animal.especie);

  foto.alt = `Foto de ${nome}`;

  configurarBotaoEdicao(animal);
}

/* =========================================================
   FORMATAÇÃO DA ESPÉCIE
========================================================= */

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

/* =========================================================
   FORMATAÇÃO DO PORTE
========================================================= */

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

/* =========================================================
   FORMATAÇÃO DO TEMPERAMENTO
========================================================= */

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

/* =========================================================
   FOTO PADRÃO
========================================================= */

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

/* =========================================================
   COMPARTILHAR
========================================================= */

function configurarCompartilhamento() {
  const btnCompartilhar = document.getElementById("btnCompartilhar");

  if (!btnCompartilhar) {
    return;
  }

  btnCompartilhar.addEventListener("click", async function () {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "PetFinder - Detalhes do Pet",
          text: "Confira este pet no PetFinder.",
          url: window.location.href,
        });

        return;
      }

      await navigator.clipboard.writeText(window.location.href);

      alert("Link copiado!");
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  });
}

/* =========================================================
   CONTATO / WHATSAPP
========================================================= */

function configurarContato() {
  const btnContato = document.getElementById("btnContato");

  if (!btnContato) {
    return;
  }

  btnContato.addEventListener("click", function (event) {
    event.preventDefault();

    if (!telefoneTutor) {
      alert("O tutor não possui um telefone cadastrado.");

      return;
    }

    const telefone = String(telefoneTutor).replace(/\D/g, "");

    if (!telefone) {
      alert("O telefone do tutor é inválido.");

      return;
    }

    const mensagem = encodeURIComponent(
      "Olá! Encontrei seu anúncio no PetFinder e gostaria de falar sobre o seu pet.",
    );

    const url = `https://wa.me/55${telefone}?text=${mensagem}`;

    window.open(url, "_blank");
  });
}

/* =========================================================
   EDIÇÃO DO PET
========================================================= */

function configurarBotaoEdicao(animal) {
  const btnEditar = document.getElementById("btnEditar");

  console.log("ANIMAL:", animal);
  console.log("PODE EDITAR:", animal.podeEditar);
  console.log("BOTÃO:", btnEditar);

  if (!btnEditar) {
    return;
  }

  btnEditar.style.display = "none";

  if (animal.podeEditar === true) {
    btnEditar.style.display = "flex";
  }
}

function configurarEdicao() {
  const btnEditar = document.getElementById("btnEditar");

  if (!btnEditar) {
    return;
  }

  btnEditar.addEventListener("click", function () {
    const params = new URLSearchParams(window.location.search);
    const animalId = params.get("id");

    if (!animalId) {
      alert("Animal não informado.");
      return;
    }

    window.location.href = `editar-pet.html?id=${animalId}`;
  });
}
