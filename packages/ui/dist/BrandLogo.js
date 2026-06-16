"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandLogo = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const logoSizes = {
    sm: { height: 24, fontSize: 14 },
    md: { height: 32, fontSize: 16 },
    lg: { height: 48, fontSize: 22 },
};
const BrandLogo = ({ logoUrl, tenantName, size = 'md', className, style }) => {
    const { height, fontSize } = logoSizes[size];
    if (logoUrl) {
        return ((0, jsx_runtime_1.jsx)("img", { src: logoUrl, alt: `${tenantName} logo`, className: className, style: {
                height,
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
                ...style,
            } }));
    }
    const textStyle = {
        fontSize,
        fontWeight: 700,
        color: 'var(--brand-primary)',
        fontFamily: 'var(--brand-font, inherit)',
        lineHeight: `${height}px`,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        ...style,
    };
    return ((0, jsx_runtime_1.jsx)("span", { className: className, style: textStyle, "aria-label": `${tenantName} logo`, children: tenantName }));
};
exports.BrandLogo = BrandLogo;
exports.default = exports.BrandLogo;
//# sourceMappingURL=BrandLogo.js.map