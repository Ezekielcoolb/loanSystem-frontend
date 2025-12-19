import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ShieldCheck, KeyRound } from "lucide-react";
import { clearCsoAuthError, updateCsoPassword } from "../../redux/slices/csoAuthSlice";

export default function CsoSettings() {
  const dispatch = useDispatch();
  const { savingPassword, error } = useSelector((state) => state.csoAuth);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (error && !savingPassword) {
      toast.error(error);
      dispatch(clearCsoAuthError());
    }
  }, [error, savingPassword, dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please complete all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    try {
      const message = await dispatch(
        updateCsoPassword({ currentPassword, newPassword, confirmPassword })
      ).unwrap();
      toast.success(message || "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Unable to update password");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-indigo-50 p-3 text-indigo-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Security</h2>
            <p className="text-sm text-slate-500">Manage credentials and strengthen your CSO account.</p>
          </div>
        </header>

        <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor="currentPassword">
                Current password
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor="newPassword">
              New password
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter new password"
                autoComplete="new-password"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor="confirmPassword">
              Confirm new password
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
            >
              Reset fields
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
              disabled={savingPassword}
            >
              <KeyRound className="h-4 w-4" />
              {savingPassword ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
