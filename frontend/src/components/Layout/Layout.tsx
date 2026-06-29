import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="layout">
            <Header onMenuToggle={toggleSidebar} />
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
            <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
