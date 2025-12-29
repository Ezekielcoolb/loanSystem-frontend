import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  fetchCsos,
  createCso,
  changeCsoStatus,
  clearCsoError,
  transferCsoBranch,
} from "../../redux/slices/csoSlice";
import { fetchBranches } from "../../redux/slices/branchSlice";

const emptyCsoForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  branch: "",
  branchId: "",
  address: "",
  workId: "",
  guaratorName: "",
  guaratorAddress: "",
  guaratorPhone: "",
  guaratorEmail: "",
  dateOfBirth: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
};

const requiredFields = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "branch",
  "branchId",
  "address",
  "workId",
  "guaratorName",
  "guaratorAddress",
  "guaratorPhone",
  "dateOfBirth",
  "city",
];

export default function Cso() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    items: csos,
    pagination,
    listLoading,
    saving,
    error,
  } = useSelector((state) => state.cso);
  const { items: branches } = useSelector((state) => state.branch);

  const [csoForm, setCsoForm] = useState(emptyCsoForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState("");
  const [transferModal, setTransferModal] = useState({ isOpen: false, cso: null, branchId: "", branchName: "" });
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".action-menu")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    dispatch(fetchCsos({ page, limit: 20, branchId: branchFilter }));
  }, [dispatch, page, branchFilter]);

  useEffect(() => {
    if (branches.length === 0) {
      dispatch(fetchBranches());
    }
  }, [branches.length, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCsoError());
    }
  }, [error, dispatch]);

  const isFormValid = useMemo(
    () =>
      requiredFields.every((field) => {
        const value = csoForm[field];
        return typeof value === "string" ? value.trim() !== "" : Boolean(value);
      }),
    [csoForm]
  );

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    if (name === "branch") {
      const selectedBranch = branches.find(b => b.name === value);
      setCsoForm((prev) => ({ 
        ...prev, 
        branch: value,
        branchId: selectedBranch ? selectedBranch._id : ""
      }));
    } else {
      setCsoForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateCso = async (event) => {
    event.preventDefault();
    if (!isFormValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = Object.entries(csoForm).reduce((acc, [key, value]) => {
      if (value === "" || value === null) {
        return acc;
      }
      if (key === "dateOfBirth") {
        acc[key] = new Date(value);
        return acc;
      }
      acc[key] = value;
      return acc;
    }, {});

    try {
      await dispatch(createCso(payload)).unwrap();
      toast.success("CSO created successfully");
      setCsoForm(emptyCsoForm);
      setIsModalOpen(false);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to create CSO");
    }
  };

  const handleToggleStatus = async (csoId, currentStatus) => {
    const action = currentStatus ? "deactivate" : "activate";
    const confirmed = window.confirm(`Are you sure you want to ${action} this CSO?`);
    if (!confirmed) return;

    try {
      await dispatch(changeCsoStatus({ id: csoId, isActive: !currentStatus })).unwrap();
      toast.success(`CSO ${!currentStatus ? "activated" : "deactivated"}`);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to update CSO status");
    }
  };

  const handleTransferBranch = async (e) => {
    e.preventDefault();
    if (!transferModal.branchId) {
      toast.error("Please select a new branch");
      return;
    }

    try {
      await dispatch(transferCsoBranch({
        id: transferModal.cso._id,
        branch: transferModal.branchName,
        branchId: transferModal.branchId
      })).unwrap();
      toast.success("CSO and loans transferred successfully");
      setTransferModal({ isOpen: false, cso: null, branchId: "", branchName: "" });
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to transfer CSO");
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleDateString();
    } catch (error_) {
      return "—";
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Customer Service Officers</h2>
            <p className="text-sm text-slate-500">
              Onboard new CSOs, manage their activation state, and review key contact information.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            onClick={() => {
              setCsoForm(emptyCsoForm);
              setIsModalOpen(true);
            }}
          >
            Add CSO
          </button>
        </header>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">All CSOs</h2>
            <p className="text-sm text-slate-500">Track the active roster of CSOs and manage their availability.</p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="branchFilter" className="text-sm font-medium text-slate-600">Filter by Branch:</label>
            <select
              id="branchFilter"
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
        </header>

        {listLoading ? (
          <p className="text-sm text-slate-500">Loading CSOs...</p>
        ) : csos.length === 0 ? (
          <p className="text-sm text-slate-500">No CSOs yet. Add your first Customer Service Officer to begin.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Branch</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Created</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {csos.map((cso) => (
                  <tr key={cso._id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">
                        {cso.firstName} {cso.lastName}
                      </div>
                      <div className="text-xs text-slate-500">Work ID: {cso.workId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800">{cso.email}</div>
                      <div className="text-xs text-slate-500">{cso.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800">{cso.branch || "—"}</div>
                      <div className="text-xs text-slate-500">
                        {cso.city ? `${cso.city}${cso.state ? ", " : ""}${cso.state || ""}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          cso.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {cso.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(cso.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative action-menu inline-block text-left">
                        <button
                          type="button"
                          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
                          onClick={() => setOpenMenuId(openMenuId === cso._id ? null : cso._id)}
                        >
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {openMenuId === cso._id && (
                          <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              <button
                                className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                onClick={() => {
                                  navigate(`/admin/cso/${cso._id}`);
                                  setOpenMenuId(null);
                                }}
                              >
                                View Details
                              </button>
                              <button
                                className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                onClick={() => {
                                  setTransferModal({ isOpen: true, cso, branchId: "", branchName: "" });
                                  setOpenMenuId(null);
                                }}
                              >
                                Transfer
                              </button>
                              <button
                                className={`flex w-full items-center px-4 py-2 text-sm font-semibold ${
                                  cso.isActive ? "text-rose-600 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"
                                }`}
                                onClick={() => {
                                  handleToggleStatus(cso._id, cso.isActive);
                                  setOpenMenuId(null);
                                }}
                                disabled={saving}
                              >
                                {cso.isActive ? "Deactivate" : "Activate"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {csos.length > 0 && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || listLoading}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages || listLoading}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Register CSO</h3>
                <p className="text-sm text-slate-500">
                  Capture the officer's personal details and guarantor information.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>

            <form className="grid flex-1 gap-4 overflow-y-auto px-6 py-6 md:grid-cols-2" onSubmit={handleCreateCso}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="firstName">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  value={csoForm.firstName}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  value={csoForm.lastName}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={csoForm.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  value={csoForm.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="branch">
                  Branch
                </label>
                <select
                  id="branch"
                  name="branch"
                  value={csoForm.branch}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                >
                  <option value="" disabled>
                    Select branch
                  </option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="workId">
                  Work ID
                </label>
                <input
                  id="workId"
                  name="workId"
                  value={csoForm.workId}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">Work ID will also be used as the CSO password.</p>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="address">
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  value={csoForm.address}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  value={csoForm.city}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="state">
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  value={csoForm.state}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="zipCode">
                  ZIP Code
                </label>
                <input
                  id="zipCode"
                  name="zipCode"
                  value={csoForm.zipCode}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="country">
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  value={csoForm.country}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="dateOfBirth">
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={csoForm.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <p className="text-sm font-semibold text-slate-700">Guarantor Information</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="guaratorName">
                  Guarantor Name
                </label>
                <input
                  id="guaratorName"
                  name="guaratorName"
                  value={csoForm.guaratorName}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="guaratorPhone">
                  Guarantor Phone
                </label>
                <input
                  id="guaratorPhone"
                  name="guaratorPhone"
                  value={csoForm.guaratorPhone}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="guaratorEmail">
                  Guarantor Email (optional)
                </label>
                <input
                  id="guaratorEmail"
                  name="guaratorEmail"
                  type="email"
                  value={csoForm.guaratorEmail}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="guaratorAddress">
                  Guarantor Address
                </label>
                <input
                  id="guaratorAddress"
                  name="guaratorAddress"
                  value={csoForm.guaratorAddress}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                  onClick={() => setCsoForm(emptyCsoForm)}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!isFormValid || saving}
                >
                  {saving ? "Saving..." : "Create CSO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {transferModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Transfer CSO</h3>
              <p className="text-sm text-slate-500">
                Move <strong>{transferModal.cso.firstName} {transferModal.cso.lastName}</strong> to a new branch.
              </p>
            </div>
            <form onSubmit={handleTransferBranch} className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">New Branch</label>
                <select
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  value={transferModal.branchId}
                  onChange={(e) => {
                    const selected = branches.find(b => b._id === e.target.value);
                    setTransferModal(prev => ({ 
                      ...prev, 
                      branchId: e.target.value, 
                      branchName: selected ? selected.name : "" 
                    }));
                  }}
                >
                  <option value="" disabled>Select target branch</option>
                  {branches.filter(b => b._id !== transferModal.cso.branchId).map((branch) => (
                    <option key={branch._id} value={branch._id}>{branch.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> All active and fully paid loans under this CSO will be updated to the new branch automatically.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                  onClick={() => setTransferModal({ isOpen: false, cso: null, branchId: "", branchName: "" })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Transferring..." : "Confirm Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
