import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchBranches,
  updateBranchTargets,
  clearBranchError,
} from "../../../redux/slices/branchSlice";

export default function BranchTarget() {
  const dispatch = useDispatch();
  const { items: branches, loading, error } = useSelector((state) => state.branch);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [targets, setTargets] = useState({ loanTarget: "", disbursementTarget: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!branches.length) {
      dispatch(fetchBranches());
    }
  }, [dispatch, branches.length]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearBranchError());
    }
  }, [error, dispatch]);

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch._id === selectedBranchId),
    [branches, selectedBranchId]
  );

  useEffect(() => {
    if (selectedBranch) {
      setTargets({
        loanTarget: selectedBranch.loanTarget ?? 0,
        disbursementTarget: selectedBranch.disbursementTarget ?? 0,
      });
    }
  }, [selectedBranch]);

  const handleTargetChange = (field) => (event) => {
    setTargets((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const resetTargets = () => {
    if (!selectedBranch) return;
    setTargets({
      loanTarget: selectedBranch.loanTarget ?? 0,
      disbursementTarget: selectedBranch.disbursementTarget ?? 0,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedBranchId) {
      toast.error("Select a branch first");
      return;
    }

    const loanTargetNumber = Number(targets.loanTarget);
    const disbursementTargetNumber = Number(targets.disbursementTarget);

    if (
      Number.isNaN(loanTargetNumber) ||
      Number.isNaN(disbursementTargetNumber) ||
      targets.loanTarget === "" ||
      targets.disbursementTarget === ""
    ) {
      toast.error("Provide valid numeric targets");
      return;
    }

    setSaving(true);
    try {
      await dispatch(
        updateBranchTargets({
          id: selectedBranchId,
          loanTarget: loanTargetNumber,
          disbursementTarget: disbursementTargetNumber,
        })
      ).unwrap();
      toast.success("Branch targets updated");
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Branch Targets</h2>
          <p className="text-sm text-slate-500">
            Select a branch, adjust its performance targets, and save the updates in one place.
          </p>
        </header>

        {branches.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">
              No branches available. Create a branch first before configuring targets.
            </p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="branch">
                  Branch
                </label>
                <select
                  id="branch"
                  value={selectedBranchId}
                  onChange={(event) => setSelectedBranchId(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                >
                  <option value="" disabled>
                    Select a branch
                  </option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="loanTarget">
                  Loan Target
                </label>
                <input
                  id="loanTarget"
                  type="number"
                  value={targets.loanTarget}
                  onChange={handleTargetChange("loanTarget")}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g. 2500000"
                  min="0"
                  step="0.01"
                  disabled={!selectedBranchId}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="disbursementTarget">
                  Disbursement Target
                </label>
                <input
                  id="disbursementTarget"
                  type="number"
                  value={targets.disbursementTarget}
                  onChange={handleTargetChange("disbursementTarget")}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g. 1500000"
                  min="0"
                  step="0.01"
                  disabled={!selectedBranchId}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                onClick={resetTargets}
                disabled={!selectedBranchId}
              >
                Reset
              </button>
              <button
                type="submit"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!selectedBranchId || saving || loading}
              >
                {saving ? "Saving..." : "Save Targets"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
