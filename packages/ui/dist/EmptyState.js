"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyState = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Button_1 = require("./Button");
const Icon_1 = require("./Icon");
const EmptyState = ({ title, description, actionLabel, onAction, className, style, }) => {
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        fontFamily: 'var(--brand-font, inherit)',
        ...style,
    };
    const iconContainerStyle = {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        color: 'var(--brand-primary)',
    };
    const titleStyle = {
        fontSize: '16px',
        fontWeight: 600,
        color: 'var(--brand-text-primary)',
        margin: '0 0 8px 0',
    };
    const descStyle = {
        fontSize: '14px',
        color: 'var(--brand-text-secondary)',
        margin: 0,
        maxWidth: '360px',
        lineHeight: '20px',
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: className, style: containerStyle, children: [(0, jsx_runtime_1.jsx)("div", { style: iconContainerStyle, children: (0, jsx_runtime_1.jsx)(Icon_1.Icon, { name: "clipboard", size: 24 }) }), (0, jsx_runtime_1.jsx)("h3", { style: titleStyle, children: title }), (0, jsx_runtime_1.jsx)("p", { style: descStyle, children: description }), actionLabel && onAction ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: '20px' }, children: (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "primary", size: "md", onClick: onAction, children: actionLabel }) })) : null] }));
};
exports.EmptyState = EmptyState;
exports.default = exports.EmptyState;
//# sourceMappingURL=EmptyState.js.map