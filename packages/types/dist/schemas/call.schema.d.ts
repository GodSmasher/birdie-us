import { z } from 'zod';
export declare const GetCallsQuerySchema: z.ZodObject<{
    teamMemberId: z.ZodOptional<z.ZodString>;
    direction: z.ZodOptional<z.ZodEnum<["inbound", "outbound"]>>;
    status: z.ZodOptional<z.ZodEnum<["answered", "missed", "voicemail", "busy", "failed"]>>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "answered" | "missed" | "voicemail" | "busy" | "failed" | undefined;
    teamMemberId?: string | undefined;
    direction?: "inbound" | "outbound" | undefined;
    from?: string | undefined;
    to?: string | undefined;
}, {
    status?: "answered" | "missed" | "voicemail" | "busy" | "failed" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    teamMemberId?: string | undefined;
    direction?: "inbound" | "outbound" | undefined;
    from?: string | undefined;
    to?: string | undefined;
}>;
export type GetCallsQuery = z.infer<typeof GetCallsQuerySchema>;
//# sourceMappingURL=call.schema.d.ts.map