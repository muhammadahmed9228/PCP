import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { teamService } from "../services/team.service";
import { toast } from "react-toastify";

export const fetchTeams = createAsyncThunk("teams/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await teamService.getTeams();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch teams");
  }
});

export const registerNewTeam = createAsyncThunk("teams/register", async (teamData, { rejectWithValue }) => {
  try {
    const response = await teamService.registerTeam(teamData);
    toast.success("Team registered successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to register team");
    return rejectWithValue(error.response?.data?.message);
  }
});

const teamSlice = createSlice({
  name: "teams",
  initialState: { teams: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => { state.loading = true; })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(registerNewTeam.fulfilled, (state, action) => {
        state.teams.push(action.payload);
      });
  },
});

export default teamSlice.reducer;