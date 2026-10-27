import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/authSlice';
import campaignReducer from '../features/campaigns/store/campaignSlice';
import aicReducer from '../features/aics/store/aicSlice';
import areaReducer from '../features/areas/store/areaSlice';
import ucmpReducer from '../features/ucmp/store/ucmpSlice';
import geographyReducer from '../features/geography/store/geographySlice';
import ampReducer from '../features/amp/store/ampSlice';
import teamReducer from '../features/teams/store/teamSlice';
import ompReducer from '../features/omp/store/ompSlice';
import tallySheetReducer from '../features/tallySheet/store/tallySheetSlice';
import fixedSheetReducer from '../features/fixedSheet/store/fixedSheetSlice';
import transitSheetReducer from '../features/transitSheet/store/transitSheetSlice';
import form2aReducer from '../features/form2a/store/form2aSlice';
import form2bReducer from '../features/form2b/store/form2bSlice';
import contextReducer from '../features/context/store/contextSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    campaigns: campaignReducer,
    aics: aicReducer,
    areas: areaReducer,
    ucmp: ucmpReducer,
    geography: geographyReducer,
    amp: ampReducer,
    teams: teamReducer,
    omp: ompReducer,
    tallySheet: tallySheetReducer,
    fixedSheet: fixedSheetReducer,
    transitSheet: transitSheetReducer,
    form2a: form2aReducer,
    form2b: form2bReducer,
    context: contextReducer
  },
});


