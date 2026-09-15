const API_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:8080/api"
        : "https://petfinder-api-wu82.onrender.com/api";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
  };

  /*
   * Se o body NÃO for FormData, usamos JSON.
   *
   * Quando for FormData, NÃO definimos Content-Type.
   * O navegador fará isso automaticamente:
   *
   * multipart/form-data; boundary=...
   */
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Adiciona o JWT automaticamente
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Token inválido/expirado
  if (response.status === 401) {
    logout();

    return;
  }

  if (!response.ok) {
    let error;

    try {
      error = await response.json();
    } catch {
      error = {
        message: "Erro na comunicação com o servidor.",
      };
    }

    throw new Error(error.message || "Erro na requisição.");
  }

  // DELETE normalmente retorna 204
  if (response.status === 204) {
    return null;
  }

  // Algumas respostas podem não possuir conteúdo
  const contentType = response.headers.get("content-type");

  if (!contentType || !contentType.includes("application/json")) {
    return null;
  }

  return response.json();
}
