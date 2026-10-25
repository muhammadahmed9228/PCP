import { z } from "zod";

const mongoId = z.string().min(24, "Required").max(24, "Invalid ID");

export const routeSchema = z.object({
  areaId: mongoId,
  team: mongoId,
  campaignDay: z.coerce.number({ required_error: "Day is required" }).int().min(1).max(3, "Mobile teams operate Days 1–3"),
  routeNo: z.string().min(1, "Route Number is required"),
  routeName: z.string().min(1, "Route Name is required"),
  routeSequence: z.string().min(1, "Sequence is required"), // String — e.g. "1", "1A"
  routeDescription: z.string().optional(),
});

export const pointSchema = z.object({
  areaId: mongoId,
  team: mongoId,
  campaignDay: z.coerce.number({ required_error: "Day is required" }).int().min(1).max(7, "Fixed/Transit teams operate up to Day 7"),
  pointNo: z.string().min(1, "Point Number is required"),
  pointName: z.string().min(1, "Point Name is required"),
  // pointSequence removed — not required for Fixed/Transit teams[cite: 1]
  pointType: z.enum(["Fixed", "Transit"], { required_error: "Point Type is required" }),
  pointDescription: z.string().optional(),
});