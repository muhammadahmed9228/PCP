import { z } from "zod";

const mongoId = z.string().min(24, "validationRequired").max(24, "validationInvalidId");

export const routeSchema = z.object({
  areaId: mongoId,
  team: mongoId,
  campaignDay: z.coerce.number({ error: "validationDayRequired" }).int().min(1, "validationDayRequired").max(3, "validationMobileDays"),
  routeNo: z.string().min(1, "validationRouteNumber"),
  routeName: z.string().min(1, "validationRouteName"),
  routeSequence: z.string().min(1, "validationSequence"), // String — e.g. "1", "1A"
  routeDescription: z.string().optional(),
});

export const pointSchema = z.object({
  areaId: mongoId,
  team: mongoId,
  campaignDay: z.coerce.number({ error: "validationDayRequired" }).int().min(1, "validationDayRequired").max(7, "validationFixedDays"),
  pointNo: z.string().min(1, "validationPointNumber"),
  pointName: z.string().min(1, "validationPointName"),
  // pointSequence removed — not required for Fixed/Transit teams[cite: 1]
  pointType: z.enum(["Fixed", "Transit"], { error: "validationPointType" }),
  pointDescription: z.string().optional(),
});