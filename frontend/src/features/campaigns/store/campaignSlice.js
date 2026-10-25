import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { campaignService } from "../services/campaign.service";
import { toast } from "react-toastify";

export const fetchCampaigns = createAsyncThunk(
  "campaigns/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await campaignService.getAllCampaigns();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch campaigns");
    }
  }
);

export const createNewCampaign = createAsyncThunk(
  "campaigns/create",
  async (campaignData, { rejectWithValue }) => {
    try {
      const response = await campaignService.createCampaign(campaignData);
      toast.success(response.message || "Campaign created successfully");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create campaign";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const editCampaign = createAsyncThunk(
  "campaigns/edit",
  async ({ id, campaignData }, { rejectWithValue }) => {
    try {
      const response = await campaignService.updateCampaign(id, campaignData);
      toast.success(response.message || "Campaign updated successfully");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update campaign";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeCampaign = createAsyncThunk(
  "campaigns/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await campaignService.deleteCampaign(id);
      toast.success(response.message || "Campaign deleted successfully");
      return id;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete campaign";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  campaigns: [],
  loading: false,
  error: null,
};

const campaignSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNewCampaign.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns.unshift(action.payload);
      })
      .addCase(createNewCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editCampaign.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.campaigns.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
      })
      .addCase(removeCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = state.campaigns.filter(c => c._id !== action.payload);
      });
  },
});

export default campaignSlice.reducer;