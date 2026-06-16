import { z } from 'zod';
export declare const CreateProjectSchema: z.ZodObject<{
    leadId: z.ZodOptional<z.ZodString>;
    offerId: z.ZodOptional<z.ZodString>;
    beraterId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    customerName: z.ZodString;
    addressStreet: z.ZodOptional<z.ZodString>;
    addressZip: z.ZodOptional<z.ZodString>;
    addressCity: z.ZodOptional<z.ZodString>;
    phaseId: z.ZodOptional<z.ZodString>;
    installationDate: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    customerName: string;
    addressStreet?: string | undefined;
    addressZip?: string | undefined;
    addressCity?: string | undefined;
    notes?: string | undefined;
    leadId?: string | undefined;
    beraterId?: string | undefined;
    offerId?: string | undefined;
    phaseId?: string | undefined;
    installationDate?: string | undefined;
}, {
    title: string;
    customerName: string;
    addressStreet?: string | undefined;
    addressZip?: string | undefined;
    addressCity?: string | undefined;
    notes?: string | undefined;
    leadId?: string | undefined;
    beraterId?: string | undefined;
    offerId?: string | undefined;
    phaseId?: string | undefined;
    installationDate?: string | undefined;
}>;
export declare const UpdateProjectSchema: z.ZodObject<{
    phaseId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "on_hold", "completed", "cancelled"]>>;
    installationDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "cancelled" | "on_hold" | "completed" | undefined;
    notes?: string | undefined;
    phaseId?: string | undefined;
    installationDate?: string | null | undefined;
}, {
    status?: "active" | "cancelled" | "on_hold" | "completed" | undefined;
    notes?: string | undefined;
    phaseId?: string | undefined;
    installationDate?: string | null | undefined;
}>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
//# sourceMappingURL=project.schema.d.ts.map