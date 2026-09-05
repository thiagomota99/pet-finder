const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();

    const email = document.getElementById("email").value.trim();

    const telefone = document.getElementById("telefone").value.trim();

    const senha = document.getElementById("s1").value;

    const confirmarSenha = document.getElementById("s2").value;

    const errorElement = document.getElementById("registerError");

    const button = document.getElementById("btnCadastro");

    // Limpa mensagem anterior

    errorElement.style.display = "none";

    errorElement.textContent = "";

    // Verifica se as senhas são iguais

    if (senha !== confirmarSenha) {
      errorElement.textContent = "As senhas não são iguais.";

      errorElement.style.display = "block";

      return;
    }

    // Desabilita botão

    button.disabled = true;

    button.textContent = "Criando conta...";

    try {
      const resposta = await apiRequest("/auth/cadastro", {
        method: "POST",

        body: JSON.stringify({
          nome: nome,
          email: email,
          telefone: telefone,
          senha: senha,
        }),
      });

      // Salva sessão retornada pelo backend

      salvarSessao(resposta);

      // Redireciona para a aplicação

      window.location.href = "explorar.html";
    } catch (error) {
      console.error("Erro ao realizar cadastro:", error);

      errorElement.textContent =
        error.message || "Não foi possível criar sua conta.";

      errorElement.style.display = "block";

      button.disabled = false;

      button.textContent = "Criar Conta →";
    }
  });
}
