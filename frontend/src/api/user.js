// frontend/src/api/user.js
import { apiClient } from "./apiClient";

export const getAllUsersAPI = (token) =>
  apiClient("/users" + __MY_ENV__.API.USERS, {
    method: "GET",
    token,
  });

export const getAllRolesAPI = (token) =>
  apiClient("/users" + __MY_ENV__.API.ROLES, {
    method: "GET",
    token,
  });

export const updateUsersAPI = async (token, users) => {
  if (!users) return;

  const basePath = "/users" + __MY_ENV__.API.USERS;

  if (typeof users === "object" && !Array.isArray(users)) {
    const { id, ...rest } = users;
    if (!id)
      throw new Error("ID requerido para actualizar un usuario individual.");

    const response = await apiClient(`${basePath}${id}`, {
      method: "PATCH",
      body: rest,
      token,
    });

    if (response && response.username) {
      return { updatedUsers: [response.username], ...response };
    }

    return response;
  }

  if (Array.isArray(users)) {
    if (users.length === 1) {
      const user = users[0];
      const { id, ...rest } = user;
      if (!id)
        throw new Error("ID requerido para actualizar un usuario individual.");

      const response = await apiClient(`${basePath}${id}`, {
        method: "PATCH",
        body: rest,
        token,
      });

      if (response && response.username) {
        return { updatedUsers: [response.username], ...response };
      }

      return response;
    }

    if (users.length > 1) {
      return apiClient(basePath, {
        method: "PATCH",
        body: { users },
        token,
      });
    }
  }
};
