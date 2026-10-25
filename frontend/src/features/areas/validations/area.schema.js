import { z } from "zod";

export const createAreaSchema = z.object({
  areaNo: z.string().min(1, "Area Number is required"),
  areaName: z.string().min(1, "Area Name is required"),
  areaDescription: z.string().optional(),
  aicId: z.string().min(1, "Selecting an AIC is required"),
});