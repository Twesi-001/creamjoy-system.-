export interface Staff {
    staff_id: number;
    name: string;
    role: 'production' | 'delivery' | 'sales' | 'maintenance' | 'supervisor';
    phone: string;
    email: string;
    hire_date: string;
}

export interface Customer {
    customer_id: number;
    name: string;
    location: string;
    phone: string;
    customer_type: string;
    notes: string;
}

export interface Flavour {
    flavour_id: number;
    flavour_name: string;
}

export interface PackSize {
    size_id: number;
    size_name: string;
}

export interface Product {
    product_id: number;
    flavour_id: number;
    size_id: number;
    unit_price: number;
    flavour_name: string;
    size_name: string;
}

export interface Batch {
    batch_id: number;
    batch_number: string;
    batch_date: string;
    status: 'pending' | 'in_progress' | 'completed';
    supervisor_id: number;
    supervisor_name: string;
    total_units: number;
    notes: string;
}

export interface BatchProduct {
    batch_product_id: number;
    batch_id: number;
    product_id: number;
    quantity_produced: number;
    flavour_name: string;
    size_name: string;
}

export interface Order {
    order_id: number;
    customer_id: number;
    customer_name: string;
    order_date: string;
    delivery_date: string;
    payment_method: 'cash' | 'mobile_money' | 'credit';
    payment_status: 'pending' | 'paid' | 'partial';
    total_amount: number;
}

export interface OrderLine {
    order_line_id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    unit_price_at_time: number;
    flavour_name: string;
    size_name: string;
}

export interface Delivery {
    delivery_id: number;
    order_id: number;
    staff_id: number;
    staff_name: string;
    customer_name: string;
    delivery_date: string;
    status: 'pending' | 'dispatched' | 'delivered';
    notes: string;
}

export interface RawMaterial {
    material_id: number;
    material_name: string;
    unit: string;
    cost_per_unit: number;
    current_stock: number;
    minimum_stock: number;
    low_stock: boolean;
}

export interface CreditAccount {
    credit_id: number;
    customer_id: number;
    customer_name: string;
    amount_ugx: number;
    date_recorded: string;
    status: 'pending' | 'paid' | 'partial';
    notes: string;
}

export interface Expenditure {
    expenditure_id: number;
    category: string;
    description: string;
    quantity: number;
    unit: string;
    amount_ugx: number;
    paid_by: number;
    paid_by_name: string;
    expenditure_date: string;
    notes: string;
}

export interface AuthResponse {
    token: string;
    user: Staff;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: string;
    phone: string;
}