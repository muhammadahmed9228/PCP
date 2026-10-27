import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ampService } from "../services/amp.service";
import { toast } from "react-toastify";
import i18n from "../../../i18n/i18n";

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
      toast.success(i18n.t("ampDraftSaved"));
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("ampSaveFailed"));
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const finalizeAmp = createAsyncThunk(
  "amp/finalize",
  async (areaId, { rejectWithValue }) => {
    try {
      const response = await ampService.finalizeAMP(areaId);
      toast.success(i18n.t("ampSubmittedNotice"));
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("ampFinalizeFailed"));
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
