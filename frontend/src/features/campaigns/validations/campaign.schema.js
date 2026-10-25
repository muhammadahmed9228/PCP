import { z } from "zod";

export const createCampaignSchema = z.object({
  campaignName: z.string().min(1, "Campaign Name is required"),
  campaignDescription: z.string().optional(),
  nameOfSIA: z.string().min(1, "Name of SIA is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: "End Date must be after Start Date",
  path: ["endDate"],
});