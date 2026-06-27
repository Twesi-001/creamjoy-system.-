import React, { useState, useEffect } from 'react';
import { CreditAPI } from '../../api/api';
import './CreditList.css';

const CreditList: React.FC = () => {
    const [credits, setCredits] = useState<any[]>([]);
    const [summary, setSummary] = useState({ total_outstanding: 0, count: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [accountsRes, summaryRes] = await Promise.all([
                CreditAPI.getAll(),
                CreditAPI.getSummary()
            ]);
            setCredits(accountsRes.data || []);
            setSummary(summaryRes.data || { total_outstanding: 0, count: 0 });
        } catch (error) {
            console.error('Error fetching credit data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="credit-list">
            <div className="page-header">
                <h1>Credit Accounts (Amabanja)</h1>
                <div className="credit-summary">
                    <span className="summary-label">Total Outstanding:</span>
                    <span className="summary-value">UGX {summary.total_outstanding?.toLocaleString() || 0}</span>
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Location</th>
                                <th>Amount (UGX)</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {credits.map((credit) => (
                                <tr key={credit.credit_id} className={credit.amount_ugx > 50000 ? 'high-amount' : ''}>
                                    <td><strong>{credit.customer_name}</strong></td>
                                    <td>{credit.location || 'N/A'}</td>
                                    <td>{credit.amount_ugx.toLocaleString()}</td>
                                    <td>{credit.date_recorded}</td>
                                    <td>
                                        <span className={`badge ${credit.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                            {credit.status}
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

export default CreditList;