"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLeadsQuerySchema = exports.UpdateLeadSchema = exports.CreateLeadSchema = void 0;
const zod_1 = require("zod");
exports.CreateLeadSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(100).optional(),
    lastName: zod_1.z.string().min(1).max(100).optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().max(30).optional(),
    addressStreet: zod_1.z.string().max(200).optional(),
    addressZip: zod_1.z.string().max(10).optional(),
    addressCity: zod_1.z.string().max(100).optional(),
    addressCanton: zod_1.z.string().max(2).optional(),
    source: zod_1.z.enum(['website', 'referral', 'partner', 'advertising', 'cold_call', 'leadnotes', 'other']),
    setterId: zod_1.z.string().uuid().optional(),
    notes: zod_1.z.string().max(5000).optional(),
});
exports.UpdateLeadSchema = zod_1.z.object({
    status: zod_1.z.enum(['new', 'contacted', 'qualified', 'appointment_set', 'won', 'lost', 'invalid']).optional(),
    setterId: zod_1.z.string().uuid().nullable().optional(),
    notes: zod_1.z.string().max(5000).optional(),
});
exports.GetLeadsQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(['new', 'contacted', 'qualified', 'appointment_set', 'won', 'lost', 'invalid']).optional(),
    setterId: zod_1.z.string().uuid().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(25),
});
//# sourceMappingURL=lead.schema.js.map