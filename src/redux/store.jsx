import { configureStore } from "@reduxjs/toolkit";
import branchReducer from "./slices/branchSlice";
import csoReducer from "./slices/csoSlice";
import csoAuthReducer from "./slices/csoAuthSlice";
import uploadReducer from "./slices/uploadSlice";
import loanReducer from "./slices/loanSlice";
import adminLoanReducer from "./slices/adminLoanSlice";

const store = configureStore({
  reducer: {
    branch: branchReducer,
    cso: csoReducer,
    csoAuth: csoAuthReducer,
    upload: uploadReducer,
    loan: loanReducer,
    adminLoans: adminLoanReducer,
  },
});

export default store;
