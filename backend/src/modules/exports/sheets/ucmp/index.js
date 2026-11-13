import mongoose from 'mongoose';
import { UCMP } from '../../../ucmp/ucmp.model.js';
import { ApiError } from '../../../../utils/ApiError.js';
import { mapUcmp } from './ucmp.mapper.js';
import { drawUcmp } from './ucmp.layout.js';

export default {
  key: 'ucmp',
  async load({ campaignId, uciId }) {
    if (!mongoose.isObjectIdOrHexString(campaignId)) throw new ApiError(400, 'Invalid campaign ID.');
    const record = await UCMP.findOne({ campaign: campaignId, uci: uciId }).populate('uci', 'uciNo username ucNumber').populate('campaign', 'campaignName nameOfSIA startDate').lean();
    if (!record) throw new ApiError(404, 'UCMP not found.');
    return record;
  },
  build(record) { return drawUcmp(mapUcmp(record)); },
  filename() { return 'ucmp.xlsx'; }
};
