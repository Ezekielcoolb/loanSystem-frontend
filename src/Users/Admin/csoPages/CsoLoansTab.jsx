import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLoansByCsoId } from "../../../redux/slices/adminLoanSlice";
import { Loader2, Eye, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function CsoLoansTab({ csoId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { csoLoans, csoLoansLoading, csoLoansError } = useSelector((state) => state.adminLoans);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (csoId) {
      dispatch(fetchLoansByCsoId(csoId));
    }
  }, [dispatch, csoId]);

  const filteredLoans = useMemo(() => {
    if (!csoLoans) return [];
    
    switch (activeTab) {
      case "active":
        return csoLoans.filter(loan => loan.status === "active loan");
      case "overdue":
        return csoLoans.filter(loan => {
            if (loan.status !== "active loan") return false;
            const days = getDaysOverdue(loan.loanDetails?.startDate);
            return days > 30 && days <= 60;
        });
      case "recovery":
        return csoLoans.filter(loan => {
            if (loan.status !== "active loan") return false;
            const days = getDaysOverdue(loan.loanDetails?.startDate);
            return days > 60;
        });
      case "paid":
        return csoLoans.filter(loan => loan.status === "fully paid");
      case "ending":
        return csoLoans.filter(loan => {
            if (loan.status !== "active loan") return false;
            const daysRemaining = getDaysRemaining(loan.loanDetails?.endDate);
            return daysRemaining > 0 && daysRemaining <= 30;
        });
      case "rejected":
        return csoLoans.filter(loan => loan.status === "rejected");
      default:
        return csoLoans;
    }
  }, [csoLoans, activeTab]);

  const counts = useMemo(() => {
      if (!csoLoans) return {};
      return {
          all: csoLoans.length,
          active: csoLoans.filter(l => l.status === "active loan").length,
          overdue: csoLoans.filter(l => {
              if (l.status !== "active loan") return false;
              const days = getDaysOverdue(l.loanDetails?.startDate);
              return days > 30 && days <= 60;
          }).length,
          recovery: csoLoans.filter(l => {
              if (l.status !== "active loan") return false;
              const days = getDaysOverdue(l.loanDetails?.startDate);
              return days > 60;
          }).length,
          paid: csoLoans.filter(l => l.status === "fully paid").length,
          ending: csoLoans.filter(l => {
              if (l.status !== "active loan") return false;
              const daysRemaining = getDaysRemaining(l.loanDetails?.endDate);
              return daysRemaining > 0 && daysRemaining <= 30;
          }).length,
          rejected: csoLoans.filter(l => l.status === "rejected").length,
      };
  }, [csoLoans]);

  const tabs = [
    { id: "all", label: "All Submitted" },
    { id: "active", label: "Active Loans" },
    { id: "overdue", label: "Overdue (>30 Days)" },
    { id: "recovery", label: "Recovery (>60 Days)" },
    { id: "paid", label: "Fully Paid" },
    { id: "ending", label: "Ending Soon (<30 Days)" },
    { id: "rejected", label: "Rejected" },
  ];

  if (csoLoansLoading) {
      return (
          <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
      );
  }

  if (csoLoansError) {
      return (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
              <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <p>{csoLoansError}</p>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === tab.id ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-600"
              }`}>
                  {counts[tab.id] || 0}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-900 whitespace-nowrap">Customer</th>
                <th className="px-6 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Amount</th>
                {activeTab !== "rejected" && activeTab !== "all" && (
                    <>
                        <th className="px-6 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Paid</th>
                        <th className="px-6 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Balance</th>
                    </>
                )}
                <th className="px-6 py-3 text-left font-semibold text-slate-900 whitespace-nowrap">Date</th>
                <th className="px-6 py-3 text-center font-semibold text-slate-900 whitespace-nowrap">Status</th>
                <th className="px-6 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
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

                    <td className="px-6 py-4 text-right font-mono text-slate-600">
                        {formatCurrency(loan.loanDetails?.amountToBePaid || loan.loanDetails?.amountRequested)}
                    </td>

                    {activeTab !== "rejected" && activeTab !== "all" && (
                        <>
                            <td className="px-6 py-4 text-right font-mono text-emerald-600">
                                {formatCurrency(loan.loanDetails?.amountPaidSoFar || 0)}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-rose-600">
                                {formatCurrency((loan.loanDetails?.amountToBePaid || 0) - (loan.loanDetails?.amountPaidSoFar || 0))}
                            </td>
                        </>
                    )}

                    <td className="px-6 py-4 text-xs text-slate-500">
                        {activeTab === "all" || activeTab === "rejected" ? (
                             formatDate(loan.createdAt)
                        ) : (
                            <>
                                <div>Start: {formatDate(loan.loanDetails?.startDate)}</div>
                                <div>End: {formatDate(loan.loanDetails?.endDate)}</div>
                            </>
                        )}
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

                    <td className="px-6 py-4 text-right">
                        <button
                            onClick={() => navigate(`/admin/loans/${loan._id}`)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                            <Eye className="h-3.5 w-3.5" /> Details
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
