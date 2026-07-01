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

interface DeleteTarget {
    productId: number;
    productName: string;
}

// Helper function to get product icon based on flavour
const getProductIcon = (flavourName: string): string => {
    const name = flavourName.toLowerCase();
    if (name.includes('millet')) return 'bi-basket';
    if (name.includes('chocolate')) return 'bi-cup-hot';
    if (name.includes('strawberry')) return 'bi-heart-fill';
    if (name.includes('mango')) return 'bi-sun';
    if (name.includes('vanilla')) return 'bi-stars';
    if (name.includes('plain')) return 'bi-cup-straw';
    if (name.includes('blueberry')) return 'bi-gem';
    if (name.includes('bushela')) return 'bi-basket2';
    if (name.includes('banana')) return 'bi-tree';
    if (name.includes('apple')) return 'bi-apple';
    if (name.includes('orange')) return 'bi-circle';
    return 'bi-box-seam';
};

// Helper function to get accent styling based on flavour
const getProductAccentClass = (flavourName: string): string => {
    const name = flavourName.toLowerCase();
    if (name.includes('millet')) return 'accent-millet';
    if (name.includes('chocolate')) return 'accent-chocolate';
    if (name.includes('strawberry')) return 'accent-strawberry';
    if (name.includes('mango')) return 'accent-mango';
    if (name.includes('vanilla')) return 'accent-vanilla';
    if (name.includes('plain')) return 'accent-plain';
    if (name.includes('blueberry')) return 'accent-blueberry';
    if (name.includes('bushela')) return 'accent-bushela';
    if (name.includes('banana')) return 'accent-banana';
    if (name.includes('apple')) return 'accent-apple';
    if (name.includes('orange')) return 'accent-orange';
    return 'accent-default';
};

// Formats a numeric price as a UGX currency string
const formatPrice = (amount: number): string => `UGX ${amount.toLocaleString()}`;

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
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string>('');

    const fetchData = async (): Promise<void> => {
        setLoading(true);
        setError('');
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
            console.error('Error fetching products:', err);
            setError('Failed to load products. Please try again.');
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

    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => setSuccess(''), 3000);
        return () => clearTimeout(timer);
    }, [success]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'unit_price' ? parseFloat(value) || 0 : parseInt(value, 10) || 0
        }));
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            let successMessage = '';

            if (editingProduct) {
                await ProductAPI.update(editingProduct.product_id, {
                    unit_price: formData.unit_price
                });
                successMessage = `Price updated for ${editingProduct.flavour_name} - ${editingProduct.size_name}.`;

                setProducts((prevProducts: Product[]) =>
                    prevProducts.map((p: Product) =>
                        p.product_id === editingProduct.product_id
                            ? { ...p, unit_price: formData.unit_price }
                            : p
                    )
                );
            } else {
                if (!formData.flavour_id || !formData.size_id) {
                    setError('Please select both a flavour and a size.');
                    setSaving(false);
                    return;
                }

                const response = await ProductAPI.create({
                    flavour_id: Number(formData.flavour_id),
                    size_id: Number(formData.size_id),
                    unit_price: Number(formData.unit_price) || 0
                });

                const flavour = flavours.find((f: Flavour) => f.flavour_id === formData.flavour_id);
                const size = packSizes.find((s: PackSize) => s.size_id === formData.size_id);
                successMessage = `Product added: ${flavour?.flavour_name || ''} - ${size?.size_name || ''}.`;

                if (response.data?.product) {
                    setProducts((prev: Product[]) => [...prev, response.data.product as Product]);
                } else {
                    await fetchData();
                }
            }

            setSuccess(successMessage);
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
            console.error('Error saving product:', apiError);

            if (apiError.response?.data?.error?.includes('already exists')) {
                setError('This product combination already exists. Please choose a different flavour and size.');
            } else {
                setError(apiError.response?.data?.error || 'Failed to save product. Please try again.');
            }
        } finally {
            setSaving(false);
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
    };

    const handleDeleteClick = (productId: number, productName: string): void => {
        setDeleteError('');
        setDeleteTarget({ productId, productName });
    };

    const handleDeleteCancel = (): void => {
        setDeleteTarget(null);
        setDeleteError('');
    };

    const handleDeleteConfirm = async (): Promise<void> => {
        if (!deleteTarget) return;
        setDeleting(true);
        setDeleteError('');
        try {
            await ProductAPI.delete(deleteTarget.productId);
            setProducts((prev: Product[]) => prev.filter((p: Product) => p.product_id !== deleteTarget.productId));
            setSuccess(`Product "${deleteTarget.productName}" was deleted.`);
            setDeleteTarget(null);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setDeleteError(apiError.response?.data?.error || 'Failed to delete product. Please try again.');
        } finally {
            setDeleting(false);
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

    const filteredProducts: Product[] = products.filter((product: Product) =>
        product.flavour_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.size_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const hasProducts = products.length > 0;
    const hasSearchTerm = searchTerm.trim().length > 0;

    return (
        <div className="product-list">
            <div className="page-header">
                <div className="page-header-title">
                    <div className="page-header-icon">
                        <i className="bi bi-box-seam" aria-hidden="true"></i>
                    </div>
                    <div>
                        <h1>Products</h1>
                        <p className="page-subtitle">Manage flavour and pack size combinations and unit prices.</p>
                    </div>
                </div>
                <div className="product-stats">
                    <span className="stat-badge">
                        <i className="bi bi-tags" aria-hidden="true"></i>
                        {products.length} {products.length === 1 ? 'product' : 'products'}
                    </span>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        <i className="bi bi-plus-circle" aria-hidden="true"></i>
                        Add Product
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error" role="alert">
                    <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="alert alert-success" role="status">
                    <i className="bi bi-check-circle" aria-hidden="true"></i>
                    <span>{success}</span>
                </div>
            )}

            <div className="search-bar">
                <i className="bi bi-search search-icon" aria-hidden="true"></i>
                <label htmlFor="product-search" className="visually-hidden">Search products</label>
                <input
                    id="product-search"
                    type="text"
                    placeholder="Search by flavour or pack size..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {showForm && (
                <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 id="product-modal-title">
                                <i className={editingProduct ? 'bi bi-pencil-square' : 'bi bi-plus-circle'} aria-hidden="true"></i>
                                {editingProduct ? 'Edit Product Price' : 'Add New Product'}
                            </h2>
                            <button
                                type="button"
                                className="btn-icon-close"
                                onClick={handleCancel}
                                aria-label="Close dialog"
                            >
                                <i className="bi bi-x-lg" aria-hidden="true"></i>
                            </button>
                        </div>

                        {error && (
                            <div className="alert alert-error" role="alert">
                                <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {!editingProduct && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="flavour_id">Flavour *</label>
                                        <select
                                            id="flavour_id"
                                            name="flavour_id"
                                            value={formData.flavour_id}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value={0}>Select flavour</option>
                                            {flavours.map((f: Flavour) => (
                                                <option key={f.flavour_id} value={f.flavour_id}>
                                                    {f.flavour_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="size_id">Pack Size *</label>
                                        <select
                                            id="size_id"
                                            name="size_id"
                                            value={formData.size_id}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value={0}>Select pack size</option>
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
                                    <label htmlFor="product_name">Product</label>
                                    <input
                                        id="product_name"
                                        type="text"
                                        value={`${editingProduct.flavour_name} - ${editingProduct.size_name}`}
                                        disabled
                                        className="disabled-input"
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="unit_price">Unit Price (UGX)</label>
                                <input
                                    id="unit_price"
                                    type="number"
                                    name="unit_price"
                                    value={formData.unit_price}
                                    onChange={handleInputChange}
                                    placeholder="Enter unit price"
                                    step="100"
                                    min="0"
                                />
                            </div>
                            {!editingProduct && (
                                <p className="form-note">
                                    <i className="bi bi-info-circle" aria-hidden="true"></i>
                                    All flavour and pack size combinations already in the system cannot be duplicated.
                                    To add a new product, add a new flavour or pack size first.
                                </p>
                            )}
                            <div className="form-actions">
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <i className="bi bi-arrow-repeat spin" aria-hidden="true"></i>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle" aria-hidden="true"></i>
                                            {editingProduct ? 'Update Product' : 'Add Product'}
                                        </>
                                    )}
                                </button>
                                <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
                    <div className="modal-content modal-content-sm">
                        <div className="modal-header">
                            <h2 id="delete-modal-title">
                                <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                                Confirm Deletion
                            </h2>
                            <button
                                type="button"
                                className="btn-icon-close"
                                onClick={handleDeleteCancel}
                                aria-label="Close dialog"
                            >
                                <i className="bi bi-x-lg" aria-hidden="true"></i>
                            </button>
                        </div>

                        {deleteError && (
                            <div className="alert alert-error" role="alert">
                                <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                                <span>{deleteError}</span>
                            </div>
                        )}

                        <p className="confirm-text">
                            Are you sure you want to delete <strong>{deleteTarget.productName}</strong>? This action cannot be undone.
                        </p>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-danger"
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <i className="bi bi-arrow-repeat spin" aria-hidden="true"></i>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-trash" aria-hidden="true"></i>
                                        Delete Product
                                    </>
                                )}
                            </button>
                            <button type="button" className="btn-secondary" onClick={handleDeleteCancel} disabled={deleting}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading-state">
                    <i className="bi bi-arrow-repeat spin" aria-hidden="true"></i>
                    <p>Loading products...</p>
                </div>
            ) : (
                <div className="products-grid">
                    {filteredProducts.length === 0 ? (
                        <div className="empty-state">
                            <i className={hasSearchTerm ? 'bi bi-search' : 'bi bi-box-seam'} aria-hidden="true"></i>
                            {hasProducts && hasSearchTerm ? (
                                <>
                                    <p className="empty-state-title">No matching products</p>
                                    <p className="empty-state-text">Try a different flavour or pack size search term.</p>
                                </>
                            ) : (
                                <>
                                    <p className="empty-state-title">No products yet</p>
                                    <p className="empty-state-text">Add a product to start building your catalogue.</p>
                                </>
                            )}
                        </div>
                    ) : (
                        filteredProducts.map((product: Product) => {
                            const iconClass = getProductIcon(product.flavour_name);
                            const accentClass = getProductAccentClass(product.flavour_name);
                            
                            return (
                                <div key={product.product_id} className="product-card">
                                    <div className={`product-icon ${accentClass}`}>
                                        <i className={iconClass} aria-hidden="true"></i>
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-name">{product.flavour_name}</h3>
                                        <span className="product-size">
                                            <i className="bi bi-tags" aria-hidden="true"></i>
                                            {product.size_name}
                                        </span>
                                        <div className="product-price">
                                            {product.unit_price ? (
                                                <span>
                                                    <i className="bi bi-cash-coin" aria-hidden="true"></i>
                                                    {formatPrice(product.unit_price)}
                                                </span>
                                            ) : (
                                                <span className="price-unset">Price not set</span>
                                            )}
                                        </div>
                                        <div className="product-actions">
                                            <button
                                                type="button"
                                                className="btn-sm btn-edit"
                                                onClick={() => handleEdit(product)}
                                                aria-label={`Edit price for ${product.flavour_name} ${product.size_name}`}
                                            >
                                                <i className="bi bi-pencil-square" aria-hidden="true"></i>
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-sm btn-delete"
                                                onClick={() => handleDeleteClick(product.product_id, `${product.flavour_name} - ${product.size_name}`)}
                                                aria-label={`Delete ${product.flavour_name} ${product.size_name}`}
                                            >
                                                <i className="bi bi-trash" aria-hidden="true"></i>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductList;

