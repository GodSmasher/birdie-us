import { z } from 'zod';
export declare const CreateTenantSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    branding: z.ZodOptional<z.ZodObject<{
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
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    branding?: {
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
    } | undefined;
}, {
    name: string;
    slug: string;
    branding?: {
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
    } | undefined;
}>;
export declare const UpdateTenantSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "suspended", "archived"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "suspended" | "archived" | undefined;
    name?: string | undefined;
}, {
    status?: "active" | "suspended" | "archived" | undefined;
    name?: string | undefined;
}>;
export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;
export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>;
//# sourceMappingURL=tenant.schema.d.ts.map