import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BatchAPI, ProductAPI } from '../../api/api';
import './BatchForm.css';

interface Product {
    product_id: number;
    flavour_name: string;
    size_name: string;
}

interface ProductEntry {
    product_id: number;
    quantity: number;
}

interface BatchFormData {
    batch_number: string;
    batch_date: string;
    supervisor_id: number;
    notes: string;
    products: ProductEntry[];
}

const SUPERVISORS = [
    { id: 1, name: 'Jack' },
    { id: 2, name: 'Namuyanja' },
    { id: 6, name: 'Alex' },
    { id: 7, name: 'Levi' }
];

const BatchForm: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState<BatchFormData>({
        batch_number: '',
        batch_date: new Date().toISOString().split('T')[0],
        supervisor_id: 1,
        notes: '',
        products: []
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await ProductAPI.getAll();
            setProducts((response.data || []) as Product[]);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'supervisor_id' ? parseInt(value, 10) : value
        }));
    };

    const handleProductChange = (index: number, field: keyof ProductEntry, value: string) => {
        const updatedProducts = [...formData.products];
        updatedProducts[index] = {
            ...updatedProducts[index],
            [field]: parseInt(value, 10) || 0
        };
        setFormData({
            ...formData,
            products: updatedProducts
        });
    };

    const addProductRow = () => {
        setFormData({
            ...formData,
            products: [...formData.products, { product_id: 0, quantity: 0 }]
        });
    };

    const removeProductRow = (index: number) => {
        const updatedProducts = formData.products.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            products: updatedProducts
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        const validProducts = formData.products.filter(p => p.product_id > 0 && p.quantity > 0);
        if (validProducts.length === 0) {
            setFormError('Please add at least one product with a valid quantity before submitting.');
            return;
        }

        setLoading(true);
        try {
            await BatchAPI.create({
                ...formData,
                products: validProducts
            });

            navigate('/batches');
        } catch (error: any) {
            setFormError(error.response?.data?.error || 'Something went wrong while creating this batch. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="batch-form">
            <div className="page-header">
                <div className="header-text">
                    <h1>
                        <i className="bi bi-box-seam" aria-hidden="true"></i>
                        Record New Batch
                    </h1>
                    <p className="page-subtitle">Log a new production batch and the products it yielded.</p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/batches')}>
                    <i className="bi bi-arrow-left" aria-hidden="true"></i>
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="form-container" noValidate>
                {formError && (
                    <div className="form-alert" role="alert" aria-live="polite">
                        <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                        <span>{formError}</span>
                    </div>
                )}

                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="batch_number">
                            <i className="bi bi-upc-scan" aria-hidden="true"></i>
                            Batch Number *
                        </label>
                        <input
                            type="text"
                            id="batch_number"
                            name="batch_number"
                            value={formData.batch_number}
                            onChange={handleChange}
                            placeholder="e.g., 09"
                            required
                            aria-required="true"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="batch_date">
                            <i className="bi bi-calendar-event" aria-hidden="true"></i>
                            Batch Date *
                        </label>
                        <input
                            type="date"
                            id="batch_date"
                            name="batch_date"
                            value={formData.batch_date}
                            onChange={handleChange}
                            required
                            aria-required="true"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="supervisor_id">
                            <i className="bi bi-person-badge" aria-hidden="true"></i>
                            Supervisor
                        </label>
                        <select
                            id="supervisor_id"
                            name="supervisor_id"
                            value={formData.supervisor_id}
                            onChange={handleChange}
                        >
                            {SUPERVISORS.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="notes">
                            <i className="bi bi-journal-text" aria-hidden="true"></i>
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Any notes about this batch..."
                            rows={3}
                        />
                    </div>
                </div>

                <div className="products-section">
                    <div className="products-header">
                        <h3>
                            <i className="bi bi-clipboard-data" aria-hidden="true"></i>
                            Products Produced
                        </h3>
                        <button type="button" className="btn btn-primary btn-sm" onClick={addProductRow}>
                            <i className="bi bi-plus-circle" aria-hidden="true"></i>
                            Add Product
                        </button>
                    </div>

                    {formData.products.length > 0 && (
                        <div className="product-row product-row-labels" aria-hidden="true">
                            <span>Product</span>
                            <span>Quantity</span>
                            <span></span>
                        </div>
                    )}

                    {formData.products.map((item, index) => (
                        <div key={index} className="product-row">
                            <select
                                aria-label={`Product for row ${index + 1}`}
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
                                aria-label={`Quantity for row ${index + 1}`}
                                value={item.quantity || ''}
                                onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                placeholder="Quantity"
                                min="0"
                            />

                            <button
                                type="button"
                                className="btn-icon btn-danger"
                                onClick={() => removeProductRow(index)}
                                aria-label={`Remove product row ${index + 1}`}
                            >
                                <i className="bi bi-trash" aria-hidden="true"></i>
                            </button>
                        </div>
                    ))}

                    {formData.products.length === 0 && (
                        <div className="empty-state">
                            <i className="bi bi-inbox" aria-hidden="true"></i>
                            <p>No products added yet. Use "Add Product" to record the batch output.</p>
                        </div>
                    )}
                </div>

                <button type="submit" className="btn btn-primary submit-btn" disabled={loading} aria-busy={loading}>
                    {loading ? (
                        <>
                            <i className="bi bi-arrow-repeat spin" aria-hidden="true"></i>
                            Creating Batch...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-check-circle" aria-hidden="true"></i>
                            Create Batch
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default BatchForm;