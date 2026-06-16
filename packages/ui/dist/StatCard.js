"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Icon_1 = require("./Icon");
const trendColors = {
    up: '#16A34A',
    down: '#DC2626',
    flat: '#6B7280',
};
const StatCard = ({ label, value, trend, period, className, style }) => {
    const cardStyle = {
        backgroundColor: 'var(--brand-surface)',
        borderRadius: 'var(--brand-radius, 8px)',
        border: '1px solid color-mix(in srgb, var(--brand-text-secondary) 20%, transparent)',
        padding: '20px',
        fontFamily: 'var(--brand-font, inherit)',
        ...style,
    };
    const labelStyle = {
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--brand-text-secondary)',
        lineHeight: '18px',
        margin: 0,
    };
    const valueStyle = {
        fontSize: '28px',
        fontWeight: 700,
        color: 'var(--brand-text-primary)',
        lineHeight: '36px',
        margin: '4px 0 0 0',
    };
    const trendContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginTop: '8px',
    };
    const periodStyle = {
        fontSize: '12px',
        color: 'var(--brand-text-secondary)',
        marginLeft: '6px',
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: className, style: cardStyle, children: [(0, jsx_runtime_1.jsx)("p", { style: labelStyle, children: label }), (0, jsx_runtime_1.jsx)("p", { style: valueStyle, children: value }), trend ? ((0, jsx_runtime_1.jsxs)("div", { style: trendContainerStyle, children: [(0, jsx_runtime_1.jsx)(Icon_1.Icon, { name: trend.direction === 'up' ? 'trending-up' : trend.direction === 'down' ? 'trending-down' : 'minus', size: 16, style: { color: trendColors[trend.direction] } }), (0, jsx_runtime_1.jsxs)("span", { style: { fontSize: '13px', fontWeight: 500, color: trendColors[trend.direction] }, children: [trend.percent, "%"] }), period ? (0, jsx_runtime_1.jsx)("span", { style: periodStyle, children: period }) : null] })) : period ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: '8px' }, children: (0, jsx_runtime_1.jsx)("span", { style: { fontSize: '12px', color: 'var(--brand-text-secondary)' }, children: period }) })) : null] }));
};
exports.StatCard = StatCard;
exports.default = exports.StatCard;
//# sourceMappingURL=StatCard.js.map