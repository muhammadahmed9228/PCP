import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ampService } from "../services/amp.service";
import { toast } from "react-toastify";

export const fetchAmp = createAsyncThunk(
  "amp/fetch",
  async (areaId, { rejectWithValue }) => {
    try {
      const response = await ampService.getAMP(areaId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch AMP");
    }
  }
);

export const saveAmpDraft = createAsyncThunk(
  "amp/saveDraft",
  async ({ areaId, data }, { rejectWithValue }) => {
    try {
      const response = await ampService.saveDraft(areaId, data);
      toast.success("AMP Draft saved successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save draft");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const finalizeAmp = createAsyncThunk(
  "amp/finalize",
  async (areaId, { rejectWithValue }) => {
    try {
      const response = await ampService.finalizeAMP(areaId);
      toast.success("AMP finalized and locked successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to finalize AMP");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const ampSlice = createSlice({
  name: "amp",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAmp: (state) => {
      state.data = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAmp.pending, (state) => { state.loading = true; })
      .addCase(fetchAmp.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAmp.rejected, (state) => {
        state.loading = false;
        state.data = null;
      })
      .addCase(saveAmpDraft.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(finalizeAmp.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export const { clearAmp } = ampSlice.actions;
export default ampSlice.reducer;