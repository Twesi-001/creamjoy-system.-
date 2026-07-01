import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============ TYPE DEFINITIONS ============
interface User {
    staff_id: number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    password_hash?: string;
    status?: 'active' | 'suspended' | 'inactive';
}

interface LoginResponse {
    token: string;
    user: User;
}

interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
}

export interface ProductData {
    product_id: number;
    flavour_id: number;
    size_id: number;
    flavour_name: string;
    size_name: string;
    unit_price: number;
}

export interface FlavourData {
    flavour_id: number;
    flavour_name: string;
}

export interface PackSizeData {
    size_id: number;
    size_name: string;
}

export interface ProductCreateData {
    flavour_id: number;
    size_id: number;
    unit_price: number;
}

export interface ProductUpdateData {
    unit_price: number;
}

interface BatchData {
    batch_number: string;
    batch_date: string;
    supervisor_id?: number;
    products?: Array<{ product_id: number; quantity: number }>;
    notes?: string;
}

export interface OrderData {
    order_id: number;
    customer_id?: number;
    customer_name?: string;
    order_date: string;
    delivery_date?: string;
    total_amount?: number | string;
    payment_method: 'cash' | 'mobile_money' | 'credit';
    payment_status?: 'paid' | 'partial' | 'pending' | string;
    order_lines?: Array<{ product_id: number; quantity: number }>;
}

export interface OrderCreateData {
    customer_id: number;
    order_date: string;
    delivery_date?: string;
    payment_method: 'cash' | 'mobile_money' | 'credit';
    order_lines?: Array<{ product_id: number; quantity: number }>;
}

interface RawMaterialData {
    material_name: string;
    unit: string;
    cost_per_unit_ugx: number;
    current_stock?: number;
    minimum_stock: number;
    supplier_id?: number | null;
    last_restocked?: string;
}

interface SupplierData {
    supplier_name: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    location?: string;
    notes?: string;
}

interface AdminUserData {
    name: string;
    email: string;
    password?: string;
    role: string;
    phone?: string;
    status?: 'active' | 'suspended' | 'inactive';
}

interface ExpenditureData {
    category: string;
    description?: string;
    quantity: number;
    unit: string;
    amount_ugx: number;
    paid_by?: number;
    expenditure_date: string;
    notes?: string;
}

interface StockUpdateData {
    quantity: number;
    action: 'add' | 'subtract';
}

interface SystemStats {
    users: number;
    active_users: number;
    suspended_users: number;
    customers: number;
    products: number;
    batches: number;
    orders: number;
    raw_materials: number;
    suppliers: number;
    low_stock: number;
    pending_orders: number;
}

export interface CreditData {
    credit_id: number;
    customer_name: string;
    location?: string;
    amount_ugx: number;
    date_recorded: string;
    status: string;
}

export interface DeliveryData {
    delivery_id: number;
    customer_name: string;
    staff_name: string;
    delivery_date: string;
    status: 'pending' | 'dispatched' | 'delivered';
}

interface PasswordStatus {
    staff_id: number;
    name: string;
    email: string;
    role: string;
    password_status: 'Set' | 'Not Set';
    last_password_change: string | null;
}

// ============ API INTERCEPTORS ============
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // ✅ Don't redirect to login for auth endpoints
        const isAuthEndpoint = error.config?.url?.includes('/auth/');
        
        // Only redirect if it's a 401 and NOT an auth endpoint
        if (error.response?.status === 401 && !isAuthEndpoint) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        
        // ✅ For auth endpoints, just reject the promise so the component can handle it
        return Promise.reject(error);
    }
);

export default api;

// ============ AUTH API ============
export const AuthAPI = {
    login: (email: string, password: string): Promise<{ data: LoginResponse }> =>
        api.post('/auth/login', { email, password }),
    register: (data: User): Promise<{ data: ApiResponse }> =>
        api.post('/auth/register', data),
    me: (): Promise<{ data: User }> =>
        api.get('/auth/me'),
    // ✅ ADD CHANGE PASSWORD
    changePassword: (data: { current_password: string; new_password: string; confirm_password: string }): Promise<{ data: ApiResponse }> =>
        api.post('/auth/change-password', data),
};

// ============ BATCH API ============
export const BatchAPI = {
    getAll: (): Promise<{ data: BatchData[] }> =>
        api.get('/batches'),
    getOne: (id: number): Promise<{ data: BatchData }> =>
        api.get(`/batches/${id}`),
    create: (data: BatchData): Promise<{ data: ApiResponse }> =>
        api.post('/batches', data),
    updateStatus: (id: number, status: string): Promise<{ data: ApiResponse }> =>
        api.put(`/batches/${id}/status`, { status }),
};

// ============ PRODUCT API ============
export const ProductAPI = {
    getAll: (): Promise<{ data: ProductData[] }> =>
        api.get('/products'),
    getOne: (id: number): Promise<{ data: ProductData }> =>
        api.get(`/products/${id}`),
    getFlavours: (): Promise<{ data: FlavourData[] }> =>
        api.get('/flavours'),
    getPackSizes: (): Promise<{ data: PackSizeData[] }> =>
        api.get('/pack-sizes'),
    create: (data: ProductCreateData): Promise<{ data: ApiResponse & { product?: ProductData } }> =>
        api.post('/products', data),
    update: (id: number, data: ProductUpdateData): Promise<{ data: ApiResponse & { product?: ProductData } }> =>
        api.put(`/products/${id}`, data),
    delete: (id: number): Promise<{ data: ApiResponse }> =>
        api.delete(`/products/${id}`),
};

// ============ ORDER API ============
export const OrderAPI = {
    getAll: (): Promise<{ data: OrderData[] }> =>
        api.get('/orders'),
    getOne: (id: number): Promise<{ data: OrderData }> =>
        api.get(`/orders/${id}`),
    create: (data: OrderCreateData): Promise<{ data: ApiResponse }> =>
        api.post('/orders', data),
    updateStatus: (id: number, status: string): Promise<{ data: ApiResponse }> =>
        api.put(`/orders/${id}/status`, { status }),
};

// ============ STAFF API ============
export const StaffAPI = {
    getAll: (): Promise<{ data: User[] }> =>
        api.get('/staff'),
    getOne: (id: number): Promise<{ data: User }> =>
        api.get(`/staff/${id}`),
};

// ============ DELIVERY API ============
export const DeliveryAPI = {
    getAll: (): Promise<{ data: DeliveryData[] }> =>
        api.get('/deliveries'),
    updateStatus: (id: number, status: string): Promise<{ data: ApiResponse }> =>
        api.put(`/deliveries/${id}/status`, { status }),
    getAudit: (): Promise<{ data: DeliveryData[] }> =>
        api.get('/deliveries/audit'),
};

// ============ INVENTORY API ============
export const InventoryAPI = {
    getAll: (): Promise<{ data: unknown[] }> =>
        api.get('/inventory'),
    updateStock: (id: number, quantity: number, action: 'add' | 'subtract'): Promise<{ data: ApiResponse }> =>
        api.put(`/inventory/${id}`, { quantity, action } as StockUpdateData),
    getLowStock: (): Promise<{ data: unknown[] }> =>
        api.get('/inventory/low-stock'),
};

// ============ CUSTOMER API ============
export const CustomerAPI = {
    getAll: (): Promise<{ data: unknown[] }> =>
        api.get('/customers'),
    getOne: (id: number): Promise<{ data: unknown }> =>
        api.get(`/customers/${id}`),
    create: (data: { name: string; location?: string; phone?: string; customer_type?: string; notes?: string }): Promise<{ data: ApiResponse }> =>
        api.post('/customers', data),
};

// ============ EXPENDITURE API ============
export const ExpenditureAPI = {
    create: (data: ExpenditureData): Promise<{ data: ApiResponse }> =>
        api.post('/expenditures', data),
    getSummary: (): Promise<{ data: unknown }> =>
        api.get('/expenditures/summary'),
};

// ============ CREDIT API ============
export const CreditAPI = {
    getAll: (): Promise<{ data: CreditData[] }> =>
        api.get('/credit-accounts'),
    getSummary: (): Promise<{ data: { total_outstanding: number; count: number } }> =>
        api.get('/credit-accounts/summary'),
};

// ============ SUPPLIER API ============
export const SupplierAPI = {
    getAll: (): Promise<{ data: unknown[] }> =>
        api.get('/suppliers'),
    getOne: (id: number): Promise<{ data: unknown }> =>
        api.get(`/suppliers/${id}`),
    create: (data: SupplierData): Promise<{ data: ApiResponse }> =>
        api.post('/suppliers', data),
    update: (id: number, data: SupplierData): Promise<{ data: ApiResponse }> =>
        api.put(`/suppliers/${id}`, data),
    delete: (id: number): Promise<{ data: ApiResponse }> =>
        api.delete(`/suppliers/${id}`),
};

// ============ RAW MATERIAL API ============
export const RawMaterialAPI = {
    getAll: (): Promise<{ data: unknown[] }> =>
        api.get('/raw-materials'),
    getOne: (id: number): Promise<{ data: unknown }> =>
        api.get(`/raw-materials/${id}`),
    create: (data: RawMaterialData): Promise<{ data: ApiResponse }> =>
        api.post('/raw-materials', data),
    update: (id: number, data: RawMaterialData): Promise<{ data: ApiResponse }> =>
        api.put(`/raw-materials/${id}`, data),
    delete: (id: number): Promise<{ data: ApiResponse }> =>
        api.delete(`/raw-materials/${id}`),
    updateStock: (id: number, quantity: number, action: 'add' | 'subtract'): Promise<{ data: ApiResponse }> =>
        api.put(`/raw-materials/${id}/stock`, { quantity, action } as StockUpdateData),
    getLowStock: (): Promise<{ data: unknown[] }> =>
        api.get('/raw-materials/low-stock'),
};

// ============ ADMIN API ============
export const AdminAPI = {
    getUsers: (): Promise<{ data: User[] }> =>
        api.get('/admin/users'),
    getUser: (id: number): Promise<{ data: User }> =>
        api.get(`/admin/users/${id}`),
    createUser: (data: AdminUserData): Promise<{ data: ApiResponse }> =>
        api.post('/admin/users', data),
    updateUser: (id: number, data: AdminUserData): Promise<{ data: ApiResponse }> =>
        api.put(`/admin/users/${id}`, data),
    deleteUser: (id: number): Promise<{ data: ApiResponse }> =>
        api.delete(`/admin/users/${id}`),
    suspendUser: (id: number): Promise<{ data: ApiResponse }> =>
        api.put(`/admin/users/${id}/suspend`),
    activateUser: (id: number): Promise<{ data: ApiResponse }> =>
        api.put(`/admin/users/${id}/activate`),
    getStats: (): Promise<{ data: SystemStats }> =>
        api.get('/admin/stats'),
    // ✅ ADD PASSWORD MANAGEMENT
    resetPassword: (userId: number, newPassword: string): Promise<{ data: ApiResponse }> =>
        api.post(`/admin/users/${userId}/reset-password`, { new_password: newPassword }),
    getPasswordStatus: (userId: number): Promise<{ data: PasswordStatus }> =>
        api.get(`/admin/users/${userId}/password-status`),
    getAllPasswordStatus: (): Promise<{ data: PasswordStatus[] }> =>
        api.get('/admin/users/password-status'),
};
