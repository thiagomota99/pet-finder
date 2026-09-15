const form = document.getElementById("resetPasswordForm");

const message = document.getElementById("message");

const button = document.getElementById("btnRedefinir");

const senha = document.getElementById("senha");

const confirmarSenha = document.getElementById("confirmarSenha");

// =====================================================
// PEGA O TOKEN DA URL
// =====================================================

const parametros = new URLSearchParams(window.location.search);

const token = parametros.get("token");

if (!token) {
  message.textContent = "Link de recuperação inválido.";

  message.style.display = "block";

  button.disabled = true;
}

// =====================================================
// MOSTRAR / OCULTAR SENHA
// =====================================================

document.getElementById("toggleSenha").addEventListener("click", function () {
  senha.type = senha.type === "password" ? "text" : "password";
});

document
  .getElementById("toggleConfirmarSenha")
  .addEventListener("click", function () {
    confirmarSenha.type =
      confirmarSenha.type === "password" ? "text" : "password";
  });

// =====================================================
// REDEFINIR SENHA
// =====================================================

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  message.style.display = "none";
  message.textContent = "";

  const novaSenha = senha.value;

  const novaSenhaConfirmacao = confirmarSenha.value;

  // ---------------------------------------------
  // Validação
  // ---------------------------------------------

  if (novaSenha.length < 6) {
    message.textContent = "A senha deve ter pelo menos 6 caracteres.";

    message.style.display = "block";

    return;
  }

  if (novaSenha !== novaSenhaConfirmacao) {
    message.textContent = "As senhas não são iguais.";

    message.style.display = "block";

    return;
  }

  if (!token) {
    message.textContent = "Link de recuperação inválido.";

    message.style.display = "block";

    return;
  }

  button.disabled = true;
  button.textContent = "Redefinindo...";

  try {
    await apiRequest("/auth/redefinir-senha", {
      method: "POST",

      body: JSON.stringify({
        token: token,

        novaSenha: novaSenha,
      }),
    });

    message.textContent =
      "Senha redefinida com sucesso! " +
      "Você será redirecionado para o login.";

    message.style.display = "block";

    form.reset();

    setTimeout(function () {
      window.location.href = "login.html";
    }, 2000);
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);

    message.textContent =
      error.message || "Não foi possível redefinir sua senha.";

    message.style.display = "block";

    button.disabled = false;

    button.textContent = "Redefinir senha →";
  }
});
