import React, { useState, useEffect } from 'react';
import { ProductAPI } from '../../api/api';
import './ProductList.css';

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await ProductAPI.getAll();
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product =>
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
                </div>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by flavour or size..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

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
                        filteredProducts.map((product) => (
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