
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

    useEffect(() => {
        let isMounted = true;
        const fetchData = async (): Promise<void> => {
            setLoading(true);
            setError('');
            try {
                const [productsRes, flavoursRes, sizesRes] = await Promise.all([
                    ProductAPI.getAll(),
                    ProductAPI.getFlavours(),
                    ProductAPI.getPackSizes()
                ]);
                if (isMounted) {
                    setProducts((productsRes.data || []) as Product[]);
                    setFlavours((flavoursRes.data || []) as Flavour[]);
                    setPackSizes((sizesRes.data || []) as PackSize[]);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Error fetching data:', err);
                    setError('Failed to load data');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

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
        try {
            if (editingProduct) {
                await ProductAPI.update(editingProduct.product_id, {
                    unit_price: formData.unit_price
                });
            } else {
                await ProductAPI.create(formData);
            }
            setShowForm(false);
            setEditingProduct(null);
            setFormData({
                flavour_id: 0,
                size_id: 0,
                unit_price: 0
            });
            // Refetch data
            const [productsRes] = await Promise.all([
                ProductAPI.getAll()
            ]);
            setProducts((productsRes.data || []) as Product[]);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError.response?.data?.error || 'Failed to save product');
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
    };

    const handleDelete = async (productId: number, productName: string): Promise<void> => {
        if (!window.confirm(`Are you sure you want to delete ${productName}?`)) return;
        try {
            await ProductAPI.delete(productId);
            const [productsRes] = await Promise.all([
                ProductAPI.getAll()
            ]);
            setProducts((productsRes.data || []) as Product[]);
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
    };

    const filteredProducts = products.filter((product: Product) =>
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
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
                            <div className="form-actions">
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save'}
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