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

const formatUgx = (amount: number): string => `UGX ${amount.toLocaleString()}`;

const extractErrorMessage = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object' && 'response' in err) {
        const message = (err as { response: { data?: { error?: string } } }).response.data?.error;
        if (message) return message;
    }
    return fallback;
};

const OrderForm: React.FC = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [formData, setFormData] = useState<FormData>({
        customer_id: 0,
        order_date: new Date().toISOString().split('T')[0],
        delivery_date: '',
        payment_method: 'cash',
        order_lines: []
    });

    const [formError, setFormError] = useState<string>('');
    const [customerError, setCustomerError] = useState<string>('');
    const [itemsError, setItemsError] = useState<string>('');

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
        if (name === 'customer_id' && value !== '0') {
            setCustomerError('');
        }
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
        setItemsError('');
    };

    const addProductRow = (): void => {
        setFormData((prev) => ({
            ...prev,
            order_lines: [...prev.order_lines, { product_id: 0, quantity: 0 }]
        }));
        setItemsError('');
    };

    const removeProductRow = (index: number): void => {
        const updatedLines = formData.order_lines.filter((_, i) => i !== index);
        setFormData((prev) => ({
            ...prev,
            order_lines: updatedLines
        }));
    };

    const getProduct = (productId: number): Product | undefined => {
        return products.find((p) => p.product_id === productId);
    };

    const estimatedTotal = formData.order_lines.reduce((sum, line) => {
        const product = getProduct(line.product_id);
        if (!product?.unit_price || !line.quantity) return sum;
        return sum + product.unit_price * line.quantity;
    }, 0);

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setFormError('');
        setCustomerError('');
        setItemsError('');

        const validLines = formData.order_lines.filter((l) => l.product_id > 0 && l.quantity > 0);

        let hasValidationError = false;

        if (formData.customer_id === 0) {
            setCustomerError('Select a customer to continue.');
            hasValidationError = true;
        }

        if (validLines.length === 0) {
            setItemsError('Add at least one product with a quantity greater than zero.');
            hasValidationError = true;
        }

        if (hasValidationError) return;

        setSubmitting(true);
        try {
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
            setFormError(extractErrorMessage(error, 'Error creating order'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="order-form">
            <div className="page-header">
                <div className="page-header-text">
                    <h1>
                        <i className="bi bi-cart-check" aria-hidden="true"></i>
                        New Order
                    </h1>
                    <p>Create a customer order</p>
                </div>
                <button type="button" className="btn-secondary" onClick={() => navigate('/orders')}>
                    <i className="bi bi-arrow-left" aria-hidden="true"></i>
                    Cancel
                </button>
            </div>

            {formError && (
                <div className="error-message">
                    <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                    <span>{formError}</span>
                    <button className="error-dismiss" onClick={() => setFormError('')} aria-label="Dismiss error">
                        <i className="bi bi-x" aria-hidden="true"></i>
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="form-container" noValidate>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="customer_id">
                            <i className="bi bi-person" aria-hidden="true"></i> Customer *
                        </label>
                        <select
                            id="customer_id"
                            name="customer_id"
                            value={formData.customer_id}
                            onChange={handleChange}
                            aria-invalid={!!customerError}
                            aria-describedby={customerError ? 'customer-error' : undefined}
                        >
                            <option value={0}>Select Customer</option>
                            {customers.map((c) => (
                                <option key={c.customer_id} value={c.customer_id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {customerError && (
                            <p className="field-error" id="customer-error">
                                <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                                {customerError}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="order_date">
                            <i className="bi bi-calendar-event" aria-hidden="true"></i> Order Date *
                        </label>
                        <input
                            id="order_date"
                            type="date"
                            name="order_date"
                            value={formData.order_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="delivery_date">
                            <i className="bi bi-calendar-event" aria-hidden="true"></i> Delivery Date
                        </label>
                        <input
                            id="delivery_date"
                            type="date"
                            name="delivery_date"
                            value={formData.delivery_date}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="payment_method">
                            <i className="bi bi-wallet2" aria-hidden="true"></i> Payment Method
                        </label>
                        <select
                            id="payment_method"
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
                        <h3>
                            <i className="bi bi-box-seam" aria-hidden="true"></i> Order Items
                        </h3>
                        <button type="button" className="btn-add-item" onClick={addProductRow}>
                            <i className="bi bi-plus-circle" aria-hidden="true"></i>
                            Add Item
                        </button>
                    </div>

                    {itemsError && (
                        <p className="field-error">
                            <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                            {itemsError}
                        </p>
                    )}

                    {formData.order_lines.map((item, index) => {
                        const product = getProduct(item.product_id);
                        const lineTotal = product?.unit_price ? product.unit_price * (item.quantity || 0) : 0;
                        return (
                            <div key={index} className="product-row">
                                <div className="product-row-fields">
                                    <select
                                        aria-label={`Product for item ${index + 1}`}
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
                                        aria-label={`Quantity for item ${index + 1}`}
                                        type="number"
                                        value={item.quantity || ''}
                                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                        placeholder="Qty"
                                        min="1"
                                    />
                                </div>

                                <div className="product-row-total">
                                    {lineTotal > 0 ? formatUgx(lineTotal) : ''}
                                </div>

                                <button
                                    type="button"
                                    className="btn-icon btn-icon-delete"
                                    onClick={() => removeProductRow(index)}
                                    aria-label={`Remove item ${index + 1}`}
                                    title="Remove item"
                                >
                                    <i className="bi bi-trash" aria-hidden="true"></i>
                                </button>
                            </div>
                        );
                    })}

                    {formData.order_lines.length === 0 && (
                        <p className="no-products">No items added yet. Click "Add Item" to begin.</p>
                    )}

                    {estimatedTotal > 0 && (
                        <div className="order-total-row">
                            <span>Estimated Total</span>
                            <strong>{formatUgx(estimatedTotal)}</strong>
                        </div>
                    )}
                </div>

                <button type="submit" className="btn-primary submit-btn" disabled={submitting}>
                    <i className="bi bi-check-circle" aria-hidden="true"></i>
                    {submitting ? 'Creating...' : 'Create Order'}
                </button>
            </form>
        </div>
    );
};

export default OrderForm;

