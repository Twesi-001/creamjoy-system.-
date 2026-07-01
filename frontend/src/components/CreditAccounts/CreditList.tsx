import React, { useState, useEffect } from 'react';
import { CreditAPI } from '../../api/api';
import './CreditList.css';

interface Credit {
    credit_id: number;
    customer_name: string;
    location?: string;
    amount_ugx: number;
    date_recorded: string;
    status: string;
}

interface CreditSummary {
    total_outstanding: number;
    count: number;
}

const HIGH_AMOUNT_THRESHOLD = 50000;

const formatCurrency = (amount: number): string => {
    return `UGX ${Number(amount || 0).toLocaleString()}`;
};

const formatDate = (value: string): string => {
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
        return value;
    }
    return parsed.toLocaleDateString('en-UG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const CreditList: React.FC = () => {
    const [credits, setCredits] = useState<Credit[]>([]);
    const [summary, setSummary] = useState<CreditSummary>({ total_outstanding: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [accountsRes, summaryRes] = await Promise.all([
                CreditAPI.getAll(),
                CreditAPI.getSummary()
            ]);
            setCredits(accountsRes.data || []);
            setSummary(summaryRes.data || { total_outstanding: 0, count: 0 });
        } catch (err) {
            console.error('Error fetching credit data:', err);
            setError('Unable to load credit accounts right now. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const outstandingCount = credits.filter((c) => c.status !== 'paid').length;

    const renderStatusBadge = (status: string) => {
        const isPaid = status === 'paid';
        return (
            <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`}>
                <i className={`bi ${isPaid ? 'bi-check-circle' : 'bi-clock-history'}`} aria-hidden="true"></i>
                {status}
            </span>
        );
    };

    return (
        <div className="credit-list">
            <div className="page-header">
                <div className="header-text">
                    <h1>
                        <i className="bi bi-wallet2" aria-hidden="true"></i>
                        Credit Accounts (Amabanja)
                    </h1>
                    <p className="page-subtitle">Track customer balances and outstanding payments.</p>
                </div>
                <button className="btn-refresh" onClick={fetchData} disabled={loading} aria-label="Refresh credit accounts">
                    <i className={`bi bi-arrow-repeat ${loading ? 'spin' : ''}`} aria-hidden="true"></i>
                    Refresh
                </button>
            </div>

            <div className="summary-cards">
                <div className="summary-card">
                    <div className="summary-icon icon-outstanding">
                        <i className="bi bi-graph-up-arrow" aria-hidden="true"></i>
                    </div>
                    <div className="summary-content">
                        <span className="summary-label">Total Outstanding</span>
                        <span className="summary-value">{formatCurrency(summary.total_outstanding)}</span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon icon-accounts">
                        <i className="bi bi-cash-coin" aria-hidden="true"></i>
                    </div>
                    <div className="summary-content">
                        <span className="summary-label">Credit Accounts</span>
                        <span className="summary-value">{summary.count}</span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon icon-pending">
                        <i className="bi bi-clock-history" aria-hidden="true"></i>
                    </div>
                    <div className="summary-content">
                        <span className="summary-label">Pending Payment</span>
                        <span className="summary-value">{outstandingCount}</span>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="state-panel">
                    <i className="bi bi-arrow-repeat spin" aria-hidden="true"></i>
                    <p>Loading credit accounts...</p>
                </div>
            )}

            {!loading && error && (
                <div className="state-panel state-error" role="alert">
                    <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
                    <p>{error}</p>
                    <button className="btn-retry" onClick={fetchData}>
                        <i className="bi bi-arrow-repeat" aria-hidden="true"></i>
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && credits.length === 0 && (
                <div className="state-panel">
                    <i className="bi bi-wallet2" aria-hidden="true"></i>
                    <p>No credit accounts recorded yet.</p>
                </div>
            )}

            {!loading && !error && credits.length > 0 && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th><i className="bi bi-person" aria-hidden="true"></i> Customer</th>
                                <th><i className="bi bi-geo-alt" aria-hidden="true"></i> Location</th>
                                <th>Amount (UGX)</th>
                                <th><i className="bi bi-calendar-event" aria-hidden="true"></i> Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {credits.map((credit) => {
                                const isHighAmount = credit.amount_ugx > HIGH_AMOUNT_THRESHOLD;
                                return (
                                    <tr key={credit.credit_id} className={isHighAmount ? 'high-amount' : ''}>
                                        <td data-label="Customer"><strong>{credit.customer_name}</strong></td>
                                        <td data-label="Location">{credit.location || 'N/A'}</td>
                                        <td data-label="Amount" className="amount-cell">
                                            {isHighAmount && (
                                                <i className="bi bi-exclamation-triangle amount-flag" aria-hidden="true" title="High outstanding balance"></i>
                                            )}
                                            {credit.amount_ugx.toLocaleString()}
                                        </td>
                                        <td data-label="Date">{formatDate(credit.date_recorded)}</td>
                                        <td data-label="Status">{renderStatusBadge(credit.status)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CreditList;