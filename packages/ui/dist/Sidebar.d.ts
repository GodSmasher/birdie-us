import React from 'react';
import { type IconName } from './Icon';
export interface SidebarItem {
    key: string;
    label: string;
    href: string;
    icon: IconName;
    active?: boolean;
}
export interface SidebarUser {
    name: string;
    role: string;
}
export interface SidebarProps {
    logo: React.ReactNode;
    items: SidebarItem[];
    user: SidebarUser;
    collapsed: boolean;
    onToggleCollapse: () => void;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}
export declare const Sidebar: React.FC<SidebarProps>;
export default Sidebar;
//# sourceMappingURL=Sidebar.d.ts.map