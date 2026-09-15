document.addEventListener("DOMContentLoaded", async function () {
  // ========================================
  // VERIFICAR LOGIN
  // ========================================

  if (!usuarioEstaLogado()) {
    window.location.href = "login.html";

    return;
  }

  // ========================================
  // CONFIGURAR BOTÕES
  // ========================================

  configurarCancelar();

  configurarFormulario();

  // ========================================
  // CARREGAR DADOS
  // ========================================

  await carregarDadosUsuario();
});

// ========================================
// CARREGAR USUÁRIO
// ========================================

async function carregarDadosUsuario() {
  try {
    const usuario = await apiRequest("/usuarios/me");

    console.log("Usuário:", usuario);

    document.getElementById("nome").value = usuario.nome || "";

    document.getElementById("email").value = usuario.email || "";

    document.getElementById("telefone").value = usuario.telefone || "";
  } catch (error) {
    console.error("Erro ao carregar usuário:", error);

    mostrarErro("Não foi possível carregar seus dados.");
  }
}

// ========================================
// FORMULÁRIO
// ========================================

function configurarFormulario() {
  const form = document.getElementById("editarPerfilForm");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    limparMensagens();

    const nome = document.getElementById("nome").value.trim();

    const email = document.getElementById("email").value.trim();

    const telefone = document.getElementById("telefone").value.trim();

    // ========================================
    // VALIDAÇÃO
    // ========================================

    if (!nome) {
      mostrarErro("Informe seu nome.");

      return;
    }

    if (!email) {
      mostrarErro("Informe seu e-mail.");

      return;
    }

    if (!validarEmail(email)) {
      mostrarErro("Informe um e-mail válido.");

      return;
    }

    if (!telefone) {
      mostrarErro("Informe seu telefone.");

      return;
    }

    // ========================================
    // BOTÃO
    // ========================================

    const botao = document.getElementById("btnSalvar");

    botao.disabled = true;

    botao.textContent = "Salvando...";

    try {
      // ========================================
      // PUT /usuarios/me
      // ========================================

      const usuario = await apiRequest("/usuarios/me", {
        method: "PUT",

        body: JSON.stringify({
          nome: nome,
          email: email,
          telefone: telefone,
        }),
      });

      console.log("Usuário atualizado:", usuario);

      // ========================================
      // ATUALIZAR SESSÃO
      // ========================================

      localStorage.setItem("nomeUsuario", usuario.nome);

      // ========================================
      // SUCESSO
      // ========================================

      mostrarSucesso("Perfil atualizado com sucesso!");

      // ========================================
      // VOLTAR PARA PERFIL
      // ========================================

      setTimeout(function () {
        window.location.href = "perfil.html";
      }, 1000);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);

      mostrarErro(error.message || "Não foi possível atualizar seu perfil.");

      botao.disabled = false;

      botao.textContent = "Salvar alterações";
    }
  });
}

// ========================================
// CANCELAR
// ========================================

function configurarCancelar() {
  const botao = document.getElementById("btnCancelar");

  botao.addEventListener("click", function () {
    window.location.href = "perfil.html";
  });
}

// ========================================
// VALIDAR E-MAIL
// ========================================

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ========================================
// ERRO
// ========================================

function mostrarErro(mensagem) {
  const elemento = document.getElementById("formError");

  elemento.textContent = mensagem;

  elemento.style.display = "block";
}

// ========================================
// SUCESSO
// ========================================

function mostrarSucesso(mensagem) {
  const elemento = document.getElementById("formSuccess");

  elemento.textContent = mensagem;

  elemento.style.display = "block";
}

// ========================================
// LIMPAR MENSAGENS
// ========================================

function limparMensagens() {
  const erro = document.getElementById("formError");

  const sucesso = document.getElementById("formSuccess");

  erro.style.display = "none";

  sucesso.style.display = "none";
}
