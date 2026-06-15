import api from "./axios";

export const rejectDocument = (docId, data) =>
  api.patch(`/api/docs/${docId}/reject`, data);
export const reopenDocument = (docId) => api.patch(`/api/docs/${docId}/reopen`);
export const getDocumentStatus = (docId) =>
  api.get(`/api/docs/${docId}/status`);
export const signerReject = (token, data) =>
  api.patch(`/api/sign/${token}/reject`, data);
