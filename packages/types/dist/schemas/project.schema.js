"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProjectSchema = exports.CreateProjectSchema = void 0;
const zod_1 = require("zod");
exports.CreateProjectSchema = zod_1.z.object({
    leadId: zod_1.z.string().uuid().optional(),
    offerId: zod_1.z.string().uuid().optional(),
    beraterId: zod_1.z.string().uuid().optional(),
    title: zod_1.z.string().min(1).max(200),
    customerName: zod_1.z.string().min(1).max(200),
    addressStreet: zod_1.z.string().max(200).optional(),
    addressZip: zod_1.z.string().max(10).optional(),
    addressCity: zod_1.z.string().max(100).optional(),
    phaseId: zod_1.z.string().uuid().optional(),
    installationDate: zod_1.z.string().optional(),
    notes: zod_1.z.string().max(5000).optional(),
});
exports.UpdateProjectSchema = zod_1.z.object({
    phaseId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['active', 'on_hold', 'completed', 'cancelled']).optional(),
    installationDate: zod_1.z.string().nullable().optional(),
    notes: zod_1.z.string().max(5000).optional(),
});
//# sourceMappingURL=project.schema.js.map