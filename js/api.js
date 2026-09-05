const API_URL = "http://localhost:8080/api";

async function apiRequest(endpoint, options = {}) {


const token = localStorage.getItem("token");

const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
};

// Adiciona o JWT automaticamente quando existir
if (token) {
    headers["Authorization"] = `Bearer ${token}`;
}

const response = await fetch(
    `${API_URL}${endpoint}`,
    {
        ...options,
        headers
    }
);

// Se a API retornar 401, a sessão será encerrada
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
            message: "Erro na comunicação com o servidor."
        };
    }

    throw new Error(
        error.message || "Erro na requisição."
    );
}

// DELETE normalmente retorna 204
if (response.status === 204) {
    return null;
}

return response.json();
}
