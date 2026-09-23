import { z } from "zod";

/**
 * Validation messages are dictionary keys, not literal text. Components render
 * them through `t()` so the same schema serves both locales.
 */

export const loginSchema = z.object({
  email: z.string().min(1, "validation.emailRequired").email("validation.emailFormat"),
  password: z.string().min(1, "validation.passwordRequired").min(8, "validation.passwordMin"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

const passwordRules = z
  .string()
  .min(1, "validation.passwordRequired")
  .min(8, "validation.passwordMin")
  .regex(/[A-Z]/, "validation.passwordUppercase")
  .regex(/[a-z]/, "validation.passwordLowercase")
  .regex(/[0-9]/, "validation.passwordNumber");

export const registerStep1Schema = z
  .object({
    fullName: z.string().min(1, "validation.fullNameRequired"),
    email: z.string().min(1, "validation.emailRequired").email("validation.emailFormat"),
    phone: z
      .string()
      .min(1, "validation.phoneRequired")
      .regex(/^[0-9]{8,15}$/, "validation.phoneFormat"),
    password: passwordRules,
    confirmPassword: z.string().min(1, "validation.confirmPasswordRequired"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "validation.passwordMismatch",
    path: ["confirmPassword"],
  });

export type RegisterStep1Values = z.infer<typeof registerStep1Schema>;

export const registerStep2Schema = z.object({
  farmName: z.string().min(1, "validation.farmNameRequired"),
  accountRole: z.string().min(1, "validation.accountRoleRequired"),
  farmType: z.string().min(1, "validation.farmTypeRequired"),
  city: z.string().min(1, "validation.cityRequired"),
  province: z.string().min(1, "validation.provinceRequired"),
  livestockCount: z.string().min(1, "validation.livestockCountRequired"),
  primaryLivestock: z.string().min(1, "validation.primaryLivestockRequired"),
});

export type RegisterStep2Values = z.infer<typeof registerStep2Schema>;

export const registerStep3Schema = z.object({
  notificationMethod: z.string().min(1, "validation.notificationMethodRequired"),
  productUpdates: z.boolean().optional(),
  agreeTerms: z.boolean().refine((value) => value === true, {
    message: "validation.agreeTermsRequired",
  }),
});

export type RegisterStep3Values = z.infer<typeof registerStep3Schema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "validation.emailRequired").email("validation.emailFormat"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordRules,
    confirmPassword: z.string().min(1, "validation.confirmPasswordRequired"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "validation.passwordMismatch",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
