import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { transitSheetService } from "../services/transitSheet.service";
import { toast } from "react-toastify";

export const fetchTransitSheet = createAsyncThunk(
  "transitSheet/fetch",
  async ({ teamId, day, pointId, campaignId }, { rejectWithValue, getState }) => {
    try {
      const response = await transitSheetService.getTransitSheet(teamId, day, pointId, campaignId || getState().context.campaign?._id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch Transit Sheet");
    }
  }
);

export const saveTransitSheetDraft = createAsyncThunk(
  "transitSheet/saveDraft",
  async ({ teamId, day, data }, { rejectWithValue, getState }) => {
    try {
      const response = await transitSheetService.saveDraft(teamId, day, data, getState().context.campaign?._id);
      toast.success("Transit Sheet Draft saved successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save draft");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const finalizeTransitSheet = createAsyncThunk(
  "transitSheet/finalize",
  async ({ teamId, day, campaignId, pointId }, { rejectWithValue, getState }) => {
    try {
      const response = await transitSheetService.finalizeTransitSheet(teamId, day, getState().transitSheet.data, campaignId || getState().context.campaign?._id, pointId);
      toast.success("Transit Sheet finalized and locked successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to finalize Transit Sheet");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const reopenTransitSheet = createAsyncThunk(
  "transitSheet/reopen",
  async ({ teamId, day, reason }, { rejectWithValue }) => {
    try {
      const response = await transitSheetService.reopenTransitSheet(teamId, day, reason);
      toast.info("Transit Sheet reopened to Draft status");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reopen Transit Sheet");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const transitSheetSlice = createSlice({
  name: "transitSheet",
  initialState: { data: null, loading: false, error: null },
  reducers: {
    clearTransitSheet: (state) => { 
      state.data = null; 
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransitSheet.pending, (state) => { 
        state.loading = true; 
      })
      .addCase(fetchTransitSheet.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTransitSheet.rejected, (state) => {
        state.loading = false;
        state.data = null;
      })
      .addCase(saveTransitSheetDraft.fulfilled, (state, action) => { 
        state.data = action.payload; 
      })
      .addCase(finalizeTransitSheet.fulfilled, (state, action) => { 
        state.data = action.payload; 
      })
      .addCase(reopenTransitSheet.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export const { clearTransitSheet } = transitSheetSlice.actions;
export default transitSheetSlice.reducer;
