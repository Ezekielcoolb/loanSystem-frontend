import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { clearCsoAuth, getStoredCsoAuth } from "../../utils/csoAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const initialState = {
  loans: [],
  loading: false,
  submitting: false,
  error: null,
  detail: null,
  detailLoading: false,
  detailError: null,
  paymentSubmitting: false,
  paymentError: null,
  customerLoans: [],
  customerLoansLoading: false,
  customerLoansError: null,
  customerLoansBvn: null,
  scheduleSyncing: false,
  scheduleSyncError: null,
  collectionDate: null,
  collectionRecords: [],
  collectionSummary: {
    totalCustomers: 0,
    totalPaidToday: 0,
    totalDue: 0,
    defaultingCount: 0,
  },
  collectionLoading: false,
  collectionError: null,
  formCollectionRecords: [],
  formCollectionSummary: {
    totalCustomers: 0,
    totalFormAmount: 0,
  },
  formCollectionLoading: false,
  formCollectionError: null,
};

const extractErrorMessage = (error, fallback) => {
  return error.response?.data?.message || error.message || fallback;
};

export const fetchCsoLoans = createAsyncThunk(
  "loan/fetchCsoLoans",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.csoAuth?.token || getStoredCsoAuth().token;

    if (!token) {
      return rejectWithValue("Unauthorized");
    }

    try {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      const response = await axios.get(`${API_BASE_URL}/api/loans/me`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        clearCsoAuth();
        delete axios.defaults.headers.common.Authorization;
        return rejectWithValue("Unauthorized");
      }

      return rejectWithValue(extractErrorMessage(error, "Unable to fetch loans"));
    }
  }
);

export const syncLoanRepaymentSchedule = createAsyncThunk(
  "loan/syncRepaymentSchedule",
  async (loanId, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.csoAuth?.token || getStoredCsoAuth().token;

    if (!token) {
      return rejectWithValue("Unauthorized");
    }

    try {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      const response = await axios.get(`${API_BASE_URL}/api/loans/${loanId}/repayment/sync`);
      return { loanId, ...response.data };
    } catch (error) {
      if (error.response?.status === 401) {
        clearCsoAuth();
        delete axios.defaults.headers.common.Authorization;
        return rejectWithValue("Unauthorized");
      }

      return rejectWithValue(extractErrorMessage(error, "Unable to synchronize repayment schedule"));
    }
  }
);

export const fetchLoansByCustomerBvn = createAsyncThunk(
  "loan/fetchLoansByCustomerBvn",
  async (bvn, { getState, rejectWithValue }) => {
    const trimmedBvn = typeof bvn === "string" ? bvn.trim() : "";

    if (!trimmedBvn) {
      return rejectWithValue("Customer BVN is required");
    }

    const state = getState();
    const token = state.csoAuth?.token || getStoredCsoAuth().token;

    if (!token) {
      return rejectWithValue("Unauthorized");
    }

    try {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      const response = await axios.get(`${API_BASE_URL}/api/loans/customer/${trimmedBvn}`);
      return { bvn: trimmedBvn, loans: response.data };
    } catch (error) {
      if (error.response?.status === 401) {
        clearCsoAuth();
        delete axios.defaults.headers.common.Authorization;
        return rejectWithValue("Unauthorized");
      }

      return rejectWithValue(extractErrorMessage(error, "Unable to fetch customer loans"));
    }
  }
);

export const recordLoanPayment = createAsyncThunk(
  "loan/recordPayment",
  async ({ loanId, amount, date }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.csoAuth?.token || getStoredCsoAuth().token;

    if (!token) {
      return rejectWithValue("Unauthorized");
    }

    try {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      const response = await axios.post(`${API_BASE_URL}/api/loans/${loanId}/payments`, {
        amount,
        date,
      });
      return { loanId, ...response.data };
    } catch (error) {
      if (error.response?.status === 401) {
        clearCsoAuth();
        delete axios.defaults.headers.common.Authorization;
        return rejectWithValue("Unauthorized");
      }

      return rejectWithValue(extractErrorMessage(error, "Unable to record payment"));
    }
  }
);

export const submitLoan = createAsyncThunk(
  "loan/submitLoan",
  async (loanData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.csoAuth?.token || getStoredCsoAuth().token;

    if (!token) {
      return rejectWithValue("Unauthorized");
    }

    try {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      const response = await axios.post(`${API_BASE_URL}/api/loans`, loanData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        clearCsoAuth();
        delete axios.defaults.headers.common.Authorization;
        return rejectWithValue("Unauthorized");
      }

      return rejectWithValue(extractErrorMessage(error, "Unable to submit loan"));
    }
  }
);

export const fetchCsoLoanById = createAsyncThunk(
  "loan/fetchById",
  async (loanId, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.csoAuth?.token || getStoredCsoAuth().token;

    if (!token) {
      return rejectWithValue("Unauthorized");
    }

    try {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      const response = await axios.get(`${API_BASE_URL}/api/loans/${loanId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        clearCsoAuth();
        delete axios.defaults.headers.common.Authorization;
        return rejectWithValue("Unauthorized");
      }

      return rejectWithValue(extractErrorMessage(error, "Unable to load loan details"));
    }
  }
);

export const fetchCsoCollection = createAsyncThunk(
  "loan/fetchCsoCollection",
  async (date, { getState, rejectWithValue }) => {
    const targetDate = typeof date === "string" && date.trim().length > 0
      ? date.trim()
      : new Date().toISOString().slice(0, 10);

    const state = getState();
    const token = state.csoAuth?.token || getStoredCsoAuth().token;

    if (!token) {
      return rejectWithValue("Unauthorized");
    }

    try {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      const response = await axios.get(`${API_BASE_URL}/api/csos/collection`, {
        params: { date: targetDate },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        clearCsoAuth();
        delete axios.defaults.headers.common.Authorization;
        return rejectWithValue("Unauthorized");
      }

      return rejectWithValue(extractErrorMessage(error, "Unable to fetch collection"));
    }
  }
);

export const fetchCsoFormCollection = createAsyncThunk(
  "loan/fetchCsoFormCollection",
  async (date, { getState, rejectWithValue }) => {
    const targetDate = typeof date === "string" && date.trim().length > 0
      ? date.trim()
      : new Date().toISOString().slice(0, 10);

    const state = getState();
    const token = state.csoAuth?.token || getStoredCsoAuth().token;

    if (!token) {
      return rejectWithValue("Unauthorized");
    }

    try {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      const response = await axios.get(`${API_BASE_URL}/api/csos/form-collection`, {
        params: { date: targetDate },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        clearCsoAuth();
        delete axios.defaults.headers.common.Authorization;
        return rejectWithValue("Unauthorized");
      }

      return rejectWithValue(extractErrorMessage(error, "Unable to fetch form collection"));
    }
  }
);

const loanSlice = createSlice({
  name: "loan",
  initialState,
  reducers: {
    clearLoanError(state) {
      state.error = null;
      state.detailError = null;
      state.paymentError = null;
      state.customerLoansError = null;
      state.scheduleSyncError = null;
      state.collectionError = null;
      state.formCollectionError = null;
    },
    resetLoanDetail(state) {
      state.detail = null;
      state.detailLoading = false;
      state.detailError = null;
    },
    resetCustomerLoans(state) {
      state.customerLoans = [];
      state.customerLoansLoading = false;
      state.customerLoansError = null;
      state.customerLoansBvn = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCsoLoans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCsoLoans.fulfilled, (state, action) => {
        state.loading = false;
        state.loans = action.payload;
      })
      .addCase(fetchCsoLoans.rejected, (state, action) => {
        state.loading = false;
        if (action.payload === "Unauthorized") {
          state.loans = [];
        }
        state.error = action.payload || "Unable to fetch loans";
      })
      .addCase(submitLoan.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitLoan.fulfilled, (state, action) => {
        state.submitting = false;
        state.loans = [action.payload, ...state.loans];
      })
      .addCase(submitLoan.rejected, (state, action) => {
        state.submitting = false;
        if (action.payload === "Unauthorized") {
          state.loans = [];
        }
        state.error = action.payload || "Unable to submit loan";
      })
      .addCase(fetchCsoLoanById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchCsoLoanById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchCsoLoanById.rejected, (state, action) => {
        state.detailLoading = false;
        if (action.payload === "Unauthorized") {
          state.detail = null;
        }
        state.detailError = action.payload || "Unable to load loan details";
      })
      .addCase(recordLoanPayment.pending, (state) => {
        state.paymentSubmitting = true;
        state.paymentError = null;
      })
      .addCase(recordLoanPayment.fulfilled, (state, action) => {
        state.paymentSubmitting = false;
        const { amountPaidSoFar, dailyPayment } = action.payload || {};

        if (state.detail) {
          state.detail = {
            ...state.detail,
            loanDetails: {
              ...state.detail.loanDetails,
              amountPaidSoFar,
              dailyPayment,
            },
          };
        }
      })
      .addCase(recordLoanPayment.rejected, (state, action) => {
        state.paymentSubmitting = false;
        if (action.payload === "Unauthorized") {
          state.detail = null;
        }
        state.paymentError = action.payload || "Unable to record payment";
      })
      .addCase(syncLoanRepaymentSchedule.pending, (state) => {
        state.scheduleSyncing = true;
        state.scheduleSyncError = null;
      })
      .addCase(syncLoanRepaymentSchedule.fulfilled, (state, action) => {
        state.scheduleSyncing = false;
        const { loanId, repaymentSchedule, amountPaidSoFar } = action.payload || {};

        if (!repaymentSchedule || !Array.isArray(repaymentSchedule)) {
          return;
        }

        if (state.detail && (state.detail._id === loanId || state.detail.loanId === loanId)) {
          state.detail = {
            ...state.detail,
            repaymentSchedule,
            loanDetails: {
              ...state.detail.loanDetails,
              amountPaidSoFar: amountPaidSoFar ?? state.detail.loanDetails?.amountPaidSoFar,
            },
          };
        }
      })
      .addCase(syncLoanRepaymentSchedule.rejected, (state, action) => {
        state.scheduleSyncing = false;
        if (action.payload === "Unauthorized") {
          state.detail = null;
        }
        state.scheduleSyncError = action.payload || "Unable to synchronize repayment schedule";
      })
      .addCase(fetchLoansByCustomerBvn.pending, (state) => {
        state.customerLoansLoading = true;
        state.customerLoansError = null;
      })
      .addCase(fetchLoansByCustomerBvn.fulfilled, (state, action) => {
        state.customerLoansLoading = false;
        state.customerLoans = action.payload.loans;
        state.customerLoansBvn = action.payload.bvn;
      })
      .addCase(fetchLoansByCustomerBvn.rejected, (state, action) => {
        state.customerLoansLoading = false;
        if (action.payload === "Unauthorized") {
          state.customerLoans = [];
          state.customerLoansBvn = null;
        }
        state.customerLoansError = action.payload || "Unable to fetch customer loans";
      })
      .addCase(fetchCsoCollection.pending, (state) => {
        state.collectionLoading = true;
        state.collectionError = null;
      })
      .addCase(fetchCsoCollection.fulfilled, (state, action) => {
        state.collectionLoading = false;
        state.collectionDate = action.payload?.date || null;
        state.collectionRecords = action.payload?.records || [];
        state.collectionSummary = action.payload?.summary || {
          totalCustomers: 0,
          totalPaidToday: 0,
          totalDue: 0,
          defaultingCount: 0,
        };
      })
      .addCase(fetchCsoCollection.rejected, (state, action) => {
        state.collectionLoading = false;
        if (action.payload === "Unauthorized") {
          state.collectionRecords = [];
          state.collectionSummary = {
            totalCustomers: 0,
            totalPaidToday: 0,
            totalDue: 0,
            defaultingCount: 0,
          };
          state.collectionDate = null;
        }
        state.collectionError = action.payload || "Unable to fetch collection";
      })
      .addCase(fetchCsoFormCollection.pending, (state) => {
        state.formCollectionLoading = true;
        state.formCollectionError = null;
      })
      .addCase(fetchCsoFormCollection.fulfilled, (state, action) => {
        state.formCollectionLoading = false;
        state.formCollectionRecords = action.payload?.records || [];
        state.formCollectionSummary = action.payload?.summary || {
          totalCustomers: 0,
          totalFormAmount: 0,
        };
      })
      .addCase(fetchCsoFormCollection.rejected, (state, action) => {
        state.formCollectionLoading = false;
        if (action.payload === "Unauthorized") {
          state.formCollectionRecords = [];
          state.formCollectionSummary = {
            totalCustomers: 0,
            totalFormAmount: 0,
          };
        }
        state.formCollectionError = action.payload || "Unable to fetch form collection";
      });
  },
});

export const { clearLoanError, resetLoanDetail, resetCustomerLoans } = loanSlice.actions;
export default loanSlice.reducer;
