import { z } from "zod";

const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  cnic: z.string().min(13, "CNIC is required"),
  gender: z.enum(["Male", "Female"], { required_error: "Gender is required" }),
  roleType: z.enum(["LHW", "Volunteer"], { required_error: "Role type is required" }),
  states: z.array(z.string()).optional(), // G, L, F mapping[cite: 1]
});

export const registerTeamSchema = z.object({
  teamNo: z.string().min(1, "Team Number is required"),
  teamType: z.enum(["Mobile", "Fixed", "Transit"], { required_error: "Team Type is required" }),
  username: z.string().min(1, "Username (CNIC) is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  leader: teamMemberSchema,
  member: teamMemberSchema,
});