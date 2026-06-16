"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
exports.Input = react_1.default.forwardRef(function Input({ label, error, helperText, id, required, className, style, ...rest }, ref) {
    const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const helperId = helperText && inputId ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        fontFamily: 'var(--brand-font, inherit)',
        ...style,
    };
    const labelStyle = {
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--brand-text-primary)',
        lineHeight: '20px',
    };
    const inputStyle = {
        padding: '8px 12px',
        fontSize: '14px',
        lineHeight: '20px',
        color: 'var(--brand-text-primary)',
        backgroundColor: 'var(--brand-surface)',
        border: error ? '1px solid #DC2626' : '1px solid var(--brand-text-secondary)',
        borderRadius: 'var(--brand-radius, 8px)',
        outline: 'none',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        fontFamily: 'inherit',
        width: '100%',
        boxSizing: 'border-box',
    };
    const errorStyle = {
        fontSize: '13px',
        color: '#DC2626',
        lineHeight: '18px',
        margin: 0,
    };
    const helperStyle = {
        fontSize: '13px',
        color: 'var(--brand-text-secondary)',
        lineHeight: '18px',
        margin: 0,
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: className, style: containerStyle, children: [label ? ((0, jsx_runtime_1.jsxs)("label", { htmlFor: inputId, style: labelStyle, children: [label, required ? (0, jsx_runtime_1.jsx)("span", { style: { color: '#DC2626', marginLeft: '2px' }, "aria-hidden": "true", children: "*" }) : null] })) : null, (0, jsx_runtime_1.jsx)("input", { ref: ref, id: inputId, required: required, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy, style: inputStyle, onFocus: (e) => {
                    e.currentTarget.style.borderColor = 'var(--brand-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 25%, transparent)';
                    rest.onFocus?.(e);
                }, onBlur: (e) => {
                    e.currentTarget.style.borderColor = error ? '#DC2626' : 'var(--brand-text-secondary)';
                    e.currentTarget.style.boxShadow = 'none';
                    rest.onBlur?.(e);
                }, ...rest }), error ? (0, jsx_runtime_1.jsx)("p", { id: errorId, style: errorStyle, role: "alert", children: error }) : null, helperText && !error ? (0, jsx_runtime_1.jsx)("p", { id: helperId, style: helperStyle, children: helperText }) : null] }));
});
exports.default = exports.Input;
//# sourceMappingURL=Input.js.map