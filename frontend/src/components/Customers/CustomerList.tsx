import React, { useState, useEffect } from 'react';
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

    const fetchCustomers = async (): Promise<void> => {
        setLoading(true);
        setError('');
        try {
            console.log('🔍 Fetching customers...');
            const response = await CustomerAPI.getAll();
            console.log('📦 Response:', response);
            
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
            
            console.log('📊 Customers found:', customerData.length);
            setCustomers(customerData);
        } catch (err: unknown) {
            console.error('❌ Error:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const errorResponse = err as { response: { data?: { error?: string } } };
                setError(errorResponse.response.data?.error || 'Server error');
            } else if (err instanceof Error) {
                setError(err.message || 'Failed to fetch customers');
            } else {
                setError('Failed to fetch customers');
            }
        } finally {
            setLoading(false);
        }
    };

    // ✅ useEffect with proper cleanup
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