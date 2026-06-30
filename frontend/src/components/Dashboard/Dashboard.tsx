/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-useless-assignment */
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
    low_stock: boolean | number;  // ✅ Allow both boolean and number
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

/* eslint-disable @typescript-eslint/no-explicit-any */

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
                console.error('Error parsing user:', e);
            }
        }
        void fetchDashboardData();
    }, []);

    // ✅ Helper functions - defined at component level
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

            default: {
                const defaultLabels = ['Total', 'Active', 'Inactive'];
                const defaultData = [1, 1, 0];
                const defaultColors = ['#1D9E75', '#17a2b8', '#dc3545'];
                const defaultLabel = 'Overview';

                labels = defaultLabels;
                chartData = defaultData;
                colors = defaultColors;
                label = defaultLabel;
                break;
            }
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

            const batches = (batchesRes as any)?.data || [];
            const orders = (ordersRes as any)?.data || [];
            const deliveries = (deliveriesRes as any)?.data || [];
            const inventory = (inventoryRes as any)?.data || [];
            const credit = (creditRes as any)?.data || { total_outstanding: 0, count: 0 };
            const customers = (customersRes as any)?.data || [];
            const products = (productsRes as any)?.data || [];

            // ✅ DEBUG: Log batches data
            console.log('📦 Batches from API:', batches);
            console.log('📦 Batches count:', batches.length);
            console.log('📅 Batch dates:', batches.map((b: Batch) => b.batch_date));

            const today = new Date().toISOString().split('T')[0];
            console.log('📅 Today:', today);

            const todayBatches = batches.filter((b: Batch) => {
                const batchDate = new Date(b.batch_date).toISOString().split('T')[0];
                return batchDate === today;
            }).length;

            console.log('🏭 Today\'s Batches:', todayBatches);

            const pendingDeliveries = deliveries.filter((d: Delivery) => d.status === 'pending').length;

            // ✅ DEBUG: Log inventory data
            console.log('📋 Inventory from API:', inventory);
            console.log('⚠️ Low Stock Items:', inventory.filter((i: InventoryItem) => i.low_stock === true));
            console.log('⚠️ Low Stock Count:', inventory.filter((i: InventoryItem) => i.low_stock === true).length);

            // ✅ Log each item's low_stock status
            inventory.forEach((item: InventoryItem) => {
                console.log(`📦 ${item.material_name}: low_stock = ${item.low_stock}, current_stock = ${item.current_stock}, minimum_stock = ${item.minimum_stock}`);
            });

            const lowStock = inventory.filter((i: InventoryItem) => {
                // Handle both number (1) and boolean (true)
                if (typeof i.low_stock === 'number') {
                    return i.low_stock === 1;
                }
                return i.low_stock === true;
            }).length;
            console.log('⚠️ Low Stock Items (fixed):', inventory.filter((i: InventoryItem) => {
                if (typeof i.low_stock === 'number') {
                    return i.low_stock === 1;
                }
                return i.low_stock === true;
            }));
            console.log('⚠️ Low Stock Count (fixed):', lowStock);

            const totalRevenue = orders
                .filter((o: Order) => o.payment_status === 'paid')
                .reduce((sum: number, o: Order) => {
                    const amount = typeof o.total_amount === 'string'
                        ? parseFloat(o.total_amount)
                        : Number(o.total_amount || 0);
                    return sum + (isNaN(amount) ? 0 : amount);
                }, 0);

            const creditSummary = credit as CreditSummary;

            setMetrics({
                todayBatches,
                pendingDeliveries,
                lowStock,
                creditOutstanding: Number(creditSummary.total_outstanding || 0),
                totalOrders: orders.length,
                totalCustomers: customers.length,
                totalProducts: products.length,
                totalRevenue
            });

            setRecentBatches(batches.slice(0, 5));
            setRecentOrders(orders.slice(0, 5));
            setLowStockItems(inventory.filter((i: InventoryItem) => i.low_stock).slice(0, 5));

            // Production Chart (Last 7 days batches)
            const last7Days = getLast7Days();
            const dailyBatches = last7Days.map((date: string) => ({
                date,
                count: batches.filter((b: Batch) => {
                    try {
                        const batchDate = new Date(b.batch_date);
                        const formattedDate = batchDate.toISOString().split('T')[0];
                        return formattedDate === date;
                    } catch (e) {
                        return false;
                    }
                }).length
            }));

            console.log('📊 Daily Batches:', dailyBatches);

            setChartData({
                labels: dailyBatches.map((d) => d.date),
                datasets: [
                    {
                        label: 'Batches Produced',
                        data: dailyBatches.map((d) => d.count),
                        backgroundColor: '#1D9E75',
                    }
                ]
            });

            generateRoleBasedCharts(batches, orders, deliveries, customers, products);

            // Revenue chart - last 7 days
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
                labels: dailyRevenue.map((d) => d.date),
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

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>📊 Dashboard</h1>
                <p>
                    Welcome, {userName}! <span className="role-tag">{userRole}</span>
                </p>
                <p className="role-message">{getWelcomeMessage()}</p>
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
                {['admin', 'sales'].includes(userRole) && (
                    <MetricCard
                        title="Total Revenue"
                        value={`UGX ${(metrics.totalRevenue || 0).toLocaleString()}`}
                        icon="💳"
                        color="success"
                    />
                )}
                {['admin', 'supervisor'].includes(userRole) && (
                    <MetricCard
                        title="Total Orders"
                        value={metrics.totalOrders}
                        icon="📦"
                        color="primary"
                    />
                )}
            </div>

            <div className="dashboard-content">
                {showProductionChart && chartData && (
                    <div className="chart-section">
                        <h3>📈 Production Activity (Last 7 Days)</h3>
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
                        <h3>📊 {roleChartData.datasets[0]?.label || 'Role Overview'}</h3>
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
                        <h3>💰 Revenue Trend (Last 7 Days)</h3>
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
                        <h3>🏭 Recent Batches</h3>
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
                )}

                {['admin', 'sales'].includes(userRole) && (
                    <div className="recent-section">
                        <h3>🛒 Recent Orders</h3>
                        {loading ? (
                            <p>Loading...</p>
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
                                            <td>{order.order_date}</td>
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
                        <h3>⚠️ Low Stock Alerts</h3>
                        {loading ? (
                            <p>Loading...</p>
                        ) : lowStockItems.length === 0 ? (
                            <p className="no-data">✅ All items are well stocked!</p>
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
        </div>
    );
};

export default Dashboard;