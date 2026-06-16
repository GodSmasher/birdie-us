export type BrandTokens = {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    font: string;
    fontUrl: string | null;
    radius: string;
    darkModeEnabled: boolean;
};
export declare const defaultBrandTokens: BrandTokens;
export declare function buildCSSVars(tokens: BrandTokens): Record<string, string>;
export declare function buildCSSVarString(tokens: BrandTokens): string;
export declare function brandTokensFromRow(row: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    surface_color: string;
    text_primary: string;
    text_secondary: string;
    font_family: string;
    font_url: string | null;
    border_radius: string;
    dark_mode_enabled: boolean;
}): BrandTokens;
export type ExtendedBrandTokens = {
    shadowSm: string;
    shadowMd: string;
    shadowLg: string;
    spacingBase: string;
    fontSizeBase: string;
    fontSizeScale: string;
    fontWeightNormal: string;
    fontWeightSemibold: string;
    letterSpacing: string;
    lineHeight: string;
    borderWidth: string;
};
export declare const defaultExtendedTokens: ExtendedBrandTokens;
export declare function buildExtendedCSSVars(tokens: Partial<ExtendedBrandTokens>): Record<string, string>;
export declare function buildExtendedCSSVarString(tokens: Partial<ExtendedBrandTokens>): string;
//# sourceMappingURL=brand.d.ts.map