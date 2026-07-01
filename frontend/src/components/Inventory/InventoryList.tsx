import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { InventoryAPI, RawMaterialAPI } from '../../api/api';
import './InventoryList.css';

interface InventoryItem {
    material_id: number;
    material_name: string;
    unit: string;
    current_stock: number;
    minimum_stock: number;
    low_stock?: boolean;
    cost_per_unit_ugx?: number;
    last_restocked?: string | null;
    supplier_name?: string | null;
}

interface FormData {
    material_name: string;
    unit: string;
    cost_per_unit_ugx: number;
    current_stock: number;
    minimum_stock: number;
    last_restocked: string;
}

const initialFormData: FormData = {
    material_name: '',
    unit: '',
    cost_per_unit_ugx: 0,
    current_stock: 0,
    minimum_stock: 0,
    last_restocked: new Date().toISOString().split('T')[0]
};

const InventoryList: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<FormData>(initialFormData);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await InventoryAPI.getAll();
            setInventory((response.data || []) as InventoryItem[]);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setError('Unable to load inventory right now. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchInventory();
    }, [fetchInventory]);

    const summary = useMemo(() => ({
        total: inventory.length,
        lowStock: inventory.filter((item) => item.low_stock || item.current_stock <= item.minimum_stock).length
    }), [inventory]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'material_name' || name === 'unit' || name === 'last_restocked'
                ? value
                : Number(value)
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSuccessMessage('');

        try {
            await RawMaterialAPI.create(formData);
            setSuccessMessage('Inventory item added successfully.');
            setFormData(initialFormData);
            setShowForm(false);
            await fetchInventory();
            window.setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            console.error('Error creating inventory item:', err);
            setError('Failed to add inventory item.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="inventory-list">
            <div className="page-header">
                <div className="page-header-text">
                    <h1>
                        <i className="bi bi-boxes" aria-hidden="true"></i>
                        Inventory
                    </h1>
                    <p>Raw Materials & Stock Levels</p>
                </div>
                <div className="page-header-stats">
                    <span className="stat-pill">
                        <i className="bi bi-box-seam" aria-hidden="true"></i>
                        {summary.total} items
                    </span>
                    <span className="stat-pill stat-pill-warning">
                        <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
                        {summary.lowStock} low stock
                    </span>
                    <button className="btn-primary" onClick={() => setShowForm((prev) => !prev)}>
                        <i className={`bi ${showForm ? 'bi-x-circle' : 'bi-plus-circle'}`} aria-hidden="true"></i>
                        {showForm ? 'Close Form' : 'Add Inventory'}
                    </button>
                </div>
            </div>

            {successMessage && (
                <div className="success-message" role="status">
                    <i className="bi bi-check-circle" aria-hidden="true"></i>
                    <span>{successMessage}</span>
                </div>
            )}

            {error && (
                <div className="error-message" role="alert">
                    <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                    <span>{error}</span>
                    <button className="btn-retry" onClick={fetchInventory}>
                        <i className="bi bi-arrow-repeat" aria-hidden="true"></i>
                        Retry
                    </button>
                </div>
            )}

            {showForm && (
                <div className="form-card">
                    <div className="form-card-header">
                        <h2>Add Inventory Item</h2>
                        <p>This creates a new raw material record that appears in inventory.</p>
                    </div>
                    <form className="inventory-form" onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="material_name">Material Name</label>
                                <input id="material_name" name="material_name" value={formData.material_name} onChange={handleInputChange} placeholder="e.g. Milk powder" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="unit">Unit</label>
                                <input id="unit" name="unit" value={formData.unit} onChange={handleInputChange} placeholder="kg, L, pieces" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="cost_per_unit_ugx">Cost per Unit (UGX)</label>
                                <input id="cost_per_unit_ugx" name="cost_per_unit_ugx" type="number" min="0" value={formData.cost_per_unit_ugx} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="current_stock">Current Stock</label>
                                <input id="current_stock" name="current_stock" type="number" min="0" value={formData.current_stock} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="minimum_stock">Minimum Stock</label>
                                <input id="minimum_stock" name="minimum_stock" type="number" min="0" value={formData.minimum_stock} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="last_restocked">Last Restocked</label>
                                <input id="last_restocked" name="last_restocked" type="date" value={formData.last_restocked} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Inventory Item'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="state-panel">
                    <i className="bi bi-arrow-repeat spin" aria-hidden="true"></i>
                    <p>Loading inventory...</p>
                </div>
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
                            {inventory.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="empty-state">No inventory items found. Add one to get started.</td>
                                </tr>
                            ) : (
                                inventory.map((item) => {
                                    const isLowStock = item.low_stock || item.current_stock <= item.minimum_stock;
                                    return (
                                        <tr key={item.material_id} className={isLowStock ? 'low-stock-row' : ''}>
                                            <td><strong>{item.material_name}</strong></td>
                                            <td>{item.unit}</td>
                                            <td>{item.current_stock}</td>
                                            <td>{item.minimum_stock}</td>
                                            <td>
                                                {isLowStock ? (
                                                    <span className="badge badge-danger">⚠️ Low Stock</span>
                                                ) : (
                                                    <span className="badge badge-success">✓ In Stock</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InventoryList;