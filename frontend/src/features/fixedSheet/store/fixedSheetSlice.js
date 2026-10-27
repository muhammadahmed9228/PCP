import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fixedSheetService } from "../services/fixedSheet.service";
import { toast } from "react-toastify";

export const fetchFixedSheet = createAsyncThunk(
  "fixedSheet/fetch",
  async ({ teamId, day, pointId, campaignId }, { rejectWithValue, getState }) => {
    try {
      const response = await fixedSheetService.getFixedSheet(teamId, day, pointId, campaignId || getState().context.campaign?._id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch Fixed Sheet");
    }
  }
);

export const saveFixedSheetDraft = createAsyncThunk(
  "fixedSheet/saveDraft",
  async ({ teamId, day, data }, { rejectWithValue, getState }) => {
    try {
      const response = await fixedSheetService.saveDraft(teamId, day, data, getState().context.campaign?._id);
      toast.success("Fixed Sheet Draft saved successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save draft");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const finalizeFixedSheet = createAsyncThunk(
  "fixedSheet/finalize",
  async ({ teamId, day, campaignId, pointId }, { rejectWithValue, getState }) => {
    try {
      const response = await fixedSheetService.finalizeFixedSheet(teamId, day, getState().fixedSheet.data, campaignId || getState().context.campaign?._id, pointId);
      toast.success("Fixed Sheet finalized and locked successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to finalize Fixed Sheet");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const reopenFixedSheet = createAsyncThunk(
  "fixedSheet/reopen",
  async ({ teamId, day, reason }, { rejectWithValue }) => {
    try {
      const response = await fixedSheetService.reopenFixedSheet(teamId, day, reason);
      toast.info("Fixed Sheet reopened to Draft status");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reopen Fixed Sheet");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const fixedSheetSlice = createSlice({
  name: "fixedSheet",
  initialState: { data: null, loading: false, error: null },
  reducers: {
    clearFixedSheet: (state) => { state.data = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFixedSheet.pending, (state) => { state.loading = true; })
      .addCase(fetchFixedSheet.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchFixedSheet.rejected, (state) => {
        state.loading = false;
        state.data = null;
      })
      .addCase(saveFixedSheetDraft.fulfilled, (state, action) => { state.data = action.payload; })
      .addCase(finalizeFixedSheet.fulfilled, (state, action) => { state.data = action.payload; })
      .addCase(reopenFixedSheet.fulfilled, (state, action) => { state.data = action.payload; });
  },
});

export const { clearFixedSheet } = fixedSheetSlice.actions;
export default fixedSheetSlice.reducer;
