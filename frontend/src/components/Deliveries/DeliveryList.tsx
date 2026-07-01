import React, { useState, useEffect, useMemo } from 'react';
import { DeliveryAPI } from '../../api/api';
import './DeliveryList.css';

type DeliveryStatus = 'pending' | 'dispatched' | 'delivered';

interface Delivery {
    delivery_id: number;
    customer_name: string;
    staff_name: string;
    delivery_date: string;
    status: DeliveryStatus;
}

interface RowFeedback {
    type: 'success' | 'error';
    text: string;
}

const formatDeliveryDate = (value: string): string => {
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
        return 'Not scheduled';
    }
    return parsed.toLocaleString('en-UG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const DeliveryList: React.FC = () => {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [rowFeedback, setRowFeedback] = useState<Record<number, RowFeedback>>({});

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await DeliveryAPI.getAll();
            setDeliveries((response.data || []) as Delivery[]);
        } catch (err) {
            console.error('Error fetching deliveries:', err);
            setError('Unable to load deliveries right now. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const showRowFeedback = (deliveryId: number, feedback: RowFeedback) => {
        setRowFeedback((prev) => ({ ...prev, [deliveryId]: feedback }));
        window.setTimeout(() => {
            setRowFeedback((prev) => {
                const next = { ...prev };
                delete next[deliveryId];
                return next;
            });
        }, 3000);
    };

    const updateStatus = async (deliveryId: number, newStatus: string) => {
        setUpdatingId(deliveryId);
        try {
            await DeliveryAPI.updateStatus(deliveryId, newStatus);
            setDeliveries((prev) =>
                prev.map((d) =>
                    d.delivery_id === deliveryId ? { ...d, status: newStatus as DeliveryStatus } : d
                )
            );
            showRowFeedback(deliveryId, { type: 'success', text: 'Status updated.' });
        } catch (err) {
            console.error('Error updating delivery status:', err);
            showRowFeedback(deliveryId, { type: 'error', text: 'Update failed. Please try again.' });
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusBadgeClass = (status: string): string => {
        switch (status) {
            case 'delivered': return 'badge-success';
            case 'dispatched': return 'badge-info';
            case 'pending': return 'badge-warning';
            default: return 'badge-secondary';
        }
    };

    const getStatusIcon = (status: string): string => {
        switch (status) {
            case 'delivered': return 'bi-check-circle';
            case 'dispatched': return 'bi-send-check';
            case 'pending': return 'bi-clock-history';
            default: return 'bi-clock-history';
        }
    };

    const summary = useMemo(() => {
        return {
            pending: deliveries.filter((d) => d.status === 'pending').length,
            dispatched: deliveries.filter((d) => d.status === 'dispatched').length,
            delivered: deliveries.filter((d) => d.status === 'delivered').length
        };
    }, [deliveries]);

    return (
        <div className="delivery-list">
            <div className="page-header">
                <div className="header-text">
                    <h1>
                        <i className="bi bi-truck" aria-hidden="true"></i>
                        Deliveries
                    </h1>
                    <p className="page-subtitle">Track customer deliveries and update their status.</p>
                </div>

                {!loading && !error && deliveries.length > 0 && (
                    <div className="delivery-summary">
                        <span className="summary-chip chip-warning">
                            <i className="bi bi-clock-history" aria-hidden="true"></i>
                            {summary.pending} Pending
                        </span>
                        <span className="summary-chip chip-info">
                            <i className="bi bi-send-check" aria-hidden="true"></i>
                            {summary.dispatched} Dispatched
                        </span>
                        <span className="summary-chip chip-success">
                            <i className="bi bi-check-circle" aria-hidden="true"></i>
                            {summary.delivered} Delivered
                        </span>
                    </div>
                )}
            </div>

            {loading && (
                <div className="state-panel">
                    <i className="bi bi-arrow-repeat spin" aria-hidden="true"></i>
                    <p>Loading deliveries...</p>
                </div>
            )}

            {!loading && error && (
                <div className="state-panel state-error" role="alert">
                    <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                    <p>{error}</p>
                    <button className="btn-retry" onClick={fetchDeliveries}>
                        <i className="bi bi-arrow-repeat" aria-hidden="true"></i>
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && deliveries.length === 0 && (
                <div className="state-panel">
                    <i className="bi bi-truck" aria-hidden="true"></i>
                    <p>No deliveries recorded yet.</p>
                </div>
            )}

            {!loading && !error && deliveries.length > 0 && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th><i className="bi bi-building" aria-hidden="true"></i> Customer</th>
                                <th><i className="bi bi-person" aria-hidden="true"></i> Staff</th>
                                <th><i className="bi bi-calendar-event" aria-hidden="true"></i> Delivery Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveries.map((delivery) => (
                                <tr key={delivery.delivery_id}>
                                    <td data-label="Customer"><strong>{delivery.customer_name}</strong></td>
                                    <td data-label="Staff">{delivery.staff_name}</td>
                                    <td data-label="Delivery Date">{formatDeliveryDate(delivery.delivery_date)}</td>
                                    <td data-label="Status">
                                        <span className={`badge ${getStatusBadgeClass(delivery.status)}`}>
                                            <i className={`bi ${getStatusIcon(delivery.status)}`} aria-hidden="true"></i>
                                            {delivery.status}
                                        </span>
                                    </td>
                                    <td data-label="Actions">
                                        <div className="action-cell">
                                            {delivery.status !== 'delivered' && (
                                                <select
                                                    className="status-select"
                                                    value={delivery.status}
                                                    onChange={(e) => updateStatus(delivery.delivery_id, e.target.value)}
                                                    disabled={updatingId === delivery.delivery_id}
                                                    aria-label={`Update status for ${delivery.customer_name}`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="dispatched">Dispatch</option>
                                                    <option value="delivered">Deliver</option>
                                                </select>
                                            )}
                                            {updatingId === delivery.delivery_id && (
                                                <i className="bi bi-arrow-repeat spin action-spinner" aria-hidden="true"></i>
                                            )}
                                            {rowFeedback[delivery.delivery_id] && (
                                                <span className={`row-feedback feedback-${rowFeedback[delivery.delivery_id].type}`}>
                                                    <i
                                                        className={`bi ${rowFeedback[delivery.delivery_id].type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}`}
                                                        aria-hidden="true"
                                                    ></i>
                                                    {rowFeedback[delivery.delivery_id].text}
                                                </span>
                                            )}
                                        </div>
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

export default DeliveryList;