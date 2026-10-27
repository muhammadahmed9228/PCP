import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { AIC } from "../users/aic.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { Area } from "../areas/area.model.js";
import { escapeListSearch, isPagedList, parseListQuery } from "../../utils/listQuery.js";

// Step 3 - Register new AIC[cite: 1]
export const registerAIC = asyncHandler(async (req, res) => {
    const { aicNo, aicName, username, password, phoneNumber, gender, isGovtEmployee } = req.body;

    if (
        [aicNo, aicName, username, password, phoneNumber, gender].some((field) => field?.trim() === "") ||
        isGovtEmployee === undefined
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existingAIC = await AIC.findOne({ username });
    if (existingAIC) {
        throw new ApiError(409, "AIC with this CNIC already exists");
    }

    const aic = await AIC.create({
        aicNo,
        aicName,
        username,
        password,
        phoneNumber,
        gender,
        isGovtEmployee,
        registeredBy: req.user._id // The currently logged-in UCI[cite: 1]
    });

    const createdAIC = await AIC.findById(aic._id).select("-password -refreshToken");

    return res.status(201).json(new ApiResponse(201, createdAIC, "AIC registered successfully"));
});

// Step 3 - Select already-registered AICs from previous campaigns[cite: 1]
export const getAICsForUCI = asyncHandler(async (req, res) => {
    if (isPagedList(req.query)) {
        const { page, limit, search, sort, direction } = parseListQuery(req.query, ["createdAt", "aicNo", "aicName", "username", "phoneNumber"]);
        const assignment = req.query.assignment ?? "all";
        const employment = req.query.employment ?? "all";
        if (!["all", "assigned", "unassigned"].includes(assignment)) throw new ApiError(400, "Invalid assignment filter");
        if (!["all", "government", "other"].includes(employment)) throw new ApiError(400, "Invalid employment filter");
        const conditions = { registeredBy: req.user._id };
        if (employment !== "all") conditions.isGovtEmployee = employment === "government";
        if (assignment !== "all") {
            const assignedIds = await Campaign.distinct("aics", { uci: req.user._id });
            conditions._id = assignment === "assigned" ? { $in: assignedIds } : { $nin: assignedIds };
        }
        if (search) {
            const pattern = new RegExp(escapeListSearch(search), "i");
            conditions.$or = [{ aicNo: pattern }, { aicName: pattern }, { username: pattern }, { phoneNumber: pattern }];
        }
        const [items, total] = await Promise.all([
            AIC.find(conditions).select("-password -refreshToken").sort({ [sort]: direction, _id: direction }).skip((page - 1) * limit).limit(limit),
            AIC.countDocuments(conditions)
        ]);
        return res.status(200).json(new ApiResponse(200, { items, total, page, limit }, "AICs retrieved successfully"));
    }
    // Only return AICs registered by this specific UCI[cite: 1]
    const aics = await AIC.find({ registeredBy: req.user._id }).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, aics, "AICs retrieved successfully"));
});

// Step 3 - Selected AICs become associated with the new campaign[cite: 1]
export const assignAicToCampaign = asyncHandler(async (req, res) => {
    const { campaignId, aicId } = req.body;

    if (!campaignId || !aicId) {
        throw new ApiError(400, "Campaign ID and AIC ID are required");
    }

    // Ensure the campaign belongs to this UCI and is still in planning phase
    const campaign = await Campaign.findOne({ _id: campaignId, uci: req.user._id });
    if (!campaign) {
        throw new ApiError(404, "Campaign not found or unauthorized");
    }
    
    if (campaign.status === "Completed") {
        throw new ApiError(403, "Cannot modify assignments for a completed campaign[cite: 1]");
    }

    // Ensure the AIC was registered by this UCI
    const aic = await AIC.findOne({ _id: aicId, registeredBy: req.user._id });
    if (!aic) {
        throw new ApiError(404, "AIC not found or unauthorized");
    }

    // Prevent duplicate assignments[cite: 1]
    if (campaign.aics.includes(aicId)) {
        throw new ApiError(409, "AIC is already assigned to this campaign");
    }

    campaign.aics.push(aicId);
    await campaign.save();

    return res.status(200).json(new ApiResponse(200, {}, "AIC assigned to campaign successfully"));
});

// Update AIC details
export const updateAIC = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { aicNo, aicName, phoneNumber, gender, isGovtEmployee, password } = req.body;

    const aic = await AIC.findOne({ _id: id, registeredBy: req.user._id });
    if (!aic) {
        throw new ApiError(404, "AIC not found or unauthorized");
    }

    if (aicNo) aic.aicNo = aicNo;
    if (aicName) aic.aicName = aicName;
    if (phoneNumber) aic.phoneNumber = phoneNumber;
    if (gender) aic.gender = gender;
    if (isGovtEmployee !== undefined) aic.isGovtEmployee = isGovtEmployee;
    if (password && password.trim() !== "") {
        aic.password = password;
    }

    await aic.save();

    const updatedAIC = await AIC.findById(aic._id).select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(200, updatedAIC, "AIC updated successfully"));
});

// Delete AIC
export const deleteAIC = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const aic = await AIC.findOne({ _id: id, registeredBy: req.user._id });
    if (!aic) {
        throw new ApiError(404, "AIC not found or unauthorized");
    }

    // Check if AIC is associated with an active or completed campaign
    const activeCampaign = await Campaign.findOne({ aics: id, status: { $in: ["Active", "Completed"] } });
    if (activeCampaign) {
        throw new ApiError(400, `Cannot delete AIC: assigned to campaign '${activeCampaign.campaignName}' which is ${activeCampaign.status}`);
    }

    // Check if AIC is assigned to any areas
    const assignedArea = await Area.findOne({ aic: id });
    if (assignedArea) {
        throw new ApiError(400, `Cannot delete AIC: assigned to Area '${assignedArea.areaName}' (${assignedArea.areaNo}). Please reassign or delete the area first.`);
    }

    // Remove from planning campaigns
    await Campaign.updateMany({ aics: id }, { $pull: { aics: id } });

    await AIC.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, { deletedId: id }, "AIC deleted successfully"));
});

// Unassign AIC from Campaign
export const unassignAicFromCampaign = asyncHandler(async (req, res) => {
    const { campaignId, aicId } = req.body;

    if (!campaignId || !aicId) {
        throw new ApiError(400, "Campaign ID and AIC ID are required");
    }

    const campaign = await Campaign.findOne({ _id: campaignId, uci: req.user._id });
    if (!campaign) {
        throw new ApiError(404, "Campaign not found or unauthorized");
    }

    if (campaign.status === "Completed" || campaign.status === "Active") {
        throw new ApiError(403, `Cannot modify assignments for a ${campaign.status} campaign`);
    }

    // Check if AIC is assigned to any areas in this campaign
    const areaInCampaign = await Area.findOne({ campaign: campaignId, aic: aicId });
    if (areaInCampaign) {
        throw new ApiError(400, `Cannot unassign AIC: currently assigned to Area '${areaInCampaign.areaName}' (${areaInCampaign.areaNo}). Reassign or delete the area first.`);
    }

    campaign.aics = campaign.aics.filter(id => id.toString() !== aicId.toString());
    await campaign.save();

    return res.status(200).json(new ApiResponse(200, {}, "AIC unassigned from campaign successfully"));
});
