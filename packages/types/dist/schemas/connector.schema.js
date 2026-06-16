"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateConnectorSchema = exports.CreateConnectorSchema = void 0;
const zod_1 = require("zod");
exports.CreateConnectorSchema = zod_1.z.object({
    type: zod_1.z.enum(['reonic', '3cx', 'bexio', 'google_calendar', 'leadnotes', 'whatsapp', 'gmail']),
    name: zod_1.z.string().min(1).max(100),
    credentials: zod_1.z.record(zod_1.z.unknown()),
    config: zod_1.z.record(zod_1.z.unknown()).default({}),
    syncIntervalMinutes: zod_1.z.number().int().min(5).max(1440).default(15),
});
exports.UpdateConnectorSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    credentials: zod_1.z.record(zod_1.z.unknown()).optional(),
    config: zod_1.z.record(zod_1.z.unknown()).optional(),
    status: zod_1.z.enum(['active', 'paused', 'error', 'disconnected']).optional(),
    syncIntervalMinutes: zod_1.z.number().int().min(5).max(1440).optional(),
});
//# sourceMappingURL=connector.schema.js.map