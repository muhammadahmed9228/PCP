import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { areaService } from "../services/area.service";
import { toast } from "react-toastify";

export const fetchAreasForCampaign = createAsyncThunk(
  "areas/fetchForCampaign",
  async (campaignId, { rejectWithValue }) => {
    try {
      const response = await areaService.getAreasForCampaign(campaignId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch areas");
    }
  }
);

export const createNewArea = createAsyncThunk(
  "areas/create",
  async (areaData, { rejectWithValue }) => {
    try {
      const response = await areaService.createAreaAndAssign(areaData);
      toast.success(response.message || "Area created and assigned successfully");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create area";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const editArea = createAsyncThunk(
  "areas/edit",
  async ({ id, areaData }, { rejectWithValue }) => {
    try {
      const response = await areaService.updateArea(id, areaData);
      toast.success(response.message || "Area updated successfully");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update area";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeArea = createAsyncThunk(
  "areas/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await areaService.deleteArea(id);
      toast.success(response.message || "Area deleted successfully");
      return id;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete area";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  areas: [],
  loading: false,
  error: null,
};

const areaSlice = createSlice({
  name: "areas",
  initialState,
  reducers: {
    clearAreas: (state) => {
      state.areas = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAreasForCampaign.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAreasForCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = action.payload;
      })
      .addCase(fetchAreasForCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNewArea.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewArea.fulfilled, (state, action) => {
        state.loading = false;
        state.areas.push(action.payload); 
      })
      .addCase(createNewArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editArea.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.areas.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.areas[index] = action.payload;
        }
      })
      .addCase(removeArea.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = state.areas.filter(a => a._id !== action.payload);
      });
  },
});

export const { clearAreas } = areaSlice.actions;
export default areaSlice.reducer;