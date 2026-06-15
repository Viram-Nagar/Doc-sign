import api from "./axios";

export const saveSignature = (data) => api.post("/api/signatures", data);
export const getSignatures = (docId) => api.get(`/api/signatures/${docId}`);
export const deleteSignature = (id) => api.delete(`/api/signatures/${id}`);
export const updateSignaturePosition = (id, data) =>
  api.patch(`/api/signatures/${id}/position`, data);
