import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOverdueLoans, clearAdminLoanErrors } from "../../../../redux/slices/adminLoanSlice";
import { fetchCsos } from "../../../../redux/slices/csoSlice";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";

const formatCurrency = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "₦0.00";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function OverdueLoans() {
  const dispatch = useDispatch();
  
  const {
    overdueLoans,
    overdueLoansPagination,
    overdueLoansLoading,
    overdueLoansError,
  } = useSelector((state) => state.adminLoans);
  
  const { items: csos } = useSelector((state) => state.cso);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCso, setSelectedCso] = useState("");

  // Fetch CSOs on mount
  useEffect(() => {
    if (csos.length === 0) {
      dispatch(fetchCsos());
    }
  }, [dispatch, csos.length]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data when filters/page change
  useEffect(() => {
    dispatch(fetchOverdueLoans({
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch,
      csoId: selectedCso
    }));
  }, [dispatch, currentPage, itemsPerPage, debouncedSearch, selectedCso]);

  // Handle errors
  useEffect(() => {
    if (overdueLoansError) {
      toast.error(overdueLoansError);
      dispatch(clearAdminLoanErrors());
    }
  }, [overdueLoansError, dispatch]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCso]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Overdue Loans</h1>
          <p className="text-sm text-slate-500">Loans exceeding 30 days outstanding duration</p>
        </div>
      </header>

      {/* Search and Filter Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* CSO Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedCso}
            onChange={(e) => setSelectedCso(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none min-w-[180px]"
          >
            <option value="">All CSOs</option>
            {csos.map((cso) => (
              <option key={cso._id} value={cso._id}>
                {cso.firstName} {cso.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {overdueLoansLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      )}

      {/* Error State */}
      {overdueLoansError && !overdueLoansLoading && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{overdueLoansError}</p>
          </div>
        </div>
      )}

      {/* Data Table */}
      {!overdueLoansLoading && !overdueLoansError && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 whitespace-nowrap">Customer Name</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Disbursed Amount</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">To Be Paid</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Paid So Far</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Loan Balance</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900 whitespace-nowrap">Overdue Days</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900 whitespace-nowrap">Disbursed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {overdueLoans.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-slate-500">
                      No overdue loans found.
                    </td>
                  </tr>
                ) : (
                  overdueLoans.map((loan) => (
                    <tr key={loan.loanId} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div>{loan.customerName || "—"}</div>
                        <div className="text-xs text-slate-400">{loan.loanId}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{formatCurrency(loan.amountDisbursed)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{formatCurrency(loan.amountToBePaid)}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-600">{formatCurrency(loan.amountPaid)}</td>
                      <td className="px-4 py-3 text-right font-mono text-rose-600 font-medium">{formatCurrency(loan.loanBalance)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-800">
                          {loan.overDueCount} days
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-slate-600">{formatDate(loan.disbursedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {overdueLoansPagination.totalPages > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value, 10));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-slate-500">per page</span>
              </div>

              <div className="text-sm text-slate-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, overdueLoansPagination.total)} of {overdueLoansPagination.total} results
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'
                  }`}
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {currentPage} of {overdueLoansPagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(overdueLoansPagination.totalPages, prev + 1))}
                  disabled={currentPage >= overdueLoansPagination.totalPages}
                  className={`rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium ${
                    currentPage >= overdueLoansPagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
