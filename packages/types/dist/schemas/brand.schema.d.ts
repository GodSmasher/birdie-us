import { z } from 'zod';
export declare const BrandTokensSchema: z.ZodObject<{
    primary: z.ZodString;
    secondary: z.ZodString;
    accent: z.ZodString;
    background: z.ZodString;
    surface: z.ZodString;
    textPrimary: z.ZodString;
    textSecondary: z.ZodString;
    font: z.ZodString;
    fontUrl: z.ZodNullable<z.ZodString>;
    radius: z.ZodString;
    darkModeEnabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>;
export type BrandTokensInput = z.infer<typeof BrandTokensSchema>;
//# sourceMappingURL=brand.schema.d.ts.map