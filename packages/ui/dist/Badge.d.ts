import React from 'react';
export interface BadgeProps {
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}
export declare const Badge: React.FC<BadgeProps>;
export default Badge;
//# sourceMappingURL=Badge.d.ts.map