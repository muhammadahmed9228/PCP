import { z } from "zod";

export const registerAicSchema = z.object({
  aicNo: z.string().min(1, "AIC Number is required"),
  aicName: z.string().min(1, "AIC Name is required"),
  username: z.string().min(13, "CNIC must be at least 13 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  gender: z.enum(["Male", "Female"], { required_error: "Gender is required" }),
  isGovtEmployee: z.string().min(1, "Employment status is required"), 
});

export const updateAicSchema = z.object({
  aicNo: z.string().min(1, "AIC Number is required"),
  aicName: z.string().min(1, "AIC Name is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  gender: z.enum(["Male", "Female"], { required_error: "Gender is required" }),
  isGovtEmployee: z.string().min(1, "Employment status is required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});