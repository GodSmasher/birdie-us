"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Avatar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const sizeDimensions = {
    sm: { dimension: 32, fontSize: 12 },
    md: { dimension: 40, fontSize: 14 },
    lg: { dimension: 56, fontSize: 18 },
};
function getInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || parts[0] === '')
        return '?';
    if (parts.length === 1)
        return (parts[0]?.[0] ?? '?').toUpperCase();
    return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}
const Avatar = ({ name, imageUrl, size = 'md', className, style }) => {
    const { dimension, fontSize } = sizeDimensions[size];
    const baseStyle = {
        width: dimension,
        height: dimension,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
    };
    if (imageUrl) {
        return ((0, jsx_runtime_1.jsx)("div", { className: className, style: baseStyle, role: "img", "aria-label": name, children: (0, jsx_runtime_1.jsx)("img", { src: imageUrl, alt: name, style: { width: '100%', height: '100%', objectFit: 'cover' } }) }));
    }
    const initialsStyle = {
        ...baseStyle,
        backgroundColor: 'var(--brand-primary)',
        color: '#ffffff',
        fontSize,
        fontWeight: 600,
        fontFamily: 'var(--brand-font, inherit)',
        userSelect: 'none',
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: className, style: initialsStyle, role: "img", "aria-label": name, children: getInitials(name) }));
};
exports.Avatar = Avatar;
exports.default = exports.Avatar;
//# sourceMappingURL=Avatar.js.map