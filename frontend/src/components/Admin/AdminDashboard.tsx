
import React, { useState, useEffect, useCallback } from 'react';
import { AdminAPI } from '../../api/api';
import './AdminDashboard.css';

interface User {
    staff_id: number;
    name: string;
    email: string;
    role: string;
    phone: string;
    status: 'active' | 'suspended' | 'inactive';
    last_login: string;
    created_at: string;
}

interface SystemStats {
    users: number;
    active_users: number;
    suspended_users: number;
    customers: number;
    products: number;
    batches: number;
    orders: number;
    raw_materials: number;
    suppliers: number;
    low_stock: number;
    pending_orders: number;
}

interface ApiError {
    response?: {
        data?: {
            error?: string;
        };
        status?: number;
    };
    message?: string;
}

interface StatsResponse {
    users: number;
    active_users: number;
    suspended_users: number;
    customers: number;
    products: number;
    batches: number;
    orders: number;
    raw_materials: number;
    suppliers: number;
    low_stock: number;
    pending_orders: number;
}

// ✅ Define form data type with proper status union
interface FormData {
    name: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    status: 'active' | 'suspended' | 'inactive';
}

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        role: 'delivery',
        phone: '',
        status: 'active'
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [usersRes, statsRes] = await Promise.all([
                AdminAPI.getUsers(),
                AdminAPI.getStats()
            ]);
            
            setUsers(usersRes.data as User[] || []);
            setStats(statsRes.data as StatsResponse || null);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError.response?.data?.error || 'Failed to fetch data');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (isMounted) {
                await fetchData();
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [fetchData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // ✅ Ensure status is properly typed
            const userData = {
                name: formData.name,
                email: formData.email,
                password: formData.password || undefined,
                role: formData.role,
                phone: formData.phone,
                status: formData.status as 'active' | 'suspended' | 'inactive'
            };

            if (editingUser) {
                await AdminAPI.updateUser(editingUser.staff_id, userData);
            } else {
                await AdminAPI.createUser(userData);
            }
            setShowForm(false);
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'delivery',
                phone: '',
                status: 'active'
            });
            await fetchData();
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError.response?.data?.error || 'Failed to save user');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            phone: user.phone || '',
            status: user.status
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await AdminAPI.deleteUser(id);
            await fetchData();
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError.response?.data?.error || 'Failed to delete user');
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: string) => {
        const action = currentStatus === 'suspended' ? 'activate' : 'suspend';
        const confirmMsg = currentStatus === 'suspended' 
            ? 'Are you sure you want to activate this user?' 
            : 'Are you sure you want to suspend this user?';
        
        if (!window.confirm(confirmMsg)) return;
        
        try {
            if (action === 'activate') {
                await AdminAPI.activateUser(id);
            } else {
                await AdminAPI.suspendUser(id);
            }
            await fetchData();
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError.response?.data?.error || 'Failed to update user status');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'delivery',
            phone: '',
            status: 'active'
        });
    };

    const getRoleBadgeClass = (role: string): string => {
        switch (role) {
            case 'admin': return 'badge-danger';
            case 'supervisor': return 'badge-warning';
            case 'production': return 'badge-success';
            case 'delivery': return 'badge-info';
            case 'sales': return 'badge-primary';
            default: return 'badge-secondary';
        }
    };

    const getStatusBadgeClass = (status: string): string => {
        switch (status) {
            case 'active': return 'badge-success';
            case 'suspended': return 'badge-danger';
            case 'inactive': return 'badge-secondary';
            default: return 'badge-secondary';
        }
    };

    if (loading && !stats) {
        return <div className="admin-loading">Loading admin dashboard...</div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="page-header">
                <h1>⚙️ Admin Dashboard</h1>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-icon">👤</span>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.users || 0}</span>
                        <span className="stat-label">Total Users</span>
                        <span className="stat-sub">Active: {stats?.active_users || 0}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🚫</span>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.suspended_users || 0}</span>
                        <span className="stat-label">Suspended Users</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📦</span>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.raw_materials || 0}</span>
                        <span className="stat-label">Raw Materials</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">⚠️</span>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.low_stock || 0}</span>
                        <span className="stat-label">Low Stock Items</span>
                    </div>
                </div>
            </div>

            <div className="user-management">
                <div className="section-header">
                    <h2>👥 User Management</h2>
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        + Add User
                    </button>
                </div>

                {showForm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>{editingUser ? '✏️ Edit User' : '➕ Add New User'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password {editingUser ? '(Leave blank to keep current)' : '*'}</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required={!editingUser}
                                        placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password (min 6 chars)'}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Role *</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="supervisor">Supervisor</option>
                                            <option value="production">Production</option>
                                            <option value="delivery">Delivery</option>
                                            <option value="sales">Sales</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button type="button" className="btn-secondary" onClick={handleCancel}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Phone</th>
                                <th>Last Login</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="empty-state">No users found</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.staff_id} className={user.status === 'suspended' ? 'suspended-row' : ''}>
                                        <td><strong>{user.name}</strong></td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>{user.phone || '-'}</td>
                                        <td>{user.last_login ? new Date(user.last_login).toLocaleDateString() : '-'}</td>
                                        <td>
                                            <button 
                                                className="btn-sm btn-edit"
                                                onClick={() => handleEdit(user)}
                                                title="Edit User"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                className={`btn-sm ${user.status === 'suspended' ? 'btn-activate' : 'btn-suspend'}`}
                                                onClick={() => handleToggleStatus(user.staff_id, user.status)}
                                                title={user.status === 'suspended' ? 'Activate' : 'Suspend'}
                                            >
                                                {user.status === 'suspended' ? '🔓' : '🔒'}
                                            </button>
                                            <button 
                                                className="btn-sm btn-delete"
                                                onClick={() => handleDelete(user.staff_id)}
                                                title="Delete User"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
