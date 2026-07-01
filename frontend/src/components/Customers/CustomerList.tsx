import React, { useState, useEffect, useMemo } from 'react';
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

const CustomerList: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const fetchCustomers = async (): Promise<void> => {
        setLoading(true);
        setError('');
        try {
            const response = await CustomerAPI.getAll();

            let customerData: Customer[] = [];
            if (response && typeof response === 'object') {
                if ('data' in response && Array.isArray(response.data)) {
                    customerData = response.data as Customer[];
                } else if (Array.isArray(response)) {
                    customerData = response as Customer[];
                } else if (response.data && Array.isArray(response.data)) {
                    customerData = response.data as Customer[];
                }
            }

            setCustomers(customerData);
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
        let isMounted = true;

        const loadData = async () => {
            if (isMounted) {
                await fetchCustomers();
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
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

    return (
        <div className="customer-list">
            <div className="page-header">
                <div className="header-text">
                    <h1>
                        <i className="bi bi-people" aria-hidden="true"></i>
                        Customers
                    </h1>
                    <p className="page-subtitle">Manage customer records used across orders and deliveries.</p>
                </div>
                <span className="customer-count">
                    <i className="bi bi-person-badge" aria-hidden="true"></i>
                    {customers.length} {customers.length === 1 ? 'customer' : 'customers'}
                </span>
            </div>

            {!loading && !error && customers.length > 0 && (
                <div className="search-bar">
                    <i className="bi bi-search" aria-hidden="true"></i>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, location, phone, or type"
                        aria-label="Search customers"
                    />
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