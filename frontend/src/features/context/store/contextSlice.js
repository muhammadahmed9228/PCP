import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { contextService } from "../services/context.service";

export const bootstrapContext = createAsyncThunk(
  "context/bootstrap",
  async (_, { rejectWithValue }) => {
    try {
      const response = await contextService.getOperationalContext();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load operational context");
    }
  }
);

const contextSlice = createSlice({
  name: "context",
  initialState: {
    areaId: null,
    areaName: null,
    areaNo: null,
    uciName: null,
    uciNo: null,
    ucNumber: null,
    ucName: null,
    province: null,
    district: null,
    townTehsil: null,
    campaign: null,
    teamType: null,
    assignments: [],
    loading: false,
    error: null
  },
  reducers: {
    clearContext: (state) => {
      state.areaId = null;
      state.areaName = null;
      state.areaNo = null;
      state.uciName = null;
      state.uciNo = null;
      state.ucNumber = null;
      state.ucName = null;
      state.province = null;
      state.district = null;
      state.townTehsil = null;
      state.campaign = null;
      state.teamType = null;
      state.assignments = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapContext.pending, (state) => {
        state.loading = true;
      })
      .addCase(bootstrapContext.fulfilled, (state, action) => {
        state.loading = false;
        state.areaId = action.payload.areaId || null;
        state.areaName = action.payload.areaName || null;
        state.areaNo = action.payload.areaNo || null;
        state.uciName = action.payload.uciName || null;
        state.uciNo = action.payload.uciNo || null;
        state.ucNumber = action.payload.ucNumber || null;
        state.ucName = action.payload.ucName || null;
        state.province = action.payload.province || null;
        state.district = action.payload.district || null;
        state.townTehsil = action.payload.townTehsil || null;
        state.campaign = action.payload.campaign || null;
        state.teamType = action.payload.teamType || null;
        state.assignments = action.payload.assignments || [];
      })
      .addCase(bootstrapContext.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearContext } = contextSlice.actions;
export default contextSlice.reducer;
