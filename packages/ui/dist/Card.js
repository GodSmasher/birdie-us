"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Card = ({ children, header, footer, className, style }) => {
    const cardStyle = {
        backgroundColor: 'var(--brand-surface)',
        borderRadius: 'var(--brand-radius, 8px)',
        border: '1px solid color-mix(in srgb, var(--brand-text-secondary) 20%, transparent)',
        overflow: 'hidden',
        fontFamily: 'var(--brand-font, inherit)',
        ...style,
    };
    const headerStyle = {
        padding: '16px 20px',
        borderBottom: '1px solid color-mix(in srgb, var(--brand-text-secondary) 20%, transparent)',
        fontWeight: 600,
        fontSize: '15px',
        color: 'var(--brand-text-primary)',
    };
    const bodyStyle = {
        padding: '16px 20px',
    };
    const footerStyle = {
        padding: '12px 20px',
        borderTop: '1px solid color-mix(in srgb, var(--brand-text-secondary) 20%, transparent)',
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: className, style: cardStyle, children: [header !== undefined ? (0, jsx_runtime_1.jsx)("div", { style: headerStyle, children: header }) : null, (0, jsx_runtime_1.jsx)("div", { style: bodyStyle, children: children }), footer !== undefined ? (0, jsx_runtime_1.jsx)("div", { style: footerStyle, children: footer }) : null] }));
};
exports.Card = Card;
exports.default = exports.Card;
//# sourceMappingURL=Card.js.map