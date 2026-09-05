const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    const senha = document.getElementById("senha").value;

    const errorElement = document.getElementById("loginError");

    const button = document.getElementById("btnLogin");

    // Limpa mensagem de erro

    errorElement.style.display = "none";
    errorElement.textContent = "";

    // Desabilita botão durante a requisição

    button.disabled = true;
    button.textContent = "Entrando...";

    try {
      const resposta = await apiRequest("/auth/login", {
        method: "POST",

        body: JSON.stringify({
          email: email,
          senha: senha,
        }),
      });

      // Salva JWT e dados do usuário

      salvarSessao(resposta);

      // Redireciona para a aplicação

      window.location.href = "explorar.html";
    } catch (error) {
      console.error("Erro ao realizar login:", error);

      errorElement.textContent = error.message || "E-mail ou senha inválidos.";

      errorElement.style.display = "block";

      button.disabled = false;

      button.textContent = "Entrar →";
    }
  });
}
