import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { aicService } from "../services/aic.service";
import { toast } from "react-toastify";

export const fetchAICs = createAsyncThunk(
  "aics/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await aicService.getAICsForUCI();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch AICs");
    }
  }
);

export const registerNewAIC = createAsyncThunk(
  "aics/register",
  async (aicData, { rejectWithValue }) => {
    try {
      const response = await aicService.registerAIC(aicData);
      toast.success(response.message || "AIC registered successfully");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to register AIC";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const editAIC = createAsyncThunk(
  "aics/edit",
  async ({ id, aicData }, { rejectWithValue }) => {
    try {
      const response = await aicService.updateAIC(id, aicData);
      toast.success(response.message || "AIC updated successfully");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update AIC";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeAIC = createAsyncThunk(
  "aics/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await aicService.deleteAIC(id);
      toast.success(response.message || "AIC deleted successfully");
      return id;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete AIC";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const assignAic = createAsyncThunk(
  "aics/assign",
  async (assignmentData, { rejectWithValue }) => {
    try {
      const response = await aicService.assignAicToCampaign(assignmentData);
      toast.success(response.message || "AIC assigned to campaign successfully");
      return assignmentData;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to assign AIC";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const unassignAic = createAsyncThunk(
  "aics/unassign",
  async (unassignmentData, { rejectWithValue }) => {
    try {
      const response = await aicService.unassignAicFromCampaign(unassignmentData);
      toast.success(response.message || "AIC unassigned from campaign successfully");
      return unassignmentData;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to unassign AIC";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  aics: [],
  loading: false,
  error: null,
};

const aicSlice = createSlice({
  name: "aics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAICs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAICs.fulfilled, (state, action) => {
        state.loading = false;
        state.aics = action.payload;
      })
      .addCase(fetchAICs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerNewAIC.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerNewAIC.fulfilled, (state, action) => {
        state.loading = false;
        state.aics.push(action.payload);
      })
      .addCase(registerNewAIC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editAIC.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.aics.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.aics[index] = action.payload;
        }
      })
      .addCase(removeAIC.fulfilled, (state, action) => {
        state.loading = false;
        state.aics = state.aics.filter(a => a._id !== action.payload);
      });
  },
});

export default aicSlice.reducer;