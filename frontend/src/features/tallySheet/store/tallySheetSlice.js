import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { tallySheetService } from "../services/tallySheet.service";
import { toast } from "react-toastify";

export const fetchTallySheet = createAsyncThunk(
  "tallySheet/fetch",
  async ({ teamId, day, assignmentId, campaignId }, { rejectWithValue, getState }) => {
    try {
      const response = await tallySheetService.getTallySheet(teamId, day, assignmentId, campaignId || getState().context.campaign?._id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch Tally Sheet");
    }
  }
);

export const saveTallySheetDraft = createAsyncThunk(
  "tallySheet/saveDraft",
  async ({ teamId, day, data }, { rejectWithValue, getState }) => {
    try {
      const response = await tallySheetService.saveDraft(teamId, day, data, getState().context.campaign?._id);
      toast.success("Tally Sheet Draft saved successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save draft");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const finalizeTallySheet = createAsyncThunk(
  "tallySheet/finalize",
  async ({ teamId, day, assignmentId, campaignId }, { rejectWithValue, getState }) => {
    try {
      const response = await tallySheetService.finalizeTallySheet(teamId, day, getState().tallySheet.data, campaignId || getState().context.campaign?._id, assignmentId);
      toast.success("Tally Sheet finalized and mathematically locked successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to finalize Tally Sheet");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const reopenTallySheet = createAsyncThunk(
  "tallySheet/reopen",
  async ({ teamId, day, reason }, { rejectWithValue }) => {
    try {
      const response = await tallySheetService.reopenTallySheet(teamId, day, reason);
      toast.info("Tally Sheet reopened to Draft status");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reopen Tally Sheet");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const tallySheetSlice = createSlice({
  name: "tallySheet",
  initialState: { data: null, loading: false, error: null },
  reducers: {
    clearTallySheet: (state) => { state.data = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTallySheet.pending, (state) => { state.loading = true; })
      .addCase(fetchTallySheet.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTallySheet.rejected, (state) => {
        state.loading = false;
        state.data = null;
      })
      .addCase(saveTallySheetDraft.fulfilled, (state, action) => { state.data = action.payload; })
      .addCase(finalizeTallySheet.fulfilled, (state, action) => { state.data = action.payload; })
      .addCase(reopenTallySheet.fulfilled, (state, action) => { state.data = action.payload; });
  },
});

export const { clearTallySheet } = tallySheetSlice.actions;
export default tallySheetSlice.reducer;
