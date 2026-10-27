import i18n from "../../../i18n/i18n";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ompService } from "../services/omp.service";
import { toast } from "react-toastify";

export const fetchOmp = createAsyncThunk(
  "omp/fetch",
  async ({ teamId, day, routeId }, { rejectWithValue }) => {
    try {
      const response = await ompService.getOMP(teamId, day, routeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch OMP");
    }
  }
);

export const saveOmpDraft = createAsyncThunk(
  "omp/saveDraft",
  async ({ teamId, day, data }, { rejectWithValue }) => {
    try {
      const response = await ompService.saveDraft(teamId, day, data);
      toast.success(i18n.t("ompDraftSaved"));
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("ampSaveFailed"));
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const finalizeOmp = createAsyncThunk(
  "omp/finalize",
  async ({ teamId, day }, { rejectWithValue }) => {
    try {
      const response = await ompService.finalizeOMP(teamId, day);
      toast.success(i18n.t("ompFinalized"));
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("ompFinalizeFailed"));
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const ompSlice = createSlice({
  name: "omp",
  initialState: { data: null, loading: false, error: null },
  reducers: {
    clearOmp: (state) => { state.data = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOmp.pending, (state) => { state.loading = true; })
      .addCase(fetchOmp.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(saveOmpDraft.fulfilled, (state, action) => { state.data = action.payload; })
      .addCase(finalizeOmp.fulfilled, (state, action) => { state.data = action.payload; });
  },
});

export const { clearOmp } = ompSlice.actions;
export default ompSlice.reducer;