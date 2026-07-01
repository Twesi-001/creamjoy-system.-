import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface User {
    name: string;
    role: string;
}

interface HeaderProps {
    onMenuToggle?: () => void;
    isSidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isSidebarOpen }) => {
    const [userName, setUserName] = useState<string>('John Doe');
    const [userRole, setUserRole] = useState<string>('Manager');
    const [today, setToday] = useState<string>('');
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
    const navigate = useNavigate();
    const isMounted = useRef<boolean>(true);

    useEffect(() => {
        isMounted.current = true;

        const userStr = localStorage.getItem('user');
        if (userStr && isMounted.current) {
            try {
                const parsed: User = JSON.parse(userStr);
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUserName(parsed.name || 'John Doe');
                setUserRole(parsed.role || 'Manager');
            } catch (e) {
                console.error('Error parsing user:', e);
            }
        }

        const now = new Date();
        if (isMounted.current) {
            setToday(now.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }));
        }

        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleLogout = (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleChangePassword = (): void => {
        navigate('/change-password');
    };

    return (
        <header className="header">
            <div className="header-left">
                {isMobile && (
                    <button
                        className="menu-toggle"
                        onClick={onMenuToggle}
                        aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isSidebarOpen}
                        aria-controls="app-sidebar"
                    >
                        <i className="bi bi-list" aria-hidden="true"></i>
                    </button>
                )}
                <h1 className="header-logo">
                    <i className="bi bi-droplet-fill" aria-hidden="true"></i>
                    <span>CreamJoy</span>
                </h1>
            </div>
            <div className="header-center">
                <span className="header-date">{today}</span>
            </div>
            <div className="header-right">
                <button
                    className="change-password-btn"
                    onClick={handleChangePassword}
                    title="Change password"
                    aria-label="Change password"
                >
                    <i className="bi bi-key" aria-hidden="true"></i>
                </button>
                <div className="header-user">
                    <span className="header-user-name">{userName}</span>
                    <span className={`header-user-role role-${userRole.toLowerCase()}`}>
                        {userRole}
                    </span>
                </div>
                <button className="logout-btn" onClick={handleLogout} aria-label="Log out">
                    <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Header;

