import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BatchAPI } from '../../api/api';
import './BatchList.css';

const BatchList: React.FC = () => {
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const response = await BatchAPI.getAll();
            setBatches(response.data || []);
        } catch (error) {
            console.error('Error fetching batches:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'completed': return 'badge-success';
            case 'in_progress': return 'badge-warning';
            case 'pending': return 'badge-secondary';
            default: return 'badge-secondary';
        }
    };

    return (
        <div className="batch-list">
            <div className="page-header">
                <h1>Production Batches</h1>
                <button
                    className="btn-primary"
                    onClick={() => navigate('/batches/new')}
                >
                    + New Batch
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Batch #</th>
                                <th>Date</th>
                                <th>Total Units</th>
                                <th>Supervisor</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batches.map((batch) => (
                                <tr key={batch.batch_id}>
                                    <td><strong>{batch.batch_number}</strong></td>
                                    <td>{batch.batch_date}</td>
                                    <td>{batch.total_units || 0}</td>
                                    <td>{batch.supervisor_name || 'N/A'}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(batch.status)}`}>
                                            {batch.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-sm btn-info">
                                            View
                                        </button>
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

export default BatchList;