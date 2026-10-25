import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "CNIC/Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["UCI", "AIC"], { required_error: "Role is required" }),
});

export const registerUciSchema = z.object({
  uciNo: z.string().min(1, "UCI Number is required"),
  uciName: z.string().min(1, "UCI Name is required"),
  username: z.string().min(13, "CNIC must be at least 13 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  gender: z.enum(["Male", "Female"], { required_error: "Gender is required" }),
  isGovtEmployee: z.preprocess((val) => {
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return val;
  }, z.boolean({ required_error: "Employment status is required" })),
  ucNumber: z.string().min(1, "UC Number is required"),
  ucName: z.string().min(1, "UC Name is required"),
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
  townTehsil: z.string().min(1, "Town/Tehsil is required"),
});