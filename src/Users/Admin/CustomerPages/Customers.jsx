import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerSummary, clearAdminLoanErrors } from "../../../redux/slices/adminLoanSlice";
import { Loader2, Search, AlertCircle, ChevronLeft, ChevronRight, User } from "lucide-react";
import ReactPaginate from "react-paginate";
import toast from "react-hot-toast";

const formatCurrency = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function Customers() {
  const dispatch = useDispatch();
  const {
    customerSummary,
    customerSummaryPagination,
    customerSummaryLoading,
    customerSummaryError,
  } = useSelector((state) => state.adminLoans);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchData = useCallback(
    (page = 1) => {
      dispatch(fetchCustomerSummary({ page, limit: 10, search: debouncedSearch }));
    },
    [dispatch, debouncedSearch]
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  useEffect(() => {
    if (customerSummaryError) {
      toast.error(customerSummaryError);
      dispatch(clearAdminLoanErrors());
    }
  }, [customerSummaryError, dispatch]);

  const handlePageClick = (event) => {
    fetchData(event.selected + 1);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">
            Overview of all customers, their loan history, and performance.
          </p>
        </div>

        <div className="relative w-full max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Search by name or BVN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {customerSummaryLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : customerSummary.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <User className="mb-4 h-12 w-12 text-slate-300" />
            <p>No customers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 whitespace-nowrap">Customer</th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-900 whitespace-nowrap">Loans</th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-900 whitespace-nowrap">Defaults</th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-900 whitespace-nowrap">Performance</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 whitespace-nowrap">Current Loan</th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Amount / Paid</th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Balance</th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-900 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {customerSummary.map((customer, index) => (
                  <tr key={customer.bvn || index} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{customer.customerName || "Unknown Customer"}</div>
                      <div className="text-xs text-slate-500 font-mono" title={customer.bvn}>
                        {customer.bvn ? `${customer.bvn.slice(0, 4)}...${customer.bvn.slice(-4)}` : "No BVN"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-700">
                      {customer.loansCollected}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        customer.defaultsCount > 0 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {customer.defaultsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex items-center justify-center gap-2">
                          <span className={`font-semibold ${
                            customer.performance >= 90 ? "text-emerald-600" : 
                            customer.performance >= 70 ? "text-amber-600" : "text-rose-600"
                          }`}>
                            {customer.performance.toFixed(1)}%
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.activeLoanDetails ? (
                        <div className="text-xs">
                           <div className="text-slate-500">Start: {formatDate(customer.activeLoanDetails.startDate)}</div>
                           <div className="text-slate-500">End: {formatDate(customer.activeLoanDetails.endDate)}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No active loan</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right cursor-default">
                       {customer.activeLoanDetails ? (
                         <>
                           <div className="font-mono text-slate-900">{formatCurrency(customer.activeLoanDetails.amountToBePaid)}</div>
                           <div className="font-mono text-emerald-600 text-xs">{formatCurrency(customer.activeLoanDetails.amountPaidSoFar)}</div>
                         </>
                       ) : (
                         <span className="text-slate-400">—</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-rose-600">
                      {customer.activeLoanDetails ? formatCurrency(customer.activeLoanDetails.balance) : "—"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap
                        ${customer.status === 'Not defaulting' ? 'bg-emerald-100 text-emerald-800' :
                          customer.status === 'Defaulting' ? 'bg-rose-100 text-rose-800' :
                          'bg-slate-100 text-slate-600'}`}>
                        {customer.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {customerSummaryPagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
             <div className="text-sm text-slate-500">
               Showing page {customerSummaryPagination.page} of {customerSummaryPagination.totalPages}
             </div>
             <ReactPaginate
               breakLabel="..."
               nextLabel={<ChevronRight className="h-4 w-4" />}
               onPageChange={handlePageClick}
               pageRangeDisplayed={3}
               pageCount={customerSummaryPagination.totalPages}
               previousLabel={<ChevronLeft className="h-4 w-4" />}
               renderOnZeroPageCount={null}
               containerClassName="flex items-center gap-1"
               pageClassName="rounded-lg"
               pageLinkClassName="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
               activeLinkClassName="!bg-indigo-600 !text-white !border-indigo-600"
               previousClassName="rounded-lg"
               previousLinkClassName="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
               nextClassName="rounded-lg"
               nextLinkClassName="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
               disabledLinkClassName="opacity-50 cursor-not-allowed hover:bg-transparent"
             />
          </div>
        )}
      </div>
    </div>
  );
}
