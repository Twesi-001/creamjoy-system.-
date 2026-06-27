import React, { useState, useEffect } from 'react';
import { CustomerAPI } from '../../api/api';
import './CustomerList.css';

const CustomerList: React.FC = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('🔍 Fetching customers...');
            const response = await CustomerAPI.getAll();
            console.log('📦 Response status:', response.status);
            console.log('📦 Response data:', response.data);
            setCustomers(response.data || []);
        } catch (err: any) {
            console.error('❌ Error:', err);
            if (err.response) {
                console.error('Response error:', err.response.data);
                setError(`Server error: ${err.response.data?.error || err.response.status}`);
            } else if (err.request) {
                console.error('No response:', err.request);
                setError('No response from server. Is the backend running?');
            } else {
                setError(err.message || 'Failed to fetch customers');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="customer-list">
            <div className="page-header">
                <h1>Customers</h1>
                <span className="customer-count">{customers.length} customers</span>
            </div>

            {error && <div className="error-message">❌ {error}</div>}

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Location</th>
                                <th>Phone</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                                        No customers found
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.customer_id}>
                                        <td><strong>{customer.name}</strong></td>
                                        <td>{customer.location || 'N/A'}</td>
                                        <td>{customer.phone || 'N/A'}</td>
                                        <td>
                                            <span className="badge badge-info">
                                                {customer.customer_type || 'Retail'}
                                            </span>
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

export default CustomerList;