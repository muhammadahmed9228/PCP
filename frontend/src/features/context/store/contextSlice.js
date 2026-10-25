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
    campaign: null,
    teamType: null,
    loading: false,
    error: null
  },
  reducers: {
    clearContext: (state) => {
      state.areaId = null;
      state.areaName = null;
      state.areaNo = null;
      state.campaign = null;
      state.teamType = null;
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
        state.campaign = action.payload.campaign || null;
        state.teamType = action.payload.teamType || null;
      })
      .addCase(bootstrapContext.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearContext } = contextSlice.actions;
export default contextSlice.reducer;