import i18n from "../../../i18n/i18n";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { form2aService } from "../services/form2a.service";
import { toast } from "react-toastify";

export const fetchForm2A = createAsyncThunk(
  "form2a/fetch",
  async ({ areaId, day }, { rejectWithValue }) => {
    try {
      const response = await form2aService.fetchOrGenerateDraft(areaId, day);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("f2aFetchFailed"));
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const finalizeForm2A = createAsyncThunk(
  "form2a/finalize",
  async ({ areaId, day }, { rejectWithValue }) => {
    try {
      const response = await form2aService.finalizeForm2A(areaId, day);
      toast.success(i18n.t("f2aFinalizedSuccess"));
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("f2aFinalizeFailed"));
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const reopenForm2A = createAsyncThunk(
  "form2a/reopen",
  async ({ areaId, day, reason }, { rejectWithValue }) => {
    try {
      const response = await form2aService.reopenForm2A(areaId, day, reason);
      toast.info(i18n.t("f2aReopened"));
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("f2aReopenFailed"));
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const form2aSlice = createSlice({
  name: "form2a",
  initialState: { data: null, loading: false, error: null },
  reducers: {
    clearForm2A: (state) => { state.data = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchForm2A.pending, (state) => { state.loading = true; })
      .addCase(fetchForm2A.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchForm2A.rejected, (state) => {
        state.loading = false;
        state.data = null;
      })
      .addCase(finalizeForm2A.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(reopenForm2A.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export const { clearForm2A } = form2aSlice.actions;
export default form2aSlice.reducer;
