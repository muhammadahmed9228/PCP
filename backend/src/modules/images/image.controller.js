import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getImageKit } from "../../config/imageKit.js";
import { UCI } from "../users/uci.model.js";
import { Area } from "../areas/area.model.js";
import { Route, Point } from "../geography/geography.model.js";
import { Campaign } from "../campaigns/campaign.model.js";

const uploadToImageKit = async (image, fileName, folder) => {
  if (typeof image !== "string" || !image.startsWith("data:image/")) {
    throw new ApiError(400, "A valid image file is required");
  }
  if (image.length > 5 * 1024 * 1024) throw new ApiError(413, "Image must be smaller than 5 MB");

  const uploaded = await getImageKit().upload({
    file: image,
    fileName: fileName || `upload-${Date.now()}.jpg`,
    folder,
    useUniqueFileName: true
  });

  return {
    url: uploaded.url,
    fileId: uploaded.fileId,
    fileName: uploaded.name,
    width: uploaded.width,
    height: uploaded.height
  };
};

const replaceImage = async (document, field, image, fileName, folder) => {
  const asset = await uploadToImageKit(image, fileName, folder);
  const previousFileId = document[field]?.fileId;
  document[field] = asset;
  await document.save();
  if (previousFileId && previousFileId !== asset.fileId) getImageKit().deleteFile(previousFileId).catch(() => {});
  return asset;
};

export const uploadUciImage = asyncHandler(async (req, res) => {
  if (req.user.role !== "UCI") throw new ApiError(403, "Only UCI users can upload a UC image");
  const image = await replaceImage(req.user, "ucImage", req.body.image, req.body.fileName, `/pcp/uci/${req.user._id}`);
  return res.status(200).json(new ApiResponse(200, image, "UC image uploaded successfully"));
});

export const uploadAreaImage = asyncHandler(async (req, res) => {
  if (req.user.role !== "AIC") throw new ApiError(403, "Only the assigned AIC can upload an Area image");
  const area = await Area.findOne({ _id: req.params.areaId, aic: req.user._id });
  if (!area) throw new ApiError(404, "Area not found or unauthorized");
  const campaign = await Campaign.findById(area.campaign);
  if (!campaign) throw new ApiError(404, "Campaign not found");
  if (campaign.status === "Completed") throw new ApiError(403, "Completed campaigns are read-only");
  const image = await replaceImage(area, "areaImage", req.body.image, req.body.fileName, `/pcp/areas/${area._id}`);
  return res.status(200).json(new ApiResponse(200, image, "Area image uploaded successfully"));
});

export const uploadGeographyImage = asyncHandler(async (req, res) => {
  if (req.user.role !== "AIC") throw new ApiError(403, "Only the assigned AIC can upload route or point images");
  const Model = req.params.kind === "route" ? Route : req.params.kind === "point" ? Point : null;
  if (!Model) throw new ApiError(400, "Image target must be route or point");
  const document = await Model.findOne({ _id: req.params.id, aic: req.user._id });
  if (!document) throw new ApiError(404, "Route or point not found or unauthorized");
  const campaign = await Campaign.findById(document.campaign);
  if (!campaign) throw new ApiError(404, "Campaign not found");
  if (campaign.status === "Completed") throw new ApiError(403, "Completed campaigns are read-only");
  const field = req.params.kind === "route" ? "routeImage" : "pointImage";
  const image = await replaceImage(document, field, req.body.image, req.body.fileName, `/pcp/geography/${req.params.kind}/${document._id}`);
  return res.status(200).json(new ApiResponse(200, image, "Geography image uploaded successfully"));
});
