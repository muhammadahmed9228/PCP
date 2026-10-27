import { z } from "zod";

const teamMemberSchema = z.object({
  name: z.string().min(1, "validationNameRequired"),
  cnic: z.string().min(13, "validationCnicRequired"),
  gender: z.enum(["Male", "Female"], { error: "validationGenderRequired" }),
  roleType: z.enum(["LHW", "Volunteer"], { error: "validationRoleRequired" }),
  states: z.array(z.string()).optional(), // G, L, F mapping[cite: 1]
});

const teamSchema = z.object({
  teamNo: z.string().min(1, "validationTeamNumberRequired"),
  teamType: z.enum(["Mobile", "Fixed", "Transit"], { error: "validationTeamTypeRequired" }),
  username: z.string().min(1, "validationUsernameRequired"),
  password: z.string().min(6, "validationPasswordLength"),
  leader: teamMemberSchema,
  member: teamMemberSchema,
});

const requireMatchingLeaderCnic = (data, context) => {
  if (data.username.trim() !== data.leader.cnic.trim()) {
    context.addIssue({ code: "custom", path: ["username"], message: "validationUsernameMatch" });
  }
};

export const registerTeamSchema = teamSchema.superRefine(requireMatchingLeaderCnic);

export const editTeamSchema = teamSchema.extend({
  password: z.string().min(6, "validationPasswordLength").or(z.literal(""))
}).superRefine(requireMatchingLeaderCnic);
