"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOfferSchema = exports.CreateOfferSchema = void 0;
const zod_1 = require("zod");
exports.CreateOfferSchema = zod_1.z.object({
    leadId: zod_1.z.string().uuid().optional(),
    beraterId: zod_1.z.string().uuid().optional(),
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().max(5000).optional(),
    amountChf: zod_1.z.number().min(0),
    validUntil: zod_1.z.string().optional(),
});
exports.UpdateOfferSchema = zod_1.z.object({
    status: zod_1.z.enum(['draft', 'sent', 'negotiating', 'won', 'lost', 'expired']).optional(),
    amountChf: zod_1.z.number().min(0).optional(),
    title: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().max(5000).optional(),
});
//# sourceMappingURL=offer.schema.js.map