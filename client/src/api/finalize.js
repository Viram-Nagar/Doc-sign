import api from "./axios";

export const finalizeDocument = (docId) =>
  api.post(`/api/finalize/${docId}/finalize`);

export const getSignedPdfUrl = (docId) =>
  api.get(`/api/finalize/${docId}/signed-url`);
