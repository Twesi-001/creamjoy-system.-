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
    password_hash?: string;
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

interface FormData {
    name: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    status: 'active' | 'suspended' | 'inactive';
}

interface ConfirmationState {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
}

interface PasswordResetState {
    isOpen: boolean;
    userId: number | null;
    userName: string;
    newPassword: string;
    confirmPassword: string;
    error: string;
}

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
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
    const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
    const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
    const [passwordReset, setPasswordReset] = useState<PasswordResetState>({
        isOpen: false,
        userId: null,
        userName: '',
        newPassword: '',
        confirmPassword: '',
        error: ''
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            const [usersRes, statsRes] = await Promise.all([
                AdminAPI.getUsers(),
                AdminAPI.getStats()
            ]);
            
            setUsers(usersRes.data as User[] || []);
            setStats(statsRes.data as StatsResponse || null);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError.response?.data?.error || 'Failed to fetch admin data');
            console.error('Error fetching admin data:', err);
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

    const validateForm = (): boolean => {
        const errors: Partial<FormData> = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Full name is required';
        }
        
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!editingUser && !formData.password) {
            errors.password = 'Password is required for new users';
        } else if (formData.password && formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        if (formErrors[name as keyof FormData]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');
        
        try {
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
                setSuccessMessage('User updated successfully');
            } else {
                await AdminAPI.createUser(userData);
                setSuccessMessage('User created successfully');
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
            setFormErrors({});
            await fetchData();
            setTimeout(() => setSuccessMessage(''), 5000);
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
        setFormErrors({});
        setShowForm(true);
    };

    const handleDeleteClick = (userId: number, userName: string) => {
        setConfirmation({
            isOpen: true,
            title: 'Delete User',
            message: `Are you sure you want to delete "${userName}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: () => handleDelete(userId)
        });
    };

    const handleDelete = async (id: number) => {
        setConfirmation(null);
        setLoading(true);
        try {
            await AdminAPI.deleteUser(id);
            setSuccessMessage('User deleted successfully');
            await fetchData();
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError.response?.data?.error || 'Failed to delete user');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatusClick = (userId: number, userName: string, currentStatus: string) => {
        const action = currentStatus === 'suspended' ? 'activate' : 'suspend';
        const actionDisplay = action === 'activate' ? 'Activate' : 'Suspend';
        const message = currentStatus === 'suspended' 
            ? `Are you sure you want to activate "${userName}"?`
            : `Are you sure you want to suspend "${userName}"? Suspended users cannot access the system.`;
        
        setConfirmation({
            isOpen: true,
            title: `${actionDisplay} User`,
            message: message,
            confirmText: actionDisplay,
            cancelText: 'Cancel',
            type: action === 'suspend' ? 'warning' : 'info',
            onConfirm: () => handleToggleStatus(userId, currentStatus)
        });
    };

    const handleToggleStatus = async (id: number, currentStatus: string) => {
        setConfirmation(null);
        setLoading(true);
        try {
            if (currentStatus === 'suspended') {
                await AdminAPI.activateUser(id);
                setSuccessMessage('User activated successfully');
            } else {
                await AdminAPI.suspendUser(id);
                setSuccessMessage('User suspended successfully');
            }
            await fetchData();
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError.response?.data?.error || 'Failed to update user status');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPasswordClick = (userId: number, userName: string) => {
        setPasswordReset({
            isOpen: true,
            userId: userId,
            userName: userName,
            newPassword: '',
            confirmPassword: '',
            error: ''
        });
    };

    const handlePasswordResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordReset((prev) => ({
            ...prev,
            [name]: value,
            error: ''
        }));
    };

    const handlePasswordResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!passwordReset.userId) return;
        
        if (passwordReset.newPassword.length < 6) {
            setPasswordReset((prev) => ({
                ...prev,
                error: 'Password must be at least 6 characters'
            }));
            return;
        }
        
        if (passwordReset.newPassword !== passwordReset.confirmPassword) {
            setPasswordReset((prev) => ({
                ...prev,
                error: 'Passwords do not match'
            }));
            return;
        }
        
        setLoading(true);
        try {
            await AdminAPI.resetPassword(passwordReset.userId, passwordReset.newPassword);
            setSuccessMessage(`Password reset successfully for ${passwordReset.userName}`);
            setPasswordReset({
                isOpen: false,
                userId: null,
                userName: '',
                newPassword: '',
                confirmPassword: '',
                error: ''
            });
            await fetchData();
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setPasswordReset((prev) => ({
                ...prev,
                error: apiError.response?.data?.error || 'Failed to reset password'
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleCancelPasswordReset = () => {
        setPasswordReset({
            isOpen: false,
            userId: null,
            userName: '',
            newPassword: '',
            confirmPassword: '',
            error: ''
        });
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
        setFormErrors({});
    };

    const handleCancelConfirmation = () => {
        setConfirmation(null);
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

    const getRoleIcon = (role: string): string => {
        switch (role) {
            case 'admin': return 'bi-shield-fill-check';
            case 'supervisor': return 'bi-person-workspace';
            case 'production': return 'bi-gear';
            case 'delivery': return 'bi-truck';
            case 'sales': return 'bi-graph-up';
            default: return 'bi-person';
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

    const getStatusIcon = (status: string): string => {
        switch (status) {
            case 'active': return 'bi-check-circle';
            case 'suspended': return 'bi-exclamation-circle';
            case 'inactive': return 'bi-circle';
            default: return 'bi-circle';
        }
    };

    const formatLastLogin = (dateString: string): string => {
        if (!dateString) return 'Never logged in';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Never logged in';
        }
    };

    const formatPhone = (phone: string): string => {
        return phone || 'Not provided';
    };

    const getStatIcon = (key: string): string => {
        const icons: Record<string, string> = {
            users: 'bi-people',
            active_users: 'bi-person-check',
            suspended_users: 'bi-person-x',
            customers: 'bi-person-badge',
            products: 'bi-box',
            batches: 'bi-layers',
            orders: 'bi-cart',
            raw_materials: 'bi-box-seam',
            suppliers: 'bi-truck',
            low_stock: 'bi-exclamation-triangle',
            pending_orders: 'bi-clock'
        };
        return icons[key] || 'bi-circle';
    };

    const getStatLabel = (key: string): string => {
        const labels: Record<string, string> = {
            users: 'Total Users',
            active_users: 'Active Users',
            suspended_users: 'Suspended Users',
            customers: 'Customers',
            products: 'Products',
            batches: 'Batches',
            orders: 'Orders',
            raw_materials: 'Raw Materials',
            suppliers: 'Suppliers',
            low_stock: 'Low Stock Items',
            pending_orders: 'Pending Orders'
        };
        return labels[key] || key;
    };

    if (loading && !stats) {
        return (
            <div className="admin-dashboard">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="page-header">
                <div className="header-left">
                    <div className="header-icon">
                        <i className="bi bi-shield-lock"></i>
                    </div>
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p className="header-subtitle">System administration and user management</p>
                    </div>
                </div>
                <div className="header-actions">
                    <span className="admin-count">
                        <i className="bi bi-people"></i>
                        {users.length} user{users.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {successMessage && (
                <div className="success-message">
                    <i className="bi bi-check-circle"></i>
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="error-message">
                    <i className="bi bi-exclamation-circle"></i>
                    <span>{error}</span>
                    <button className="btn-retry" onClick={fetchData}>
                        <i className="bi bi-arrow-repeat"></i>
                        Retry
                    </button>
                </div>
            )}

            <div className="stats-grid">
                {stats && [
                    { key: 'users', value: stats.users, sub: `Active: ${stats.active_users}` },
                    { key: 'active_users', value: stats.active_users },
                    { key: 'suspended_users', value: stats.suspended_users },
                    { key: 'raw_materials', value: stats.raw_materials },
                    { key: 'low_stock', value: stats.low_stock },
                    { key: 'pending_orders', value: stats.pending_orders }
                ].map((stat) => (
                    <div key={stat.key} className="stat-card">
                        <div className="stat-icon">
                            <i className={getStatIcon(stat.key)}></i>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{getStatLabel(stat.key)}</span>
                            {stat.sub && <span className="stat-sub">{stat.sub}</span>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="user-management">
                <div className="section-header">
                    <div className="section-title">
                        <i className="bi bi-people"></i>
                        <h2>User Management</h2>
                    </div>
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        <i className="bi bi-person-plus"></i>
                        Add User
                    </button>
                </div>

                {showForm && (
                    <div className="modal-overlay" role="dialog" aria-modal="true">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>
                                    <i className="bi bi-person"></i>
                                    {editingUser ? 'Edit User' : 'Add New User'}
                                </h2>
                                <button 
                                    className="modal-close" 
                                    onClick={handleCancel}
                                    aria-label="Close form"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="form-group">
                                    <label htmlFor="name">
                                        <i className="bi bi-person"></i>
                                        Full Name <span className="required">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={formErrors.name ? 'error' : ''}
                                        placeholder="Enter full name"
                                        required
                                    />
                                    {formErrors.name && (
                                        <span className="field-error">{formErrors.name}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">
                                        <i className="bi bi-envelope"></i>
                                        Email <span className="required">*</span>
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={formErrors.email ? 'error' : ''}
                                        placeholder="Enter email address"
                                        required
                                    />
                                    {formErrors.email && (
                                        <span className="field-error">{formErrors.email}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">
                                        <i className="bi bi-key"></i>
                                        Password {editingUser ? '(Leave blank to keep current)' : <span className="required">*</span>}
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={formErrors.password ? 'error' : ''}
                                        placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password (min 6 chars)'}
                                        required={!editingUser}
                                        minLength={6}
                                    />
                                    {formErrors.password && (
                                        <span className="field-error">{formErrors.password}</span>
                                    )}
                                    {!editingUser && (
                                        <span className="field-hint">Must be at least 6 characters</span>
                                    )}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="role">
                                            <i className="bi bi-badge"></i>
                                            Role <span className="required">*</span>
                                        </label>
                                        <select
                                            id="role"
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
                                        <label htmlFor="status">
                                            <i className="bi bi-toggle-on"></i>
                                            Status
                                        </label>
                                        <select
                                            id="status"
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
                                    <label htmlFor="phone">
                                        <i className="bi bi-telephone"></i>
                                        Phone
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <span className="spinner-small"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle"></i>
                                                {editingUser ? 'Update User' : 'Add User'}
                                            </>
                                        )}
                                    </button>
                                    <button type="button" className="btn-secondary" onClick={handleCancel}>
                                        <i className="bi bi-x-lg"></i>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {confirmation && (
                    <div className="modal-overlay" role="dialog" aria-modal="true">
                        <div className="modal-content modal-confirm">
                            <div className="modal-header">
                                <h2>
                                    <i className={`bi ${confirmation.type === 'danger' ? 'bi-exclamation-triangle' : 'bi-question-circle'}`}></i>
                                    {confirmation.title}
                                </h2>
                                <button 
                                    className="modal-close" 
                                    onClick={handleCancelConfirmation}
                                    aria-label="Close confirmation"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>{confirmation.message}</p>
                            </div>
                            <div className="form-actions">
                                <button 
                                    className={`btn-${confirmation.type === 'danger' ? 'danger' : 'primary'}`} 
                                    onClick={confirmation.onConfirm}
                                >
                                    <i className={`bi ${confirmation.type === 'danger' ? 'bi-exclamation-triangle' : 'bi-check-circle'}`}></i>
                                    {confirmation.confirmText}
                                </button>
                                <button className="btn-secondary" onClick={handleCancelConfirmation}>
                                    <i className="bi bi-x-lg"></i>
                                    {confirmation.cancelText}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {passwordReset.isOpen && (
                    <div className="modal-overlay" role="dialog" aria-modal="true">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>
                                    <i className="bi bi-key"></i>
                                    Reset Password
                                </h2>
                                <button 
                                    className="modal-close" 
                                    onClick={handleCancelPasswordReset}
                                    aria-label="Close password reset"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <form onSubmit={handlePasswordResetSubmit} noValidate>
                                <div className="form-group">
                                    <label>
                                        <i className="bi bi-person"></i>
                                        User
                                    </label>
                                    <input
                                        type="text"
                                        value={passwordReset.userName}
                                        disabled
                                        className="field-disabled"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="newPassword">
                                        <i className="bi bi-key"></i>
                                        New Password <span className="required">*</span>
                                    </label>
                                    <input
                                        id="newPassword"
                                        type="password"
                                        name="newPassword"
                                        value={passwordReset.newPassword}
                                        onChange={handlePasswordResetChange}
                                        placeholder="Enter new password (min 6 chars)"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">
                                        <i className="bi bi-key"></i>
                                        Confirm Password <span className="required">*</span>
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordReset.confirmPassword}
                                        onChange={handlePasswordResetChange}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>

                                {passwordReset.error && (
                                    <div className="field-error">{passwordReset.error}</div>
                                )}

                                <div className="form-actions">
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <span className="spinner-small"></span>
                                                Resetting...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle"></i>
                                                Reset Password
                                            </>
                                        )}
                                    </button>
                                    <button type="button" className="btn-secondary" onClick={handleCancelPasswordReset}>
                                        <i className="bi bi-x-lg"></i>
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
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Phone</th>
                                <th>Last Login</th>
                                <th className="actions-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="empty-state">
                                        <div className="empty-state-content">
                                            <i className="bi bi-inbox"></i>
                                            <p>No users found</p>
                                            <span>Click "Add User" to create your first user</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.staff_id} className={user.status === 'suspended' ? 'suspended-row' : ''}>
                                        <td>
                                            <div className="user-name-cell">
                                                <i className="bi bi-person"></i>
                                                <span className="user-name">{user.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="email-cell">
                                                <i className="bi bi-envelope"></i>
                                                {user.email}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                                                <i className={getRoleIcon(user.role)}></i>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                                                <i className={getStatusIcon(user.status)}></i>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="phone-cell">
                                                <i className="bi bi-telephone"></i>
                                                {formatPhone(user.phone)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="login-cell">
                                                <i className="bi bi-clock"></i>
                                                {formatLastLogin(user.last_login)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn-sm btn-edit"
                                                    onClick={() => handleEdit(user)}
                                                    aria-label={`Edit ${user.name}`}
                                                    title="Edit user"
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                                <button 
                                                    className={`btn-sm ${user.status === 'suspended' ? 'btn-activate' : 'btn-suspend'}`}
                                                    onClick={() => handleToggleStatusClick(user.staff_id, user.name, user.status)}
                                                    aria-label={user.status === 'suspended' ? `Activate ${user.name}` : `Suspend ${user.name}`}
                                                    title={user.status === 'suspended' ? 'Activate user' : 'Suspend user'}
                                                >
                                                    <i className={`bi ${user.status === 'suspended' ? 'bi-unlock' : 'bi-lock'}`}></i>
                                                </button>
                                                <button 
                                                    className="btn-sm btn-reset"
                                                    onClick={() => handleResetPasswordClick(user.staff_id, user.name)}
                                                    aria-label={`Reset password for ${user.name}`}
                                                    title="Reset password"
                                                >
                                                    <i className="bi bi-key"></i>
                                                </button>
                                                <button 
                                                    className="btn-sm btn-delete"
                                                    onClick={() => handleDeleteClick(user.staff_id, user.name)}
                                                    aria-label={`Delete ${user.name}`}
                                                    title="Delete user"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
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

