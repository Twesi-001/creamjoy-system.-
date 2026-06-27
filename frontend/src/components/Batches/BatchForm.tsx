import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BatchAPI, ProductAPI } from '../../api/api';
import './BatchForm.css';

const BatchForm: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        batch_number: '',
        batch_date: new Date().toISOString().split('T')[0],
        supervisor_id: 1,
        notes: '',
        products: [] as { product_id: number; quantity: number }[]
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await ProductAPI.getAll();
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleProductChange = (index: number, field: string, value: any) => {
        const updatedProducts = [...formData.products];
        updatedProducts[index] = {
            ...updatedProducts[index],
            [field]: field === 'product_id' ? parseInt(value) : parseInt(value)
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
        setLoading(true);

        try {
            const validProducts = formData.products.filter(p => p.product_id > 0 && p.quantity > 0);
            if (validProducts.length === 0) {
                alert('Please add at least one product with quantity.');
                setLoading(false);
                return;
            }

            await BatchAPI.create({
                ...formData,
                products: validProducts
            });

            navigate('/batches');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Error creating batch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="batch-form">
            <div className="page-header">
                <h1>Record New Batch</h1>
                <button className="btn-secondary" onClick={() => navigate('/batches')}>
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Batch Number *</label>
                        <input
                            type="text"
                            name="batch_number"
                            value={formData.batch_number}
                            onChange={handleChange}
                            placeholder="e.g., 09"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Batch Date *</label>
                        <input
                            type="date"
                            name="batch_date"
                            value={formData.batch_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Supervisor</label>
                        <select
                            name="supervisor_id"
                            value={formData.supervisor_id}
                            onChange={handleChange}
                        >
                            <option value="1">Jack</option>
                            <option value="2">Namuyanja</option>
                            <option value="6">Alex</option>
                            <option value="7">Levi</option>
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Notes</label>
                        <textarea
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
                        <h3>Products Produced</h3>
                        <button type="button" className="btn-sm btn-primary" onClick={addProductRow}>
                            + Add Product
                        </button>
                    </div>

                    {formData.products.map((item, index) => (
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
                                placeholder="Quantity"
                                min="0"
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

                    {formData.products.length === 0 && (
                        <p className="no-products">No products added yet. Click "Add Product" to start.</p>
                    )}
                </div>

                <button type="submit" className="btn-primary submit-btn" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Batch'}
                </button>
            </form>
        </div>
    );
};

export default BatchForm;