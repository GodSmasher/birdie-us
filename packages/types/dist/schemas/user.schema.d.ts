import { z } from 'zod';
export declare const CreateUserSchema: z.ZodObject<{
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    roleIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    roleIds: string[];
}, {
    email: string;
    firstName: string;
    lastName: string;
    roleIds: string[];
}>;
export declare const ResetPasswordSchema: z.ZodEffects<z.ZodObject<{
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    confirmPassword: string;
}, {
    password: string;
    confirmPassword: string;
}>, {
    password: string;
    confirmPassword: string;
}, {
    password: string;
    confirmPassword: string;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const VerifyTotpSchema: z.ZodObject<{
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
}, {
    code: string;
}>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type VerifyTotpInput = z.infer<typeof VerifyTotpSchema>;
//# sourceMappingURL=user.schema.d.ts.map