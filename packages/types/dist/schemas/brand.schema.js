"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandTokensSchema = void 0;
const zod_1 = require("zod");
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
exports.BrandTokensSchema = zod_1.z.object({
    primary: zod_1.z.string().regex(hexColorRegex, 'Must be a valid hex color'),
    secondary: zod_1.z.string().regex(hexColorRegex, 'Must be a valid hex color'),
    accent: zod_1.z.string().regex(hexColorRegex, 'Must be a valid hex color'),
    background: zod_1.z.string().regex(hexColorRegex, 'Must be a valid hex color'),
    surface: zod_1.z.string().regex(hexColorRegex, 'Must be a valid hex color'),
    textPrimary: zod_1.z.string().regex(hexColorRegex, 'Must be a valid hex color'),
    textSecondary: zod_1.z.string().regex(hexColorRegex, 'Must be a valid hex color'),
    font: zod_1.z.string().min(1).max(100),
    fontUrl: zod_1.z.string().url().nullable(),
    radius: zod_1.z.string().regex(/^\d+px$/, 'Must be in format like "8px"'),
    darkModeEnabled: zod_1.z.boolean(),
});
//# sourceMappingURL=brand.schema.js.map