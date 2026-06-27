import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BatchAPI,  InventoryAPI, CreditAPI } from '../../api/api';
import MetricCard from './MetricCard';
import './Dashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface MetricData {
    todayBatches: number;
    pendingDeliveries: number;
    lowStock: number;
    creditOutstanding: number;
}

const Dashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<MetricData>({
        todayBatches: 0,
        pendingDeliveries: 0,
        lowStock: 0,
        creditOutstanding: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentBatches, setRecentBatches] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [batchesRes, inventoryRes, creditRes] = await Promise.all([
                BatchAPI.getAll(),
                InventoryAPI.getAll(),
                CreditAPI.getSummary()
            ]);

            const batches = batchesRes.data || [];
            const inventory = inventoryRes.data || [];
            const credit = creditRes.data || {};

            const today = new Date().toISOString().split('T')[0];
            const todayBatches = batches.filter(
                (b: any) => b.batch_date === today
            ).length;

            const pendingDeliveries = batches.filter(
                (b: any) => b.status === 'pending'
            ).length;

            const lowStock = inventory.filter((i: any) => i.low_stock).length;

            setMetrics({
                todayBatches,
                pendingDeliveries,
                lowStock,
                creditOutstanding: credit.total_outstanding || 0
            });

            setRecentBatches(batches.slice(0, 5));

            // Chart data
            const last7Days = getLast7Days();
            const dailyBatches = last7Days.map(date => ({
                date,
                count: batches.filter((b: any) => b.batch_date === date).length
            }));

            setChartData({
                labels: dailyBatches.map(d => d.date),
                datasets: [
                    {
                        label: 'Batches Produced',
                        data: dailyBatches.map(d => d.count),
                        backgroundColor: '#1D9E75',
                        borderRadius: 4,
                    }
                ]
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLast7Days = () => {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
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
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p>Welcome to the CreamJoy Management System</p>
            </div>

            <div className="metrics-grid">
                <MetricCard
                    title="Today's Batches"
                    value={metrics.todayBatches}
                    icon="🏭"
                    color="primary"
                />
                <MetricCard
                    title="Pending Deliveries"
                    value={metrics.pendingDeliveries}
                    icon="🚚"
                    color="warning"
                />
                <MetricCard
                    title="Low Stock Alerts"
                    value={metrics.lowStock}
                    icon="⚠️"
                    color="danger"
                />
                <MetricCard
                    title="Credit Outstanding"
                    value={`UGX ${metrics.creditOutstanding.toLocaleString()}`}
                    icon="💰"
                    color="info"
                />
            </div>

            <div className="dashboard-content">
                <div className="chart-section">
                    <h3>Production Activity (Last 7 Days)</h3>
                    {chartData && (
                        <Bar
                            data={chartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            stepSize: 1,
                                        },
                                    },
                                },
                            }}
                        />
                    )}
                </div>

                <div className="recent-section">
                    <h3>Recent Batches</h3>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <table className="recent-table">
                            <thead>
                                <tr>
                                    <th>Batch #</th>
                                    <th>Date</th>
                                    <th>Total Units</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBatches.map((batch) => (
                                    <tr key={batch.batch_id}>
                                        <td>{batch.batch_number}</td>
                                        <td>{batch.batch_date}</td>
                                        <td>{batch.total_units || 0}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(batch.status)}`}>
                                                {batch.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;