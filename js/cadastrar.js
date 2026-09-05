document.addEventListener("DOMContentLoaded", function () {
  /*
   * ============================================================
   * AUTENTICAÇÃO
   * ============================================================
   */

  if (!usuarioEstaLogado()) {
    window.location.href = "login.html";
    return;
  }

  /*
   * ============================================================
   * ELEMENTOS DO FORMULÁRIO
   * ============================================================
   */

  const form = document.getElementById("cadastroPetForm");

  const nome = document.getElementById("nome");

  const especie = document.getElementById("especie");

  const raca = document.getElementById("raca");

  const temperamento = document.getElementById("temperamento");

  const localizacao = document.getElementById("localizacao");

  const telefone = document.getElementById("telefone");

  const fotos = document.getElementById("fotos");

  const btnPublicar = document.getElementById("btnPublicar");

  const latitudeInput = document.getElementById("latitude");

  const longitudeInput = document.getElementById("longitude");

  const porteButtons = document.querySelectorAll("[data-porte]");

  /*
   * ============================================================
   * VARIÁVEIS
   * ============================================================
   */

  let porteSelecionado = null;

  let map = null;

  let marcador = null;

  /*
   * ============================================================
   * PORTE
   * ============================================================
   */

  porteButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      porteButtons.forEach(function (item) {
        item.classList.remove("selected");
      });

      button.classList.add("selected");

      porteSelecionado = button.dataset.porte;
    });
  });

  /*
   * ============================================================
   * TELEFONE / WHATSAPP
   * ============================================================
   */

  if (telefone) {
    telefone.addEventListener("input", function () {
      let valor = telefone.value.replace(/\D/g, "").slice(0, 11);

      if (valor.length > 6) {
        valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
      } else if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
      }

      telefone.value = valor;
    });
  }

  /*
   * ============================================================
   * FOTOS
   * ============================================================
   */

  if (fotos) {
    fotos.addEventListener("change", function () {
      const quantidade = fotos.files.length;

      const titulo = document.getElementById("fotoTitulo");

      const descricao = document.getElementById("fotoDescricao");

      if (quantidade === 0) {
        titulo.textContent = "Adicionar fotos";

        descricao.textContent = "Toque para selecionar";

        return;
      }

      titulo.textContent =
        quantidade === 1
          ? "1 foto selecionada"
          : `${quantidade} fotos selecionadas`;

      descricao.textContent = "Fotos selecionadas";
    });
  }

  /*
   * ============================================================
   * MAPA
   * ============================================================
   */

  const mapElement = document.getElementById("map");

  if (mapElement && typeof L !== "undefined") {
    /*
     * Coordenadas iniciais:
     * Goiânia - GO
     */

    const latitudeInicial = -16.6869;

    const longitudeInicial = -49.2648;

    /*
     * Cria o mapa.
     */

    map = L.map("map", {
      zoomControl: true,
      attributionControl: true,
    });

    /*
     * Centraliza inicialmente em Goiânia.
     */

    map.setView([latitudeInicial, longitudeInicial], 13);

    /*
     * OpenStreetMap
     */

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,

      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    /*
     * ========================================================
     * CORREÇÃO DO TAMANHO DO MAPA
     * ========================================================
     *
     * O Leaflet precisa saber o tamanho real do container.
     * Como o mapa está dentro de uma página responsiva,
     * recalculamos depois que a página termina de renderizar.
     */

    function corrigirTamanhoMapa() {
      if (!map) {
        return;
      }

      map.invalidateSize({
        pan: false,
        animate: false,
      });
    }

    /*
     * Executa algumas vezes para garantir que o
     * navegador já tenha terminado o layout.
     */

    setTimeout(corrigirTamanhoMapa, 100);

    setTimeout(corrigirTamanhoMapa, 300);

    setTimeout(corrigirTamanhoMapa, 600);

    /*
     * Corrige quando a janela muda de tamanho.
     */

    window.addEventListener("resize", corrigirTamanhoMapa);

    /*
     * Corrige quando a orientação do celular muda.
     */

    window.addEventListener("orientationchange", function () {
      setTimeout(corrigirTamanhoMapa, 200);
    });

    /*
     * ========================================================
     * CLIQUE NO MAPA
     * ========================================================
     */

    map.on("click", function (event) {
      const latitude = event.latlng.lat;

      const longitude = event.latlng.lng;

      console.log("Latitude:", latitude);

      console.log("Longitude:", longitude);

      /*
       * Remove marcador anterior.
       */

      if (marcador) {
        map.removeLayer(marcador);
      }

      /*
       * Cria novo marcador.
       */

      marcador = L.marker([latitude, longitude]).addTo(map);

      /*
       * Popup.
       */

      marcador.bindPopup("Localização onde o pet foi visto.").openPopup();

      /*
       * Preenche latitude.
       */

      latitudeInput.value = latitude.toFixed(7);

      /*
       * Preenche longitude.
       */

      longitudeInput.value = longitude.toFixed(7);
    });

    /*
     * ========================================================
     * GEOLOCALIZAÇÃO
     * ========================================================
     *
     * Tenta utilizar a localização atual do dispositivo
     * somente para centralizar o mapa.
     *
     * O usuário ainda precisa clicar no mapa para selecionar
     * efetivamente a localização do pet.
     */

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          const latitude = position.coords.latitude;

          const longitude = position.coords.longitude;

          map.setView([latitude, longitude], 15);

          setTimeout(corrigirTamanhoMapa, 150);
        },

        function () {
          console.log(
            "Localização atual não disponível. " +
              "O mapa continuará em Goiânia.",
          );
        },

        {
          enableHighAccuracy: true,

          timeout: 8000,

          maximumAge: 60000,
        },
      );
    }
  } else {
    console.error("Leaflet não foi carregado corretamente.");
  }

  /*
   * ============================================================
   * ENVIO DO FORMULÁRIO
   * ============================================================
   */

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
      /*
       * ==================================================
       * VALIDAÇÕES
       * ==================================================
       */

      if (!nome.value.trim()) {
        throw new Error("Informe o nome do pet.");
      }

      if (!especie.value) {
        throw new Error("Selecione a espécie do pet.");
      }

      if (!raca.value.trim()) {
        throw new Error("Informe a raça do pet.");
      }

      if (!porteSelecionado) {
        throw new Error("Selecione o porte do pet.");
      }

      if (!temperamento.value) {
        throw new Error("Selecione o temperamento do pet.");
      }

      if (!localizacao.value.trim()) {
        throw new Error("Informe a última localização.");
      }

      /*
       * Latitude e longitude são obrigatórias.
       */

      if (!latitudeInput.value || !longitudeInput.value) {
        throw new Error("Clique no mapa para marcar onde o pet foi visto.");
      }

      /*
       * ==================================================
       * USUÁRIO LOGADO
       * ==================================================
       */

      const usuarioId = obterUsuarioId();

      if (!usuarioId) {
        throw new Error(
          "Não foi possível identificar o usuário logado. " +
            "Faça login novamente.",
        );
      }

      const tutorId = Number(usuarioId);

      if (Number.isNaN(tutorId)) {
        throw new Error("ID do usuário inválido.");
      }

      /*
       * ==================================================
       * COORDENADAS
       * ==================================================
       */

      const latitude = Number(latitudeInput.value);

      const longitude = Number(longitudeInput.value);

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        throw new Error("Latitude ou longitude inválida.");
      }

      /*
       * ==================================================
       * OBJETO DO ANIMAL
       * ==================================================
       */

      const animal = {
        nome: nome.value.trim(),

        raca: raca.value.trim(),

        especie: especie.value,

        porte: porteSelecionado,

        temperamento: temperamento.value,

        tutorId: tutorId,

        desaparecido: true,

        latitude: latitude,

        longitude: longitude,

        descricaoLocalizacao: localizacao.value.trim(),
      };

      console.log("Animal que será enviado:", animal);

      /*
       * ==================================================
       * BOTÃO
       * ==================================================
       */

      btnPublicar.disabled = true;

      btnPublicar.textContent = "Publicando...";

      /*
       * ==================================================
       * POST
       * ==================================================
       */

      const animalCriado = await apiRequest("/animais", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(animal),
      });

      console.log("Animal criado com sucesso:", animalCriado);

      /*
       * ==================================================
       * SUCESSO
       * ==================================================
       */

      alert("Pet cadastrado com sucesso!");

      window.location.href = "explorar.html";
    } catch (error) {
      console.error("Erro ao cadastrar pet:", error);

      alert(error.message || "Erro ao cadastrar pet.");

      btnPublicar.disabled = false;

      btnPublicar.textContent = "📢  Publicar Anúncio";
    }
  });
});
