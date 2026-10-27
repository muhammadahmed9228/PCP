import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../services/auth.service";
import { toast } from "react-toastify";

const readStoredAuth = () => {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(window.localStorage.getItem("pcp-auth") || "null"); } catch { return null; }
};

const storedAuth = readStoredAuth();

const persistAuth = (state) => {
  if (typeof window !== "undefined") window.localStorage.setItem("pcp-auth", JSON.stringify({ user: state.user, accessToken: state.accessToken }));
};

// RTK Async Thunk for asynchronous operations where required[cite: 1]
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.loginUCI(credentials);
      toast.success(response.message || "Logged in successfully");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const role = state.auth.user?.role || "UCI"; // Default to UCI if missing

      await authService.logout(role);
      toast.success("Logged out successfully");
      return null;
    } catch (error) {
      const message = error.response?.data?.message || "Logout failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Export a new thunk for AIC login alongside the existing loginUser thunk
export const loginAicUser = createAsyncThunk(
  "auth/loginAicUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.loginAIC(credentials);
      toast.success(response.message || "AIC Logged in successfully");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const loginTeamUser = createAsyncThunk(
  "auth/loginTeamUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.loginTeam(credentials);
      toast.success("Field Team logged in");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
// Make sure to add .addCase(loginTeamUser.fulfilled, ...) to extraReducers exactly like the others.
const initialState = {
  user: storedAuth?.user || null,
  accessToken: storedAuth?.accessToken || null,
  isAuthenticated: Boolean(storedAuth?.user),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    // Separate UI state from persistent state[cite: 1]
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        persistAuth(state);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        if (typeof window !== "undefined") window.localStorage.removeItem("pcp-auth");
      })
      .addCase(loginAicUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAicUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        persistAuth(state);
      })
      .addCase(loginAicUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginTeamUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginTeamUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        persistAuth(state);
      })
      .addCase(loginTeamUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })



  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
