import React, { useState, useEffect, useCallback } from 'react';
import { SupplierAPI } from '../../api/api';
import './SupplierList.css';

interface Supplier {
    supplier_id: number;
    supplier_name: string;
    contact_person: string;
    phone: string;
    email: string;
    location: string;
    notes: string;
    created_at: string;
}

interface FormData {
    supplier_name: string;
    contact_person: string;
    phone: string;
    email: string;
    location: string;
    notes: string;
}

const SupplierList: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState<FormData>({
        supplier_name: '',
        contact_person: '',
        phone: '',
        email: '',
        location: '',
        notes: ''
    });

    // ✅ Define fetchSuppliers with useCallback
    const fetchSuppliers = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError('');
        try {
            const response = await SupplierAPI.getAll();
            setSuppliers((response.data || []) as Supplier[]);
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'response' in err 
                ? (err as { response: { data?: { error?: string } } }).response.data?.error 
                : 'Failed to fetch suppliers';
            setError(errorMessage || 'Failed to fetch suppliers');
            console.error('Error fetching suppliers:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ useEffect with cleanup
    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            if (isMounted) {
                await fetchSuppliers();
            }
        };
        loadData();
        return () => {
            isMounted = false;
        };
    }, [fetchSuppliers]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingSupplier) {
                await SupplierAPI.update(editingSupplier.supplier_id, formData);
            } else {
                await SupplierAPI.create(formData);
            }
            setShowForm(false);
            setEditingSupplier(null);
            setFormData({
                supplier_name: '',
                contact_person: '',
                phone: '',
                email: '',
                location: '',
                notes: ''
            });
            await fetchSuppliers();
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'response' in err 
                ? (err as { response: { data?: { error?: string } } }).response.data?.error 
                : 'Failed to save supplier';
            setError(errorMessage || 'Failed to save supplier');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (supplier: Supplier): void => {
        setEditingSupplier(supplier);
        setFormData({
            supplier_name: supplier.supplier_name,
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            location: supplier.location || '',
            notes: supplier.notes || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number): Promise<void> => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;
        try {
            await SupplierAPI.delete(id);
            await fetchSuppliers();
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'response' in err 
                ? (err as { response: { data?: { error?: string } } }).response.data?.error 
                : 'Failed to delete supplier';
            setError(errorMessage || 'Failed to delete supplier');
        }
    };

    const handleCancel = (): void => {
        setShowForm(false);
        setEditingSupplier(null);
        setFormData({
            supplier_name: '',
            contact_person: '',
            phone: '',
            email: '',
            location: '',
            notes: ''
        });
    };

    return (
        <div className="supplier-list">
            <div className="page-header">
                <h1>📦 Suppliers</h1>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    + Add Supplier
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Supplier Name *</label>
                                <input
                                    type="text"
                                    name="supplier_name"
                                    value={formData.supplier_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Person</label>
                                <input
                                    type="text"
                                    name="contact_person"
                                    value={formData.contact_person}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={3}
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
                <div className="loading">Loading suppliers...</div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact Person</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Location</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="empty-state">
                                        No suppliers found. Click "Add Supplier" to create one.
                                    </td>
                                </tr>
                            ) : (
                                suppliers.map((supplier) => (
                                    <tr key={supplier.supplier_id}>
                                        <td><strong>{supplier.supplier_name}</strong></td>
                                        <td>{supplier.contact_person || '-'}</td>
                                        <td>{supplier.phone || '-'}</td>
                                        <td>{supplier.email || '-'}</td>
                                        <td>{supplier.location || '-'}</td>
                                        <td>
                                            <button 
                                                className="btn-sm btn-edit"
                                                onClick={() => handleEdit(supplier)}
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                className="btn-sm btn-delete"
                                                onClick={() => handleDelete(supplier.supplier_id)}
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

export default SupplierList;