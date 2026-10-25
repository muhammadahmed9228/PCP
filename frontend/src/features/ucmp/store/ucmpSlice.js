import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ucmpService } from "../services/ucmp.service";
import { toast } from "react-toastify";

export const fetchUcmp = createAsyncThunk(
  "ucmp/fetch",
  async (campaignId, { rejectWithValue }) => {
    try {
      const response = await ucmpService.getUCMP(campaignId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch UCMP");
    }
  }
);

export const saveUcmpDraft = createAsyncThunk(
  "ucmp/saveDraft",
  async ({ campaignId, data }, { rejectWithValue }) => {
    try {
      const response = await ucmpService.saveDraft(campaignId, data);
      toast.success("UCMP Draft saved successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save draft");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const finalizeUcmp = createAsyncThunk(
  "ucmp/finalize",
  async (campaignId, { rejectWithValue }) => {
    try {
      const response = await ucmpService.finalizeUCMP(campaignId);
      toast.success("UCMP finalized and locked successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to finalize UCMP");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const ucmpSlice = createSlice({
  name: "ucmp",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUcmp: (state) => {
      state.data = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUcmp.pending, (state) => { state.loading = true; })
      .addCase(fetchUcmp.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(saveUcmpDraft.fulfilled, (state, action) => {
        state.data = action.payload; // Update state with latest draft
      })
      .addCase(finalizeUcmp.fulfilled, (state, action) => {
        state.data = action.payload; // Update state with finalized record
      });
  },
});

export const { clearUcmp } = ucmpSlice.actions;
export default ucmpSlice.reducer;