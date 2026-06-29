import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderAPI, CustomerAPI, ProductAPI } from '../../api/api';
import './OrderForm.css';

interface Customer {
    customer_id: number;
    name: string;
    location?: string;
    phone?: string;
    customer_type?: string;
}

interface Product {
    product_id: number;
    flavour_name: string;
    size_name: string;
    unit_price?: number;
}

interface OrderLine {
    product_id: number;
    quantity: number;
}

interface FormData {
    customer_id: number;
    order_date: string;
    delivery_date: string;
    payment_method: 'cash' | 'mobile_money' | 'credit';
    order_lines: OrderLine[];
}

const OrderForm: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [formData, setFormData] = useState<FormData>({
        customer_id: 0,
        order_date: new Date().toISOString().split('T')[0],
        delivery_date: '',
        payment_method: 'cash',
        order_lines: []
    });

    const fetchData = useCallback(async (): Promise<void> => {
        try {
            const [customersRes, productsRes] = await Promise.all([
                CustomerAPI.getAll(),
                ProductAPI.getAll()
            ]);
            setCustomers((customersRes.data || []) as Customer[]);
            setProducts((productsRes.data || []) as Product[]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            if (isMounted) {
                await fetchData();
            }
        };
        loadData();
        return () => {
            isMounted = false;
        };
    }, [fetchData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'customer_id' ? parseInt(value) || 0 : value
        }));
    };

    const handleProductChange = (index: number, field: keyof OrderLine, value: string): void => {
        const updatedLines = [...formData.order_lines];
        updatedLines[index] = {
            ...updatedLines[index],
            [field]: parseInt(value) || 0
        };
        setFormData((prev) => ({
            ...prev,
            order_lines: updatedLines
        }));
    };

    const addProductRow = (): void => {
        setFormData((prev) => ({
            ...prev,
            order_lines: [...prev.order_lines, { product_id: 0, quantity: 0 }]
        }));
    };

    const removeProductRow = (index: number): void => {
        const updatedLines = formData.order_lines.filter((_, i) => i !== index);
        setFormData((prev) => ({
            ...prev,
            order_lines: updatedLines
        }));
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setLoading(true);

        try {
            const validLines = formData.order_lines.filter(l => l.product_id > 0 && l.quantity > 0);
            if (validLines.length === 0) {
                alert('Please add at least one product.');
                setLoading(false);
                return;
            }

            if (formData.customer_id === 0) {
                alert('Please select a customer.');
                setLoading(false);
                return;
            }

            // ✅ Ensure payment_method is correctly typed
            const orderData = {
                customer_id: formData.customer_id,
                order_date: formData.order_date,
                delivery_date: formData.delivery_date,
                payment_method: formData.payment_method,
                order_lines: validLines
            };

            await OrderAPI.create(orderData);
            navigate('/orders');
        } catch (error: unknown) {
            const errorMessage = error && typeof error === 'object' && 'response' in error 
                ? (error as { response: { data?: { error?: string } } }).response.data?.error 
                : 'Error creating order';
            alert(errorMessage || 'Error creating order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="order-form">
            <div className="page-header">
                <h1>New Order</h1>
                <button className="btn-secondary" onClick={() => navigate('/orders')}>
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Customer *</label>
                        <select
                            name="customer_id"
                            value={formData.customer_id}
                            onChange={handleChange}
                            required
                        >
                            <option value={0}>Select Customer</option>
                            {customers.map((c) => (
                                <option key={c.customer_id} value={c.customer_id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Order Date *</label>
                        <input
                            type="date"
                            name="order_date"
                            value={formData.order_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Delivery Date</label>
                        <input
                            type="date"
                            name="delivery_date"
                            value={formData.delivery_date}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Payment Method</label>
                        <select
                            name="payment_method"
                            value={formData.payment_method}
                            onChange={handleChange}
                        >
                            <option value="cash">Cash</option>
                            <option value="mobile_money">Mobile Money</option>
                            <option value="credit">Credit</option>
                        </select>
                    </div>
                </div>

                <div className="products-section">
                    <div className="products-header">
                        <h3>Order Items</h3>
                        <button type="button" className="btn-sm btn-primary" onClick={addProductRow}>
                            + Add Item
                        </button>
                    </div>

                    {formData.order_lines.map((item, index) => (
                        <div key={index} className="product-row">
                            <select
                                value={item.product_id}
                                onChange={(e) => handleProductChange(index, 'product_id', e.target.value)}
                            >
                                <option value={0}>Select Product</option>
                                {products.map((p) => (
                                    <option key={p.product_id} value={p.product_id}>
                                        {p.flavour_name} - {p.size_name}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                value={item.quantity || ''}
                                onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                placeholder="Qty"
                                min="1"
                            />

                            <button
                                type="button"
                                className="btn-sm btn-danger"
                                onClick={() => removeProductRow(index)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    {formData.order_lines.length === 0 && (
                        <p className="no-products">No items added yet.</p>
                    )}
                </div>

                <button type="submit" className="btn-primary submit-btn" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Order'}
                </button>
            </form>
        </div>
    );
};

export default OrderForm;