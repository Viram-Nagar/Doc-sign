import api from "./axios";

export const generateShareLink = (docId, data) =>
  api.post(`/api/docs/${docId}/share`, data);

// Public — no auth token needed
export const getDocByToken = (token) => api.get(`/api/sign/${token}`);

export const signViaToken = (token, data) =>
  api.post(`/api/sign/${token}`, data);
