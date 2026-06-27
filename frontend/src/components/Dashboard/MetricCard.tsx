import React from 'react';
import './MetricCard.css';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: string;
    color?: 'primary' | 'warning' | 'danger' | 'info' | 'success';
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    icon,
    color = 'primary'
}) => {
    return (
        <div className={`metric-card metric-${color}`}>
            <div className="metric-icon">{icon}</div>
            <div className="metric-info">
                <span className="metric-value">{value}</span>
                <span className="metric-title">{title}</span>
            </div>
        </div>
    );
};

export default MetricCard;