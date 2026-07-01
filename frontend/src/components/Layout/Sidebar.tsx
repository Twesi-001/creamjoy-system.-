import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

type UserRole = 'supervisor' | 'production' | 'delivery' | 'sales' | 'admin' | 'maintenance';

interface MenuItem {
    path: string;
    icon: string;
    label: string;
    roles: UserRole[];
}

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const ROLE_MENU_ITEMS: Record<UserRole, MenuItem[]> = {
    admin: [
        { path: '/admin', icon: 'bi-gear', label: 'Admin Panel', roles: ['admin'] },
        { path: '/', icon: 'bi-speedometer2', label: 'Dashboard', roles: ['admin'] },
        { path: '/batches', icon: 'bi-box-seam', label: 'Batches', roles: ['admin'] },
        { path: '/products', icon: 'bi-box-seam', label: 'Products', roles: ['admin'] },
        { path: '/orders', icon: 'bi-cart-check', label: 'Orders', roles: ['admin'] },
        { path: '/deliveries', icon: 'bi-truck', label: 'Deliveries', roles: ['admin'] },
        { path: '/inventory', icon: 'bi-boxes', label: 'Inventory', roles: ['admin'] },
        { path: '/raw-materials', icon: 'bi-archive', label: 'Raw Materials', roles: ['admin'] },
        { path: '/suppliers', icon: 'bi-building', label: 'Suppliers', roles: ['admin'] },
        { path: '/expenditures/new', icon: 'bi-receipt', label: 'Expenditure', roles: ['admin'] },
        { path: '/customers', icon: 'bi-people', label: 'Customers', roles: ['admin'] },
        { path: '/credit', icon: 'bi-wallet2', label: 'Credit Accounts', roles: ['admin'] },
    ],
    supervisor: [
        { path: '/', icon: 'bi-speedometer2', label: 'Dashboard', roles: ['supervisor'] },
        { path: '/batches', icon: 'bi-box-seam', label: 'Batches', roles: ['supervisor'] },
        { path: '/products', icon: 'bi-box-seam', label: 'Products', roles: ['supervisor'] },
        { path: '/orders', icon: 'bi-cart-check', label: 'Orders', roles: ['supervisor'] },
        { path: '/deliveries', icon: 'bi-truck', label: 'Deliveries', roles: ['supervisor'] },
        { path: '/inventory', icon: 'bi-boxes', label: 'Inventory', roles: ['supervisor'] },
        { path: '/raw-materials', icon: 'bi-archive', label: 'Raw Materials', roles: ['supervisor'] },
        { path: '/suppliers', icon: 'bi-building', label: 'Suppliers', roles: ['supervisor'] },
        { path: '/customers', icon: 'bi-people', label: 'Customers', roles: ['supervisor'] },
        { path: '/credit', icon: 'bi-wallet2', label: 'Credit Accounts', roles: ['supervisor'] },
        { path: '/expenditures/new', icon: 'bi-receipt', label: 'Expenditure', roles: ['supervisor'] },
    ],
    production: [
        { path: '/', icon: 'bi-speedometer2', label: 'Dashboard', roles: ['production'] },
        { path: '/batches', icon: 'bi-box-seam', label: 'Batches', roles: ['production'] },
        { path: '/products', icon: 'bi-box-seam', label: 'Products', roles: ['production'] },
        { path: '/inventory', icon: 'bi-boxes', label: 'Inventory', roles: ['production'] },
        { path: '/raw-materials', icon: 'bi-archive', label: 'Raw Materials', roles: ['production'] },
        { path: '/suppliers', icon: 'bi-building', label: 'Suppliers', roles: ['production'] },
    ],
    delivery: [
        { path: '/', icon: 'bi-speedometer2', label: 'Dashboard', roles: ['delivery'] },
        { path: '/orders', icon: 'bi-cart-check', label: 'Orders', roles: ['delivery'] },
        { path: '/deliveries', icon: 'bi-truck', label: 'Deliveries', roles: ['delivery'] },
    ],
    sales: [
        { path: '/', icon: 'bi-speedometer2', label: 'Dashboard', roles: ['sales'] },
        { path: '/orders', icon: 'bi-cart-check', label: 'Orders', roles: ['sales'] },
        { path: '/customers', icon: 'bi-people', label: 'Customers', roles: ['sales'] },
        { path: '/credit', icon: 'bi-wallet2', label: 'Credit Accounts', roles: ['sales'] },
    ],
    maintenance: [
        { path: '/', icon: 'bi-speedometer2', label: 'Dashboard', roles: ['maintenance'] },
    ],
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
    const [role, setRole] = useState<UserRole>('delivery');
    const [userName, setUserName] = useState<string>('User');
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);

    const getRoleLabel = (currentRole: UserRole): string => {
        const labels: Record<UserRole, string> = {
            admin: 'System Admin',
            supervisor: 'Supervisor',
            production: 'Production',
            delivery: 'Delivery',
            sales: 'Sales',
            maintenance: 'Maintenance'
        };

        return labels[currentRole] || currentRole;
    };

    const roleLabel = getRoleLabel(role);
    const displayName = userName.trim() || roleLabel;
    const showRoleBadge = role === 'admin' && displayName.trim().toLowerCase() !== roleLabel.toLowerCase();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        const updateUser = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    setRole((user.role as UserRole) || 'delivery');
                    setUserName(user.name || 'User');
                } catch (e) {
                    console.error('Error parsing user:', e);
                }
            }
        };

        updateUser();
        window.addEventListener('storage', updateUser);
        window.addEventListener('user-updated', updateUser);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('storage', updateUser);
            window.removeEventListener('user-updated', updateUser);
        };
    }, []);

    const menuItems = ROLE_MENU_ITEMS[role] || [];

    const handleLinkClick = () => {
        if (isMobile && onClose) {
            onClose();
        }
    };

    return (
        <>
            {isMobile && isOpen && (
                <div className="sidebar-overlay active" onClick={onClose} aria-hidden="true" />
            )}
            <nav id="app-sidebar" className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Main navigation">
            
                <div className="sidebar-user">
                    <i className="bi bi-person-circle sidebar-user-avatar" aria-hidden="true"></i>
                    <div className="sidebar-user-info">
                        <span className="sidebar-user-name">{displayName}</span>
                        {showRoleBadge && (
                            <span className={`sidebar-user-role role-${role}`}>{roleLabel}</span>
                        )}
                    </div>
                </div>

                <ul className="sidebar-menu">
                    {menuItems.map((item) => (
                        <li key={item.path} className="sidebar-item">
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'active' : ''}`
                                }
                                onClick={handleLinkClick}
                            >
                                <span className="link-icon">
                                    <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                                </span>
                                <span className="link-label">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>

            </nav>
        </>
    );
};

export default Sidebar;


