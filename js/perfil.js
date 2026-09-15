document.addEventListener("DOMContentLoaded", async function () {
  // ========================================
  // VERIFICAR AUTENTICAÇÃO
  // ========================================

  if (!usuarioEstaLogado()) {
    window.location.href = "login.html";
    return;
  }

  // ========================================
  // CARREGAR DADOS DO USUÁRIO
  // ========================================

  await carregarPerfil();

  // ========================================
  // CONFIGURAR BOTÕES
  // ========================================

  configurarLogout();
  configurarEditar();
  configurarMeusPets();
});

// ========================================
// CARREGAR PERFIL
// ========================================

async function carregarPerfil() {
  try {
    console.log("TOKEN:", obterToken());

    const usuario = await apiRequest("/usuarios/me");

    console.log("Usuário autenticado:", usuario);

    preencherPerfil(usuario);
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);

    preencherPerfilLocal();
  }
}

// ========================================
// PREENCHER PERFIL
// ========================================

function preencherPerfil(usuario) {
  const nome = usuario.nome || "Usuário";

  const email = usuario.email || "E-mail não informado";

  const telefone = formatarTelefone(usuario.telefone);

  // ========================================
  // CABEÇALHO
  // ========================================

  const usuarioNome = document.getElementById("usuarioNome");

  const usuarioEmail = document.getElementById("usuarioEmail");

  if (usuarioNome) {
    usuarioNome.textContent = nome;
  }

  if (usuarioEmail) {
    usuarioEmail.textContent = email;
  }

  // ========================================
  // DADOS DO USUÁRIO
  // ========================================

  const campoNome = document.getElementById("campoNome");

  const campoEmail = document.getElementById("campoEmail");

  const campoTelefone = document.getElementById("campoTelefone");

  if (campoNome) {
    campoNome.textContent = nome;
  }

  if (campoEmail) {
    campoEmail.textContent = email;
  }

  if (campoTelefone) {
    campoTelefone.textContent = telefone;
  }
}

// ========================================
// PREENCHER PERFIL LOCAL
// ========================================

function preencherPerfilLocal() {
  const nome =
    typeof obterNomeUsuario === "function" ? obterNomeUsuario() : null;

  const email =
    typeof obterEmailUsuario === "function" ? obterEmailUsuario() : null;

  const campoNome = document.getElementById("campoNome");

  const campoEmail = document.getElementById("campoEmail");

  const campoTelefone = document.getElementById("campoTelefone");

  const usuarioNome = document.getElementById("usuarioNome");

  const usuarioEmail = document.getElementById("usuarioEmail");

  const nomeFinal = nome || "Usuário";

  const emailFinal = email || "E-mail não informado";

  // ========================================
  // CABEÇALHO
  // ========================================

  if (usuarioNome) {
    usuarioNome.textContent = nomeFinal;
  }

  if (usuarioEmail) {
    usuarioEmail.textContent = emailFinal;
  }

  // ========================================
  // DADOS
  // ========================================

  if (campoNome) {
    campoNome.textContent = nomeFinal;
  }

  if (campoEmail) {
    campoEmail.textContent = emailFinal;
  }

  if (campoTelefone) {
    campoTelefone.textContent = "Não informado";
  }
}

// ========================================
// FORMATAR TELEFONE
// ========================================

function formatarTelefone(telefone) {
  if (!telefone) {
    return "Não informado";
  }

  const numero = String(telefone).replace(/\D/g, "");

  // Celular brasileiro
  // (62) 99999-9999

  if (numero.length === 11) {
    return numero.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  // Telefone fixo
  // (62) 9999-9999

  if (numero.length === 10) {
    return numero.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }

  /*
   * Caso o telefone já esteja formatado
   * ou tenha outro padrão, mantém
   * o valor original.
   */

  return telefone;
}

// ========================================
// LOGOUT
// ========================================

function configurarLogout() {
  const btnSair = document.getElementById("btnSair");

  if (!btnSair) {
    return;
  }

  btnSair.addEventListener("click", realizarLogout);
}

// ========================================
// REALIZAR LOGOUT
// ========================================

function realizarLogout() {
  const confirmar = confirm("Deseja realmente sair da sua conta?");

  if (!confirmar) {
    return;
  }

  /*
   * Remove token e dados da sessão.
   */

  logout();

  /*
   * Volta para o login.
   */

  window.location.href = "login.html";
}

// ========================================
// EDITAR PERFIL
// ========================================

function configurarEditar() {
  const btnEditar = document.getElementById("btnEditar");

  if (!btnEditar) {
    return;
  }

  btnEditar.addEventListener("click", function () {
    window.location.href = "editar-perfil.html";
  });
}

// ========================================
// MEUS PETS
// ========================================

function configurarMeusPets() {
  const btnMeusPets = document.getElementById("btnMeusPets");

  /*
   * Seu HTML atual ainda não possui
   * esse botão.
   *
   * Por isso fazemos a verificação
   * antes de adicionar o evento.
   */

  if (!btnMeusPets) {
    return;
  }

  btnMeusPets.addEventListener("click", function () {
    window.location.href = "meus-pets.html";
  });
}
