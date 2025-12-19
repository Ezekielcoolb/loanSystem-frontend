import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import {
  clearAdminLoanErrors,
  fetchWaitingLoans,
} from "../../../redux/slices/adminLoanSlice";

const formatCurrency = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  try {
    return new Date(value).toLocaleString();
  } catch (_error) {
    return value;
  }
};

export default function NewLoan() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    waitingLoans,
    waitingLoansLoading,
    waitingLoansError,
  } = useSelector((state) => state.adminLoans);

  useEffect(() => {
    dispatch(fetchWaitingLoans());
  }, [dispatch]);

  useEffect(() => {
    if (waitingLoansError) {
      toast.error(waitingLoansError);
      dispatch(clearAdminLoanErrors());
    }
  }, [waitingLoansError, dispatch]);

  const handleViewDetails = (loanId) => {
    navigate(`/admin/loans/${loanId}`);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Loan applications</h1>
            <p className="text-sm text-slate-500">
              Review customer submissions that are waiting for approval.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Waiting for approval</h2>
            <p className="text-sm text-slate-500">
              {waitingLoans.length} loan(s) pending an approval decision.
            </p>
          </div>

          <button
            type="button"
            onClick={() => dispatch(fetchWaitingLoans())}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            disabled={waitingLoansLoading}
          >
            {waitingLoansLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Refresh
          </button>
        </header>

        {waitingLoansLoading ? (
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            Fetching loan applications...
          </div>
        ) : waitingLoans.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No loan applications are awaiting approval.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Loan ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Loan type</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Amount requested</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Submitted</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {waitingLoans.map((loan) => {
                  const customer = loan?.customerDetails || {};
                  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Unknown";
                  return (
                    <tr key={loan._id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-800">{loan.loanId || loan._id}</td>
                      <td className="px-4 py-3 text-slate-700">{fullName}</td>
                      <td className="px-4 py-3 capitalize text-slate-700">{loan?.loanDetails?.loanType || "—"}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatCurrency(loan?.loanDetails?.amountRequested)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(loan?.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(loan._id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
