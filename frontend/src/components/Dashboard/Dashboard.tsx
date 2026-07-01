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
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    BatchAPI,
    OrderAPI,
    DeliveryAPI,
    RawMaterialAPI,
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

interface LowStockItem {
    material_id: number;
    product_name: string;
    quantity: number;
    reorder_level: number;
    supplier_name?: string;
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
        backgroundColor: string | string[];
        borderColor?: string;
        borderRadius?: number;
        borderWidth?: number;
        fill?: boolean;
        tension?: number;
        pointRadius?: number;
    }[];
}

// Daily batch data
interface DailyBatch {
    date: string;
    count: number;
}

const toNumber = (value: unknown): number => {
    const numericValue = typeof value === 'string' ? Number.parseFloat(value) : Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatCurrency = (value: number): string =>
    `UGX ${value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const ROLE_LABELS: Record<string, string> = {
    admin: 'System Admin',
    sales: 'Sales',
    supervisor: 'Supervisor',
    production: 'Production',
    delivery: 'Delivery',
    maintenance: 'Maintenance'
};

const Dashboard: React.FC = () => {
    const [userRole, setUserRole] = useState<string>(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            return 'delivery';
        }

        try {
            const parsed = JSON.parse(userStr) as { role?: string };
            return parsed.role || 'delivery';
        } catch {
            return 'delivery';
        }
    });
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
    const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [deliveryChartData, setDeliveryChartData] = useState<ChartData | null>(null);
    const [revenueChartData, setRevenueChartData] = useState<ChartData | null>(null);

    const normalizedRole = userRole.toLowerCase();
    const showRevenueInsights = normalizedRole === 'admin';

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

    useEffect(() => {
        const updateUserRole = () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setUserRole('delivery');
                return;
            }

            try {
                const parsed = JSON.parse(userStr) as { role?: string };
                setUserRole(parsed.role || 'delivery');
            } catch {
                setUserRole('delivery');
            }
        };

        window.addEventListener('storage', updateUserRole);
        window.addEventListener('user-updated', updateUserRole);

        updateUserRole();

        return () => {
            window.removeEventListener('storage', updateUserRole);
            window.removeEventListener('user-updated', updateUserRole);
        };
    }, []);

    const fetchDashboardData = useCallback(async (): Promise<void> => {
        try {
            const [
                batchesRes,
                ordersRes,
                deliveriesRes,
                lowStockRes,
                creditRes,
                customersRes,
                productsRes
            ] = await Promise.all([
                BatchAPI.getAll(),
                OrderAPI.getAll(),
                DeliveryAPI.getAll(),
                RawMaterialAPI.getLowStock(),
                CreditAPI.getSummary(),
                CustomerAPI.getAll(),
                ProductAPI.getAll()
            ]);

            const batches = (batchesRes?.data || []) as Batch[];
            const orders = (ordersRes?.data || []) as unknown as Order[];
            const deliveries = (deliveriesRes?.data || []) as unknown as Delivery[];
            const lowStockMaterials = (lowStockRes?.data || []) as Array<Record<string, unknown>>;
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

            const lowStock = lowStockMaterials.length;

            const totalOrders = orders.length;
            const totalCustomers = customers.length;
            const totalProducts = products.length;
            const totalRevenue = orders.reduce(
                (sum: number, order: Order) => sum + toNumber(order.total_amount),
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
            setLowStockItems(
                lowStockMaterials.map((item) => ({
                    material_id: toNumber(item.material_id),
                    product_name:
                        typeof item.material_name === 'string' && item.material_name
                            ? item.material_name
                            : typeof item.product_name === 'string' && item.product_name
                                ? item.product_name
                                : `Material #${toNumber(item.material_id)}`,
                    quantity: toNumber(item.current_stock),
                    reorder_level: toNumber(item.minimum_stock),
                    supplier_name: typeof item.supplier_name === 'string' ? item.supplier_name : undefined
                }))
            );

            // Prepare chart data
            const last7Days: string[] = getLast7Days();
            const dailyBatches: DailyBatch[] = last7Days.map((date: string) => ({
                date,
                count: batches.filter((batch: Batch) => batch.batch_date === date).length
            }));

            const deliveryStatusData = [
                { label: 'Pending', count: deliveries.filter((delivery: Delivery) => delivery.status === 'pending').length, color: '#F59E0B' },
                { label: 'Dispatched', count: deliveries.filter((delivery: Delivery) => delivery.status === 'dispatched').length, color: '#1D9E75' },
                { label: 'Delivered', count: deliveries.filter((delivery: Delivery) => delivery.status === 'delivered').length, color: '#2563EB' }
            ].filter((item) => item.count > 0);

            const revenueByDay = last7Days.map((date: string) => ({
                date,
                revenue: orders
                    .filter((order: Order) => order.order_date.split('T')[0] === date)
                    .reduce((sum: number, order: Order) => sum + toNumber(order.total_amount), 0)
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

            setDeliveryChartData({
                labels: deliveryStatusData.map((item) => item.label),
                datasets: [
                    {
                        label: 'Deliveries',
                        data: deliveryStatusData.map((item) => item.count),
                        backgroundColor: deliveryStatusData.map((item) => item.color),
                        borderWidth: 0
                    }
                ]
            });

            setRevenueChartData({
                labels: revenueByDay.map((item) => item.date),
                datasets: [
                    {
                        label: 'Revenue',
                        data: revenueByDay.map((item) => item.revenue),
                        backgroundColor: 'rgba(29, 158, 117, 0.15)',
                        borderColor: '#1D9E75',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.38,
                        pointRadius: 3
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
                <div>
                    <div className="header-top">
                        <h1>
                            <i className="bi bi-speedometer2" aria-hidden="true"></i>
                            <span>Dashboard</span>
                        </h1>
                        {showRevenueInsights && (
                            <span className="role-tag">{ROLE_LABELS[normalizedRole] || userRole}</span>
                        )}
                    </div>
                    <p className="dashboard-welcome">Welcome to the CreamJoy Management System</p>
                    {showRevenueInsights && (
                        <p className="role-message">Revenue and delivery insights are enabled for your role.</p>
                    )}
                </div>
            </div>

            <div className="metrics-grid">
                <MetricCard
                    title="Today's Batches"
                    value={metrics.todayBatches}
                    icon="bi bi-box-seam"
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
                {showRevenueInsights && (
                    <MetricCard
                        title="Revenue Collected (7 Days)"
                        value={formatCurrency(metrics.totalRevenue)}
                        icon="bi bi-graph-up-arrow"
                        color="success"
                    />
                )}
            </div>

            {showRevenueInsights && (
                <div className="dashboard-insights">
                    <div className="chart-section revenue-chart">
                        <h3>Revenue Trend (Last 7 Days)</h3>
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner" aria-hidden="true"></div>
                                <p>Loading revenue data...</p>
                            </div>
                        ) : revenueChartData ? (
                            <div className="chart-container">
                                <Line
                                    data={revenueChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: false,
                                            },
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    callback: (value) => formatCurrency(Number(value)),
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        ) : (
                            <p>No revenue data available</p>
                        )}
                    </div>

                    <div className="chart-section role-chart">
                        <h3>Delivery Status</h3>
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner" aria-hidden="true"></div>
                                <p>Loading delivery data...</p>
                            </div>
                        ) : deliveryChartData ? (
                            <div className="chart-container">
                                <Doughnut
                                    data={deliveryChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                            },
                                        },
                                        cutout: '65%'
                                    }}
                                />
                            </div>
                        ) : (
                            <p>No delivery data available</p>
                        )}
                    </div>
                </div>
            )}

            <div className="dashboard-content">
                <div className="chart-section">
                    <h3>Production Activity (Last 7 Days)</h3>
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner" aria-hidden="true"></div>
                            <p>Loading chart data...</p>
                        </div>
                    ) : chartData ? (
                        <div className="chart-container">
                            <Bar
                                data={chartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
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
                        </div>
                    ) : (
                        <p>No chart data available</p>
                    )}
                </div>

                {showRevenueInsights && (
                    <div className="chart-section low-stock-section">
                        <h3>Low Stock Alerts</h3>
                        {lowStockItems.length > 0 ? (
                            <ul className="low-stock-list">
                                {lowStockItems.map((item) => (
                                    <li key={`${item.product_name}-${item.quantity}`}>
                                        <div>
                                            <strong>{item.product_name}</strong>
                                            <span>Reorder level: {item.reorder_level}</span>
                                        </div>
                                        <span className="badge badge-warning">Qty {item.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No low stock items found.</p>
                        )}
                    </div>
                )}

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