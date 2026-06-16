"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultExtendedTokens = exports.defaultBrandTokens = void 0;
exports.buildCSSVars = buildCSSVars;
exports.buildCSSVarString = buildCSSVarString;
exports.brandTokensFromRow = brandTokensFromRow;
exports.buildExtendedCSSVars = buildExtendedCSSVars;
exports.buildExtendedCSSVarString = buildExtendedCSSVarString;
exports.defaultBrandTokens = {
    primary: '#1A56DB',
    secondary: '#1A1A1A',
    accent: '#F3A917',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    font: 'Inter',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
    radius: '8px',
    darkModeEnabled: true,
};
function buildCSSVars(tokens) {
    return {
        '--brand-primary': tokens.primary,
        '--brand-secondary': tokens.secondary,
        '--brand-accent': tokens.accent,
        '--brand-background': tokens.background,
        '--brand-surface': tokens.surface,
        '--brand-text-primary': tokens.textPrimary,
        '--brand-text-secondary': tokens.textSecondary,
        '--brand-font': tokens.font,
        '--brand-radius': tokens.radius,
    };
}
function buildCSSVarString(tokens) {
    const vars = buildCSSVars(tokens);
    return Object.entries(vars)
        .map(([k, v]) => `${k}:${v}`)
        .join(';');
}
function brandTokensFromRow(row) {
    return {
        primary: row.primary_color,
        secondary: row.secondary_color,
        accent: row.accent_color,
        background: row.background_color,
        surface: row.surface_color,
        textPrimary: row.text_primary,
        textSecondary: row.text_secondary,
        font: row.font_family,
        fontUrl: row.font_url,
        radius: row.border_radius,
        darkModeEnabled: row.dark_mode_enabled,
    };
}
exports.defaultExtendedTokens = {
    shadowSm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    spacingBase: '4px',
    fontSizeBase: '16px',
    fontSizeScale: '1.25',
    fontWeightNormal: '400',
    fontWeightSemibold: '600',
    letterSpacing: '0em',
    lineHeight: '1.5',
    borderWidth: '1px',
};
function buildExtendedCSSVars(tokens) {
    const merged = { ...exports.defaultExtendedTokens, ...tokens };
    return {
        '--brand-shadow-sm': merged.shadowSm,
        '--brand-shadow-md': merged.shadowMd,
        '--brand-shadow-lg': merged.shadowLg,
        '--brand-spacing-base': merged.spacingBase,
        '--brand-font-size-base': merged.fontSizeBase,
        '--brand-font-size-scale': merged.fontSizeScale,
        '--brand-font-weight-normal': merged.fontWeightNormal,
        '--brand-font-weight-semibold': merged.fontWeightSemibold,
        '--brand-letter-spacing': merged.letterSpacing,
        '--brand-line-height': merged.lineHeight,
        '--brand-border-width': merged.borderWidth,
    };
}
function buildExtendedCSSVarString(tokens) {
    const vars = buildExtendedCSSVars(tokens);
    return Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';');
}
//# sourceMappingURL=brand.js.map