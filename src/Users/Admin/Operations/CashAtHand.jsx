import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Wallet,
  CalendarDays,
  Loader2,
  RefreshCw,
  ArrowUpCircle,
  History,
  AlertCircle,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchCashEntries,
  fetchCashByDate,
  updateCashAtHand,
  clearCashError,
} from "../../../redux/slices/cashAtHandSlice";

const LAGOS_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Lagos",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const HUMAN_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Africa/Lagos",
  weekday: "short",
  month: "short",
  day: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Africa/Lagos",
  hour: "numeric",
  minute: "numeric",
});

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

function getInputDate(value) {
  try {
    return LAGOS_DATE_FORMATTER.format(value ? new Date(value) : new Date());
  } catch {
    return "";
  }
}

function formatDisplayDate(dateKey) {
  if (!dateKey) {
    return "—";
  }

  try {
    return HUMAN_DATE_FORMATTER.format(new Date(`${dateKey}T00:00:00+01:00`));
  } catch {
    return dateKey;
  }
}

function formatUpdatedTime(value) {
  if (!value) {
    return "—";
  }

  try {
    return TIME_FORMATTER.format(new Date(value));
  } catch {
    return value;
  }
}

function formatCurrency(amount) {
  return CURRENCY_FORMATTER.format(Number(amount) || 0);
}

function getMonthRange(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  return {
    start: LAGOS_DATE_FORMATTER.format(firstDay),
    end: LAGOS_DATE_FORMATTER.format(lastDay),
    display: new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Lagos",
      month: "long",
      year: "numeric",
    }).format(date),
  };
}

function filterEntriesByMonth(entries, monthStart, monthEnd) {
  return entries.filter((entry) => {
    return entry.date >= monthStart && entry.date <= monthEnd;
  });
}

export default function CashAtHand() {
  const dispatch = useDispatch();
  const {
    entries,
    entriesLoading,
    selected,
    selectedLoading,
    saving,
    error,
  } = useSelector((state) => state.cashAtHand);

  const [selectedDate, setSelectedDate] = useState(getInputDate(new Date()));
  const [amountInput, setAmountInput] = useState("");
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    dispatch(fetchCashEntries());
  }, [dispatch]);

  useEffect(() => {
    if (selectedDate) {
      dispatch(fetchCashByDate(selectedDate));
    }
  }, [dispatch, selectedDate]);

  useEffect(() => {
    setAmountInput(selected.amount?.toString() || "");
  }, [selected.amount]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCashError());
    }
  }, [error, dispatch]);

  const sortedEntries = useMemo(() => {
    const monthRange = getMonthRange(currentMonth);
    const filtered = filterEntriesByMonth(entries || [], monthRange.start, monthRange.end);
    return filtered.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [entries, currentMonth]);

  const monthRange = useMemo(() => getMonthRange(currentMonth), [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    const numericAmount = Number(amountInput);
    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      toast.error("Amount must be a non-negative number");
      return;
    }

    try {
      const result = await dispatch(
        updateCashAtHand({ amount: numericAmount, date: selectedDate })
      ).unwrap();

      toast.success("Cash at hand updated");
      setAmountInput(result.amount.toString());

      dispatch(fetchCashEntries());
      dispatch(fetchCashByDate(selectedDate));
      setIsCashModalOpen(false);
    } catch (submissionError) {
      toast.error(
        submissionError?.message || submissionError || "Unable to update cash at hand"
      );
    }
  };

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cash at Hand</h1>
          <p className="text-sm text-slate-500">
            Track daily balances, confirm reconciliations, and maintain a clear audit trail.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCashModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Add Cash Entry
          </button>
          <button
            type="button"
            onClick={() => {
              dispatch(fetchCashEntries());
              if (selectedDate) {
                dispatch(fetchCashByDate(selectedDate));
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            <RefreshCw className={`h-4 w-4 ${entriesLoading ? "animate-spin" : ""}`} />
            Refresh data
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-1">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Selected date</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatDisplayDate(selected.date || selectedDate)}
                </p>
                <p className="text-xs text-slate-500">
                  Updated at {selected.updatedAt ? formatUpdatedTime(selected.updatedAt) : "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-slate-400">Balance</p>
                <p className="text-3xl font-semibold text-emerald-600">
                  {selectedLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  ) : (
                    formatCurrency(selected.amount)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-800">
                <History className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold">Historical balances</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-sm font-semibold text-slate-700">{monthRange.display}</span>
                </div>
                
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                {new Date().getMonth() !== currentMonth.getMonth() || new Date().getFullYear() !== currentMonth.getFullYear() ? (
                  <button
                    type="button"
                    onClick={handleCurrentMonth}
                    className="text-xs font-semibold text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50"
                  >
                    Current
                  </button>
                ) : null}
              </div>
            </div>

            {entriesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
              </div>
            ) : sortedEntries.length === 0 ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                <AlertCircle className="h-4 w-4" />
                No cash records yet. Save a balance to start tracking history.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="py-3 pr-4">Date</th>
                      <th className="py-3 pr-4">Amount</th>
                      <th className="py-3 pr-4">Last updated</th>
                      <th className="py-3 pr-4 text-right">Select</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedEntries.map((entry) => (
                      <tr key={entry.date}>
                        <td className="py-3 pr-4 font-semibold text-slate-900">
                          {formatDisplayDate(entry.date)}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">
                          {formatCurrency(entry.amount)}
                        </td>
                        <td className="py-3 pr-4 text-slate-500">
                          {formatUpdatedTime(entry.updatedAt)}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedDate(entry.date)}
                            className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                              selectedDate === entry.date
                                ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                                : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                            }`}
                          >
                            View
                            <ArrowUpCircle className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cash Modal */}
      {isCashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div className="flex items-center gap-2 text-slate-800">
                <Wallet className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold">Update daily balance</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCashModalOpen(false)}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Date</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(event) => setSelectedDate(event.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <CalendarDays className="h-5 w-5 text-slate-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(getInputDate(new Date()))}
                    className="mt-2 text-xs font-semibold text-indigo-600"
                  >
                    Use today's date
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Amount (NGN)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountInput}
                    onChange={(event) => setAmountInput(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    This overrides any previous balance recorded for the selected date.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCashModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving balance...
                    </>
                  ) : (
                    "Save balance"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
