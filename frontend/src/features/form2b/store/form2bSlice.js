import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { form2bService } from "../services/form2b.service";
import { toast } from "react-toastify";

export const fetchForm2B = createAsyncThunk(
  "form2b/fetch",
  async ({ campaignId, day }, { rejectWithValue }) => {
    try {
      const response = await form2bService.fetchOrGenerateDraft(campaignId, day);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to aggregate Form 2B");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const finalizeForm2B = createAsyncThunk(
  "form2b/finalize",
  async ({ campaignId, day }, { rejectWithValue }) => {
    try {
      const response = await form2bService.finalizeForm2B(campaignId, day);
      toast.success("Form 2B finalized and locked at UC level");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to finalize Form 2B");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const reopenForm2B = createAsyncThunk(
  "form2b/reopen",
  async ({ campaignId, day, reason }, { rejectWithValue }) => {
    try {
      const response = await form2bService.reopenForm2B(campaignId, day, reason);
      toast.info("Form 2B reopened to Draft status");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reopen Form 2B");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const form2bSlice = createSlice({
  name: "form2b",
  initialState: { data: null, loading: false, error: null },
  reducers: {
    clearForm2B: (state) => {
      state.data = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchForm2B.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchForm2B.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchForm2B.rejected, (state, action) => {
        state.loading = false;
        state.data = null;
        state.error = action.payload;
      })
      .addCase(finalizeForm2B.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(reopenForm2B.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  }
});

export const { clearForm2B } = form2bSlice.actions;
export default form2bSlice.reducer;