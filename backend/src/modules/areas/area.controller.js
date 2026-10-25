import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Area } from "./area.model.js";
import { Campaign } from "../campaigns/campaign.model.js";

// Step 4 - Divide UC into Areas and assign to AIC[cite: 1]
export const createAreaAndAssign = asyncHandler(async (req, res) => {
    const { areaNo, areaName, areaDescription, campaignId, aicId } = req.body;

    if (!areaNo || !areaName || !campaignId || !aicId) {
        throw new ApiError(400, "Area Number, Area Name, Campaign ID, and AIC ID are required");
    }

    // Verify campaign ownership and state
    const campaign = await Campaign.findOne({ _id: campaignId, uci: req.user._id });
    if (!campaign) {
        throw new ApiError(404, "Campaign not found or unauthorized");
    }

    if (campaign.status === "Completed") {
        throw new ApiError(403, "Cannot modify areas for a completed historical campaign[cite: 1]");
    }

    // Verify that the AIC is actually assigned to this campaign[cite: 1]
    if (!campaign.aics.includes(aicId)) {
        throw new ApiError(400, "The selected AIC must be assigned to this campaign first");
    }

    // Check for duplicate area number within the same campaign
    const existingArea = await Area.findOne({ campaign: campaignId, areaNo });
    if (existingArea) {
        throw new ApiError(409, `Area Number ${areaNo} already exists in this campaign`);
    }

    const area = await Area.create({
        areaNo,
        areaName,
        areaDescription,
        campaign: campaignId,
        uci: req.user._id,
        aic: aicId
    });

    const populatedArea = await Area.findById(area._id).populate("aic", "aicNo aicName username phoneNumber");

    return res.status(201).json(new ApiResponse(201, populatedArea, "Area created and assigned to AIC successfully"));
});

export const getAreasForCampaign = asyncHandler(async (req, res) => {
    const { campaignId } = req.params;

    // Verify campaign ownership before returning data[cite: 1]
    const campaign = await Campaign.findOne({ _id: campaignId, uci: req.user._id });
    if (!campaign) {
        throw new ApiError(404, "Campaign not found or unauthorized");
    }

    // Fetch areas and populate the AIC details for the UI
    const areas = await Area.find({ campaign: campaignId, uci: req.user._id })
        .populate("aic", "aicNo aicName username phoneNumber")
        .sort({ areaNo: 1 });

    return res.status(200).json(new ApiResponse(200, areas, "Campaign areas retrieved successfully"));
});

// Update Area details and/or reassign AIC
export const updateArea = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { areaNo, areaName, areaDescription, aicId } = req.body;

    const area = await Area.findOne({ _id: id, uci: req.user._id });
    if (!area) {
        throw new ApiError(404, "Area not found or unauthorized");
    }

    const campaign = await Campaign.findById(area.campaign);
    if (!campaign) {
        throw new ApiError(404, "Campaign not found");
    }

    if (campaign.status === "Completed") {
        throw new ApiError(403, "Cannot modify areas for a completed campaign");
    }

    if (areaNo && areaNo !== area.areaNo) {
        const duplicate = await Area.findOne({ campaign: area.campaign, areaNo, _id: { $ne: id } });
        if (duplicate) {
            throw new ApiError(409, `Area Number ${areaNo} already exists in this campaign`);
        }
        area.areaNo = areaNo;
    }

    if (aicId && aicId !== area.aic?.toString()) {
        if (!campaign.aics.includes(aicId)) {
            throw new ApiError(400, "The selected AIC must be assigned to this campaign first");
        }
        area.aic = aicId;
    }

    if (areaName) area.areaName = areaName;
    if (areaDescription !== undefined) area.areaDescription = areaDescription;

    await area.save();

    const populatedArea = await Area.findById(area._id).populate("aic", "aicNo aicName username phoneNumber");
    return res.status(200).json(new ApiResponse(200, populatedArea, "Area updated successfully"));
});

// Delete Area
export const deleteArea = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const area = await Area.findOne({ _id: id, uci: req.user._id });
    if (!area) {
        throw new ApiError(404, "Area not found or unauthorized");
    }

    const campaign = await Campaign.findById(area.campaign);
    if (campaign && (campaign.status === "Completed" || campaign.status === "Active")) {
        throw new ApiError(403, `Cannot delete an area from a ${campaign.status} campaign`);
    }

    await Area.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, { deletedId: id }, "Area deleted successfully"));
});