import i18n from "../../../i18n/i18n";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { teamService } from "../services/team.service";
import { toast } from "react-toastify";

export const fetchTeams = createAsyncThunk("teams/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await teamService.getTeams();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || i18n.t("teamFetchFailed"));
  }
});

export const registerNewTeam = createAsyncThunk("teams/register", async (teamData, { rejectWithValue }) => {
  try {
    const response = await teamService.registerTeam(teamData);
    toast.success(i18n.t("teamRegisteredSuccess"));
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || i18n.t("teamRegisterFailed"));
    return rejectWithValue(error.response?.data?.message);
  }
});

export const updateTeam = createAsyncThunk("teams/update", async ({ id, teamData }, { rejectWithValue }) => {
  try {
    const response = await teamService.updateTeam(id, teamData);
    toast.success(i18n.t("teamUpdatedSuccess"));
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || i18n.t("teamUpdateFailed"));
    return rejectWithValue(error.response?.data?.message);
  }
});

export const deleteTeam = createAsyncThunk("teams/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await teamService.deleteTeam(id);
    toast.success(i18n.t("teamDeletedSuccess"));
    return response.data.deletedId;
  } catch (error) {
    toast.error(error.response?.data?.message || i18n.t("teamDeleteFailed"));
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
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        const index = state.teams.findIndex((team) => team._id === action.payload._id);
        if (index !== -1) state.teams[index] = action.payload;
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.teams = state.teams.filter((team) => team._id !== action.payload);
      });
  },
});

export default teamSlice.reducer;
