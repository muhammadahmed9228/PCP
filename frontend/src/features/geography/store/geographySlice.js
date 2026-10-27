import i18n from "../../../i18n/i18n";
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
      return rejectWithValue(error.response?.data?.message || i18n.t("geoFetchFailed"));
    }
  }
);

export const addRoute = createAsyncThunk(
  "geography/addRoute",
  async (routeData, { rejectWithValue }) => {
    try {
      const response = await geographyService.addRoute(routeData);
      toast.success(i18n.t("geoRouteAdded"));
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("geoAddRouteFailed"));
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const addPoint = createAsyncThunk(
  "geography/addPoint",
  async (pointData, { rejectWithValue }) => {
    try {
      const response = await geographyService.addPoint(pointData);
      toast.success(i18n.t("geoPointAdded"));
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("geoAddPointFailed"));
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const geographyMutation = (name, service, success, failure) => createAsyncThunk(name, async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await service(id, data);
    toast.success(i18n.t(success));
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || i18n.t(failure));
    return rejectWithValue(error.response?.data?.message);
  }
});

export const updateRoute = geographyMutation("geography/updateRoute", geographyService.updateRoute, "geoRouteUpdated", "geoUpdateRouteFailed");
export const updatePoint = geographyMutation("geography/updatePoint", geographyService.updatePoint, "geoPointUpdated", "geoUpdatePointFailed");

export const deleteRoute = createAsyncThunk("geography/deleteRoute", async (id, { rejectWithValue }) => {
  try { const response = await geographyService.deleteRoute(id); toast.success(i18n.t("geoRouteDeleted")); return response.data.deletedId; }
  catch (error) { toast.error(error.response?.data?.message || i18n.t("geoDeleteRouteFailed")); return rejectWithValue(error.response?.data?.message); }
});

export const deletePoint = createAsyncThunk("geography/deletePoint", async (id, { rejectWithValue }) => {
  try { const response = await geographyService.deletePoint(id); toast.success(i18n.t("geoPointDeleted")); return response.data.deletedId; }
  catch (error) { toast.error(error.response?.data?.message || i18n.t("geoDeletePointFailed")); return rejectWithValue(error.response?.data?.message); }
});

export const unassignRoute = createAsyncThunk("geography/unassignRoute", async (id, { rejectWithValue }) => {
  try { const response = await geographyService.unassignRoute(id); toast.success(i18n.t("geoRouteUnassigned")); return response.data; }
  catch (error) { toast.error(error.response?.data?.message || i18n.t("geoUnassignRouteFailed")); return rejectWithValue(error.response?.data?.message); }
});

export const unassignPoint = createAsyncThunk("geography/unassignPoint", async (id, { rejectWithValue }) => {
  try { const response = await geographyService.unassignPoint(id); toast.success(i18n.t("geoPointUnassigned")); return response.data; }
  catch (error) { toast.error(error.response?.data?.message || i18n.t("geoUnassignPointFailed")); return rejectWithValue(error.response?.data?.message); }
});

export const assignRoute = geographyMutation("geography/assignRoute", geographyService.assignRoute, "geoRouteAssigned", "geoAssignRouteFailed");
export const assignPoint = geographyMutation("geography/assignPoint", geographyService.assignPoint, "geoPointAssigned", "geoAssignPointFailed");

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
    },
    setRouteImage: (state, action) => {
      const route = state.routes.find((item) => item._id === action.payload.id);
      if (route) route.routeImage = action.payload.image;
    },
    setPointImage: (state, action) => {
      const point = state.points.find((item) => item._id === action.payload.id);
      if (point) point.pointImage = action.payload.image;
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
      })
      .addCase(updateRoute.fulfilled, (state, action) => {
        const index = state.routes.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) state.routes[index] = action.payload;
      })
      .addCase(updatePoint.fulfilled, (state, action) => {
        const index = state.points.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) state.points[index] = action.payload;
      })
      .addCase(deleteRoute.fulfilled, (state, action) => { state.routes = state.routes.filter((item) => item._id !== action.payload); })
      .addCase(deletePoint.fulfilled, (state, action) => { state.points = state.points.filter((item) => item._id !== action.payload); })
      .addCase(unassignRoute.fulfilled, (state, action) => { const item = state.routes.find((route) => route._id === action.payload._id); if (item) Object.assign(item, action.payload); })
      .addCase(unassignPoint.fulfilled, (state, action) => { const item = state.points.find((point) => point._id === action.payload._id); if (item) Object.assign(item, action.payload); })
      .addCase(assignRoute.fulfilled, (state, action) => { const item = state.routes.find((route) => route._id === action.payload._id); if (item) Object.assign(item, action.payload); })
      .addCase(assignPoint.fulfilled, (state, action) => { const item = state.points.find((point) => point._id === action.payload._id); if (item) Object.assign(item, action.payload); });
  },
});

export const { clearGeography, setRouteImage, setPointImage } = geographySlice.actions;
export default geographySlice.reducer;
