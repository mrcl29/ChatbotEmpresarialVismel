// frontend/src/api/auth.js
import { apiClient } from "./apiClient";

export const loginAPI = (username, password) =>
  apiClient("/auth" + __MY_ENV__.API.LOGIN, {
    method: "POST",
    body: { username, password },
  });

export const registerAPI = (username, password) =>
  apiClient("/auth" + __MY_ENV__.API.REGISTER, {
    method: "POST",
    body: { username, password },
  });
