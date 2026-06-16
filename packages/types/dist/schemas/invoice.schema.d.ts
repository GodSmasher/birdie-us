import { z } from 'zod';
export declare const CreateInvoiceSchema: z.ZodObject<{
    offerId: z.ZodOptional<z.ZodString>;
    invoiceNumber: z.ZodString;
    customerName: z.ZodString;
    amountChf: z.ZodNumber;
    taxChf: z.ZodDefault<z.ZodNumber>;
    totalChf: z.ZodNumber;
    issuedAt: z.ZodString;
    dueAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    amountChf: number;
    invoiceNumber: string;
    customerName: string;
    taxChf: number;
    totalChf: number;
    issuedAt: string;
    dueAt: string;
    offerId?: string | undefined;
}, {
    amountChf: number;
    invoiceNumber: string;
    customerName: string;
    totalChf: number;
    issuedAt: string;
    dueAt: string;
    offerId?: string | undefined;
    taxChf?: number | undefined;
}>;
export declare const UpdateInvoiceSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["draft", "sent", "paid", "overdue", "cancelled", "partially_paid"]>>;
    paidAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: "draft" | "sent" | "paid" | "overdue" | "cancelled" | "partially_paid" | undefined;
    paidAt?: string | null | undefined;
}, {
    status?: "draft" | "sent" | "paid" | "overdue" | "cancelled" | "partially_paid" | undefined;
    paidAt?: string | null | undefined;
}>;
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;
//# sourceMappingURL=invoice.schema.d.ts.map