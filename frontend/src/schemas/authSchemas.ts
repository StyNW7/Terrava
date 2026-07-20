import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi.")
    .email("Gunakan format email yang valid."),
  password: z
    .string()
    .min(1, "Password wajib diisi.")
    .min(8, "Password minimal terdiri dari 8 karakter."),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

const passwordRules = z
  .string()
  .min(1, "Password wajib diisi.")
  .min(8, "Password minimal terdiri dari 8 karakter.")
  .regex(/[A-Z]/, "Password harus memiliki huruf besar.")
  .regex(/[a-z]/, "Password harus memiliki huruf kecil.")
  .regex(/[0-9]/, "Password harus memiliki angka.");

export const registerStep1Schema = z
  .object({
    fullName: z.string().min(1, "Nama lengkap wajib diisi."),
    email: z
      .string()
      .min(1, "Email wajib diisi.")
      .email("Gunakan format email yang valid."),
    phone: z
      .string()
      .min(1, "Nomor telepon wajib diisi.")
      .regex(/^[0-9]{8,15}$/, "Nomor telepon harus berupa angka 8-15 digit."),
    password: passwordRules,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak sama dengan password.",
    path: ["confirmPassword"],
  });

export type RegisterStep1Values = z.infer<typeof registerStep1Schema>;

export const registerStep2Schema = z.object({
  farmName: z.string().min(1, "Nama peternakan atau organisasi wajib diisi."),
  accountRole: z.string().min(1, "Pilih peran akun Anda."),
  farmType: z.string().min(1, "Pilih jenis peternakan."),
  city: z.string().min(1, "Kota atau kabupaten wajib diisi."),
  province: z.string().min(1, "Provinsi wajib diisi."),
  livestockCount: z.string().min(1, "Pilih jumlah ternak."),
  primaryLivestock: z.string().min(1, "Pilih jenis ternak utama."),
});

export type RegisterStep2Values = z.infer<typeof registerStep2Schema>;

export const registerStep3Schema = z.object({
  notificationMethod: z.string().min(1, "Pilih metode notifikasi."),
  productUpdates: z.boolean().optional(),
  agreeTerms: z.boolean().refine((value) => value === true, {
    message: "Anda harus menyetujui Ketentuan Layanan dan Kebijakan Privasi.",
  }),
});

export type RegisterStep3Values = z.infer<typeof registerStep3Schema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi.")
    .email("Gunakan format email yang valid."),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordRules,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak sama dengan password.",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
