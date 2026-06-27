import React, { useState, useEffect } from 'react';
import { InventoryAPI } from '../../api/api';
import './InventoryList.css';

const InventoryList: React.FC = () => {
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await InventoryAPI.getAll();
            setInventory(response.data || []);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="inventory-list">
            <div className="page-header">
                <h1>Inventory</h1>
                <p>Raw Materials & Stock Levels</p>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Unit</th>
                                <th>Current Stock</th>
                                <th>Minimum Stock</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map((item) => (
                                <tr key={item.material_id} className={item.low_stock ? 'low-stock-row' : ''}>
                                    <td><strong>{item.material_name}</strong></td>
                                    <td>{item.unit}</td>
                                    <td>{item.current_stock}</td>
                                    <td>{item.minimum_stock}</td>
                                    <td>
                                        {item.low_stock ? (
                                            <span className="badge badge-danger">⚠️ Low Stock</span>
                                        ) : (
                                            <span className="badge badge-success">✓ In Stock</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InventoryList;