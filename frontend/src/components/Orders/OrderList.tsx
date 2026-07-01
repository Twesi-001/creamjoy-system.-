import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderAPI, type OrderData } from '../../api/api';
import './OrderList.css';


const paymentMethodLabels: Record<string, string> = {
    cash: 'Cash',
    mobile_money: 'Mobile Money',
    credit: 'Credit'
};

const formatPaymentMethod = (method: string): string => {
    return paymentMethodLabels[method] || method;
};

const formatUgx = (amount?: number | string): string => `UGX ${Number(amount || 0).toLocaleString()}`;

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getPaymentBadge = (status: string): { className: string; icon: string } => {
    switch (status) {
        case 'paid':
            return { className: 'badge-success', icon: 'bi-check-circle' };
        case 'partial':
            return { className: 'badge-warning', icon: 'bi-hourglass-split' };
        case 'pending':
            return { className: 'badge-secondary', icon: 'bi-clock-history' };
        default:
            return { className: 'badge-secondary', icon: 'bi-question-circle' };
    }
};

const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    const fetchOrders = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError('');
        try {
            const response = await OrderAPI.getAll();
            setOrders((response.data || []) as OrderData[]);
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'response' in err
                ? (err as { response: { data?: { error?: string } } }).response.data?.error
                : 'Failed to load orders';
            setError(errorMessage || 'Failed to load orders');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return (
        <div className="order-list">
            <div className="page-header">
                <div className="page-header-text">
                    <h1>
                        <i className="bi bi-cart-check" aria-hidden="true"></i>
                        Orders
                    </h1>
                    <p>Customer orders and payment status</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/orders/new')}>
                    <i className="bi bi-plus-circle" aria-hidden="true"></i>
                    New Order
                </button>
            </div>

            {!loading && !error && orders.length > 0 && (
                <div className="page-header-stats">
                    <div className="stat-pill">
                        <i className="bi bi-cart-check" aria-hidden="true"></i>
                        <span>{orders.length} orders</span>
                    </div>
                </div>
            )}

            {error ? (
                <div className="state-panel state-error">
                    <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                    <p>{error}</p>
                    <button className="btn-retry" onClick={fetchOrders}>
                        <i className="bi bi-arrow-repeat" aria-hidden="true"></i>
                        Retry
                    </button>
                </div>
            ) : loading ? (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Total (UGX)</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <tr key={index} className="skeleton-row">
                                    <td><div className="skeleton-bar skeleton-bar-sm" /></td>
                                    <td><div className="skeleton-bar" /></td>
                                    <td><div className="skeleton-bar skeleton-bar-sm" /></td>
                                    <td><div className="skeleton-bar skeleton-bar-sm" /></td>
                                    <td><div className="skeleton-bar skeleton-bar-sm" /></td>
                                    <td><div className="skeleton-bar skeleton-bar-sm" /></td>
                                    <td><div className="skeleton-bar skeleton-bar-sm" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : orders.length === 0 ? (
                <div className="state-panel state-empty">
                    <i className="bi bi-inbox" aria-hidden="true"></i>
                    <p>No orders yet.</p>
                    <button className="btn-primary" onClick={() => navigate('/orders/new')}>
                        <i className="bi bi-plus-circle" aria-hidden="true"></i>
                        New Order
                    </button>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Total (UGX)</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const badge = getPaymentBadge(order.payment_status || 'pending');
                                return (
                                    <tr key={order.order_id}>
                                        <td><strong>#{order.order_id}</strong></td>
                                        <td>{order.customer_name}</td>
                                        <td>{formatDate(order.order_date)}</td>
                                        <td>{formatUgx(order.total_amount)}</td>
                                        <td>{formatPaymentMethod(order.payment_method)}</td>
                                        <td>
                                            <span className={`badge ${badge.className}`}>
                                                <i className={`bi ${badge.icon}`} aria-hidden="true"></i>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-icon btn-icon-view"
                                                onClick={() => navigate(`/orders/${order.order_id}`)}
                                                aria-label={`View order ${order.order_id}`}
                                                title="View order"
                                            >
                                                <i className="bi bi-eye" aria-hidden="true"></i>
                                            </button>
                                        </td>
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

export default OrderList;

