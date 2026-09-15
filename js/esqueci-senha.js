const form = document.getElementById("forgotPasswordForm");

const message = document.getElementById("message");

const button = document.getElementById("btnEnviar");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();

  message.style.display = "none";
  message.textContent = "";

  button.disabled = true;
  button.textContent = "Enviando...";

  try {
    await apiRequest("/auth/esqueci-senha", {
      method: "POST",

      body: JSON.stringify({
        email: email,
      }),
    });

    message.textContent =
      "Se o e-mail estiver cadastrado, " +
      "você receberá um link para redefinir sua senha.";

    message.style.display = "block";

    form.reset();
  } catch (error) {
    console.error("Erro ao solicitar recuperação:", error);

    message.textContent =
      error.message || "Não foi possível solicitar a recuperação da senha.";

    message.style.display = "block";
  } finally {
    button.disabled = false;
    button.textContent = "Enviar link →";
  }
});
