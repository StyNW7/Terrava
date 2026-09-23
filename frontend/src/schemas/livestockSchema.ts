import { z } from "zod";

/** Messages are dictionary keys; the form renders them through `t()`. */

export const livestockSchema = z.object({
  name: z.string().min(1, "validation.livestock.name"),
  animalType: z.string().min(1, "validation.livestock.animalType"),
  breed: z.string().min(1, "validation.livestock.breed"),
  gender: z.enum(["Male", "Female"], { message: "validation.livestock.gender" }),
  dateOfBirth: z.string().min(1, "validation.livestock.dateOfBirth"),
  estimatedAge: z.string().optional(),

  internalId: z.string().min(1, "validation.livestock.internalId"),
  earTagId: z.string().min(1, "validation.livestock.earTagId"),
  rfid: z.string().optional(),
  registrationNumber: z.string().optional(),

  weightKg: z.coerce.number().min(1, "validation.livestock.weight"),
  bodyConditionScore: z.coerce.number().min(1).max(5),
  markings: z.string().optional(),

  farmId: z.string().min(1, "validation.livestock.farm"),
  barnId: z.string().min(1, "validation.livestock.barn"),
  herdGroup: z.string().min(1, "validation.livestock.herdGroup"),
  arrivalDate: z.string().min(1, "validation.livestock.arrivalDate"),
  acquisitionSource: z.string().min(1, "validation.livestock.acquisitionSource"),

  initialHealthStatus: z.string().min(1, "validation.livestock.initialHealthStatus"),
  vaccinationStatus: z.string().min(1, "validation.livestock.vaccinationStatus"),
  lastExaminationDate: z.string().optional(),
  knownConditions: z.string().optional(),
  notes: z.string().optional(),

  assignDevice: z.boolean().optional(),
  deviceId: z.string().optional(),
});

export type LivestockFormValues = z.input<typeof livestockSchema>;
