import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status !== 404) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Patient APIs
export const patientAPI = {
  getAll: (params) => api.get('/patients', { params }),
  getOne: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
  getStats: () => api.get('/patients/stats'),
};

// Doctor APIs
export const doctorAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getOne: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
};

// Ward APIs
export const wardAPI = {
  getAll: (params) => api.get('/wards', { params }),
  create: (data) => api.post('/wards', data),
  update: (id, data) => api.put(`/wards/${id}`, data),
  getStats: () => api.get('/wards/stats'),
};

// Emergency APIs
export const emergencyAPI = {
  getAll: (params) => api.get('/emergency', { params }),
  create: (data) => api.post('/emergency', data),
  update: (id, data) => api.put(`/emergency/${id}`, data),
};

// Diagnostic APIs
export const diagnosticAPI = {
  getAll: (params) => api.get('/diagnostics', { params }),
  create: (data) => api.post('/diagnostics', data),
  update: (id, data) => api.put(`/diagnostics/${id}`, data),
};

// Appointment APIs
export const appointmentAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
};

// Admission APIs
export const admissionAPI = {
  getAll: (params) => api.get('/admissions', { params }),
  create: (data) => api.post('/admissions', data),
  update: (id, data) => api.put(`/admissions/${id}`, data),
};

// Billing APIs
export const billingAPI = {
  getAll: (params) => api.get('/billing', { params }),
  getOne: (id) => api.get(`/billing/${id}`),
  create: (data) => api.post('/billing', data),
  makePayment: (id, data) => api.post(`/billing/${id}/pay`, data),
  downloadPDF: (id) => api.get(`/billing/${id}/pdf`, { responseType: 'blob' }),
};

// Discharge APIs
export const dischargeAPI = {
  getAll: () => api.get('/discharges'),
  create: (data) => api.post('/discharges', data),
};

// Medicine APIs
export const medicineAPI = {
  getAll: (params) => api.get('/medicines', { params }),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
};

// Dashboard APIs
export const dashboardAPI = {
  getAdminStats: () => api.get('/dashboard/admin'),
};

export default api;