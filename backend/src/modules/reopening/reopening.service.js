import { Form2A } from "../form2a/form2a.model.js";
import { Form2B } from "../form2b/form2b.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { refreshDraftForm2A } from "../form2a/form2a.service.js";
import { refreshDraftForm2B } from "../form2b/form2b.service.js";
import { withMongoTransaction } from "../../utils/mongoTransaction.js";
import { ApiError } from "../../utils/ApiError.js";
import { validateReopenReason } from "../../utils/reopenReason.js";

const withSession = (query, session) => (session ? query.session(session) : query);

export const reopenFieldSheet = async ({
    Model,
    label,
    teamId,
    campaignDay,
    aicId,
    reason
}) => {
    const normalizedReason = validateReopenReason(reason);

    return withMongoTransaction(async (session) => {
        const sheet = await withSession(
            Model.findOne({ team: teamId, campaignDay, aic: aicId }),
            session
        );

        if (!sheet) throw new ApiError(404, `${label} not found or unauthorized.`);
        if (sheet.status !== "Finalized") {
            throw new ApiError(409, `${label} is not finalized and cannot be reopened.`);
        }

        const campaign = await withSession(Campaign.findById(sheet.campaign), session);
        if (!campaign) throw new ApiError(404, "Campaign not found.");
        if (campaign.status === "Completed") throw new ApiError(403, "Completed campaigns are read-only.");

        const form2A = await withSession(
            Form2A.findOne({
                campaign: sheet.campaign,
                area: sheet.area,
                aic: aicId,
                campaignDay
            }),
            session
        );

        if (!form2A) {
            throw new ApiError(409, `The corresponding Form 2A must exist in Draft status before reopening this ${label}.`);
        }
        if (form2A.status !== "Draft") {
            throw new ApiError(409, `The corresponding Form 2A is finalized. Reopen Form 2B and Form 2A first.`);
        }

        const reopenedAt = new Date();
        const reopenedSheet = await Model.findOneAndUpdate(
            { _id: sheet._id, aic: aicId, status: "Finalized" },
            {
                $set: {
                    status: "Draft",
                    reopenedBy: aicId,
                    reopenReason: normalizedReason,
                    reopenedAt
                },
                $unset: { finalizedAt: 1 }
            },
            { new: true, runValidators: true, session }
        );

        if (!reopenedSheet) {
            throw new ApiError(409, `${label} changed before it could be reopened. Please reload and try again.`);
        }

        await refreshDraftForm2A(sheet.area, campaignDay, aicId, session);
        return reopenedSheet;
    });
};

export const reopenForm2A = async ({ areaId, campaignDay, uciId, reason }) => {
    const normalizedReason = validateReopenReason(reason);

    return withMongoTransaction(async (session) => {
        const form2A = await withSession(
            Form2A.findOne({ area: areaId, campaignDay, uci: uciId }),
            session
        );

        if (!form2A) throw new ApiError(404, "Form 2A not found or unauthorized.");
        if (form2A.status !== "Finalized") {
            throw new ApiError(409, "Form 2A is not finalized and cannot be reopened.");
        }

        const campaign = await withSession(Campaign.findById(form2A.campaign), session);
        if (!campaign) throw new ApiError(404, "Campaign not found.");
        if (campaign.status === "Completed") throw new ApiError(403, "Completed campaigns are read-only.");

        const form2B = await withSession(
            Form2B.findOne({
                campaign: form2A.campaign,
                uci: uciId,
                campaignDay,
                status: "Draft"
            }),
            session
        );

        if (!form2B) {
            throw new ApiError(409, "The corresponding Form 2B must be in Draft status before reopening Form 2A.");
        }

        const reopenedAt = new Date();
        const reopenedForm2A = await Form2A.findOneAndUpdate(
            { _id: form2A._id, uci: uciId, status: "Finalized" },
            {
                $set: {
                    status: "Draft",
                    reopenedBy: uciId,
                    reopenReason: normalizedReason,
                    reopenedAt
                },
                $unset: { finalizedAt: 1 }
            },
            { new: true, runValidators: true, session }
        );

        if (!reopenedForm2A) {
            throw new ApiError(409, "Form 2A changed before it could be reopened. Please reload and try again.");
        }

        await refreshDraftForm2B(form2A.campaign, campaignDay, uciId, session);
        return reopenedForm2A;
    });
};
