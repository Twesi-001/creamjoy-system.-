import React, { useState, useEffect, useCallback } from 'react';
import { RawMaterialAPI, SupplierAPI } from '../../api/api';
import './RawMaterialList.css';

interface RawMaterial {
    material_id: number;
    material_name: string;
    unit: string;
    cost_per_unit_ugx: number;
    current_stock: number;
    minimum_stock: number;
    last_restocked: string;
    supplier_id: number;
    supplier_name?: string;
}

interface Supplier {
    supplier_id: number;
    supplier_name: string;
}

interface FormData {
    material_name: string;
    unit: string;
    cost_per_unit_ugx: number;
    current_stock: number;
    minimum_stock: number;
    supplier_id: number;
    last_restocked: string;
}

const RawMaterialList: React.FC = () => {
    const [materials, setMaterials] = useState<RawMaterial[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
    const [formData, setFormData] = useState<FormData>({
        material_name: '',
        unit: '',
        cost_per_unit_ugx: 0,
        current_stock: 0,
        minimum_stock: 0,
        supplier_id: 0,
        last_restocked: new Date().toISOString().split('T')[0]
    });

    // ✅ Define fetchData with useCallback
    const fetchData = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError('');
        try {
            const [materialsRes, suppliersRes] = await Promise.all([
                RawMaterialAPI.getAll(),
                SupplierAPI.getAll()
            ]);
            setMaterials((materialsRes.data || []) as RawMaterial[]);
            setSuppliers((suppliersRes.data || []) as Supplier[]);
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'response' in err 
                ? (err as { response: { data?: { error?: string } } }).response.data?.error 
                : 'Failed to fetch data';
            setError(errorMessage || 'Failed to fetch data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ useEffect with cleanup
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingMaterial) {
                await RawMaterialAPI.update(editingMaterial.material_id, formData);
            } else {
                await RawMaterialAPI.create(formData);
            }
            setShowForm(false);
            setEditingMaterial(null);
            setFormData({
                material_name: '',
                unit: '',
                cost_per_unit_ugx: 0,
                current_stock: 0,
                minimum_stock: 0,
                supplier_id: 0,
                last_restocked: new Date().toISOString().split('T')[0]
            });
            await fetchData();
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'response' in err 
                ? (err as { response: { data?: { error?: string } } }).response.data?.error 
                : 'Failed to save material';
            setError(errorMessage || 'Failed to save material');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (material: RawMaterial): void => {
        setEditingMaterial(material);
        setFormData({
            material_name: material.material_name,
            unit: material.unit,
            cost_per_unit_ugx: material.cost_per_unit_ugx,
            current_stock: material.current_stock,
            minimum_stock: material.minimum_stock,
            supplier_id: material.supplier_id || 0,
            last_restocked: material.last_restocked || new Date().toISOString().split('T')[0]
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number): Promise<void> => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;
        try {
            await RawMaterialAPI.delete(id);
            await fetchData();
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'response' in err 
                ? (err as { response: { data?: { error?: string } } }).response.data?.error 
                : 'Failed to delete material';
            setError(errorMessage || 'Failed to delete material');
        }
    };

    const handleStockUpdate = async (id: number, action: 'add' | 'subtract'): Promise<void> => {
        const quantity = prompt(`Enter quantity to ${action}:`, '10');
        if (!quantity) return;
        const qty = parseFloat(quantity);
        if (isNaN(qty) || qty <= 0) {
            alert('Please enter a valid quantity');
            return;
        }
        try {
            await RawMaterialAPI.updateStock(id, qty, action);
            await fetchData();
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'response' in err 
                ? (err as { response: { data?: { error?: string } } }).response.data?.error 
                : `Failed to ${action} stock`;
            setError(errorMessage || `Failed to ${action} stock`);
        }
    };

    const handleCancel = (): void => {
        setShowForm(false);
        setEditingMaterial(null);
        setFormData({
            material_name: '',
            unit: '',
            cost_per_unit_ugx: 0,
            current_stock: 0,
            minimum_stock: 0,
            supplier_id: 0,
            last_restocked: new Date().toISOString().split('T')[0]
        });
    };

    const getSupplierName = (supplierId: number): string => {
        const supplier = suppliers.find(s => s.supplier_id === supplierId);
        return supplier?.supplier_name || 'N/A';
    };

    const isLowStock = (material: RawMaterial): boolean => {
        return material.current_stock <= material.minimum_stock;
    };

    return (
        <div className="raw-material-list">
            <div className="page-header">
                <h1>📦 Raw Materials</h1>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    + Add Material
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingMaterial ? 'Edit Material' : 'Add New Material'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Material Name *</label>
                                <input
                                    type="text"
                                    name="material_name"
                                    value={formData.material_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Unit *</label>
                                    <input
                                        type="text"
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                        placeholder="kg, L, pieces"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Cost per Unit (UGX) *</label>
                                    <input
                                        type="number"
                                        name="cost_per_unit_ugx"
                                        value={formData.cost_per_unit_ugx}
                                        onChange={handleInputChange}
                                        step="100"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Current Stock</label>
                                    <input
                                        type="number"
                                        name="current_stock"
                                        value={formData.current_stock}
                                        onChange={handleInputChange}
                                        step="0.01"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Minimum Stock *</label>
                                    <input
                                        type="number"
                                        name="minimum_stock"
                                        value={formData.minimum_stock}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Supplier</label>
                                    <select
                                        name="supplier_id"
                                        value={formData.supplier_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value={0}>Select Supplier</option>
                                        {suppliers.map((s) => (
                                            <option key={s.supplier_id} value={s.supplier_id}>
                                                {s.supplier_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Last Restocked</label>
                                    <input
                                        type="date"
                                        name="last_restocked"
                                        value={formData.last_restocked}
                                        onChange={handleInputChange}
                                    />
                                </div>
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
                <div className="loading">Loading materials...</div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Unit</th>
                                <th>Cost/Unit (UGX)</th>
                                <th>Current Stock</th>
                                <th>Min Stock</th>
                                <th>Supplier</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materials.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="empty-state">
                                        No materials found. Click "Add Material" to create one.
                                    </td>
                                </tr>
                            ) : (
                                materials.map((material) => (
                                    <tr key={material.material_id} className={isLowStock(material) ? 'low-stock-row' : ''}>
                                        <td><strong>{material.material_name}</strong></td>
                                        <td>{material.unit}</td>
                                        <td>{material.cost_per_unit_ugx.toLocaleString()}</td>
                                        <td>{material.current_stock}</td>
                                        <td>{material.minimum_stock}</td>
                                        <td>{material.supplier_id ? getSupplierName(material.supplier_id) : 'N/A'}</td>
                                        <td>
                                            {isLowStock(material) ? (
                                                <span className="badge badge-danger">⚠️ Low Stock</span>
                                            ) : (
                                                <span className="badge badge-success">✅ In Stock</span>
                                            )}
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-sm btn-add"
                                                onClick={() => handleStockUpdate(material.material_id, 'add')}
                                                title="Add Stock"
                                            >
                                                ➕
                                            </button>
                                            <button 
                                                className="btn-sm btn-remove"
                                                onClick={() => handleStockUpdate(material.material_id, 'subtract')}
                                                title="Remove Stock"
                                            >
                                                ➖
                                            </button>
                                            <button 
                                                className="btn-sm btn-edit"
                                                onClick={() => handleEdit(material)}
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                className="btn-sm btn-delete"
                                                onClick={() => handleDelete(material.material_id)}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RawMaterialList;