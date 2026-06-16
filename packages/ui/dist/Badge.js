"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Badge = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const variantColors = {
    success: { bg: '#DCFCE7', text: '#166534' },
    warning: { bg: '#FEF9C3', text: '#854D0E' },
    danger: { bg: '#FEE2E2', text: '#991B1B' },
    info: { bg: '#DBEAFE', text: '#1E40AF' },
    neutral: { bg: '#F3F4F6', text: '#374151' },
};
const Badge = ({ variant = 'neutral', children, className, style }) => {
    const colors = variantColors[variant];
    const badgeStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '18px',
        borderRadius: '9999px',
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: 'var(--brand-font, inherit)',
        whiteSpace: 'nowrap',
        ...style,
    };
    return ((0, jsx_runtime_1.jsx)("span", { className: className, style: badgeStyle, children: children }));
};
exports.Badge = Badge;
exports.default = exports.Badge;
//# sourceMappingURL=Badge.js.map