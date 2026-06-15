import api from "./axios";

export const getAuditLogs = (docId) => api.get(`/api/audit/${docId}`);
