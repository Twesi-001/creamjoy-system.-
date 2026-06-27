import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderAPI } from '../../api/api';
import './OrderList.css';

const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await OrderAPI.getAll();
            setOrders(response.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPaymentBadgeClass = (status: string) => {
        switch (status) {
            case 'paid': return 'badge-success';
            case 'partial': return 'badge-warning';
            case 'pending': return 'badge-secondary';
            default: return 'badge-secondary';
        }
    };

    return (
        <div className="order-list">
            <div className="page-header">
                <h1>Orders</h1>
                <button
                    className="btn-primary"
                    onClick={() => navigate('/orders/new')}
                >
                    + New Order
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
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
                            {orders.map((order) => (
                                <tr key={order.order_id}>
                                    <td>#{order.order_id}</td>
                                    <td>{order.customer_name}</td>
                                    <td>{order.order_date}</td>
                                    <td>{order.total_amount?.toLocaleString() || 0}</td>
                                    <td>{order.payment_method}</td>
                                    <td>
                                        <span className={`badge ${getPaymentBadgeClass(order.payment_status)}`}>
                                            {order.payment_status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-sm btn-info">View</button>
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

export default OrderList;