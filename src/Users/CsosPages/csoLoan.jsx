import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  Search, Filter, Calendar, ChevronRight, AlertCircle, 
  CheckCircle2, Clock, XCircle, Banknote, Eye, Loader2 
} from "lucide-react";
import toast from "react-hot-toast";
import { fetchCsoLoans, recordLoanPayment, clearLoanError } from "../../redux/slices/loanSlice";

const formatCurrency = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "₦0.00";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getDaysOverdue = (startDate) => {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
};

export default function CsoLoan() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loans, loading, error, paymentSubmitting } = useSelector((state) => state.loan);
  
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    dispatch(fetchCsoLoans());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearLoanError());
    }
  }, [error, dispatch]);

  const filteredLoans = useMemo(() => {
    let filtered = loans;

    // Search Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(loan => 
        loan.customerDetails?.firstName?.toLowerCase().includes(lowerSearch) ||
        loan.customerDetails?.lastName?.toLowerCase().includes(lowerSearch) ||
        loan.loanId?.toLowerCase().includes(lowerSearch)
      );
    }

    // Tab Filter
    const now = new Date();
    
    switch (activeTab) {
      case "active":
        return filtered.filter(loan => loan.status === "active loan");
      case "overdue":
        return filtered.filter(loan => {
            if (loan.status !== "active loan") return false;
            const days = getDaysOverdue(loan.loanDetails?.startDate);
            return days > 30 && days <= 60;
        });
      case "recovery":
        return filtered.filter(loan => {
            if (loan.status !== "active loan") return false;
            const days = getDaysOverdue(loan.loanDetails?.startDate);
            return days > 60;
        });
      case "paid":
        return filtered.filter(loan => loan.status === "fully paid");
      case "pending":
        return filtered.filter(loan => loan.status === "waiting for approval");
      case "rejected":
        return filtered.filter(loan => loan.status === "rejected");
      default:
        return filtered;
    }
  }, [loans, activeTab, searchTerm]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLoanForPayment || !paymentAmount) return;

    try {
      await dispatch(recordLoanPayment({
        loanId: selectedLoanForPayment._id,
        amount: Number(paymentAmount),
        date: paymentDate
      })).unwrap();
      
      toast.success("Payment recorded successfully");
      setSelectedLoanForPayment(null);
      setPaymentAmount("");
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const tabs = [
    { id: "all", label: "All Submitted" },
    { id: "active", label: "Active Loans" },
    { id: "overdue", label: "Overdue (>30 Days)" },
    { id: "recovery", label: "Recovery (>60 Days)" },
    { id: "paid", label: "Fully Paid" },
    { id: "pending", label: "Pending Approval" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loan Management</h1>
          <p className="text-sm text-slate-500">Track and manage all your customer loans</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none sm:w-64"
          />
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-900 whitespace-nowrap">Customer</th>
                {activeTab === "all" && (
                    <>
                        <th className="px-6 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Requested</th>
                        <th className="px-6 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Approved</th>
                        <th className="px-6 py-3 text-center font-semibold text-slate-900 whitespace-nowrap">Status</th>
                    </>
                )}
                {(activeTab === "active" || activeTab === "overdue" || activeTab === "recovery" || activeTab === "paid") && (
                    <>
                        <th className="px-6 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">To Pay</th>
                        <th className="px-6 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Paid</th>
                        <th className="px-6 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Balance</th>
                        <th className="px-6 py-3 text-left font-semibold text-slate-900 whitespace-nowrap">Duration</th>
                        <th className="px-6 py-3 text-center font-semibold text-slate-900 whitespace-nowrap">Status</th>
                    </>
                )}
                {activeTab === "pending" && (
                    <>
                        <th className="px-6 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Requested</th>
                        <th className="px-6 py-3 text-left font-semibold text-slate-900 whitespace-nowrap">Date Submitted</th>
                    </>
                )}
                {activeTab === "rejected" && (
                    <>
                        <th className="px-6 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Requested</th>
                        <th className="px-6 py-3 text-left font-semibold text-slate-900 whitespace-nowrap">Reason</th>
                    </>
                )}
                <th className="px-6 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
                    <p className="mt-2">Loading loans...</p>
                  </td>
                </tr>
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    No loans found in this category.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {loan.customerDetails?.firstName} {loan.customerDetails?.lastName}
                      </div>
                      <div className="text-xs text-slate-500">{loan.loanId}</div>
                    </td>

                    {activeTab === "all" && (
                        <>
                            <td className="px-6 py-4 text-right font-mono text-slate-600">
                                {formatCurrency(loan.loanDetails?.amountRequested)}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-emerald-600">
                                {formatCurrency(loan.loanDetails?.amountToBePaid)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize
                                    ${loan.status === 'active loan' ? 'bg-emerald-100 text-emerald-800' : 
                                      loan.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 
                                      loan.status === 'fully paid' ? 'bg-blue-100 text-blue-800' :
                                      'bg-amber-100 text-amber-800'}`}>
                                    {loan.status}
                                </span>
                            </td>
                        </>
                    )}

                    {(activeTab === "active" || activeTab === "overdue" || activeTab === "recovery" || activeTab === "paid") && (
                        <>
                            <td className="px-6 py-4 text-right font-mono text-slate-900">
                                {formatCurrency(loan.loanDetails?.amountToBePaid)}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-emerald-600">
                                {formatCurrency(loan.loanDetails?.amountPaidSoFar || 0)}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-rose-600">
                                {formatCurrency((loan.loanDetails?.amountToBePaid || 0) - (loan.loanDetails?.amountPaidSoFar || 0))}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500">
                                <div>Start: {formatDate(loan.loanDetails?.startDate)}</div>
                                <div>End: {formatDate(loan.loanDetails?.endDate)}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize 
                                    ${loan.status === 'fully paid' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                    {loan.status}
                                </span>
                            </td>
                        </>
                    )}

                    {activeTab === "pending" && (
                        <>
                            <td className="px-6 py-4 text-right font-mono text-slate-600">
                                {formatCurrency(loan.loanDetails?.amountRequested)}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                                {formatDate(loan.createdAt)}
                            </td>
                        </>
                    )}

                    {activeTab === "rejected" && (
                        <>
                            <td className="px-6 py-4 text-right font-mono text-slate-600">
                                {formatCurrency(loan.loanDetails?.amountRequested)}
                            </td>
                            <td className="px-6 py-4 text-rose-600 text-xs max-w-xs truncate">
                                {loan.rejectionReason || "No reason provided"}
                            </td>
                        </>
                    )}

                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            {(activeTab === "overdue" || activeTab === "recovery") && (
                                <button
                                    onClick={() => setSelectedLoanForPayment(loan)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                                >
                                    <Banknote className="h-3.5 w-3.5" /> Pay
                                </button>
                            )}
                            <button
                                onClick={() => navigate(`/cso/loans/${loan._id}`)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                                <Eye className="h-3.5 w-3.5" /> Details
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedLoanForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Record Payment</h2>
              <button 
                onClick={() => setSelectedLoanForPayment(null)}
                className="rounded-full p-2 hover:bg-slate-100"
              >
                <XCircle className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <div className="mb-6 rounded-2xl bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Customer</div>
                <div className="font-semibold text-slate-900">
                    {selectedLoanForPayment.customerDetails?.firstName} {selectedLoanForPayment.customerDetails?.lastName}
                </div>
                <div className="mt-2 flex justify-between text-sm">
                    <span className="text-slate-500">Balance Due:</span>
                    <span className="font-mono font-medium text-rose-600">
                        {formatCurrency((selectedLoanForPayment.loanDetails?.amountToBePaid || 0) - (selectedLoanForPayment.loanDetails?.amountPaidSoFar || 0))}
                    </span>
                </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Amount</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={paymentSubmitting}
                className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {paymentSubmitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Confirm Payment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}