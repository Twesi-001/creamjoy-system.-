import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderAPI, CustomerAPI, ProductAPI } from '../../api/api';
import './OrderForm.css';

const OrderForm: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        customer_id: 0,
        order_date: new Date().toISOString().split('T')[0],
        delivery_date: '',
        payment_method: 'cash',
        order_lines: [] as { product_id: number; quantity: number }[]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [customersRes, productsRes] = await Promise.all([
                CustomerAPI.getAll(),
                ProductAPI.getAll()
            ]);
            setCustomers(customersRes.data || []);
            setProducts(productsRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleProductChange = (index: number, field: string, value: any) => {
        const updatedLines = [...formData.order_lines];
        updatedLines[index] = {
            ...updatedLines[index],
            [field]: field === 'product_id' ? parseInt(value) : parseInt(value)
        };
        setFormData({
            ...formData,
            order_lines: updatedLines
        });
    };

    const addProductRow = () => {
        setFormData({
            ...formData,
            order_lines: [...formData.order_lines, { product_id: 0, quantity: 0 }]
        });
    };

    const removeProductRow = (index: number) => {
        const updatedLines = formData.order_lines.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            order_lines: updatedLines
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
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

            await OrderAPI.create({
                ...formData,
                order_lines: validLines
            });

            navigate('/orders');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Error creating order');
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