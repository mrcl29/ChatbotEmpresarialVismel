// frontend/src/api/chat.js
import { apiClient } from "./apiClient";

export const talkToBot = (token, message, sessionID = "") =>
  apiClient("/chat" + __MY_ENV__.API.TALK, {
    method: "POST",
    token,
    body: { message, sessionID },
  });

export const getHistory = (token) =>
  apiClient("/chat" + __MY_ENV__.API.TALK, {
    method: "GET",
    token,
  });

export const deleteHistory = (token) =>
  apiClient("/chat" + __MY_ENV__.API.TALK, {
    method: "DELETE",
    token,
  });
