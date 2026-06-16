import { z } from 'zod';
export declare const CreateConnectorSchema: z.ZodObject<{
    type: z.ZodEnum<["reonic", "3cx", "bexio", "google_calendar", "leadnotes", "whatsapp", "gmail"]>;
    name: z.ZodString;
    credentials: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    config: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    syncIntervalMinutes: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "leadnotes" | "reonic" | "3cx" | "bexio" | "google_calendar" | "whatsapp" | "gmail";
    name: string;
    credentials: Record<string, unknown>;
    config: Record<string, unknown>;
    syncIntervalMinutes: number;
}, {
    type: "leadnotes" | "reonic" | "3cx" | "bexio" | "google_calendar" | "whatsapp" | "gmail";
    name: string;
    credentials: Record<string, unknown>;
    config?: Record<string, unknown> | undefined;
    syncIntervalMinutes?: number | undefined;
}>;
export declare const UpdateConnectorSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    credentials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    status: z.ZodOptional<z.ZodEnum<["active", "paused", "error", "disconnected"]>>;
    syncIntervalMinutes: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "paused" | "error" | "disconnected" | undefined;
    name?: string | undefined;
    credentials?: Record<string, unknown> | undefined;
    config?: Record<string, unknown> | undefined;
    syncIntervalMinutes?: number | undefined;
}, {
    status?: "active" | "paused" | "error" | "disconnected" | undefined;
    name?: string | undefined;
    credentials?: Record<string, unknown> | undefined;
    config?: Record<string, unknown> | undefined;
    syncIntervalMinutes?: number | undefined;
}>;
export type CreateConnectorInput = z.infer<typeof CreateConnectorSchema>;
export type UpdateConnectorInput = z.infer<typeof UpdateConnectorSchema>;
//# sourceMappingURL=connector.schema.d.ts.map