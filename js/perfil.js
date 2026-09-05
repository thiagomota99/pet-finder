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
});

// ========================================
// CARREGAR PERFIL
// ========================================

async function carregarPerfil() {
  try {
    /*
     * Busca o usuário autenticado.
     *
     * Endpoint esperado:
     *
     * GET /usuarios/me
     *
     * Se sua API estiver utilizando /api,
     * o apiRequest() deve cuidar do prefixo.
     */

    const usuario = await apiRequest("/usuarios/me");

    console.log("Usuário autenticado:", usuario);

    preencherPerfil(usuario);
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);

    /*
     * Caso o endpoint /usuarios/me ainda
     * não esteja implementado no backend,
     * tentamos utilizar os dados armazenados
     * durante o login.
     */

    preencherPerfilLocal();
  }
}

// ========================================
// PREENCHER PERFIL
// ========================================

function preencherPerfil(usuario) {
  const nome = usuario.nome || "Usuário";

  const email = usuario.email || "E-mail não informado";

  const telefone = usuario.telefone || "Não informado";

  // Cabeçalho

  const usuarioNome = document.getElementById("usuarioNome");

  const usuarioEmail = document.getElementById("usuarioEmail");

  if (usuarioNome) {
    usuarioNome.textContent = nome;
  }

  if (usuarioEmail) {
    usuarioEmail.textContent = email;
  }

  // Dados

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

  const usuarioNome = document.getElementById("usuarioNome");

  const usuarioEmail = document.getElementById("usuarioEmail");

  const nomeFinal = nome || "Usuário";

  const emailFinal = email || "E-mail não informado";

  if (usuarioNome) {
    usuarioNome.textContent = nomeFinal;
  }

  if (usuarioEmail) {
    usuarioEmail.textContent = emailFinal;
  }

  if (campoNome) {
    campoNome.textContent = nomeFinal;
  }

  if (campoEmail) {
    campoEmail.textContent = emailFinal;
  }
}

// ========================================
// LOGOUT
// ========================================

function configurarLogout() {
  const btnSair = document.getElementById("btnSair");

  if (btnSair) {
    btnSair.addEventListener("click", realizarLogout);
  }
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
   * Remove o token e os dados
   * do usuário.
   */

  logout();

  /*
   * Redireciona para o login.
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
    alert("A edição de perfil será implementada em breve.");
  });
}
