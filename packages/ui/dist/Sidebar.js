"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Avatar_1 = require("./Avatar");
const Icon_1 = require("./Icon");
const Sidebar = ({ logo, items, user, collapsed, onToggleCollapse, children, className, style, }) => {
    const sidebarStyle = {
        display: 'flex',
        flexDirection: 'column',
        width: collapsed ? '64px' : '240px',
        minHeight: '100vh',
        backgroundColor: 'var(--brand-surface)',
        borderRight: '1px solid color-mix(in srgb, var(--brand-text-secondary) 20%, transparent)',
        transition: 'width 200ms ease',
        overflow: 'hidden',
        fontFamily: 'var(--brand-font, inherit)',
        flexShrink: 0,
        ...style,
    };
    const logoContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '16px 8px' : '16px 16px',
        borderBottom: '1px solid color-mix(in srgb, var(--brand-text-secondary) 20%, transparent)',
        minHeight: '60px',
    };
    const collapseButtonStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        borderRadius: 'var(--brand-radius, 8px)',
        color: 'var(--brand-text-secondary)',
        flexShrink: 0,
        padding: 0,
    };
    const navStyle = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        padding: '8px',
        overflowY: 'auto',
        overflowX: 'hidden',
    };
    const userSectionStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: collapsed ? '12px 8px' : '12px 16px',
        borderTop: '1px solid color-mix(in srgb, var(--brand-text-secondary) 20%, transparent)',
        justifyContent: collapsed ? 'center' : 'flex-start',
    };
    return ((0, jsx_runtime_1.jsxs)("nav", { className: className, style: sidebarStyle, "aria-label": "Main navigation", children: [(0, jsx_runtime_1.jsxs)("div", { style: logoContainerStyle, children: [collapsed ? null : (0, jsx_runtime_1.jsx)("div", { style: { overflow: 'hidden', flexShrink: 1 }, children: logo }), (0, jsx_runtime_1.jsx)("button", { style: collapseButtonStyle, onClick: onToggleCollapse, "aria-label": collapsed ? 'Expand sidebar' : 'Collapse sidebar', type: "button", children: (0, jsx_runtime_1.jsx)(Icon_1.Icon, { name: collapsed ? 'chevron-right' : 'chevron-left', size: 18 }) })] }), (0, jsx_runtime_1.jsx)("div", { style: navStyle, role: "list", children: items.map((item) => {
                    const itemStyle = {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: collapsed ? '10px' : '10px 12px',
                        borderRadius: 'var(--brand-radius, 8px)',
                        textDecoration: 'none',
                        color: item.active ? 'var(--brand-primary)' : 'var(--brand-text-primary)',
                        backgroundColor: item.active
                            ? 'color-mix(in srgb, var(--brand-primary) 10%, transparent)'
                            : 'transparent',
                        fontWeight: item.active ? 600 : 400,
                        fontSize: '14px',
                        lineHeight: '20px',
                        cursor: 'pointer',
                        border: 'none',
                        width: '100%',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        transition: 'background-color 150ms ease',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                    };
                    return ((0, jsx_runtime_1.jsxs)("a", { href: item.href, style: itemStyle, role: "listitem", "aria-current": item.active ? 'page' : undefined, children: [(0, jsx_runtime_1.jsx)(Icon_1.Icon, { name: item.icon, size: 20 }), collapsed ? null : (0, jsx_runtime_1.jsx)("span", { children: item.label })] }, item.key));
                }) }), children, (0, jsx_runtime_1.jsxs)("div", { style: userSectionStyle, children: [(0, jsx_runtime_1.jsx)(Avatar_1.Avatar, { name: user.name, size: "sm" }), collapsed ? null : ((0, jsx_runtime_1.jsxs)("div", { style: { overflow: 'hidden', minWidth: 0 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: 'var(--brand-text-primary)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }, children: user.name }), (0, jsx_runtime_1.jsx)("div", { style: {
                                    fontSize: '12px',
                                    color: 'var(--brand-text-secondary)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }, children: user.role })] }))] })] }));
};
exports.Sidebar = Sidebar;
exports.default = exports.Sidebar;
//# sourceMappingURL=Sidebar.js.map