// API Service - Frontend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// API Request Helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  getMe: () => apiRequest('/auth/me'),

  updatePassword: (passwords) => apiRequest('/auth/password', {
    method: 'PUT',
    body: JSON.stringify(passwords),
  }),
};

// Clients API
export const clientsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/clients${query ? `?${query}` : ''}`);
  },

  getOne: (id) => apiRequest(`/clients/${id}`),

  create: (clientData) => apiRequest('/clients', {
    method: 'POST',
    body: JSON.stringify(clientData),
  }),

  update: (id, clientData) => apiRequest(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(clientData),
  }),

  delete: (id) => apiRequest(`/clients/${id}`, {
    method: 'DELETE',
  }),

  getStats: () => apiRequest('/clients/stats'),
};

// Invoices API
export const invoicesAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/invoices${query ? `?${query}` : ''}`);
  },

  getOne: (id) => apiRequest(`/invoices/${id}`),

  create: (invoiceData) => apiRequest('/invoices', {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  }),

  update: (id, invoiceData) => apiRequest(`/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(invoiceData),
  }),

  delete: (id) => apiRequest(`/invoices/${id}`, {
    method: 'DELETE',
  }),

  getStats: (period) => apiRequest(`/invoices/stats?period=${period || 'month'}`),

  getNextNumber: () => apiRequest('/invoices/next-number'),
};

// Payments API
export const paymentsAPI = {
  add: (paymentData) => apiRequest('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  }),

  getByInvoice: (invoiceId) => apiRequest(`/payments/invoice/${invoiceId}`),
};

// Reports API
export const reportsAPI = {
  getDashboard: () => apiRequest('/reports/dashboard'),

  getSales: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/reports/sales${query ? `?${query}` : ''}`);
  },
};

// Settings API
export const settingsAPI = {
  get: () => apiRequest('/settings'),

  update: (settingsData) => apiRequest('/settings', {
    method: 'PUT',
    body: JSON.stringify(settingsData),
  }),
};

// Activities API
export const activitiesAPI = {
  getAll: (limit = 100) => apiRequest(`/activities?limit=${limit}`),
};

// Users API (Admin only)
export const usersAPI = {
  getAll: () => apiRequest('/users'),

  update: (id, userData) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),

  delete: (id) => apiRequest(`/users/${id}`, {
    method: 'DELETE',
  }),
};

export default {
  auth: authAPI,
  clients: clientsAPI,
  invoices: invoicesAPI,
  payments: paymentsAPI,
  reports: reportsAPI,
  settings: settingsAPI,
  activities: activitiesAPI,
  users: usersAPI,
};
