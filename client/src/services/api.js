import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me')
};

// Pets API
export const petsAPI = {
  getAll: (params) => api.get('/pets', { params }),
  getById: (id) => api.get(`/pets/${id}`),
  create: (petData) => api.post('/pets', petData),
  update: (id, petData) => api.put(`/pets/${id}`, petData),
  delete: (id) => api.delete(`/pets/${id}`)
};

// Applications API
export const applicationsAPI = {
  getMyApplications: () => api.get('/applications/my-applications'),
  getAll: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  submit: (applicationData) => api.post('/applications', applicationData),
  updateStatus: (id, status, notes) =>
    api.patch(`/applications/${id}/status`, { status, notes })
};

// Favorites API
export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (petId) => api.post(`/favorites/${petId}`),
  remove: (petId) => api.delete(`/favorites/${petId}`)
};

// Appointments API
export const appointmentsAPI = {
  getMyAppointments: () => api.get('/appointments/my-appointments'),
  getAvailableSlots: (date) =>
    api.get('/appointments/available-slots', { params: { date } }),
  schedule: (appointmentData) => api.post('/appointments', appointmentData),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`)
};

// Quiz API
export const quizAPI = {
  submit: (answers) => api.post('/quiz/submit', answers),
  getResults: () => api.get('/quiz/results')
};

export default api;
