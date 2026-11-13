import mongoose from 'mongoose';
import { AMP } from '../../../amp/amp.model.js';
import { ApiError } from '../../../../utils/ApiError.js';
import { mapAmp } from './amp.mapper.js';
import { drawAmp } from './amp.layout.js';

export default {
  key: 'amp',
  async load({ campaignId, ampId, user }) {
    if (!['AIC','UCI'].includes(user?.role)) throw new ApiError(403, 'Not authorized to export this AMP.');
    if (ampId && (typeof ampId !== 'string' || !mongoose.isObjectIdOrHexString(ampId))) throw new ApiError(400, 'Invalid ampId.');
    if (!ampId && user.role !== 'AIC') throw new ApiError(400, 'ampId is required');
    if (!ampId && (typeof campaignId !== 'string' || !mongoose.isObjectIdOrHexString(campaignId))) throw new ApiError(400, 'Invalid campaign ID.');
    const query = ampId ? { _id: ampId } : { campaign: campaignId, aic: user._id };
    const record = await AMP.findOne(query).populate('aic','aicNo username').populate('campaign','startDate').populate('approvedBy','uciName').populate('reviewHistory.reviewer','uciName').lean();
    if (!record) throw new ApiError(404, 'AMP not found.');
    const owner = user.role === 'AIC' ? record.aic?._id : record.uci;
    if (!owner || String(owner) !== String(user._id)) throw new ApiError(403, 'Not authorized to export this AMP.');
    return record;
  },
  build(record) { return drawAmp(mapAmp(record)); },
  filename(record) {
    const d = mapAmp(record);
    const safe = s => String(s || 'unknown').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 60);
    return `AMP_${safe(d.areaName)}_${safe(d.campaignName)}_${Date.now()}.xlsx`;
  }
};
