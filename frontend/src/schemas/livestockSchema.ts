import { z } from "zod";

export const livestockSchema = z.object({
  name: z.string().min(1, "Nama atau kode ternak wajib diisi."),
  animalType: z.string().min(1, "Jenis ternak wajib dipilih."),
  breed: z.string().min(1, "Ras ternak wajib dipilih."),
  gender: z.enum(["Male", "Female"], { message: "Pilih jenis kelamin." }),
  dateOfBirth: z.string().min(1, "Tanggal lahir wajib diisi."),
  estimatedAge: z.string().optional(),

  internalId: z.string().min(1, "ID internal wajib diisi."),
  earTagId: z.string().min(1, "Ear tag ID wajib diisi."),
  rfid: z.string().optional(),
  registrationNumber: z.string().optional(),

  weightKg: z.coerce.number().min(1, "Bobot wajib diisi."),
  bodyConditionScore: z.coerce.number().min(1).max(5),
  markings: z.string().optional(),

  farmId: z.string().min(1, "Farm wajib dipilih."),
  barnId: z.string().min(1, "Barn wajib dipilih."),
  herdGroup: z.string().min(1, "Herd group wajib dipilih."),
  arrivalDate: z.string().min(1, "Tanggal kedatangan wajib diisi."),
  acquisitionSource: z.string().min(1, "Sumber akuisisi wajib dipilih."),

  initialHealthStatus: z.string().min(1, "Status kesehatan awal wajib dipilih."),
  vaccinationStatus: z.string().min(1, "Status vaksinasi wajib dipilih."),
  lastExaminationDate: z.string().optional(),
  knownConditions: z.string().optional(),
  notes: z.string().optional(),

  assignDevice: z.boolean().optional(),
  deviceId: z.string().optional(),
});

export type LivestockFormValues = z.input<typeof livestockSchema>;
