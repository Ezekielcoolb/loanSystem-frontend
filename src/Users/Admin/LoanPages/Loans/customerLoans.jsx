import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerLoanWeekly, clearAdminLoanErrors } from "../../../../redux/slices/adminLoanSlice";
import { fetchCsos } from "../../../../redux/slices/csoSlice";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Calendar, Search, Filter } from "lucide-react";
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

// Get Monday of the week containing the given date
const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function CustomerLoans() {
  const dispatch = useDispatch();
  
  const {
    customerLoans,
    customerLoansPagination,
    customerLoansWeek,
    customerLoansLoading,
    customerLoansError,
  } = useSelector((state) => state.adminLoans);
  
  const { items: csos } = useSelector((state) => state.cso);

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()).toISOString().slice(0, 10));
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

  // Fetch data when filters change
  useEffect(() => {
    dispatch(fetchCustomerLoanWeekly({
      weekStart,
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch,
      csoId: selectedCso
    }));
  }, [dispatch, weekStart, currentPage, itemsPerPage, debouncedSearch, selectedCso]);

  // Handle errors
  useEffect(() => {
    if (customerLoansError) {
      toast.error(customerLoansError);
      dispatch(clearAdminLoanErrors());
    }
  }, [customerLoansError, dispatch]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [weekStart, debouncedSearch, selectedCso]);



  const handlePrevWeek = () => {
    const current = new Date(weekStart);
    current.setDate(current.getDate() - 7);
    setWeekStart(current.toISOString().slice(0, 10));
  };

  const handleNextWeek = () => {
    const current = new Date(weekStart);
    const nextMonday = new Date(current);
    nextMonday.setDate(current.getDate() + 7);
    
    // Don't allow navigation beyond current week
    const today = getMonday(new Date());
    if (nextMonday > today) return;
    
    setWeekStart(nextMonday.toISOString().slice(0, 10));
  };

  const canGoNext = useMemo(() => {
    const current = new Date(weekStart);
    const nextMonday = new Date(current);
    nextMonday.setDate(current.getDate() + 7);
    const today = getMonday(new Date());
    return nextMonday <= today;
  }, [weekStart]);

  // Format week display
  const weekDisplay = useMemo(() => {
    if (!customerLoansWeek?.start) return "Loading...";
    const start = new Date(customerLoansWeek.start);
    const end = new Date(customerLoansWeek.end);
    return `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
  }, [customerLoansWeek]);

  // Get weekday headers with dates
  const weekDayHeaders = useMemo(() => {
    if (!customerLoansWeek?.days) return [];
    return customerLoansWeek.days.map(d => ({
      label: d.label,
      date: new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    }));
  }, [customerLoansWeek]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Loans</h1>
          <p className="text-sm text-slate-500">Weekly payment breakdown for all active loans</p>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevWeek}
            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>

          <div className="flex items-center gap-2 min-w-[200px] justify-center">
            <Calendar className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">{weekDisplay}</span>
          </div>

          <button
            onClick={handleNextWeek}
            disabled={!canGoNext}
            className={`rounded-lg border border-slate-200 p-2 ${canGoNext ? 'hover:bg-slate-50' : 'opacity-50 cursor-not-allowed'}`}
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </button>
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
      {customerLoansLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      )}

      {/* Error State */}
      {customerLoansError && !customerLoansLoading && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{customerLoansError}</p>
          </div>
        </div>
      )}

      {/* Data Table */}
      {!customerLoansLoading && !customerLoansError && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 whitespace-nowrap">Customer Name</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Disbursed</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">To Be Paid</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Amount Paid</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900 whitespace-nowrap">Start Date</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900 whitespace-nowrap">End Date</th>
                  {/* Weekday columns */}
                  {weekDayHeaders.map(header => (
                    <th key={header.label} className="px-3 py-3 text-center font-semibold text-slate-900 whitespace-nowrap bg-indigo-50">
                      <div className="text-xs">{header.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{header.date}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {customerLoans.length === 0 ? (
                  <tr>
                    <td colSpan={6 + weekDayHeaders.length} className="px-4 py-12 text-center text-slate-500">
                      No active loans found.
                    </td>
                  </tr>
                ) : (
                  customerLoans.map((loan) => (
                    <tr key={loan.loanId} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div>{loan.customerName || "—"}</div>
                        <div className="text-xs text-slate-400">{loan.loanId}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{formatCurrency(loan.amountDisbursed)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{formatCurrency(loan.amountToBePaid)}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-600">{formatCurrency(loan.amountPaid)}</td>
                      <td className="px-4 py-3 text-center text-xs text-slate-600">{formatDate(loan.startDate)}</td>
                      <td className="px-4 py-3 text-center text-xs text-slate-600">{formatDate(loan.expectedEndDate)}</td>
                      {/* Payment columns for each weekday */}
                      {["Mon", "Tue", "Wed", "Thu", "Fri"].map(day => (
                        <td key={day} className="px-3 py-3 text-center font-mono text-xs">
                          {loan.payments?.[day] > 0 ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                              {formatCurrency(loan.payments[day])}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {customerLoansPagination.totalPages > 0 && (
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, customerLoansPagination.total)} of {customerLoansPagination.total} results
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
                  Page {currentPage} of {customerLoansPagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(customerLoansPagination.totalPages, prev + 1))}
                  disabled={currentPage >= customerLoansPagination.totalPages}
                  className={`rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium ${
                    currentPage >= customerLoansPagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'
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
