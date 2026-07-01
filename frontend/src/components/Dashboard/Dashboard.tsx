import React, { useState, useEffect } from 'react';
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

interface ReportData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string | string[];
        borderColor?: string;
        borderWidth?: number;
        fill?: boolean;
        tension?: number;
    }[];
}

interface Batch {
    batch_id: number;
    batch_number: string;
    batch_date: string;
    status: string;
    total_units?: number;
}

interface Order {
    order_id: number;
    order_date: string;
    total_amount: string | number;
    payment_status: string;
    customer_name?: string;
}

interface Delivery {
    delivery_id: number;
    status: string;
}

interface InventoryItem {
    material_id: number;
    material_name: string;
    current_stock: number;
    minimum_stock: number;
    low_stock: boolean | number; // Backend may return either a boolean or a 0/1 flag
}

interface Customer {
    customer_id: number;
}

interface Product {
    product_id: number;
}

interface CreditSummary {
    total_outstanding: number;
    count: number;
}

interface User {
    name: string;
    role: string;
}

// Formatting helpers
const formatCurrency = (amount: number): string => {
    return `UGX ${Math.round(amount || 0).toLocaleString()}`;
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

const Dashboard: React.FC = () => {
    const [userRole, setUserRole] = useState<string>('delivery');
    const [userName, setUserName] = useState<string>('User');
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
    const [error, setError] = useState<string>('');
    const [recentBatches, setRecentBatches] = useState<Batch[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
    const [chartData, setChartData] = useState<ReportData | null>(null);
    const [roleChartData, setRoleChartData] = useState<ReportData | null>(null);
    const [revenueChartData, setRevenueChartData] = useState<ReportData | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user: User = JSON.parse(userStr);
                setUserRole(user.role || 'delivery');
                setUserName(user.name || 'User');
            } catch (e) {
                console.error('Error parsing stored user:', e);
            }
        }
        void fetchDashboardData();
        // Runs once on mount; fetchDashboardData reads the latest userRole internally when it resolves.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getLast7Days = (): string[] => {
        const dates: string[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
    };

    const getStatusBadgeClass = (status: string): string => {
        const statusMap: Record<string, string> = {
            completed: 'badge-success',
            in_progress: 'badge-warning',
            pending: 'badge-secondary',
            delivered: 'badge-success',
            dispatched: 'badge-info',
        };
        return statusMap[status] || 'badge-secondary';
    };

    const getWelcomeMessage = (): string => {
        const messages: Record<string, string> = {
            admin: 'You have full access to all system data.',
            supervisor: 'You can view production and delivery overview.',
            production: 'Focus on your production batches.',
            delivery: 'Track your deliveries efficiently.',
            sales: 'Manage your orders and customers.'
        };
        return messages[userRole] || 'Welcome to your dashboard.';
    };

    const generateRoleBasedCharts = (
        batches: Batch[],
        orders: Order[],
        deliveries: Delivery[],
        customers: Customer[],
        products: Product[]
    ): void => {
        let labels: string[] = [];
        let chartData: number[] = [];
        let colors: string[] = [];
        let label = '';

        switch (userRole) {
            case 'admin':
                labels = ['Batches', 'Orders', 'Deliveries', 'Customers', 'Products'];
                chartData = [batches.length, orders.length, deliveries.length, customers.length, products.length];
                colors = ['#1D9E75', '#17a2b8', '#ffc107', '#6f42c1', '#fd7e14'];
                label = 'Overall System Stats';
                break;

            case 'supervisor': {
                const pendingDeliveries = deliveries.filter((d: Delivery) => d.status === 'pending').length;
                const completedDeliveries = deliveries.filter((d: Delivery) => d.status === 'delivered').length;
                const completedBatches = batches.filter((b: Batch) => b.status === 'completed').length;

                labels = ['Completed Batches', 'Pending Batches', 'Completed Deliveries', 'Pending Deliveries'];
                chartData = [completedBatches, batches.length - completedBatches, completedDeliveries, pendingDeliveries];
                colors = ['#28a745', '#ffc107', '#17a2b8', '#dc3545'];
                label = 'Production & Delivery Overview';
                break;
            }

            case 'production': {
                const completed = batches.filter((b: Batch) => b.status === 'completed').length;
                const inProgress = batches.filter((b: Batch) => b.status === 'in_progress').length;
                const pending = batches.filter((b: Batch) => b.status === 'pending').length;

                labels = ['Completed', 'In Progress', 'Pending'];
                chartData = [completed, inProgress, pending];
                colors = ['#28a745', '#ffc107', '#dc3545'];
                label = 'Batch Status Overview';
                break;
            }

            case 'delivery': {
                const delivered = deliveries.filter((d: Delivery) => d.status === 'delivered').length;
                const dispatched = deliveries.filter((d: Delivery) => d.status === 'dispatched').length;
                const pendingDel = deliveries.filter((d: Delivery) => d.status === 'pending').length;

                labels = ['Delivered', 'Dispatched', 'Pending'];
                chartData = [delivered, dispatched, pendingDel];
                colors = ['#28a745', '#17a2b8', '#dc3545'];
                label = 'Delivery Status Overview';
                break;
            }

            case 'sales': {
                const paid = orders.filter((o: Order) => o.payment_status === 'paid').length;
                const partial = orders.filter((o: Order) => o.payment_status === 'partial').length;
                const pendingOrders = orders.filter((o: Order) => o.payment_status === 'pending').length;

                labels = ['Paid', 'Partial', 'Pending'];
                chartData = [paid, partial, pendingOrders];
                colors = ['#28a745', '#ffc107', '#dc3545'];
                label = 'Order Payment Status';
                break;
            }

            default:
                labels = ['Total', 'Active', 'Inactive'];
                chartData = [1, 1, 0];
                colors = ['#1D9E75', '#17a2b8', '#dc3545'];
                label = 'Overview';
                break;
        }

        setRoleChartData({
            labels,
            datasets: [
                {
                    label,
                    data: chartData,
                    backgroundColor: colors,
                    borderWidth: 2,
                }
            ]
        });
    };

    const showProductionChart = ['admin', 'supervisor', 'production'].includes(userRole);
    const showRevenueChart = ['admin', 'supervisor', 'sales'].includes(userRole);

    const fetchDashboardData = async (): Promise<void> => {
        setLoading(true);
        setError('');
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

            const batches: Batch[] = (batchesRes?.data || []) as unknown as Batch[];
            const orders: Order[] = (ordersRes?.data || []) as unknown as Order[];
            const deliveries: Delivery[] = (deliveriesRes?.data || []) as unknown as Delivery[];
            const inventory: InventoryItem[] = (inventoryRes?.data || []) as unknown as InventoryItem[];
            const credit: CreditSummary = (creditRes?.data || { total_outstanding: 0, count: 0 }) as unknown as CreditSummary;
            const customers: Customer[] = (customersRes?.data || []) as unknown as Customer[];
            const products: Product[] = (productsRes?.data || []) as unknown as Product[];

            const today = new Date().toISOString().split('T')[0];
            const todayBatches = batches.filter((b: Batch) => {
                const batchDate = new Date(b.batch_date).toISOString().split('T')[0];
                return batchDate === today;
            }).length;

            const pendingDeliveries = deliveries.filter((d: Delivery) => d.status === 'pending').length;

            const lowStock = inventory.filter((i: InventoryItem) => {
                // Handles both number (1) and boolean (true) representations from the backend
                if (typeof i.low_stock === 'number') {
                    return i.low_stock === 1;
                }
                return i.low_stock === true;
            }).length;

            const totalRevenue = orders
                .filter((o: Order) => o.payment_status === 'paid')
                .reduce((sum: number, o: Order) => {
                    const amount = typeof o.total_amount === 'string'
                        ? parseFloat(o.total_amount)
                        : Number(o.total_amount || 0);
                    return sum + (isNaN(amount) ? 0 : amount);
                }, 0);

            setMetrics({
                todayBatches,
                pendingDeliveries,
                lowStock,
                creditOutstanding: Number(credit.total_outstanding || 0),
                totalOrders: orders.length,
                totalCustomers: customers.length,
                totalProducts: products.length,
                totalRevenue
            });

            setRecentBatches(batches.slice(0, 5));
            setRecentOrders(orders.slice(0, 5));
            setLowStockItems(inventory.filter((i: InventoryItem) => i.low_stock).slice(0, 5));

            // Production chart: batches produced over the last 7 days
            const last7Days = getLast7Days();
            const dailyBatches = last7Days.map((date: string) => ({
                date,
                count: batches.filter((b: Batch) => {
                    try {
                        const batchDate = new Date(b.batch_date);
                        return batchDate.toISOString().split('T')[0] === date;
                    } catch {
                        return false;
                    }
                }).length
            }));

            setChartData({
                labels: dailyBatches.map((d) => formatDate(d.date)),
                datasets: [
                    {
                        label: 'Batches Produced',
                        data: dailyBatches.map((d) => d.count),
                        backgroundColor: '#1D9E75',
                    }
                ]
            });

            generateRoleBasedCharts(batches, orders, deliveries, customers, products);

            // Revenue chart: paid order revenue over the last 7 days
            const dailyRevenue = last7Days.map((date: string) => {
                const dayOrders = orders.filter((o: Order) => {
                    const orderDate = new Date(o.order_date).toISOString().split('T')[0];
                    return orderDate === date && o.payment_status === 'paid';
                });

                const total = dayOrders.reduce((sum: number, o: Order) => {
                    const amount = typeof o.total_amount === 'string'
                        ? parseFloat(o.total_amount)
                        : Number(o.total_amount || 0);
                    return sum + (isNaN(amount) ? 0 : amount);
                }, 0);

                return { date, total };
            });

            setRevenueChartData({
                labels: dailyRevenue.map((d) => formatDate(d.date)),
                datasets: [
                    {
                        label: 'Daily Revenue (UGX)',
                        data: dailyRevenue.map((d) => d.total),
                        backgroundColor: 'rgba(29, 158, 117, 0.6)',
                        borderColor: '#1D9E75',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                    }
                ]
            });

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Unable to load dashboard data right now. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="header-top">
                    <h1>
                        <i className="bi bi-speedometer2" aria-hidden="true"></i>
                        Dashboard
                    </h1>
                    <span className="role-tag">
                        <i className="bi bi-person-badge" aria-hidden="true"></i>
                        {userRole}
                    </span>
                </div>
                <p className="dashboard-welcome">Welcome back, {userName}.</p>
                <p className="role-message">{getWelcomeMessage()}</p>
            </div>

            {loading && (
                <div className="state-panel">
                    <i className="bi bi-arrow-repeat spin" aria-hidden="true"></i>
                    <p>Loading dashboard data...</p>
                </div>
            )}

            {!loading && error && (
                <div className="state-panel state-error" role="alert">
                    <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
                    <p>{error}</p>
                    <button className="btn-retry" onClick={fetchDashboardData}>
                        <i className="bi bi-arrow-repeat" aria-hidden="true"></i>
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="metrics-grid">
                        <MetricCard
                            title="Today's Batches"
                            titleIcon="bi bi-factory"
                            value={metrics.todayBatches}
                            icon="bi bi-factory"
                            color="primary"
                        />
                        <MetricCard
                            title="Pending Deliveries"
                            titleIcon="bi bi-truck"
                            value={metrics.pendingDeliveries}
                            icon="bi bi-truck"
                            color="warning"
                        />
                        <MetricCard
                            title="Low Stock Alerts"
                            titleIcon="bi bi-exclamation-triangle"
                            value={metrics.lowStock}
                            icon="bi bi-exclamation-triangle"
                            color="danger"
                        />
                        <MetricCard
                            title="Credit Outstanding"
                            titleIcon="bi bi-cash-coin"
                            value={formatCurrency(metrics.creditOutstanding)}
                            icon="bi bi-cash-coin"
                            color="info"
                        />
                        {['admin', 'sales'].includes(userRole) && (
                            <MetricCard
                                title="Total Revenue"
                                titleIcon="bi bi-credit-card"
                                value={formatCurrency(metrics.totalRevenue)}
                                icon="bi bi-credit-card"
                                color="success"
                            />
                        )}
                        {['admin', 'supervisor'].includes(userRole) && (
                            <MetricCard
                                title="Total Orders"
                                titleIcon="bi bi-box-seam"
                                value={metrics.totalOrders}
                                icon="bi bi-box-seam"
                                color="primary"
                            />
                        )}
                    </div>

                    <div className="dashboard-content">
                        {showProductionChart && chartData && (
                            <div className="chart-section">
                                <h3>
                                    <i className="bi bi-graph-up-arrow" aria-hidden="true"></i>
                                    Production Activity (Last 7 Days)
                                </h3>
                                <Bar
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { display: false },
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: { stepSize: 1 },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        )}

                        {roleChartData && (
                            <div className="chart-section role-chart">
                                <h3>
                                    <i className="bi bi-pie-chart" aria-hidden="true"></i>
                                    {roleChartData.datasets[0]?.label || 'Role Overview'}
                                </h3>
                                <Doughnut
                                    data={roleChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                            },
                                        },
                                    }}
                                />
                            </div>
                        )}

                        {showRevenueChart && revenueChartData && (
                            <div className="chart-section revenue-chart">
                                <h3>
                                    <i className="bi bi-graph-up-arrow" aria-hidden="true"></i>
                                    Revenue Trend (Last 7 Days)
                                </h3>
                                <Line
                                    data={revenueChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { display: false },
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                            },
                                        },
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="dashboard-tables">
                        {['admin', 'supervisor', 'production'].includes(userRole) && (
                            <div className="recent-section">
                                <h3>
                                    <i className="bi bi-factory" aria-hidden="true"></i>
                                    Recent Batches
                                </h3>
                                {recentBatches.length === 0 ? (
                                    <p className="no-data">No recent batches recorded.</p>
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
                                                    <td>{formatDate(batch.batch_date)}</td>
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
                        )}

                        {['admin', 'sales'].includes(userRole) && (
                            <div className="recent-section">
                                <h3>
                                    <i className="bi bi-box-seam" aria-hidden="true"></i>
                                    Recent Orders
                                </h3>
                                {recentOrders.length === 0 ? (
                                    <p className="no-data">No recent orders recorded.</p>
                                ) : (
                                    <table className="recent-table">
                                        <thead>
                                            <tr>
                                                <th>Order #</th>
                                                <th>Date</th>
                                                <th>Amount (UGX)</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentOrders.map((order: Order) => (
                                                <tr key={order.order_id}>
                                                    <td>#{order.order_id}</td>
                                                    <td>{formatDate(order.order_date)}</td>
                                                    <td>
                                                        {typeof order.total_amount === 'string'
                                                            ? parseFloat(order.total_amount).toLocaleString()
                                                            : (order.total_amount || 0).toLocaleString()}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                                            {order.payment_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {['admin', 'supervisor', 'production'].includes(userRole) && (
                            <div className="recent-section">
                                <h3>
                                    <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
                                    Low Stock Alerts
                                </h3>
                                {lowStockItems.length === 0 ? (
                                    <p className="no-data no-data-positive">
                                        <i className="bi bi-check-circle" aria-hidden="true"></i>
                                        All items are well stocked.
                                    </p>
                                ) : (
                                    <table className="recent-table">
                                        <thead>
                                            <tr>
                                                <th>Material</th>
                                                <th>Current Stock</th>
                                                <th>Min Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lowStockItems.map((item: InventoryItem) => (
                                                <tr key={item.material_id} className="low-stock-row">
                                                    <td>{item.material_name}</td>
                                                    <td>{item.current_stock}</td>
                                                    <td>{item.minimum_stock}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;