"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsNavItem = exports.navigationItems = exports.navigationSections = void 0;
/**
 * Platform navigation structure — "Prozesshaus" (Process House).
 * Items are shown/hidden based on the user's permissions.
 */
exports.navigationSections = [
    {
        key: 'processes',
        title: 'PROZESSE',
        items: [
            { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'dashboard', requiredPermission: null },
            { key: 'leads', label: 'Leads & Vertrieb', href: '/leads', icon: 'sales', requiredPermission: 'module:leads:read' },
            { key: 'projects', label: 'Projekte', href: '/projects', icon: 'project', requiredPermission: 'module:bau:read' },
            { key: 'processes', label: 'Prozesse', href: '/processes', icon: 'montage', requiredPermission: 'module:bau:read' },
        ],
    },
    {
        key: 'automation',
        title: 'AUTOMATION',
        items: [
            { key: 'bots', label: 'Bots', href: '/bots', icon: 'bot', requiredPermission: 'module:bots:read' },
            { key: 'routes', label: 'Routen', href: '/routes', icon: 'route', requiredPermission: 'module:bots:read' },
        ],
    },
    {
        key: 'support',
        title: 'SUPPORT',
        items: [
            { key: 'analytics', label: 'Analytics', href: '/analytics', icon: 'analytics', requiredPermission: 'module:reports:read' },
            { key: 'controlling', label: 'Finanzen & Controlling', href: '/controlling', icon: 'finance', requiredPermission: 'module:finance:read' },
        ],
    },
];
/** Flat list of all navigation items (for lookups) */
exports.navigationItems = exports.navigationSections.flatMap((s) => s.items);
/** Settings nav item — shown separately for admins */
exports.settingsNavItem = {
    key: 'settings',
    label: 'Einstellungen',
    href: '/settings/connectors',
    icon: 'settings',
    requiredPermission: 'module:admin:read',
};
//# sourceMappingURL=domain.js.map