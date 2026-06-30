import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
    const [role, setRole] = useState<string>('delivery');
    const [userName, setUserName] = useState<string>('User');
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);

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
                    setRole(user.role || 'delivery');
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

    const allMenuItems = [
        { path: '/', icon: '📊', label: 'Dashboard', roles: ['supervisor', 'production', 'delivery', 'sales'] },
        { path: '/batches', icon: '🏭', label: 'Batches', roles: ['supervisor', 'production'] },
        { path: '/products', icon: '📦', label: 'Products', roles: ['supervisor', 'production'] },
        { path: '/orders', icon: '🛒', label: 'Orders', roles: ['supervisor', 'delivery', 'sales'] },
        { path: '/deliveries', icon: '🚚', label: 'Deliveries', roles: ['supervisor', 'delivery'] },
        { path: '/inventory', icon: '📋', label: 'Inventory', roles: ['supervisor', 'production'] },
        { path: '/raw-materials', icon: '📦', label: 'Raw Materials', roles: ['supervisor', 'production'] },
        { path: '/suppliers', icon: '🏢', label: 'Suppliers', roles: ['supervisor', 'production'] },
        { path: '/customers', icon: '👤', label: 'Customers', roles: ['supervisor', 'sales'] },
        { path: '/credit', icon: '💰', label: 'Credit Accounts', roles: ['supervisor', 'sales'] },
        { path: '/admin', icon: '⚙️', label: 'Admin Panel', roles: ['admin'] },
        { path: '/expenditures/new', icon: '💳', label: 'Expenditure', roles: ['supervisor'] },
    ];

    const menuItems = allMenuItems.filter(item => 
        item.roles.includes(role)
    );

    // Handle click on mobile to close sidebar
    const handleLinkClick = () => {
        if (isMobile && onClose) {
            onClose();
        }
    };

    return (
        <>
            {/* ✅ Mobile overlay */}
            {isMobile && isOpen && (
                <div className="sidebar-overlay active" onClick={onClose} />
            )}
            <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-user">
                    <span className="user-avatar">👤</span>
                    <div className="user-info">
                        <span className="user-name">{userName}</span>
                        <span className={`user-role role-${role}`}>{role}</span>
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
                                <span className="link-icon">{item.icon}</span>
                                <span className="link-label">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="sidebar-footer">
                    <span className="footer-role">👤 {role}</span>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;
