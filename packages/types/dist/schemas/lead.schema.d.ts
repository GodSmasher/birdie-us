import { z } from 'zod';
export declare const CreateLeadSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    addressStreet: z.ZodOptional<z.ZodString>;
    addressZip: z.ZodOptional<z.ZodString>;
    addressCity: z.ZodOptional<z.ZodString>;
    addressCanton: z.ZodOptional<z.ZodString>;
    source: z.ZodEnum<["website", "referral", "partner", "advertising", "cold_call", "leadnotes", "other"]>;
    setterId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    source: "website" | "referral" | "partner" | "advertising" | "cold_call" | "leadnotes" | "other";
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    addressStreet?: string | undefined;
    addressZip?: string | undefined;
    addressCity?: string | undefined;
    addressCanton?: string | undefined;
    setterId?: string | undefined;
    notes?: string | undefined;
}, {
    source: "website" | "referral" | "partner" | "advertising" | "cold_call" | "leadnotes" | "other";
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    addressStreet?: string | undefined;
    addressZip?: string | undefined;
    addressCity?: string | undefined;
    addressCanton?: string | undefined;
    setterId?: string | undefined;
    notes?: string | undefined;
}>;
export declare const UpdateLeadSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["new", "contacted", "qualified", "appointment_set", "won", "lost", "invalid"]>>;
    setterId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "new" | "contacted" | "qualified" | "appointment_set" | "won" | "lost" | "invalid" | undefined;
    setterId?: string | null | undefined;
    notes?: string | undefined;
}, {
    status?: "new" | "contacted" | "qualified" | "appointment_set" | "won" | "lost" | "invalid" | undefined;
    setterId?: string | null | undefined;
    notes?: string | undefined;
}>;
export declare const GetLeadsQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["new", "contacted", "qualified", "appointment_set", "won", "lost", "invalid"]>>;
    setterId: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "new" | "contacted" | "qualified" | "appointment_set" | "won" | "lost" | "invalid" | undefined;
    setterId?: string | undefined;
}, {
    status?: "new" | "contacted" | "qualified" | "appointment_set" | "won" | "lost" | "invalid" | undefined;
    setterId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;
export type GetLeadsQuery = z.infer<typeof GetLeadsQuerySchema>;
//# sourceMappingURL=lead.schema.d.ts.map