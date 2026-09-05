function salvarSessao(resposta) {
  localStorage.setItem("token", resposta.token);

  localStorage.setItem("usuarioId", resposta.usuarioId);

  localStorage.setItem("nomeUsuario", resposta.nome);
}

function obterToken() {
  return localStorage.getItem("token");
}

function obterUsuarioId() {
  return localStorage.getItem("usuarioId");
}

function obterNomeUsuario() {
  return localStorage.getItem("nomeUsuario");
}

function usuarioEstaLogado() {
  return !!localStorage.getItem("token");
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuarioId");
  localStorage.removeItem("nomeUsuario");

  window.location.href = "login.html";
}
