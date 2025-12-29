
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Loader2, Users, ArrowRightLeft, CheckSquare, Square, Filter } from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchCsoCustomers,
  fetchCsoGroupLeaders,
  assignCustomersToGroup,
} from "../../../redux/slices/adminLoanSlice";

export default function CsoCustomersTab({ csoId }) {
  const dispatch = useDispatch();
  const {
    csoLoans: customers,
    csoLoansLoading: loading,
    groupLeaders,
    groupLeadersLoading,
    updating,
  } = useSelector((state) => state.adminLoans);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterGroupId, setFilterGroupId] = useState("");
  const [selectedLoans, setSelectedLoans] = useState(new Set());
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [targetGroupLeaderId, setTargetGroupLeaderId] = useState("");

  useEffect(() => {
    if (csoId) {
      dispatch(fetchCsoCustomers({ csoId, search: searchQuery, groupId: filterGroupId }));
    }
  }, [dispatch, csoId, searchQuery, filterGroupId, updating]);

  useEffect(() => {
    if (csoId) {
      dispatch(fetchCsoGroupLeaders(csoId));
    }
  }, [dispatch, csoId]);

  const toggleSelectAll = () => {
    if (selectedLoans.size === customers.length) {
      setSelectedLoans(new Set());
    } else {
      setSelectedLoans(new Set(customers.map((c) => c._id)));
    }
  };

  const toggleSelectOne = (id) => {
    const newSelected = new Set(selectedLoans);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLoans(newSelected);
  };

  const handleTransfer = async () => {
    if (!targetGroupLeaderId) return;

    try {
      await dispatch(
        assignCustomersToGroup({
          loanIds: Array.from(selectedLoans),
          groupLeaderId: targetGroupLeaderId,
        })
      ).unwrap();
      toast.success("Customers transferred successfully");
      setIsTransferModalOpen(false);
      setSelectedLoans(new Set());
      setTargetGroupLeaderId("");
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to transfer customers");
    }
  };
  
  const getGroupName = (customer) => {
      return customer.groupDetails?.groupName || "Ungrouped";
  }
  
  const getLeaderName = (customer) => {
      return customer.groupDetails?.leaderName || "-";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        
        <div className="flex items-center gap-2">
            <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                    value={filterGroupId}
                    onChange={(e) => setFilterGroupId(e.target.value)}
                    className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-8 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                    <option value="">All Groups</option>
                    <option value="ungrouped">Ungrouped</option>
                    {groupLeaders.map(gl => (
                        <option key={gl._id} value={gl._id}>{gl.groupName}</option>
                    ))}
                </select>
            </div>

            {selectedLoans.size > 0 && (
            <button
                onClick={() => setIsTransferModalOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                disabled={updating}
            >
                <ArrowRightLeft className="h-4 w-4" />
                Transfer ({selectedLoans.size})
            </button>
            )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            <span className="ml-2 text-sm text-slate-500">Loading customers...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No customers found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-4 py-3 text-left">
                            <button onClick={toggleSelectAll} className="flex items-center">
                                {selectedLoans.size === customers.length && customers.length > 0 ? (
                                    <CheckSquare className="h-4 w-4 text-indigo-600" />
                                ) : (
                                    <Square className="h-4 w-4 text-slate-400" />
                                )}
                            </button>
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Customer</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Phone</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Group</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Leader</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {customers.map((loan) => (
                        <tr key={loan._id} className="hover:bg-slate-50/60">
                            <td className="px-4 py-3">
                                <button onClick={() => toggleSelectOne(loan._id)}>
                                    {selectedLoans.has(loan._id) ? (
                                        <CheckSquare className="h-4 w-4 text-indigo-600" />
                                    ) : (
                                        <Square className="h-4 w-4 text-slate-300 hover:text-slate-400" />
                                    )}
                                </button>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">
                                {loan.customerDetails?.firstName} {loan.customerDetails?.lastName}
                                <div className="text-xs text-slate-500">{loan.loanId}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{loan.customerDetails?.telephone || "-"}</td>
                            <td className="px-4 py-3 text-slate-600">{getGroupName(loan)}</td>
                            <td className="px-4 py-3 text-slate-600">{getLeaderName(loan)}</td>
                             <td className="px-4 py-3">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    loan.status === 'active loan' ? 'bg-emerald-100 text-emerald-700' : 
                                    loan.status === 'fully paid' ? 'bg-blue-100 text-blue-700' :
                                    'bg-slate-100 text-slate-700'
                                }`}>
                                    {loan.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        )}
      </div>

      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold text-slate-900">Transfer Customers</h3>
            <p className="mb-4 text-sm text-slate-600">
                Move <strong>{selectedLoans.size}</strong> selected customer(s) to a new group.
            </p>
            
            <div className="mb-6">
                <label className="mb-1 block text-sm font-medium text-slate-700">Select Destination Group</label>
                <select
                    value={targetGroupLeaderId}
                    onChange={(e) => setTargetGroupLeaderId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                >
                    <option value="">Choose a group leader...</option>
                    {groupLeaders.map(gl => (
                        <option key={gl._id} value={gl._id}>{gl.groupName} ({gl.firstName} {gl.lastName})</option>
                    ))}
                </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={!targetGroupLeaderId || updating}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {updating ? "Transferring..." : "Confirm Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
