// frontend/src/api/dashboard.js
import { apiClient } from "./apiClient";

export const getDashboardInfo = async (token, info) => {
    if (!info) return;

    const basePath = "/dashboard" + __MY_ENV__.API.DASHBOARD;
    const response = await apiClient(`${basePath}${info}`, {
      method: "GET",
      token,
    });

    return response;
}