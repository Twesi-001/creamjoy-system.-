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
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [showForm, setShowForm] = useState<boolean>(false);
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState<FormData>({
        supplier_name: '',
        contact_person: '',
        phone: '',
        email: '',
        location: '',
        notes: ''
    });
    const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

    const fetchSuppliers = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
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

    const validateForm = (): boolean => {
        const errors: Partial<FormData> = {};
        
        if (!formData.supplier_name.trim()) {
            errors.supplier_name = 'Supplier name is required';
        }
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user types
        if (formErrors[name as keyof FormData]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');
        
        try {
            if (editingSupplier) {
                await SupplierAPI.update(editingSupplier.supplier_id, formData);
                setSuccessMessage('Supplier updated successfully');
            } else {
                await SupplierAPI.create(formData);
                setSuccessMessage('Supplier added successfully');
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
            setFormErrors({});
            await fetchSuppliers();
            // Auto-dismiss success message after 5 seconds
            setTimeout(() => setSuccessMessage(''), 5000);
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
        setFormErrors({});
        setShowForm(true);
    };

    const handleDeleteClick = (id: number): void => {
        setSupplierToDelete(id);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async (): Promise<void> => {
        if (!supplierToDelete) return;
        
        setLoading(true);
        setError('');
        setShowConfirmModal(false);
        
        try {
            await SupplierAPI.delete(supplierToDelete);
            setSuccessMessage('Supplier deleted successfully');
            await fetchSuppliers();
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'response' in err 
                ? (err as { response: { data?: { error?: string } } }).response.data?.error 
                : 'Failed to delete supplier';
            setError(errorMessage || 'Failed to delete supplier');
        } finally {
            setLoading(false);
            setSupplierToDelete(null);
        }
    };

    const handleCancelDelete = (): void => {
        setShowConfirmModal(false);
        setSupplierToDelete(null);
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
        setFormErrors({});
    };

    const formatValue = (value: string | undefined | null): string => {
        if (!value || value.trim() === '') {
            return 'Not provided';
        }
        return value;
    };

    const getSupplierCount = (): number => suppliers.length;

    if (loading && suppliers.length === 0) {
        return (
            <div className="supplier-list">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading suppliers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="supplier-list">
            <div className="page-header">
                <div className="header-left">
                    <div className="header-icon">
                        <i className="bi bi-building"></i>
                    </div>
                    <div>
                        <h1>Suppliers</h1>
                        <p className="header-subtitle">Manage your supplier contacts and information</p>
                    </div>
                </div>
                <div className="header-actions">
                    <span className="supplier-count">{getSupplierCount()} supplier{getSupplierCount() !== 1 ? 's' : ''}</span>
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        <i className="bi bi-plus-circle"></i>
                        Add Supplier
                    </button>
                </div>
            </div>

            {successMessage && (
                <div className="success-message">
                    <i className="bi bi-check-circle"></i>
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="error-message">
                    <i className="bi bi-exclamation-circle"></i>
                    <span>{error}</span>
                    <button className="btn-retry" onClick={fetchSuppliers}>
                        <i className="bi bi-arrow-repeat"></i>
                        Retry
                    </button>
                </div>
            )}

            {showForm && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>
                                <i className="bi bi-building"></i>
                                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                            </h2>
                            <button 
                                className="modal-close" 
                                onClick={handleCancel}
                                aria-label="Close form"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label htmlFor="supplier_name">
                                    <i className="bi bi-building"></i>
                                    Supplier Name <span className="required">*</span>
                                </label>
                                <input
                                    id="supplier_name"
                                    type="text"
                                    name="supplier_name"
                                    value={formData.supplier_name}
                                    onChange={handleInputChange}
                                    className={formErrors.supplier_name ? 'error' : ''}
                                    placeholder="Enter supplier name"
                                    required
                                />
                                {formErrors.supplier_name && (
                                    <span className="field-error">{formErrors.supplier_name}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="contact_person">
                                    <i className="bi bi-person-badge"></i>
                                    Contact Person
                                </label>
                                <input
                                    id="contact_person"
                                    type="text"
                                    name="contact_person"
                                    value={formData.contact_person}
                                    onChange={handleInputChange}
                                    placeholder="Enter contact person name"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="phone">
                                        <i className="bi bi-telephone"></i>
                                        Phone
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">
                                        <i className="bi bi-envelope"></i>
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={formErrors.email ? 'error' : ''}
                                        placeholder="Enter email address"
                                    />
                                    {formErrors.email && (
                                        <span className="field-error">{formErrors.email}</span>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">
                                    <i className="bi bi-geo-alt"></i>
                                    Location
                                </label>
                                <input
                                    id="location"
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Enter location"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="notes">
                                    <i className="bi bi-card-text"></i>
                                    Notes
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Enter any additional notes..."
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner-small"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle"></i>
                                            {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                                        </>
                                    )}
                                </button>
                                <button type="button" className="btn-secondary" onClick={handleCancel}>
                                    <i className="bi bi-x-lg"></i>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-content modal-confirm">
                        <div className="modal-header">
                            <h2>
                                <i className="bi bi-exclamation-triangle"></i>
                                Confirm Delete
                            </h2>
                            <button 
                                className="modal-close" 
                                onClick={handleCancelDelete}
                                aria-label="Close confirmation"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete this supplier?</p>
                            <p className="text-muted">This action cannot be undone.</p>
                        </div>
                        <div className="form-actions">
                            <button className="btn-danger" onClick={handleConfirmDelete}>
                                <i className="bi bi-trash"></i>
                                Delete
                            </button>
                            <button className="btn-secondary" onClick={handleCancelDelete}>
                                <i className="bi bi-x-lg"></i>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Supplier</th>
                            <th>Contact</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Location</th>
                            <th className="actions-header">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="empty-state">
                                    <div className="empty-state-content">
                                        <i className="bi bi-inbox"></i>
                                        <p>No suppliers found</p>
                                        <span>Click "Add Supplier" to create your first supplier</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            suppliers.map((supplier) => (
                                <tr key={supplier.supplier_id}>
                                    <td>
                                        <div className="supplier-name-cell">
                                            <i className="bi bi-building"></i>
                                            <span className="supplier-name">{supplier.supplier_name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <i className="bi bi-person-badge"></i>
                                            {formatValue(supplier.contact_person)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="phone-cell">
                                            <i className="bi bi-telephone"></i>
                                            {formatValue(supplier.phone)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="email-cell">
                                            <i className="bi bi-envelope"></i>
                                            {formatValue(supplier.email)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="location-cell">
                                            <i className="bi bi-geo-alt"></i>
                                            {formatValue(supplier.location)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-sm btn-edit"
                                                onClick={() => handleEdit(supplier)}
                                                aria-label={`Edit ${supplier.supplier_name}`}
                                                title="Edit supplier"
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                            <button 
                                                className="btn-sm btn-delete"
                                                onClick={() => handleDeleteClick(supplier.supplier_id)}
                                                aria-label={`Delete ${supplier.supplier_name}`}
                                                title="Delete supplier"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SupplierList;

