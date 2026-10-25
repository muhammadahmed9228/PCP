import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { geographyService } from "../services/geography.service";
import { toast } from "react-toastify";

export const fetchGeography = createAsyncThunk(
  "geography/fetch",
  async (areaId, { rejectWithValue }) => {
    try {
      const response = await geographyService.getGeography(areaId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch geography");
    }
  }
);

export const addRoute = createAsyncThunk(
  "geography/addRoute",
  async (routeData, { rejectWithValue }) => {
    try {
      const response = await geographyService.addRoute(routeData);
      toast.success("Route added successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add route");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const addPoint = createAsyncThunk(
  "geography/addPoint",
  async (pointData, { rejectWithValue }) => {
    try {
      const response = await geographyService.addPoint(pointData);
      toast.success("Point added successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add point");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const geographySlice = createSlice({
  name: "geography",
  initialState: {
    routes: [],
    points: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearGeography: (state) => {
      state.routes = [];
      state.points = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGeography.pending, (state) => { state.loading = true; })
      .addCase(fetchGeography.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload.routes;
        state.points = action.payload.points;
      })
      .addCase(addRoute.fulfilled, (state, action) => {
        state.routes.push(action.payload);
        state.routes.sort((a, b) =>
          a.campaignDay !== b.campaignDay
            ? a.campaignDay - b.campaignDay
            : String(a.routeSequence).localeCompare(String(b.routeSequence), undefined, { numeric: true })
        );
      })
      .addCase(addPoint.fulfilled, (state, action) => {
        state.points.push(action.payload);
        state.points.sort((a, b) => a.campaignDay - b.campaignDay);
      });
  },
});

export const { clearGeography } = geographySlice.actions;
export default geographySlice.reducer;