"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '13px', lineHeight: '18px' },
    md: { padding: '8px 16px', fontSize: '14px', lineHeight: '20px' },
    lg: { padding: '12px 24px', fontSize: '16px', lineHeight: '24px' },
};
const variantStyles = {
    primary: {
        backgroundColor: 'var(--brand-primary)',
        color: '#ffffff',
        border: '1px solid transparent',
    },
    secondary: {
        backgroundColor: 'transparent',
        color: 'var(--brand-text-primary)',
        border: '1px solid var(--brand-text-secondary)',
    },
    ghost: {
        backgroundColor: 'transparent',
        color: 'var(--brand-text-primary)',
        border: '1px solid transparent',
    },
    danger: {
        backgroundColor: '#DC2626',
        color: '#ffffff',
        border: '1px solid transparent',
    },
};
const Spinner = ({ size }) => {
    const dimension = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
    return ((0, jsx_runtime_1.jsxs)("svg", { width: dimension, height: dimension, viewBox: "0 0 24 24", fill: "none", style: { animation: 'enura-spin 1s linear infinite', marginRight: '6px', flexShrink: 0 }, "aria-hidden": "true", children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeDasharray: "31.4 31.4", opacity: 0.25 }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeDasharray: "31.4 31.4", strokeDashoffset: "23.55" })] }));
};
exports.Button = react_1.default.forwardRef(function Button({ variant = 'primary', size = 'md', loading = false, disabled, children, style, className, ...rest }, ref) {
    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
        fontFamily: 'var(--brand-font, inherit)',
        borderRadius: 'var(--brand-radius, 8px)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 150ms ease, opacity 150ms ease, box-shadow 150ms ease',
        outline: 'none',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("style", { children: `@keyframes enura-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }), (0, jsx_runtime_1.jsxs)("button", { ref: ref, className: className, style: baseStyle, disabled: disabled || loading, "aria-busy": loading || undefined, ...rest, children: [loading ? (0, jsx_runtime_1.jsx)(Spinner, { size: size }) : null, children] })] }));
});
exports.default = exports.Button;
//# sourceMappingURL=Button.js.map