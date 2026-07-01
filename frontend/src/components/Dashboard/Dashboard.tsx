/* eslint-disable react-hooks/set-state-in-effect */
import React, { useCallback, useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
    BatchAPI,
    OrderAPI,
    DeliveryAPI,
    InventoryAPI,
    CreditAPI,
    CustomerAPI,
    ProductAPI
} from '../../api/api';
import MetricCard from './MetricCard';
import './Dashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);

// ============ TYPE DEFINITIONS ============

// Batch types
interface Batch {
    batch_id: number;
    batch_number: string;
    batch_date: string;
    total_units: number;
    status: string;
    product_id?: number;
    [key: string]: unknown;
}

// Order types
interface Order {
    order_id: number;
    order_number: string;
    order_date: string;
    status: string;
    customer_id: number;
    total_amount: number;
    [key: string]: unknown;
}

// Delivery types
interface Delivery {
    delivery_id: number;
    delivery_date: string;
    status: string;
    order_id: number;
    [key: string]: unknown;
}

// Inventory types
interface InventoryItem {
    inventory_id: number;
    product_id: number;
    quantity: number;
    low_stock: boolean;
    reorder_level: number;
    [key: string]: unknown;
}

// Credit types
interface CreditSummary {
    total_outstanding: number;
    total_credit: number;
    [key: string]: unknown;
}

// Customer types
interface Customer {
    customer_id: number;
    name: string;
    email: string;
    phone: string;
    [key: string]: unknown;
}

// Product types
interface Product {
    product_id: number;
    product_name: string;
    price: number;
    [key: string]: unknown;
}

// Metric data interface
interface MetricData {
    todayBatches: number;
    pendingDeliveries: number;
    lowStock: number;
    creditOutstanding: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    totalRevenue: number;
}

// Chart data interface
interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
        borderRadius: number;
    }[];
}

// Daily batch data
interface DailyBatch {
    date: string;
    count: number;
}

const Dashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<MetricData>({
        todayBatches: 0,
        pendingDeliveries: 0,
        lowStock: 0,
        creditOutstanding: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [recentBatches, setRecentBatches] = useState<Batch[]>([]);
    const [chartData, setChartData] = useState<ChartData | null>(null);

    // Helper function to get last 7 days
    const getLast7Days = (): string[] => {
        const dates: string[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

    // Helper function to get status badge class
    const getStatusBadgeClass = (status: string): string => {
        const statusMap: Record<string, string> = {
            'completed': 'badge-success',
            'pending': 'badge-warning',
            'in-progress': 'badge-info',
            'cancelled': 'badge-danger',
            'delivered': 'badge-success',
            'failed': 'badge-danger'
        };
        return statusMap[status.toLowerCase()] || 'badge-secondary';
    };

    const fetchDashboardData = useCallback(async (): Promise<void> => {
        try {
            const [
                batchesRes,
                ordersRes,
                deliveriesRes,
                inventoryRes,
                creditRes,
                customersRes,
                productsRes
            ] = await Promise.all([
                BatchAPI.getAll(),
                OrderAPI.getAll(),
                DeliveryAPI.getAll(),
                InventoryAPI.getAll(),
                CreditAPI.getSummary(),
                CustomerAPI.getAll(),
                ProductAPI.getAll()
            ]);

            const batches = (batchesRes?.data || []) as Batch[];
            const orders = (ordersRes?.data || []) as unknown as Order[];
            const deliveries = (deliveriesRes?.data || []) as unknown as Delivery[];
            const inventory = (inventoryRes?.data || []) as InventoryItem[];
            const credit = (creditRes?.data || {}) as unknown as CreditSummary;
            const customers = (customersRes?.data || []) as Customer[];
            const products = (productsRes?.data || []) as unknown as Product[];

            // Get today's date
            const today = new Date().toISOString().split('T')[0];
            
            // Calculate metrics
            const todayBatches = batches.filter(
                (batch: Batch) => batch.batch_date === today
            ).length;

            const pendingDeliveries = deliveries.filter(
                (delivery: Delivery) => delivery.status === 'pending'
            ).length;

            const lowStock = inventory.filter(
                (item: InventoryItem) => item.low_stock === true
            ).length;

            const totalOrders = orders.length;
            const totalCustomers = customers.length;
            const totalProducts = products.length;
            const totalRevenue = orders.reduce(
                (sum: number, order: Order) => sum + (order.total_amount || 0),
                0
            );

            setMetrics({
                todayBatches,
                pendingDeliveries,
                lowStock,
                creditOutstanding: credit.total_outstanding || 0,
                totalOrders,
                totalCustomers,
                totalProducts,
                totalRevenue
            });

            // Set recent data
            setRecentBatches(batches.slice(0, 5));

            // Prepare chart data
            const last7Days: string[] = getLast7Days();
            const dailyBatches: DailyBatch[] = last7Days.map((date: string) => ({
                date,
                count: batches.filter((batch: Batch) => batch.batch_date === date).length
            }));

            console.log('Daily Batches:', dailyBatches);

            setChartData({
                labels: dailyBatches.map((d: DailyBatch) => d.date),
                datasets: [
                    {
                        label: 'Batches Produced',
                        data: dailyBatches.map((d: DailyBatch) => d.count),
                        backgroundColor: '#1D9E75',
                        borderRadius: 4,
                    }
                ]
            });

        } catch (err: unknown) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

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
                    icon="bi bi-factory"
                    color="primary"
                />
                <MetricCard
                    title="Pending Deliveries"
                    value={metrics.pendingDeliveries}
                    icon="bi bi-truck"
                    color="warning"
                />
                <MetricCard
                    title="Low Stock Alerts"
                    value={metrics.lowStock}
                    icon="bi bi-exclamation-triangle"
                    color="danger"
                />
                <MetricCard
                    title="Credit Outstanding"
                    value={`UGX ${metrics.creditOutstanding.toLocaleString()}`}
                    icon="bi bi-cash-coin"
                    color="info"
                />
            </div>

            <div className="dashboard-content">
                <div className="chart-section">
                    <h3>Production Activity (Last 7 Days)</h3>
                    {loading ? (
                        <p>Loading chart data...</p>
                    ) : chartData ? (
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
                    ) : (
                        <p>No chart data available</p>
                    )}
                </div>

                <div className="recent-section">
                    <h3>Recent Batches</h3>
                    {loading ? (
                        <p>Loading...</p>
                    ) : recentBatches.length === 0 ? (
                        <p className="empty-state">No recent batches found</p>
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
                                {recentBatches.map((batch: Batch) => (
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