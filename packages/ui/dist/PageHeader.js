"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageHeader = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const PageHeader = ({ title, subtitle, actions, className, style }) => {
    const containerStyle = {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        fontFamily: 'var(--brand-font, inherit)',
        ...style,
    };
    const titleStyle = {
        fontSize: '24px',
        fontWeight: 700,
        color: 'var(--brand-text-primary)',
        lineHeight: '32px',
        margin: 0,
    };
    const subtitleStyle = {
        fontSize: '14px',
        color: 'var(--brand-text-secondary)',
        lineHeight: '20px',
        margin: '4px 0 0 0',
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: className, style: containerStyle, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { style: titleStyle, children: title }), subtitle ? (0, jsx_runtime_1.jsx)("p", { style: subtitleStyle, children: subtitle }) : null] }), actions ? (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }, children: actions }) : null] }));
};
exports.PageHeader = PageHeader;
exports.default = exports.PageHeader;
//# sourceMappingURL=PageHeader.js.map