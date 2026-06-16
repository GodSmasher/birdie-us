"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInvoiceSchema = exports.CreateInvoiceSchema = void 0;
const zod_1 = require("zod");
exports.CreateInvoiceSchema = zod_1.z.object({
    offerId: zod_1.z.string().uuid().optional(),
    invoiceNumber: zod_1.z.string().min(1).max(50),
    customerName: zod_1.z.string().min(1).max(200),
    amountChf: zod_1.z.number().min(0),
    taxChf: zod_1.z.number().min(0).default(0),
    totalChf: zod_1.z.number().min(0),
    issuedAt: zod_1.z.string(),
    dueAt: zod_1.z.string(),
});
exports.UpdateInvoiceSchema = zod_1.z.object({
    status: zod_1.z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially_paid']).optional(),
    paidAt: zod_1.z.string().nullable().optional(),
});
//# sourceMappingURL=invoice.schema.js.map