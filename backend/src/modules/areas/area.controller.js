import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Area } from "./area.model.js";
import { Campaign } from "../campaigns/campaign.model.js";
import { AMP } from "../amp/amp.model.js";
import { escapeListSearch, isPagedList, parseListQuery } from "../../utils/listQuery.js";

const isObjectIdString = value => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
const sameObjectId = (left, right) => String(left?._id || left).toLowerCase() === String(right).toLowerCase();
const campaignHasAic = (campaign, aicId) => campaign.aics?.some(id => sameObjectId(id, aicId));
const areaAssignmentConflict = "This AIC is already assigned to another area in this campaign";

const throwAreaDuplicate = error => {
    if (error?.code !== 11000) throw error;
    if (error.keyPattern?.aic) throw new ApiError(409, areaAssignmentConflict);
    if (error.keyPattern?.areaNo) throw new ApiError(409, "Area Number already exists in this campaign");
    throw new ApiError(409, "Area number or AIC already assigned in this campaign");
};

// Step 4 - Divide UC into Areas and assign to AIC[cite: 1]
export const createAreaAndAssign = asyncHandler(async (req, res) => {
    const { areaNo, areaName, areaDescription, campaignId, aicId } = req.body;

    if (!areaNo || !areaName || !campaignId || !aicId) {
        throw new ApiError(400, "Area Number, Area Name, Campaign ID, and AIC ID are required");
    }
    if (!isObjectIdString(campaignId) || !isObjectIdString(aicId)) {
        throw new ApiError(400, "Invalid Campaign ID or AIC ID");
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
    if (!campaignHasAic(campaign, aicId)) {
        throw new ApiError(400, "The selected AIC must be assigned to this campaign first");
    }

    // Check for duplicate area number within the same campaign
    const existingArea = await Area.findOne({ campaign: campaignId, areaNo });
    if (existingArea) {
        throw new ApiError(409, `Area Number ${areaNo} already exists in this campaign`);
    }

    if (await Area.exists({ campaign: campaignId, aic: aicId })) {
        throw new ApiError(409, areaAssignmentConflict);
    }

    let area;
    try {
        area = await Area.create({
            areaNo,
            areaName,
            areaDescription,
            campaign: campaignId,
            uci: req.user._id,
            aic: aicId
        });
    } catch (error) {
        throwAreaDuplicate(error);
    }

    const populatedArea = await Area.findById(area._id).populate("aic", "aicNo aicName username phoneNumber");

    return res.status(201).json(new ApiResponse(201, populatedArea, "Area created and assigned to AIC successfully"));
});

export const getAreasForCampaign = asyncHandler(async (req, res) => {
    const { campaignId } = req.params;

    if (!isObjectIdString(campaignId)) throw new ApiError(400, "Invalid Campaign ID");

    // Verify campaign ownership before returning data[cite: 1]
    const campaign = await Campaign.findOne({ _id: campaignId, uci: req.user._id });
    if (!campaign) {
        throw new ApiError(404, "Campaign not found or unauthorized");
    }

    if (isPagedList(req.query)) {
        const { page, limit, search, sort, direction } = parseListQuery(req.query, ["createdAt", "areaNo", "areaName"]);
        const aicId = req.query.aicId ?? "";
        if (aicId !== "" && !isObjectIdString(aicId)) throw new ApiError(400, "Invalid AIC ID filter");
        const scope = { campaign: campaignId, uci: req.user._id };
        const conditions = { ...scope };
        if (aicId) conditions.aic = aicId;
        if (search) {
            const pattern = new RegExp(escapeListSearch(search), "i");
            conditions.$or = [{ areaNo: pattern }, { areaName: pattern }, { areaDescription: pattern }];
        }
        const [items, total, occupiedAicIds] = await Promise.all([
            Area.find(conditions).populate("aic", "aicNo aicName username phoneNumber")
                .sort({ [sort]: direction, _id: direction }).skip((page - 1) * limit).limit(limit),
            Area.countDocuments(conditions),
            Area.distinct("aic", scope)
        ]);
        return res.status(200).json(new ApiResponse(200, { items, total, page, limit, occupiedAicIds }, "Campaign areas retrieved successfully"));
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

    if (!isObjectIdString(id) || (aicId !== undefined && !isObjectIdString(aicId))) {
        throw new ApiError(400, "Invalid Area ID or AIC ID");
    }

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

    if (aicId && !sameObjectId(aicId, area.aic)) {
        if (!campaignHasAic(campaign, aicId)) {
            throw new ApiError(400, "The selected AIC must be assigned to this campaign first");
        }
        if (await Area.exists({ campaign: area.campaign, aic: aicId, _id: { $ne: area._id } })) {
            throw new ApiError(409, areaAssignmentConflict);
        }
        if (await AMP.exists({ area: area._id })) {
            throw new ApiError(409, "This area has an AMP. Reassignment would orphan its review history.");
        }
        area.aic = aicId;
    }

    if (areaName) area.areaName = areaName;
    if (areaDescription !== undefined) area.areaDescription = areaDescription;

    try {
        await area.save();
    } catch (error) {
        throwAreaDuplicate(error);
    }

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

    if (await AMP.exists({ area: area._id })) {
        throw new ApiError(409, "This area has an AMP. Deleting it would orphan its review history.");
    }

    await Area.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, { deletedId: id }, "Area deleted successfully"));
});
