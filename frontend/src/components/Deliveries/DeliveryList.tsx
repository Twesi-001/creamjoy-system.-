import React, { useState, useEffect } from 'react';
import { DeliveryAPI } from '../../api/api';
import './DeliveryList.css';

const DeliveryList: React.FC = () => {
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const response = await DeliveryAPI.getAll();
            setDeliveries(response.data || []);
        } catch (error) {
            console.error('Error fetching deliveries:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (deliveryId: number, newStatus: string) => {
        try {
            await DeliveryAPI.updateStatus(deliveryId, newStatus);
            await fetchDeliveries(); // Refresh
        } catch (error) {
            console.error('Error updating delivery status:', error);
            alert('Failed to update delivery status.');
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'delivered': return 'badge-success';
            case 'dispatched': return 'badge-info';
            case 'pending': return 'badge-warning';
            default: return 'badge-secondary';
        }
    };

    return (
        <div className="delivery-list">
            <div className="page-header">
                <h1>Deliveries</h1>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Staff</th>
                                <th>Delivery Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveries.map((delivery) => (
                                <tr key={delivery.delivery_id}>
                                    <td>{delivery.customer_name}</td>
                                    <td>{delivery.staff_name}</td>
                                    <td>{new Date(delivery.delivery_date).toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(delivery.status)}`}>
                                            {delivery.status}
                                        </span>
                                    </td>
                                    <td>
                                        {delivery.status !== 'delivered' && (
                                            <select
                                                className="status-select"
                                                value={delivery.status}
                                                onChange={(e) => updateStatus(delivery.delivery_id, e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="dispatched">Dispatch</option>
                                                <option value="delivered">Deliver</option>
                                            </select>
                                        )}
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