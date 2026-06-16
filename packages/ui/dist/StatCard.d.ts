import React from 'react';
export interface StatCardTrend {
    direction: 'up' | 'down' | 'flat';
    percent: number;
}
export interface StatCardProps {
    label: string;
    value: string | number;
    trend?: StatCardTrend;
    period?: string;
    className?: string;
    style?: React.CSSProperties;
}
export declare const StatCard: React.FC<StatCardProps>;
export default StatCard;
//# sourceMappingURL=StatCard.d.ts.map