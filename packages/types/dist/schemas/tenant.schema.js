"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTenantSchema = exports.CreateTenantSchema = void 0;
const zod_1 = require("zod");
const brand_schema_js_1 = require("./brand.schema.js");
exports.CreateTenantSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    slug: zod_1.z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
    branding: brand_schema_js_1.BrandTokensSchema.optional(),
});
exports.UpdateTenantSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    status: zod_1.z.enum(['active', 'suspended', 'archived']).optional(),
});
//# sourceMappingURL=tenant.schema.js.map