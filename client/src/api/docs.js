import api from "./axios";

export const uploadDocument = (formData, onProgress) =>
  api.post("/api/docs/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress) {
        const percent = Math.round((e.loaded * 100) / e.total);
        onProgress(percent);
      }
    },
  });

export const getDocuments = () => api.get("/api/docs");
export const getDocument = (id) => api.get(`/api/docs/${id}`);
export const deleteDocument = (id) => api.delete(`/api/docs/${id}`);
export const getFreshUrl = (id) => api.get(`/api/docs/${id}/fresh-url`);
