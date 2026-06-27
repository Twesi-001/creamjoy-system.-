import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to every request
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

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// ============ AUTH API ============
export const AuthAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    register: (data: any) =>
        api.post('/auth/register', data),
    me: () =>
        api.get('/auth/me'),
};

// ============ BATCH API ============
export const BatchAPI = {
    getAll: () => api.get('/batches'),
    getOne: (id: number) => api.get(`/batches/${id}`),
    create: (data: any) => api.post('/batches', data),
    updateStatus: (id: number, status: string) =>
        api.put(`/batches/${id}/status`, { status }),
};

// ============ PRODUCT API ============
export const ProductAPI = {
    getAll: () => api.get('/products'),
    getOne: (id: number) => api.get(`/products/${id}`),
};

// ============ ORDER API ============
export const OrderAPI = {
    getAll: () => api.get('/orders'),
    getOne: (id: number) => api.get(`/orders/${id}`),
    create: (data: any) => api.post('/orders', data),
    updateStatus: (id: number, status: string) =>
        api.put(`/orders/${id}/status`, { status }),
};

// ============ STAFF API ============
export const StaffAPI = {
    getAll: () => api.get('/staff'),
    getOne: (id: number) => api.get(`/staff/${id}`),
};

// ============ DELIVERY API ============
export const DeliveryAPI = {
    getAll: () => api.get('/deliveries'),
    updateStatus: (id: number, status: string) =>
        api.put(`/deliveries/${id}/status`, { status }),
    getAudit: () => api.get('/deliveries/audit'),
};

// ============ INVENTORY API ============
export const InventoryAPI = {
    getAll: () => api.get('/inventory'),
    updateStock: (id: number, quantity: number, action: 'add' | 'subtract') =>
        api.put(`/inventory/${id}`, { quantity, action }),
    getLowStock: () => api.get('/inventory/low-stock'),
};

// ============ CUSTOMER API ============
export const CustomerAPI = {
    getAll: () => api.get('/customers'),
    getOne: (id: number) => api.get(`/customers/${id}`),
};

// ============ EXPENDITURE API ============
export const ExpenditureAPI = {
    create: (data: any) => api.post('/expenditures', data),
    getSummary: () => api.get('/expenditures/summary'),
};

// ============ CREDIT API ============
export const CreditAPI = {
    getAll: () => api.get('/credit-accounts'),
    getSummary: () => api.get('/credit-accounts/summary'),
};

// ============ SUPPLIER API ============
export const SupplierAPI = {
    getAll: () => api.get('/suppliers'),
    getOne: (id: number) => api.get(`/suppliers/${id}`),
    create: (data: any) => api.post('/suppliers', data),
    update: (id: number, data: any) => api.put(`/suppliers/${id}`, data),
    delete: (id: number) => api.delete(`/suppliers/${id}`),
};
// Add to src/api/api.ts

export const RawMaterialAPI = {
    getAll: () => api.get('/raw-materials'),
    getOne: (id: number) => api.get(`/raw-materials/${id}`),
    create: (data: any) => api.post('/raw-materials', data),
    update: (id: number, data: any) => api.put(`/raw-materials/${id}`, data),
    delete: (id: number) => api.delete(`/raw-materials/${id}`),
    updateStock: (id: number, quantity: number, action: 'add' | 'subtract') =>
        api.put(`/raw-materials/${id}/stock`, { quantity, action }),
    getLowStock: () => api.get('/raw-materials/low-stock'),
};