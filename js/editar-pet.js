document.addEventListener("DOMContentLoaded", async function () {
  if (!usuarioEstaLogado()) {
    window.location.href = "login.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const animalId = params.get("id");

  if (!animalId) {
    alert("Pet não informado.");
    window.location.href = "explorar.html";
    return;
  }

  const form = document.getElementById("editarPetForm");

  const nome = document.getElementById("nome");
  const especie = document.getElementById("especie");
  const raca = document.getElementById("raca");
  const temperamento = document.getElementById("temperamento");
  const desaparecido = document.getElementById("desaparecido");
  const localizacao = document.getElementById("localizacao");
  const telefone = document.getElementById("telefone");
  const fotos = document.getElementById("fotos");
  const fotosAtuais = document.getElementById("fotosAtuais");

  const btnSalvar = document.getElementById("btnSalvar");
  const btnCancelar = document.getElementById("btnCancelar");
  const btnAlterarStatus = document.getElementById("btnAlterarStatus");
  const btnInativar = document.getElementById("btnInativar");

  const latitudeInput = document.getElementById("latitude");
  const longitudeInput = document.getElementById("longitude");

  const porteButtons = document.querySelectorAll("[data-porte]");

  let porteSelecionado = null;
  let map = null;
  let marcador = null;

  /*
   * Estado do anúncio.
   *
   * IMPORTANTE:
   * Essa variável precisa existir antes
   * de carregarPet().
   */
  let petAtivo = true;

  /*
   * =========================================================
   * PORTE
   * =========================================================
   */

  porteButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (isPetInativo()) {
        return;
      }

      porteButtons.forEach(function (item) {
        item.classList.remove("selected");
      });

      button.classList.add("selected");

      porteSelecionado = button.dataset.porte;
    });
  });

  /*
   * =========================================================
   * TELEFONE
   * =========================================================
   */

  if (telefone) {
    telefone.addEventListener("input", function () {
      if (isPetInativo()) {
        return;
      }

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
   * =========================================================
   * FOTOS SELECIONADAS
   * =========================================================
   */

  if (fotos) {
    fotos.addEventListener("change", function () {
      if (isPetInativo()) {
        return;
      }

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

      descricao.textContent = "Novas fotos serão adicionadas";
    });
  }

  /*
   * =========================================================
   * CARREGAR PET
   * =========================================================
   */

  await carregarPet();

  async function carregarPet() {
    try {
      const animal = await apiRequest(`/animais/${animalId}`);

      console.log("Pet para edição:", animal);

      /*
       * Verifica se o usuário é o tutor.
       */

      if (animal.podeEditar !== true) {
        alert("Você não possui permissão para editar este pet.");

        window.location.href = `detalhes-pet.html?id=${animalId}`;

        return;
      }

      /*
       * Guarda o estado real do anúncio.
       */

      petAtivo = animal.ativo !== false;

      /*
       * Preenche os campos.
       */

      preencherDadosPet(animal);

      /*
       * Configura os botões conforme
       * o estado do pet.
       */

      configurarBotoesStatus(animal);

      /*
       * Carrega fotos e localização.
       */

      await carregarFotos();

      await carregarLocalizacao();

      /*
       * Se o anúncio estiver inativo,
       * bloqueia a edição.
       */

      if (!petAtivo) {
        bloquearEdicaoPet();
      }
    } catch (error) {
      console.error("Erro ao carregar pet:", error);

      alert(error.message || "Não foi possível carregar os dados do pet.");

      window.location.href = "explorar.html";
    }
  }

  /*
   * =========================================================
   * PREENCHER DADOS
   * =========================================================
   */

  function preencherDadosPet(animal) {
    petAtivo = animal.ativo !== false;

    nome.value = animal.nome || "";

    especie.value = animal.especie || "";

    raca.value = animal.raca || "";

    temperamento.value = animal.temperamento || "";

    desaparecido.value = String(animal.desaparecido);

    porteSelecionado = animal.porte || null;

    porteButtons.forEach(function (button) {
      button.classList.remove("selected");

      if (button.dataset.porte === animal.porte) {
        button.classList.add("selected");
      }
    });

    if (animal.tutor && animal.tutor.telefone) {
      telefone.value = formatarTelefone(animal.tutor.telefone);
    }
  }

  /*
   * =========================================================
   * VERIFICAR SE PET ESTÁ INATIVO
   * =========================================================
   */

  function isPetInativo() {
    return petAtivo === false;
  }

  /*
   * =========================================================
   * BLOQUEAR PET INATIVO
   * =========================================================
   */

  function bloquearEdicaoPet() {
    const campos = form.querySelectorAll("input, select, button");

    campos.forEach(function (campo) {
      if (campo.id !== "btnCancelar") {
        campo.disabled = true;
      }
    });

    if (btnAlterarStatus) {
      btnAlterarStatus.textContent = "⚪ Anúncio inativo";
    }

    if (btnInativar) {
      btnInativar.textContent = "⚪ Anúncio já inativado";
    }
  }

  /*
   * =========================================================
   * FOTOS ATUAIS
   * =========================================================
   */

  async function carregarFotos() {
    if (!fotosAtuais) {
      return;
    }

    try {
      const lista = await apiRequest(`/animais/${animalId}/fotos`);

      fotosAtuais.innerHTML = "";

      if (!Array.isArray(lista) || lista.length === 0) {
        fotosAtuais.innerHTML = `
          <p class="fotos-vazio">
            Nenhuma foto cadastrada.
          </p>
        `;

        return;
      }

      lista.forEach(function (foto) {
        if (!foto || !foto.url) {
          return;
        }

        const container = document.createElement("div");

        container.className = "foto-atual";

        const imagem = document.createElement("img");

        imagem.src = foto.url;

        imagem.alt = "Foto do pet";

        const botaoExcluir = document.createElement("button");

        botaoExcluir.type = "button";

        botaoExcluir.className = "btn-excluir-foto";

        botaoExcluir.textContent = "🗑️";

        if (isPetInativo()) {
          botaoExcluir.disabled = true;
        } else {
          botaoExcluir.addEventListener("click", function () {
            excluirFoto(foto.id, botaoExcluir, container);
          });
        }

        container.appendChild(imagem);

        container.appendChild(botaoExcluir);

        fotosAtuais.appendChild(container);
      });
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);

      fotosAtuais.innerHTML = `
        <p class="fotos-vazio">
          Não foi possível carregar as fotos.
        </p>
      `;
    }
  }

  /*
   * =========================================================
   * EXCLUIR FOTO
   * =========================================================
   */

  async function excluirFoto(fotoId, botao, container) {
    if (isPetInativo()) {
      return;
    }

    const confirmou = confirm("Tem certeza que deseja excluir esta foto?");

    if (!confirmou) {
      return;
    }

    try {
      botao.disabled = true;

      botao.textContent = "⏳";

      await apiRequest(`/animais/${animalId}/fotos/${fotoId}`, {
        method: "DELETE",
      });

      container.remove();

      if (fotosAtuais && fotosAtuais.children.length === 0) {
        fotosAtuais.innerHTML = `
          <p class="fotos-vazio">
            Nenhuma foto cadastrada.
          </p>
        `;
      }
    } catch (error) {
      console.error("Erro ao excluir foto:", error);

      alert(error.message || "Não foi possível excluir a foto.");

      botao.disabled = false;

      botao.textContent = "🗑️";
    }
  }

  /*
   * =========================================================
   * LOCALIZAÇÃO
   * =========================================================
   */

  async function carregarLocalizacao() {
    try {
      const local = await apiRequest(
        `/animais/${animalId}/localizacoes/ultima`,
      );

      if (!local) {
        inicializarMapa();

        return;
      }

      localizacao.value = local.descricao || "";

      const latitude = Number(local.latitude);

      const longitude = Number(local.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        inicializarMapa();

        return;
      }

      latitudeInput.value = latitude.toFixed(7);

      longitudeInput.value = longitude.toFixed(7);

      inicializarMapa(latitude, longitude);
    } catch (error) {
      console.error("Erro ao carregar localização:", error);

      inicializarMapa();
    }
  }

  /*
   * =========================================================
   * MAPA
   * =========================================================
   */

  function inicializarMapa(latitude = -16.6869, longitude = -49.2648) {
    const mapElement = document.getElementById("map");

    if (!mapElement || typeof L === "undefined") {
      console.error("Leaflet não foi carregado.");

      return;
    }

    map = L.map("map", {
      zoomControl: true,
      attributionControl: true,
    });

    map.setView([latitude, longitude], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    if (latitudeInput.value && longitudeInput.value) {
      marcador = L.marker([latitude, longitude]).addTo(map);

      marcador.bindPopup("Localização atual do pet.");
    }

    /*
     * Pet inativo não pode alterar
     * a localização.
     */

    if (isPetInativo()) {
      return;
    }

    map.on("click", function (event) {
      const novaLatitude = event.latlng.lat;

      const novaLongitude = event.latlng.lng;

      if (marcador) {
        map.removeLayer(marcador);
      }

      marcador = L.marker([novaLatitude, novaLongitude]).addTo(map);

      marcador.bindPopup("Nova localização do pet.").openPopup();

      latitudeInput.value = novaLatitude.toFixed(7);

      longitudeInput.value = novaLongitude.toFixed(7);
    });

    function corrigirTamanhoMapa() {
      if (map) {
        map.invalidateSize({
          pan: false,
          animate: false,
        });
      }
    }

    setTimeout(corrigirTamanhoMapa, 100);

    setTimeout(corrigirTamanhoMapa, 300);

    setTimeout(corrigirTamanhoMapa, 600);

    window.addEventListener("resize", corrigirTamanhoMapa);
  }

  /*
   * =========================================================
   * CONFIGURAR BOTÕES DE STATUS
   * =========================================================
   */

  function configurarBotoesStatus(animal) {
    if (!btnAlterarStatus || !btnInativar) {
      return;
    }

    /*
     * ANÚNCIO INATIVO
     *
     * Não existe reativação.
     */

    if (animal.ativo === false) {
      btnAlterarStatus.disabled = true;

      btnInativar.disabled = true;

      btnAlterarStatus.textContent = "⚪ Anúncio inativo";

      btnInativar.textContent = "⚪ Anúncio já inativado";

      return;
    }

    /*
     * PET PERDIDO
     */

    if (animal.desaparecido === true) {
      btnAlterarStatus.textContent = "🟢  Marcar como encontrado";
    } else {
      /*
       * PET ENCONTRADO
       */

      btnAlterarStatus.textContent = "🔴  Marcar como perdido";
    }

    btnAlterarStatus.disabled = false;

    btnInativar.disabled = false;
  }

  /*
   * =========================================================
   * ALTERAR STATUS
   * =========================================================
   */

  async function alterarStatus() {
    if (isPetInativo()) {
      return;
    }

    const estaDesaparecido = desaparecido.value === "true";

    const novoStatus = !estaDesaparecido;

    const mensagem = novoStatus
      ? "Deseja marcar este pet como perdido novamente?"
      : "Deseja marcar este pet como encontrado?";

    if (!confirm(mensagem)) {
      return;
    }

    try {
      btnAlterarStatus.disabled = true;

      btnAlterarStatus.textContent = "Atualizando...";

      const endpoint = novoStatus
        ? `/animais/${animalId}/perdido`
        : `/animais/${animalId}/encontrado`;

      const animalAtualizado = await apiRequest(endpoint, {
        method: "PUT",
      });

      desaparecido.value = String(animalAtualizado.desaparecido);

      petAtivo = animalAtualizado.ativo !== false;

      configurarBotoesStatus(animalAtualizado);

      alert(
        animalAtualizado.desaparecido
          ? "Pet marcado como perdido."
          : "Pet marcado como encontrado.",
      );
    } catch (error) {
      console.error("Erro ao alterar status do pet:", error);

      alert(error.message || "Não foi possível alterar o status do pet.");

      configurarBotoesStatus({
        desaparecido: estaDesaparecido,

        ativo: petAtivo,
      });
    }
  }

  /*
   * =========================================================
   * INATIVAR PET
   * =========================================================
   */

  async function inativarPet() {
    if (isPetInativo()) {
      return;
    }

    const confirmou = confirm(
      "Tem certeza que deseja inativar este anúncio?\n\n" +
        "O pet não será excluído, mas o anúncio deixará de aparecer no Explorar.\n\n" +
        "As fotos cadastradas também serão excluídas permanentemente.\n\n" +
        "Essa ação não poderá ser desfeita.",
    );

    if (!confirmou) {
      return;
    }

    try {
      btnInativar.disabled = true;

      btnAlterarStatus.disabled = true;

      btnSalvar.disabled = true;

      btnInativar.textContent = "Inativando...";

      await apiRequest(`/animais/${animalId}/inativar`, {
        method: "PUT",
      });

      petAtivo = false;

      alert("Anúncio inativado com sucesso!");

      window.location.href = "perfil.html";
    } catch (error) {
      console.error("Erro ao inativar anúncio:", error);

      alert(error.message || "Não foi possível inativar o anúncio.");

      btnInativar.disabled = false;

      btnAlterarStatus.disabled = false;

      btnSalvar.disabled = false;

      configurarBotoesStatus({
        desaparecido: desaparecido.value === "true",

        ativo: true,
      });
    }
  }

  /*
   * =========================================================
   * SALVAR ALTERAÇÕES
   * =========================================================
   */

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (isPetInativo()) {
      alert("Este anúncio está inativo e não pode mais ser alterado.");

      return;
    }

    try {
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

      if (!latitudeInput.value || !longitudeInput.value) {
        throw new Error("Informe a localização do pet no mapa.");
      }

      const animalAtualizado = {
        nome: nome.value.trim(),

        raca: raca.value.trim(),

        especie: especie.value,

        porte: porteSelecionado,

        temperamento: temperamento.value,

        desaparecido: desaparecido.value === "true",

        latitude: Number(latitudeInput.value),

        longitude: Number(longitudeInput.value),

        descricaoLocalizacao: localizacao.value.trim(),
      };

      console.log("Animal que será atualizado:", animalAtualizado);

      btnSalvar.disabled = true;

      btnSalvar.textContent = "Salvando...";

      await apiRequest(`/animais/${animalId}`, {
        method: "PUT",
        body: JSON.stringify(animalAtualizado),
      });

      const arquivos = fotos.files;

      if (arquivos && arquivos.length > 0) {
        await enviarFotos(animalId, arquivos);
      }

      alert("Pet atualizado com sucesso!");

      window.location.href = `detalhes-pet.html?id=${animalId}`;
    } catch (error) {
      console.error("Erro ao atualizar pet:", error);

      alert(error.message || "Erro ao atualizar pet.");

      btnSalvar.disabled = false;

      btnSalvar.textContent = "💾  Salvar alterações";
    }
  });

  /*
   * =========================================================
   * ENVIAR NOVAS FOTOS
   * =========================================================
   */

  async function enviarFotos(animalId, arquivos) {
    const limiteFotos = 5;

    const fotosExistentes = await apiRequest(`/animais/${animalId}/fotos`);

    const quantidadeExistente = Array.isArray(fotosExistentes)
      ? fotosExistentes.length
      : 0;

    const quantidadeDisponivel = limiteFotos - quantidadeExistente;

    if (quantidadeDisponivel <= 0) {
      throw new Error("O animal já possui o máximo de 5 fotos.");
    }

    const fotosSelecionadas = Array.from(arquivos).slice(
      0,
      quantidadeDisponivel,
    );

    for (const arquivo of fotosSelecionadas) {
      console.log(`Enviando foto: ${arquivo.name}`);

      const imagemComprimida = await comprimirImagem(arquivo);

      const formData = new FormData();

      formData.append("arquivo", imagemComprimida, `${Date.now()}.webp`);

      await apiRequest(`/animais/${animalId}/fotos`, {
        method: "POST",
        body: formData,
      });
    }
  }

  /*
   * =========================================================
   * COMPRIMIR IMAGEM
   * =========================================================
   */

  async function comprimirImagem(file) {
    const bitmap = await createImageBitmap(file);

    const tamanhoMaximo = 1280;

    let largura = bitmap.width;

    let altura = bitmap.height;

    if (largura > tamanhoMaximo || altura > tamanhoMaximo) {
      if (largura > altura) {
        altura = Math.round((altura * tamanhoMaximo) / largura);

        largura = tamanhoMaximo;
      } else {
        largura = Math.round((largura * tamanhoMaximo) / altura);

        altura = tamanhoMaximo;
      }
    }

    const canvas = document.createElement("canvas");

    canvas.width = largura;

    canvas.height = altura;

    const contexto = canvas.getContext("2d");

    contexto.drawImage(bitmap, 0, 0, largura, altura);

    return new Promise(function (resolve, reject) {
      canvas.toBlob(
        function (blob) {
          if (!blob) {
            reject(new Error("Não foi possível processar a imagem."));

            return;
          }

          resolve(blob);
        },
        "image/webp",
        0.75,
      );
    });
  }

  /*
   * =========================================================
   * FORMATAR TELEFONE
   * =========================================================
   */

  function formatarTelefone(valor) {
    const numeros = String(valor).replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 2) {
      return numeros;
    }

    if (numeros.length <= 6) {
      return numeros.replace(/^(\d{2})(\d+)/, "($1) $2");
    }

    return numeros.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
  }

  /*
   * =========================================================
   * EVENTOS DOS BOTÕES
   * =========================================================
   */

  if (btnAlterarStatus) {
    btnAlterarStatus.addEventListener("click", alterarStatus);
  }

  if (btnInativar) {
    btnInativar.addEventListener("click", inativarPet);
  }

  if (btnCancelar) {
    btnCancelar.addEventListener("click", function () {
      window.location.href = `detalhes-pet.html?id=${animalId}`;
    });
  }
});
