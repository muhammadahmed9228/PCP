import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Campaign } from "./campaign.model.js";
import { Area } from "../areas/area.model.js";
import { AMP } from "../amp/amp.model.js";
import { verifyCampaignReadiness } from "./campaign.activation.service.js";
import { completeCampaign, getCampaignCompletionReadiness } from "../completion/completion.service.js";
import { escapeListSearch, isPagedList, parseListQuery } from "../../utils/listQuery.js";

export const createCampaign = asyncHandler(async (req, res) => {
    const { campaignName, campaignDescription, nameOfSIA, startDate, endDate } = req.body;

    if (!campaignName || !nameOfSIA || !startDate || !endDate) {
        throw new ApiError(400, "Campaign Name, Name of SIA, Start Date, and End Date are required");
    }

    const campaign = await Campaign.create({
        campaignName,
        campaignDescription,
        nameOfSIA,
        startDate,
        endDate,
        status: "Planning", // Default state for a fresh campaign[cite: 1]
        uci: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, campaign, "Campaign created successfully"));
});

export const getAllCampaigns = asyncHandler(async (req, res) => {
    if (isPagedList(req.query)) {
        const { page, limit, search, sort, direction } = parseListQuery(req.query, ["createdAt", "campaignName", "nameOfSIA", "startDate", "endDate", "status"]);
        const status = req.query.status ?? "current";
        if (!["current", "all", "Planning", "Active", "Paused", "Cancelled", "Completed"].includes(status)) throw new ApiError(400, "Invalid campaign status filter");
        const conditions = { uci: req.user._id };
        if (status === "current") conditions.status = { $ne: "Completed" };
        else if (status !== "all") conditions.status = status;
        if (search) {
            const pattern = new RegExp(escapeListSearch(search), "i");
            conditions.$or = [{ campaignName: pattern }, { nameOfSIA: pattern }, { campaignDescription: pattern }];
        }
        const [items, total] = await Promise.all([
            Campaign.find(conditions).sort({ [sort]: direction, _id: direction }).skip((page - 1) * limit).limit(limit),
            Campaign.countDocuments(conditions)
        ]);
        return res.status(200).json(new ApiResponse(200, { items, total, page, limit }, "Campaigns retrieved successfully"));
    }
    // UCI can access own campaigns and authorized historical campaigns[cite: 1]
    const campaigns = await Campaign.find({ uci: req.user._id }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, campaigns, "Campaigns retrieved successfully"));
});

export const getCampaignById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const campaign = await Campaign.findOne({ _id: id, uci: req.user._id });

    if (!campaign) {
        throw new ApiError(404, "Campaign not found or you are not authorized to view it");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, campaign, "Campaign retrieved successfully"));
});

export const updateCampaign = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { campaignName, campaignDescription, nameOfSIA, startDate, endDate } = req.body;

    const campaign = await Campaign.findOne({ _id: id, uci: req.user._id });

    if (!campaign) {
        throw new ApiError(404, "Campaign not found or unauthorized");
    }

    // Locked campaign records must be read-only[cite: 1]
    if (campaign.status === "Completed") {
        throw new ApiError(403, "Cannot edit a completed historical campaign");
    }

    if (campaignName) campaign.campaignName = campaignName;
    if (campaignDescription) campaign.campaignDescription = campaignDescription;
    if (nameOfSIA) campaign.nameOfSIA = nameOfSIA;
    if (startDate) campaign.startDate = startDate;
    if (endDate) campaign.endDate = endDate;

    await campaign.save();

    return res
        .status(200)
        .json(new ApiResponse(200, campaign, "Campaign updated successfully"));
});

export const updateCampaignStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Planning", "Active", "Completed", "Paused", "Cancelled"];
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid campaign status");
    }

    const campaign = await Campaign.findOne({ _id: id, uci: req.user._id });
    if (!campaign) throw new ApiError(404, "Campaign not found or unauthorized");
    if (campaign.status === "Completed") throw new ApiError(403, "Campaign is already completed and read-only");

    if (status === "Completed") {
        if (req.user.role !== "UCI") {
            throw new ApiError(403, "Only the UCI can complete a campaign.");
        }
        const completedCampaign = await completeCampaign(id, req.user._id);
        return res.status(200).json(new ApiResponse(200, completedCampaign, "Campaign completed and archived successfully"));
    }

    // The exact activation checklist implemented as explicit system validations[cite: 1]
    if (status === "Active" && campaign.status === "Planning") {
        const readinessReport = await verifyCampaignReadiness(id, req.user._id);
        
        if (!readinessReport.isReady) {
            throw new ApiError(
                400, 
                "Campaign planning is incomplete. Cannot activate.", 
                readinessReport.errors
            );
        }
    }

    campaign.status = status;
    await campaign.save();

    // Logic for UCI notifying AICs would be triggered here (e.g., via a notification service or SMS)[cite: 1]

    return res.status(200).json(new ApiResponse(200, campaign, `Campaign status updated to ${status}`));
});

export const complete = asyncHandler(async (req, res) => {
    const campaign = await completeCampaign(req.params.id, req.user._id);
    return res.status(200).json(new ApiResponse(200, campaign, "Campaign completed and archived successfully"));
});

export const getCompletionReadiness = asyncHandler(async (req, res) => {
    const readiness = await getCampaignCompletionReadiness(req.params.id, req.user._id);
    return res.status(200).json(new ApiResponse(200, readiness, "Campaign completion readiness retrieved successfully"));
});

export const getCampaignReadiness = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const readinessReport = await verifyCampaignReadiness(id, req.user._id);
    return res.status(200).json(new ApiResponse(200, readinessReport, "Campaign readiness report retrieved successfully"));
});

export const deleteCampaign = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const campaign = await Campaign.findOne({ _id: id, uci: req.user._id });
    if (!campaign) {
        throw new ApiError(404, "Campaign not found or unauthorized");
    }

    if (campaign.status === "Completed") {
        throw new ApiError(403, "Cannot delete a completed historical campaign");
    }

    if (campaign.status === "Active") {
        throw new ApiError(403, "Cannot delete an active campaign. Please cancel or complete it first.");
    }

    if (await AMP.exists({ campaign: id })) {
        throw new ApiError(409, "This campaign has AMP records. Deleting it would orphan their review history.");
    }

    // Clean up areas associated with this campaign
    await Area.deleteMany({ campaign: id, uci: req.user._id });

    // Clean up campaign
    await Campaign.findByIdAndDelete(id);

    return res
        .status(200)
        .json(new ApiResponse(200, { deletedId: id }, "Campaign and associated planning data deleted successfully"));
});
