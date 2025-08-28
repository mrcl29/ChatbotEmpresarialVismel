// frontend/src/api/apiClient.js
import { handleApiError } from "../utils/handleApiError";

const BASE_URL = `http://${__MY_ENV__.HOST}:${__MY_ENV__.BACKEND_NODE_PORT}/api`;

export const apiClient = async (
  endpoint,
  { method = "GET", body, token, headers = {}, ...customConfig } = {}
) => {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    credentials: "include",
    ...customConfig,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    const data = await response.json().catch(() => ({})); // fallback en errores sin JSON

    if (!response.ok) {
      const message =
        data?.message || data?.error || "Error en la llamada a la API";
      return handleApiError(new Error(message));
    }

    return { success: true, ...data };
  } catch (err) {
    console.error("apiClient error:", err.message);
    return handleApiError(err);
  }
};
