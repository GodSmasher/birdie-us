"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingSpinner = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const spinnerSizes = {
    sm: 20,
    md: 32,
    lg: 48,
};
const LoadingSpinner = ({ size = 'md', className, style }) => {
    const dimension = spinnerSizes[size];
    const containerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        ...style,
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: className, style: containerStyle, role: "status", "aria-label": "Loading", children: [(0, jsx_runtime_1.jsx)("style", { children: `@keyframes enura-spinner-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }), (0, jsx_runtime_1.jsxs)("svg", { width: dimension, height: dimension, viewBox: "0 0 24 24", fill: "none", style: { animation: 'enura-spinner-rotate 0.8s linear infinite' }, "aria-hidden": "true", children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "10", stroke: "color-mix(in srgb, var(--brand-primary) 20%, transparent)", strokeWidth: "3", fill: "none" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 2a10 10 0 0 1 10 10", stroke: "var(--brand-primary)", strokeWidth: "3", strokeLinecap: "round", fill: "none" })] })] }));
};
exports.LoadingSpinner = LoadingSpinner;
exports.default = exports.LoadingSpinner;
//# sourceMappingURL=LoadingSpinner.js.map