import React, { useEffect, useMemo, useState } from 'react';
import { CustomerAPI } from '../../api/api';
import './CustomerList.css';

interface Customer {
    customer_id: number;
    name: string;
    location: string | null;
    phone: string | null;
    customer_type: string;
    notes?: string;
}

interface CustomerFormData {
    name: string;
    location: string;
    phone: string;
    customer_type: string;
    notes: string;
}

const initialFormData: CustomerFormData = {
    name: '',
    location: '',
    phone: '',
    customer_type: 'Retail',
    notes: ''
};

const CustomerList: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showForm, setShowForm] = useState<boolean>(false);
    const [formData, setFormData] = useState<CustomerFormData>(initialFormData);

    const fetchCustomers = async (): Promise<void> => {
        setLoading(true);
        setError('');
        try {
            const response = await CustomerAPI.getAll();
            setCustomers((response.data || []) as Customer[]);
        } catch (err: unknown) {
            console.error('Error fetching customers:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const errorResponse = err as { response: { data?: { error?: string } } };
                setError(errorResponse.response.data?.error || 'Server error while loading customers.');
            } else if (err instanceof Error) {
                setError(err.message || 'Failed to fetch customers.');
            } else {
                setError('Failed to fetch customers.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) {
            return customers;
        }

        return customers.filter((customer) =>
            customer.name.toLowerCase().includes(term) ||
            (customer.location || '').toLowerCase().includes(term) ||
            (customer.phone || '').toLowerCase().includes(term) ||
            (customer.customer_type || '').toLowerCase().includes(term)
        );
    }, [customers, searchTerm]);

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (event: React.FormEvent): Promise<void> => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSuccessMessage('');

        try {
            await CustomerAPI.create({
                name: formData.name,
                location: formData.location || undefined,
                phone: formData.phone || undefined,
                customer_type: formData.customer_type || 'Retail',
                notes: formData.notes || undefined
            });

            setSuccessMessage('Customer added successfully.');
            setFormData(initialFormData);
            setShowForm(false);
            await fetchCustomers();
            window.setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err: unknown) {
            console.error('Error saving customer:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const errorResponse = err as { response: { data?: { error?: string } } };
                setError(errorResponse.response.data?.error || 'Failed to save customer.');
            } else {
                setError('Failed to save customer.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="customer-list">
            <div className="page-header">
                <div className="header-left">
                    <div className="header-icon">
                        <i className="bi bi-people" aria-hidden="true"></i>
                    </div>
                    <div>
                        <h1>Customers</h1>
                        <p className="header-subtitle">Manage customer records used across orders and deliveries.</p>
                    </div>
                </div>
                <div className="header-actions">
                    <span className="customer-count">
                        {customers.length} {customers.length === 1 ? 'customer' : 'customers'}
                    </span>
                    <button className="btn-primary" onClick={() => setShowForm((prev) => !prev)}>
                        <i className={`bi ${showForm ? 'bi-x-circle' : 'bi-plus-circle'}`} aria-hidden="true"></i>
                        {showForm ? 'Close Form' : 'Add Customer'}
                    </button>
                </div>
            </div>

            <div className="toolbar-card">
                <div className="search-bar">
                    <i className="bi bi-search" aria-hidden="true"></i>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search customers by name, location, phone, or type"
                        aria-label="Search customers"
                    />
                </div>
            </div>

            {showForm && (
                <div className="form-card">
                    <div className="form-card-header">
                        <div>
                            <h2>Add Customer</h2>
                            <p>Enter the customer details you want to use in orders and deliveries.</p>
                        </div>
                    </div>

                    <form className="customer-form" onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="name">Customer Name</label>
                                <input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter customer name" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Phone</label>
                                <input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter phone number" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="location">Location</label>
                                <input id="location" name="location" value={formData.location} onChange={handleInputChange} placeholder="Enter location" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="customer_type">Customer Type</label>
                                <input id="customer_type" name="customer_type" value={formData.customer_type} onChange={handleInputChange} placeholder="Retail, Wholesale, etc." />
                            </div>
                        </div>
                        <div className="form-group full-width">
                            <label htmlFor="notes">Notes</label>
                            <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Optional notes" rows={3} />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Customer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {successMessage && (
                <div className="success-message">
                    <i className="bi bi-check-circle" aria-hidden="true"></i>
                    <span>{successMessage}</span>
                </div>
            )}

            {loading && (
                <div className="state-panel">
                    <i className="bi bi-arrow-repeat spin" aria-hidden="true"></i>
                    <p>Loading customers...</p>
                </div>
            )}

            {!loading && error && (
                <div className="state-panel state-error" role="alert">
                    <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                    <p>{error}</p>
                    <button className="btn-retry" onClick={fetchCustomers}>
                        <i className="bi bi-arrow-repeat" aria-hidden="true"></i>
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && customers.length === 0 && (
                <div className="state-panel">
                    <i className="bi bi-people" aria-hidden="true"></i>
                    <p>No customers found. New customers will appear here once added.</p>
                </div>
            )}

            {!loading && !error && customers.length > 0 && filteredCustomers.length === 0 && (
                <div className="state-panel">
                    <i className="bi bi-search" aria-hidden="true"></i>
                    <p>No customers match your search.</p>
                </div>
            )}

            {!loading && !error && filteredCustomers.length > 0 && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th><i className="bi bi-person-badge" aria-hidden="true"></i> Name</th>
                                <th><i className="bi bi-geo-alt" aria-hidden="true"></i> Location</th>
                                <th><i className="bi bi-telephone" aria-hidden="true"></i> Phone</th>
                                <th><i className="bi bi-tags" aria-hidden="true"></i> Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.customer_id}>
                                    <td data-label="Name"><strong>{customer.name}</strong></td>
                                    <td data-label="Location">{customer.location || 'Not provided'}</td>
                                    <td data-label="Phone">{customer.phone || 'Not provided'}</td>
                                    <td data-label="Type">
                                        <span className="badge badge-info">
                                            {customer.customer_type || 'Retail'}
                                        </span>
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

export default CustomerList;