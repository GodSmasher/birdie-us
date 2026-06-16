import React from 'react';
export type IconName = 'home' | 'phone' | 'briefcase' | 'users' | 'clipboard' | 'kanban' | 'wallet' | 'settings' | 'chevron-left' | 'chevron-right' | 'menu' | 'x' | 'check' | 'alert-triangle' | 'plus' | 'search' | 'filter' | 'logout' | 'user' | 'mail' | 'lock' | 'eye' | 'eye-off' | 'trending-up' | 'trending-down' | 'minus';
export interface IconProps {
    name: IconName;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}
export declare const Icon: React.FC<IconProps>;
export default Icon;
//# sourceMappingURL=Icon.d.ts.map