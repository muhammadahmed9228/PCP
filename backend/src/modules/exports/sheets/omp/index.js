import mongoose from 'mongoose';
import { OMP } from '../../../omp/omp.model.js';
import { ApiError } from '../../../../utils/ApiError.js';
import { mapOmp } from './omp.mapper.js';
import { drawOmp } from './omp.layout.js';

export default {
  key: 'omp',
  async load({ campaignId, teamId, user }) {
    if (!campaignId || !teamId || typeof campaignId !== 'string' || typeof teamId !== 'string' || !mongoose.isObjectIdOrHexString(campaignId) || !mongoose.isObjectIdOrHexString(teamId)) throw new ApiError(400, 'Valid campaignId and teamId are required.');
    if (!['AIC','UCI'].includes(user?.role)) throw new ApiError(403, 'Not authorized to export OMP.');
    const scope = { campaign: campaignId, team: teamId, [user.role === 'AIC' ? 'aic' : 'uci']: user._id };
    const records = await OMP.find(scope).sort({ campaignDay: 1 }).lean();
    if (!records.length) throw new ApiError(404, 'OMP not found.');
    return { records };
  },
  build(record) { return drawOmp(mapOmp(record)); },
  filename(record) { const d=mapOmp(record); const safe=v=>String(v || 'unknown').replace(/[^a-z0-9_-]+/gi,'_').slice(0,60); return `OMP_Team${safe(d.teamNo)}_${safe(d.campaignName)}_${Date.now()}.xlsx`; }
};
