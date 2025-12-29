import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const extractErrorMessage = (error, fallback) => {
  return error.response?.data?.message || error.message || fallback;
};

export const fetchWaitingLoans = createAsyncThunk(
  "adminLoans/fetchWaiting",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/loans/waiting`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to load waiting loans"));
    }
  }
);

export const fetchApprovedLoans = createAsyncThunk(
  "adminLoans/fetchApproved",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/loans/approved`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to load approved loans"));
    }
  }
);

export const fetchLoanById = createAsyncThunk(
  "adminLoans/fetchById",
  async (loanId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/loans/${loanId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to load loan details"));
    }
  }
);

export const approveLoan = createAsyncThunk(
  "adminLoans/approve",
  async ({ loanId, amountApproved }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/loans/${loanId}/approve`, {
        amountApproved,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to approve loan"));
    }
  }
);

export const rejectLoan = createAsyncThunk(
  "adminLoans/reject",
  async ({ loanId, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/loans/${loanId}/reject`, {
        reason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to reject loan"));
    }
  }
);

export const disburseLoan = createAsyncThunk(
  "adminLoans/disburse",
  async ({ loanId, disbursementPicture }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/loans/${loanId}/disburse`, {
        disbursementPicture,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to disburse loan"));
    }
  }
);

const initialState = {
  waitingLoans: [],
  waitingLoansLoading: false,
  waitingLoansError: null,
  approvedLoans: [],
  approvedLoansLoading: false,
  approvedLoansError: null,
  detail: null,
  detailLoading: false,
  detailError: null,
  updating: false,
  updateError: null,
  csoLoans: [],
  csoLoansLoading: false,
  csoLoansError: null,
  // CSO Loan Metrics state
  csoMetrics: [],
  csoMetricsPagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  csoMetricsMonth: new Date().getMonth() + 1,
  csoMetricsYear: new Date().getFullYear(),
  csoMetricsLoading: false,
  csoMetricsError: null,
  // Customer Loan Weekly state
  customerLoans: [],
  customerLoansPagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  customerLoansWeek: { start: null, end: null, days: [] },
  customerLoansLoading: false,
  customerLoansError: null,
  // Overdue Loans state
  overdueLoans: [],
  overdueLoansPagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  overdueLoansLoading: false,
  overdueLoansError: null,
  // Customer Summary state
  customerSummary: [],
  customerSummaryPagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  customerSummaryLoading: false,
  customerSummaryError: null,
  customerLoanHistory: [],
  customerLoanHistoryLoading: false,
  customerLoanHistoryError: null,
  customerLoanHistoryCustomer: null,
  customerDetailsRecord: null,
  customerDetailsLoading: false,
  customerDetailsError: null,
  groupLeaders: [],
  groupLeadersLoading: false,
  groupLeadersError: null,
};

export const fetchLoansByCsoId = createAsyncThunk(
  "adminLoans/fetchByCsoId",
  async (csoId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/loans/cso/${csoId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to load CSO loans"));
    }
  }
);

export const fetchCsoLoanMetrics = createAsyncThunk(
  "adminLoans/fetchCsoLoanMetrics",
  async ({ month, year, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cso-loan-metrics`, {
        params: { month, year, page, limit }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to load CSO loan metrics"));
    }
  }
);

export const fetchCustomerLoanWeekly = createAsyncThunk(
  "adminLoans/fetchCustomerLoanWeekly",
  async ({ weekStart, page = 1, limit = 20, search = "", csoId = "" }, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (weekStart) params.weekStart = weekStart;
      if (search) params.search = search;
      if (csoId) params.csoId = csoId;
      const response = await axios.get(`${API_BASE_URL}/api/customer-loan-weekly`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to load customer loans"));
    }
  }
);

export const fetchOverdueLoans = createAsyncThunk(
  "adminLoans/fetchOverdueLoans",
  async ({ page = 1, limit = 20, search = "", csoId = "" }, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (csoId) params.csoId = csoId;
      const response = await axios.get(`${API_BASE_URL}/api/overdue-loans`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to load overdue loans"));
    }
  }
);


export const fetchCustomerSummary = createAsyncThunk(
  "adminLoans/fetchCustomerSummary",
  async ({ page = 1, limit = 10, search = "" }, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      const response = await axios.get(`${API_BASE_URL}/api/admin/customers`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to load customer summary"));
    }
  }
);

export const fetchCustomerLoansByBvn = createAsyncThunk(
  "adminLoans/fetchCustomerLoansByBvn",
  async (bvn, { rejectWithValue }) => {
    const trimmedBvn = typeof bvn === "string" ? bvn.trim() : "";

    if (!trimmedBvn) {
      return rejectWithValue("Customer BVN is required");
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/customers/${trimmedBvn}/loans`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to load customer loans"));
    }
  }
);

export const fetchCustomerDetailsByBvn = createAsyncThunk(
  "adminLoans/fetchCustomerDetailsByBvn",
  async (bvn, { rejectWithValue }) => {
    const trimmedBvn = typeof bvn === "string" ? bvn.trim() : "";

    if (!trimmedBvn) {
      return rejectWithValue("Customer BVN is required");
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/customers/${trimmedBvn}/details`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to load customer details"));
    }
  }
);

export const fetchCsoCustomers = createAsyncThunk(
  "adminLoans/fetchCsoCustomers",
  async ({ csoId, search, groupId }, { rejectWithValue }) => {
    try {
      const params = {};
      if (search) params.search = search;
      if (groupId) params.groupId = groupId;
      
      const response = await axios.get(`${API_BASE_URL}/api/loans/cso/${csoId}/customers`, {
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to load CSO customers"));
    }
  }
);

export const fetchCsoGroupLeaders = createAsyncThunk(
  "adminLoans/fetchCsoGroupLeaders",
  async (csoId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/csos/${csoId}/group-leaders`);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to load group leaders"));
    }
  }
);

export const assignCustomersToGroup = createAsyncThunk(
  "adminLoans/assignCustomersToGroup",
  async ({ loanIds, groupLeaderId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/loans/assign-group`, {
        loanIds,
        groupLeaderId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to assign customers to group"));
    }
  }
);

const adminLoanSlice = createSlice({
  name: "adminLoans",
  initialState,
  reducers: {
    clearAdminLoanErrors(state) {
      state.waitingLoansError = null;
      state.approvedLoansError = null;
      state.detailError = null;
      state.updateError = null;
      state.csoLoansError = null;
      state.csoMetricsError = null;
      state.customerLoansError = null;
      state.overdueLoansError = null;
      state.customerSummaryError = null;
      state.customerLoanHistoryError = null;
      state.customerDetailsError = null;
    },
    resetLoanDetail(state) {
      state.detail = null;
      state.detailLoading = false;
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWaitingLoans.pending, (state) => {
        state.waitingLoansLoading = true;
        state.waitingLoansError = null;
      })
      .addCase(fetchWaitingLoans.fulfilled, (state, action) => {
        state.waitingLoansLoading = false;
        state.waitingLoans = action.payload;
      })
      .addCase(fetchWaitingLoans.rejected, (state, action) => {
        state.waitingLoansLoading = false;
        state.waitingLoansError = action.payload || "Unable to load waiting loans";
      })
      .addCase(fetchApprovedLoans.pending, (state) => {
        state.approvedLoansLoading = true;
        state.approvedLoansError = null;
      })
      .addCase(fetchApprovedLoans.fulfilled, (state, action) => {
        state.approvedLoansLoading = false;
        state.approvedLoans = action.payload;
      })
      .addCase(fetchApprovedLoans.rejected, (state, action) => {
        state.approvedLoansLoading = false;
        state.approvedLoansError = action.payload || "Unable to load approved loans";
      })
      .addCase(fetchLoanById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchLoanById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchLoanById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || "Unable to load loan details";
      })
      .addCase(approveLoan.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(approveLoan.fulfilled, (state, action) => {
        state.updating = false;
        state.detail = action.payload;
        state.waitingLoans = state.waitingLoans.filter((loan) => loan._id !== action.payload._id);
      })
      .addCase(approveLoan.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || "Unable to approve loan";
      })
      .addCase(rejectLoan.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(rejectLoan.fulfilled, (state, action) => {
        state.updating = false;
        state.detail = action.payload;
        state.waitingLoans = state.waitingLoans.filter((loan) => loan._id !== action.payload._id);
      })
      .addCase(rejectLoan.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || "Unable to reject loan";
      })
      .addCase(disburseLoan.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(disburseLoan.fulfilled, (state, action) => {
        state.updating = false;
        state.approvedLoans = state.approvedLoans.filter((loan) => loan._id !== action.payload._id);
      })
      .addCase(disburseLoan.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || "Unable to disburse loan";
      })
      .addCase(fetchLoansByCsoId.pending, (state) => {
        state.csoLoansLoading = true;
        state.csoLoansError = null;
      })
      .addCase(fetchLoansByCsoId.fulfilled, (state, action) => {
        state.csoLoansLoading = false;
        state.csoLoans = action.payload;
      })
      .addCase(fetchLoansByCsoId.rejected, (state, action) => {
        state.csoLoansLoading = false;
        state.csoLoansError = action.payload || "Unable to load CSO loans";
      })
      .addCase(fetchCsoLoanMetrics.pending, (state) => {
        state.csoMetricsLoading = true;
        state.csoMetricsError = null;
      })
      .addCase(fetchCsoLoanMetrics.fulfilled, (state, action) => {
        state.csoMetricsLoading = false;
        state.csoMetrics = action.payload.data;
        state.csoMetricsPagination = action.payload.pagination;
        state.csoMetricsMonth = action.payload.month;
        state.csoMetricsYear = action.payload.year;
      })
      .addCase(fetchCsoLoanMetrics.rejected, (state, action) => {
        state.csoMetricsLoading = false;
        state.csoMetricsError = action.payload || "Unable to load CSO loan metrics";
      })
      .addCase(fetchCustomerLoanWeekly.pending, (state) => {
        state.customerLoansLoading = true;
        state.customerLoansError = null;
      })
      .addCase(fetchCustomerLoanWeekly.fulfilled, (state, action) => {
        state.customerLoansLoading = false;
        state.customerLoans = action.payload.data;
        state.customerLoansPagination = action.payload.pagination;
        state.customerLoansWeek = action.payload.week;
      })
      .addCase(fetchCustomerLoanWeekly.rejected, (state, action) => {
        state.customerLoansLoading = false;
        state.customerLoansError = action.payload || "Unable to load customer loans";
      })
      .addCase(fetchOverdueLoans.pending, (state) => {
        state.overdueLoansLoading = true;
        state.overdueLoansError = null;
      })
      .addCase(fetchOverdueLoans.fulfilled, (state, action) => {
        state.overdueLoansLoading = false;
        state.overdueLoans = action.payload.data;
        state.overdueLoansPagination = action.payload.pagination;
      })
      .addCase(fetchOverdueLoans.rejected, (state, action) => {
        state.overdueLoansLoading = false;
        state.overdueLoansError = action.payload || "Unable to load overdue loans";
      })
      .addCase(fetchCustomerSummary.pending, (state) => {
        state.customerSummaryLoading = true;
        state.customerSummaryError = null;
      })
      .addCase(fetchCustomerSummary.fulfilled, (state, action) => {
        state.customerSummaryLoading = false;
        state.customerSummary = action.payload.customers;
        state.customerSummaryPagination = action.payload.pagination;
      })
      .addCase(fetchCustomerSummary.rejected, (state, action) => {
        state.customerSummaryLoading = false;
        state.customerSummaryError = action.payload || "Unable to load customer summary";
      })
      .addCase(fetchCustomerLoansByBvn.pending, (state) => {
        state.customerLoanHistoryLoading = true;
        state.customerLoanHistoryError = null;
        state.customerLoanHistory = [];
        state.customerLoanHistoryCustomer = null;
      })
      .addCase(fetchCustomerLoansByBvn.fulfilled, (state, action) => {
        state.customerLoanHistoryLoading = false;
        state.customerLoanHistory = action.payload.loans || [];
        state.customerLoanHistoryCustomer = {
          bvn: action.payload.bvn,
          name: action.payload.customerName || "",
        };
      })
      .addCase(fetchCustomerLoansByBvn.rejected, (state, action) => {
        state.customerLoanHistoryLoading = false;
        state.customerLoanHistoryError = action.payload || "Unable to load customer loans";
      })
      .addCase(fetchCustomerDetailsByBvn.pending, (state) => {
        state.customerDetailsLoading = true;
        state.customerDetailsError = null;
        state.customerDetailsRecord = null;
      })
      .addCase(fetchCustomerDetailsByBvn.fulfilled, (state, action) => {
        state.customerDetailsLoading = false;
        state.customerDetailsRecord = action.payload || null;
      })
      .addCase(fetchCustomerDetailsByBvn.rejected, (state, action) => {
        state.customerDetailsLoading = false;
        state.customerDetailsError = action.payload || "Unable to load customer details";
      })
      .addCase(fetchCsoCustomers.pending, (state) => {
        state.csoLoansLoading = true;
        state.csoLoansError = null;
      })
      .addCase(fetchCsoCustomers.fulfilled, (state, action) => {
        state.csoLoansLoading = false;
        state.csoLoans = action.payload;
      })
      .addCase(fetchCsoCustomers.rejected, (state, action) => {
        state.csoLoansLoading = false;
        state.csoLoansError = action.payload || "Unable to load CSO customers";
      })
      .addCase(fetchCsoGroupLeaders.pending, (state) => {
        state.groupLeadersLoading = true;
        state.groupLeadersError = null;
      })
      .addCase(fetchCsoGroupLeaders.fulfilled, (state, action) => {
        state.groupLeadersLoading = false;
        state.groupLeaders = action.payload;
      })
      .addCase(fetchCsoGroupLeaders.rejected, (state, action) => {
        state.groupLeadersLoading = false;
        state.groupLeadersError = action.payload || "Unable to load group leaders";
      })
      .addCase(assignCustomersToGroup.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(assignCustomersToGroup.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(assignCustomersToGroup.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || "Unable to assign customers to group";
      });
  },
});

export const { clearAdminLoanErrors, resetLoanDetail } = adminLoanSlice.actions;
export default adminLoanSlice.reducer;
