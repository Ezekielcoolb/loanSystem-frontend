import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getStoredCsoAuth } from "../../utils/csoAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const extractErrorMessage = (error, fallback) => {
  return error.response?.data?.message || error.message || fallback;
};

export const fetchCsos = createAsyncThunk("cso/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/csos`);
    return response.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Failed to load CSOs"));
  }
});

export const createCso = createAsyncThunk("cso/create", async (payload, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/csos`, payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Failed to create CSO"));
  }
});

export const fetchCsoById = createAsyncThunk("cso/fetchById", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/csos/${id}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Failed to load CSO details"));
  }
});

export const updateCso = createAsyncThunk(
  "cso/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/csos/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to update CSO"));
    }
  }
);

export const changeCsoStatus = createAsyncThunk(
  "cso/changeStatus",
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/csos/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to update CSO status"));
    }
  }
);

export const fetchCsoProfile = createAsyncThunk("cso/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const { token } = getStoredCsoAuth();
    const response = await axios.get(`${API_BASE_URL}/api/csos/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Failed to load CSO profile"));
  }
});

export const postCsoRemittance = createAsyncThunk(
  "cso/postRemittance",
  async (payload, { rejectWithValue }) => {
    try {
      const { token } = getStoredCsoAuth();
      const response = await axios.post(`${API_BASE_URL}/api/csos/remittance`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to post remittance"));
    }
  }
);

export const resolveCsoRemittance = createAsyncThunk(
  "cso/resolveRemittance",
  async ({ id, date, resolvedIssue }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/csos/${id}/resolve-remittance`, {
        date,
        resolvedIssue,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to resolve remittance"));
    }
  }
);

const csoSlice = createSlice({
  name: "cso",
  initialState: {
    items: [],
    selected: null,
    profile: null,
    listLoading: false,
    detailLoading: false,
    profileLoading: false,
    remittanceLoading: false,
    saving: false,
    error: null,
    remittanceSuccess: false,
  },
  reducers: {
    clearCsoError(state) {
      state.error = null;
    },
    resetRemittanceSuccess(state) {
      state.remittanceSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCsos.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchCsos.fulfilled, (state, action) => {
        state.listLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchCsos.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload || "Failed to load CSOs";
      })
      .addCase(createCso.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createCso.fulfilled, (state, action) => {
        state.saving = false;
        state.items.unshift(action.payload);
      })
      .addCase(createCso.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to create CSO";
      })
      .addCase(fetchCsoById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchCsoById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchCsoById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || "Failed to load CSO details";
      })
      .addCase(updateCso.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateCso.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.map((cso) => (cso._id === action.payload._id ? action.payload : cso));
        state.selected = action.payload;
      })
      .addCase(updateCso.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to update CSO";
      })
      .addCase(changeCsoStatus.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(changeCsoStatus.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.map((cso) => (cso._id === action.payload._id ? action.payload : cso));
        if (state.selected?._id === action.payload._id) {
          state.selected = action.payload;
        }
      })
      .addCase(changeCsoStatus.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to update CSO status";
      })
      .addCase(fetchCsoProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(fetchCsoProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchCsoProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload || "Failed to load profile";
      })
      .addCase(postCsoRemittance.pending, (state) => {
        state.remittanceLoading = true;
        state.error = null;
        state.remittanceSuccess = false;
      })
      .addCase(postCsoRemittance.fulfilled, (state, action) => {
        state.remittanceLoading = false;
        state.remittanceSuccess = true;
        // Update profile remittance list locally
        if (state.profile) {
            // We can either refetch or update manually. 
            // The API returns { message, remittance: [] }
            // Let's update the profile's remittance array
            state.profile.remittance = action.payload.remittance;
        }
      })
      .addCase(postCsoRemittance.rejected, (state, action) => {
        state.remittanceLoading = false;
        state.error = action.payload || "Failed to post remittance";
      });
  },
});

export const { clearCsoError, resetRemittanceSuccess } = csoSlice.actions;

export default csoSlice.reducer;
