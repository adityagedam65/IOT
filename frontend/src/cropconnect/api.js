import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const listViews = () => axios.get(`${API}/views`).then((r) => r.data);
export const createView = (payload) => axios.post(`${API}/views`, payload).then((r) => r.data);
export const deleteView = (id) => axios.delete(`${API}/views/${id}`).then((r) => r.data);

export const listNotes = (componentId) =>
  axios.get(`${API}/notes`, { params: componentId ? { componentId } : {} }).then((r) => r.data);
export const createNote = (payload) => axios.post(`${API}/notes`, payload).then((r) => r.data);
export const deleteNote = (id) => axios.delete(`${API}/notes/${id}`).then((r) => r.data);
