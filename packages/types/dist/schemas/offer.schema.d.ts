import { z } from 'zod';
export declare const CreateOfferSchema: z.ZodObject<{
    leadId: z.ZodOptional<z.ZodString>;
    beraterId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    amountChf: z.ZodNumber;
    validUntil: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    amountChf: number;
    leadId?: string | undefined;
    beraterId?: string | undefined;
    description?: string | undefined;
    validUntil?: string | undefined;
}, {
    title: string;
    amountChf: number;
    leadId?: string | undefined;
    beraterId?: string | undefined;
    description?: string | undefined;
    validUntil?: string | undefined;
}>;
export declare const UpdateOfferSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["draft", "sent", "negotiating", "won", "lost", "expired"]>>;
    amountChf: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "won" | "lost" | "draft" | "sent" | "negotiating" | "expired" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    amountChf?: number | undefined;
}, {
    status?: "won" | "lost" | "draft" | "sent" | "negotiating" | "expired" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    amountChf?: number | undefined;
}>;
export type CreateOfferInput = z.infer<typeof CreateOfferSchema>;
export type UpdateOfferInput = z.infer<typeof UpdateOfferSchema>;
//# sourceMappingURL=offer.schema.d.ts.map