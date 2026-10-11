import axios from 'axios';

// Automatically detect host IP (e.g. 192.168.1.4 or localhost) when accessed from mobile phone
const backendHost = window.location.hostname || 'localhost';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `http://${backendHost}:8080/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Students API
export const getStudents = () => api.get('/students');
export const getStudentById = (id) => api.get(`/students/${id}`);
export const searchStudents = (name) => api.get(`/students/search?name=${encodeURIComponent(name || '')}`);
export const createStudent = (data) => api.post('/students', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

// Subjects API
export const getSubjects = () => api.get('/subjects');
export const getSubjectById = (id) => api.get(`/subjects/${id}`);
export const searchSubjects = (name) => api.get(`/subjects/search?name=${encodeURIComponent(name || '')}`);
export const createSubject = (data) => api.post('/subjects', data);
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data);
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);

// Orders API
export const getOrders = () => api.get('/orders');
export const getOrderHistory = (filters = {}) => api.get('/orders/history', { params: filters });
export const getOrderHistoryByStudent = (id) => api.get(`/orders/history/student/${id}`);
export const getOrderHistoryBySubject = (id) => api.get(`/orders/history/subject/${id}`);
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const getOrdersByStudent = (studentId) => api.get(`/orders/student/${studentId}`);
export const getOrdersBySubject = (subjectId) => api.get(`/orders/subject/${subjectId}`);
export const getOrdersByPaymentStatus = (status) => api.get(`/orders/payment-status/${status}`);
export const getOrdersByDeliveryStatus = (status) => api.get(`/orders/delivery-status/${status}`);
export const getPendingOrders = () => api.get('/orders/pending');
export const searchOrders = (q) => api.get(`/orders/search?q=${encodeURIComponent(q || '')}`);
export const createOrder = (data) => api.post('/orders', data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
export const archiveOrder = (id) => api.post(`/orders/${id}/archive`);
export const recordPayment = (id, payment) => api.post(`/orders/${id}/payments`, {
  ...payment,
  idempotencyKey: payment.idempotencyKey || window.crypto.randomUUID(),
});

// Payments API
export const updatePayment = (id, amountPaid) =>
  api.patch(`/orders/${id}/payment`, amountPaid !== undefined && amountPaid !== null ? { amountPaid } : {});
export const recordAdditionalPayment = (id, amount) =>
  api.post(`/orders/${id}/record-payment`, { amount });

// Delivery Status API (Independent of payment)
export const updateDeliveryStatus = (id, deliveryStatus) =>
  api.patch(`/orders/${id}/delivery-status`, { deliveryStatus });

// Dashboard API
export const getDashboard = () => api.get('/dashboard');

export default api;
