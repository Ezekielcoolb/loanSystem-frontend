import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  MoreVertical,
  Eye,
} from "lucide-react";
import {
  fetchAdminMembers,
  createAdminMember,
  suspendAdminMember,
  activateAdminMember,
  deleteAdminMember,
  clearAdminPanelError,
} from "../../redux/slices/adminPanelSlice";

const ROLE_OPTIONS = [
  "Manager",
  "Disbursement Officer",
  "Support/Reconciliation Officer",
  "Agency Manager",
];

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  assignedRole: ROLE_OPTIONS[0],
  gender: "",
};

export default function AdminPanel() {
  const dispatch = useDispatch();
  const { items, loading, creating, error, actionId } = useSelector(
    (state) => state.adminPanel
  );

  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [filter, setFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState(ROLE_OPTIONS[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminMembers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminPanelError());
    }
  }, [error, dispatch]);

  const filteredMembers = useMemo(() => {
    if (filter === "all") {
      return items;
    }
    if (filter === "active") {
      return items.filter((member) => !member.isSuspended);
    }
    if (filter === "suspended") {
      return items.filter((member) => member.isSuspended);
    }
    if (filter === "role") {
      return items.filter((member) => member.assignedRole === roleFilter);
    }
    return items;
  }, [items, filter, roleFilter]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setShowPassword(false);
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    const requiredFields = Object.entries(form).filter(([key]) => key !== "gender" ? !form[key] : false);
    if (requiredFields.some(([, value]) => !value)) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!form.gender) {
      toast.error("Please select a gender");
      return;
    }

    try {
      await dispatch(createAdminMember(form)).unwrap();
      toast.success("Admin member created");
      resetForm();
      setIsModalOpen(false);
    } catch (createError) {
      toast.error(createError || "Unable to create admin member");
    }
  };

  const handleSuspend = async (id, isSuspended) => {
    try {
      if (isSuspended) {
        await dispatch(activateAdminMember(id)).unwrap();
        toast.success("Admin member activated");
      } else {
        await dispatch(suspendAdminMember(id)).unwrap();
        toast.success("Admin member suspended");
      }
    } catch (actionError) {
      toast.error(actionError || "Unable to update admin member");
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteAdminMember(id)).unwrap();
      toast.success("Admin member deleted");
    } catch (deleteError) {
      toast.error(deleteError || "Unable to delete admin member");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-500">
            Manage internal admin members, their roles, and access.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => dispatch(fetchAdminMembers())}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh list
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            <UserPlus className="h-4 w-4" />
            New admin
          </button>
        </div>
      </header>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <Users className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold">Admin members</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All members</option>
              <option value="active">Active only</option>
              <option value="suspended">Suspended only</option>
              <option value="role">Filter by selected role</option>
            </select>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <p className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            <AlertCircle className="h-4 w-4" />
            No admin members found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Phone</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => (
                  <tr key={member._id} className="text-slate-700">
                    <td className="py-3 pr-4 font-semibold text-slate-900">
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="py-3 pr-4">{member.email}</td>
                    <td className="py-3 pr-4">{member.phone}</td>
                    <td className="py-3 pr-4">{member.assignedRole}</td>
                    <td className="py-3 pr-4">
                      {member.isSuspended ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
                          <Ban className="h-3.5 w-3.5" />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="relative py-3 pr-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setMenuOpenId((prev) => (prev === member._id ? null : member._id))
                          }
                          className="inline-flex items-center rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                      {menuOpenId === member._id && (
                        <div className="absolute right-0 top-12 z-10 w-48 rounded-xl border border-slate-200 bg-white shadow-lg">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMember(member);
                              setMenuOpenId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4 text-indigo-500" />
                            View details
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setMenuOpenId(null);
                              await handleSuspend(member._id, member.isSuspended);
                            }}
                            disabled={actionId === member._id}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionId === member._id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                            ) : member.isSuspended ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Ban className="h-4 w-4 text-amber-500" />
                            )}
                            {member.isSuspended ? "Activate" : "Suspend"}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setMenuOpenId(null);
                              await handleDelete(member._id);
                            }}
                            disabled={actionId === member._id}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionId === member._id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="absolute right-4 top-4 text-sm font-semibold text-slate-400 transition hover:text-slate-600"
            >
              Close
            </button>
            <div className="mb-4 flex items-center gap-2 text-slate-800">
              <UserPlus className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-semibold">Add new admin</h2>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">First name</label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Last name</label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="jane@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="+234 800 0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Assigned role</label>
                  <select
                    name="assignedRole"
                    value={form.assignedRole}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  <div className="mt-1 flex rounded-lg border border-slate-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="flex-1 rounded-l-lg border-0 px-3 py-2 text-sm focus:outline-none"
                      placeholder="******"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="rounded-r-lg border-l border-slate-200 px-3 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating member...
                  </>
                ) : (
                  "Create member"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setSelectedMember(null);
              }}
              className="absolute right-4 top-4 text-sm font-semibold text-slate-400 transition hover:text-slate-600"
            >
              Close
            </button>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Admin details</h2>
              <p className="text-sm text-slate-500">Internal information overview</p>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-slate-600">Name</dt>
                <dd className="text-slate-900">
                  {selectedMember.firstName} {selectedMember.lastName}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-slate-600">Email</dt>
                <dd className="text-slate-900">{selectedMember.email}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-slate-600">Phone</dt>
                <dd className="text-slate-900">{selectedMember.phone}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-slate-600">Role</dt>
                <dd className="text-slate-900">{selectedMember.assignedRole}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-slate-600">Gender</dt>
                <dd className="text-slate-900">{selectedMember.gender || "—"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-slate-600">Status</dt>
                <dd>
                  {selectedMember.isSuspended ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
                      <Ban className="h-3.5 w-3.5" />
                      Suspended
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Active
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
