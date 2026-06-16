"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCallsQuerySchema = void 0;
const zod_1 = require("zod");
exports.GetCallsQuerySchema = zod_1.z.object({
    teamMemberId: zod_1.z.string().uuid().optional(),
    direction: zod_1.z.enum(['inbound', 'outbound']).optional(),
    status: zod_1.z.enum(['answered', 'missed', 'voicemail', 'busy', 'failed']).optional(),
    from: zod_1.z.string().optional(),
    to: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(25),
});
//# sourceMappingURL=call.schema.js.map