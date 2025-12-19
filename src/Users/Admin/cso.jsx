import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  fetchCsos,
  createCso,
  changeCsoStatus,
  clearCsoError,
} from "../../redux/slices/csoSlice";
import { fetchBranches } from "../../redux/slices/branchSlice";

const emptyCsoForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  branch: "",
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
    listLoading,
    saving,
    error,
  } = useSelector((state) => state.cso);
  const { items: branches } = useSelector((state) => state.branch);

  const [csoForm, setCsoForm] = useState(emptyCsoForm);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCsos());
  }, [dispatch]);

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
    setCsoForm((prev) => ({ ...prev, [name]: value }));
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
                    <td className="flex items-center justify-end gap-2 px-4 py-3">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        onClick={() => navigate(`/admin/cso/${cso._id}`)}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${
                          cso.isActive ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                        onClick={() => handleToggleStatus(cso._id, cso.isActive)}
                        disabled={saving}
                      >
                        {cso.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
}
