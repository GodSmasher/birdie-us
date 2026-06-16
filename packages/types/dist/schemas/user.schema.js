"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyTotpSchema = exports.LoginSchema = exports.ResetPasswordSchema = exports.CreateUserSchema = void 0;
const zod_1 = require("zod");
exports.CreateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    firstName: zod_1.z.string().min(1).max(100),
    lastName: zod_1.z.string().min(1).max(100),
    roleIds: zod_1.z.array(zod_1.z.string().uuid()).min(1),
});
exports.ResetPasswordSchema = zod_1.z.object({
    password: zod_1.z
        .string()
        .min(12)
        .max(128)
        .regex(/[A-Z]/, 'Muss einen Grossbuchstaben enthalten')
        .regex(/[0-9]/, 'Muss eine Zahl enthalten')
        .regex(/[^A-Za-z0-9]/, 'Muss ein Sonderzeichen enthalten'),
    confirmPassword: zod_1.z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: 'Passw\u00f6rter stimmen nicht \u00fcberein',
    path: ['confirmPassword'],
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Ung\u00fcltige E-Mail-Adresse'),
    password: zod_1.z.string().min(1, 'Passwort ist erforderlich'),
});
exports.VerifyTotpSchema = zod_1.z.object({
    code: zod_1.z.string().length(6).regex(/^\d{6}$/, 'Code muss 6 Ziffern enthalten'),
});
//# sourceMappingURL=user.schema.js.map