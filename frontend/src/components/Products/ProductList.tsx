
import React, { useState, useEffect } from 'react';
import { ProductAPI } from '../../api/api';
import './ProductList.css';

interface Product {
    product_id: number;
    flavour_id: number;
    size_id: number;
    flavour_name: string;
    size_name: string;
    unit_price: number;
}

interface Flavour {
    flavour_id: number;
    flavour_name: string;
}

interface PackSize {
    size_id: number;
    size_name: string;
}

interface ApiError {
    response?: {
        data?: {
            error?: string;
        };
        status?: number;
    };
    message?: string;
}

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [flavours, setFlavours] = useState<Flavour[]>([]);
    const [packSizes, setPackSizes] = useState<PackSize[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        flavour_id: 0,
        size_id: 0,
        unit_price: 0
    });
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const fetchData = async (): Promise<void> => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const [productsRes, flavoursRes, sizesRes] = await Promise.all([
                ProductAPI.getAll(),
                ProductAPI.getFlavours(),
                ProductAPI.getPackSizes()
            ]);
            setProducts((productsRes.data || []) as Product[]);
            setFlavours((flavoursRes.data || []) as Flavour[]);
            setPackSizes((sizesRes.data || []) as PackSize[]);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const loadData = async (): Promise<void> => {
            if (isMounted) {
                await fetchData();
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'unit_price' ? parseFloat(value) || 0 : parseInt(value, 10) || 0
        }));
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            let successMessage = '';
            
            if (editingProduct) {
                await ProductAPI.update(editingProduct.product_id, {
                    unit_price: formData.unit_price
                });
                successMessage = `✅ Product updated successfully! (${editingProduct.flavour_name} - ${editingProduct.size_name})`;
                
                setProducts((prevProducts: Product[]) =>
                    prevProducts.map((p: Product) =>
                        p.product_id === editingProduct.product_id
                            ? { ...p, unit_price: formData.unit_price }
                            : p
                    )
                );
            } else {
                if (!formData.flavour_id || !formData.size_id) {
                    setError('❌ Please select both flavour and size.');
                    setLoading(false);
                    return;
                }
                
                const response = await ProductAPI.create({
                    flavour_id: Number(formData.flavour_id),
                    size_id: Number(formData.size_id),
                    unit_price: Number(formData.unit_price) || 0
                });
                
                const flavour = flavours.find((f: Flavour) => f.flavour_id === formData.flavour_id);
                const size = packSizes.find((s: PackSize) => s.size_id === formData.size_id);
                successMessage = `✅ Product added successfully! (${flavour?.flavour_name || ''} - ${size?.size_name || ''})`;
                
                if (response.data?.product) {
                    setProducts((prev: Product[]) => [...prev, response.data.product as Product]);
                } else {
                    await fetchData();
                }
            }
            
            setSuccess(successMessage);
            
            setTimeout(() => {
                setSuccess('');
            }, 3000);
            
            setShowForm(false);
            setEditingProduct(null);
            setFormData({
                flavour_id: 0,
                size_id: 0,
                unit_price: 0
            });
            
            if (!editingProduct) {
                await fetchData();
            }
        } catch (err: unknown) {
            const apiError = err as ApiError;
            console.error('❌ Error:', apiError);
            
            if (apiError.response?.data?.error?.includes('already exists')) {
                setError('❌ This product combination already exists. Please choose a different flavour and size.');
            } else {
                setError(apiError.response?.data?.error || 'Failed to save product');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: Product): void => {
        setEditingProduct(product);
        setFormData({
            flavour_id: product.flavour_id,
            size_id: product.size_id,
            unit_price: product.unit_price || 0
        });
        setShowForm(true);
        setError('');
        setSuccess('');
    };

    const handleDelete = async (productId: number, productName: string): Promise<void> => {
        if (!window.confirm(`Are you sure you want to delete ${productName}?`)) {
            return;
        }
        try {
            await ProductAPI.delete(productId);
            setSuccess(`✅ Product "${productName}" deleted successfully!`);
            setTimeout(() => setSuccess(''), 3000);
            // ✅ FIX: Properly filter products - returns Product[]
            setProducts((prev: Product[]) => {
                const filtered: Product[] = prev.filter((p: Product) => p.product_id !== productId);
                return filtered;
            });
        } catch (err: unknown) {
            const apiError = err as ApiError;
            alert(apiError.response?.data?.error || 'Failed to delete product');
        }
    };

    const handleCancel = (): void => {
        setShowForm(false);
        setEditingProduct(null);
        setFormData({
            flavour_id: 0,
            size_id: 0,
            unit_price: 0
        });
        setError('');
        setSuccess('');
    };

    const filteredProducts: Product[] = products.filter((product: Product) =>
        product.flavour_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.size_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="product-list">
            <div className="page-header">
                <h1>Products</h1>
                <div className="product-stats">
                    <span className="stat-badge">
                        Total: {products.length} products
                    </span>
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        + Add Product
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by flavour or size..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
                        
                        {success && <div className="success-message">{success}</div>}
                        {error && <div className="error-message">{error}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            {!editingProduct && (
                                <>
                                    <div className="form-group">
                                        <label>Flavour *</label>
                                        <select
                                            name="flavour_id"
                                            value={formData.flavour_id}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value={0}>Select Flavour</option>
                                            {flavours.map((f: Flavour) => (
                                                <option key={f.flavour_id} value={f.flavour_id}>
                                                    {f.flavour_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Size *</label>
                                        <select
                                            name="size_id"
                                            value={formData.size_id}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value={0}>Select Size</option>
                                            {packSizes.map((s: PackSize) => (
                                                <option key={s.size_id} value={s.size_id}>
                                                    {s.size_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}
                            {editingProduct && (
                                <div className="form-group">
                                    <label>Product</label>
                                    <input
                                        type="text"
                                        value={`${editingProduct.flavour_name} - ${editingProduct.size_name}`}
                                        disabled
                                        className="disabled-input"
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Unit Price (UGX)</label>
                                <input
                                    type="number"
                                    name="unit_price"
                                    value={formData.unit_price}
                                    onChange={handleInputChange}
                                    placeholder="Enter unit price"
                                    step="100"
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Note: All 8 flavours × 4 sizes already exist.</label>
                                <small style={{ color: '#6c757d' }}>
                                    To add a new product, you need to add a new flavour or size first.
                                </small>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                                </button>
                                <button type="button" className="btn-secondary" onClick={handleCancel}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading-state">
                    <p>Loading products...</p>
                </div>
            ) : (
                <div className="products-grid">
                    {filteredProducts.length === 0 ? (
                        <div className="empty-state">
                            <p>No products found matching your search.</p>
                        </div>
                    ) : (
                        filteredProducts.map((product: Product) => (
                            <div key={product.product_id} className="product-card">
                                <div className="product-icon">
                                    🥛
                                </div>
                                <div className="product-info">
                                    <h3 className="product-name">{product.flavour_name}</h3>
                                    <span className="product-size">{product.size_name}</span>
                                    <div className="product-price">
                                        {product.unit_price ? (
                                            <span>UGX {product.unit_price.toLocaleString()}</span>
                                        ) : (
                                            <span className="price-unset">Price not set</span>
                                        )}
                                    </div>
                                    <div className="product-actions">
                                        <button 
                                            className="btn-sm btn-edit"
                                            onClick={() => handleEdit(product)}
                                            title="Edit Price"
                                        >
                                            ✏️
                                        </button>
                                        <button 
                                            className="btn-sm btn-delete"
                                            onClick={() => handleDelete(product.product_id, `${product.flavour_name} - ${product.size_name}`)}
                                            title="Delete Product"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductList;