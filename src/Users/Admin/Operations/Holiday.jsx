import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  CalendarDays,
  Repeat,
  RefreshCw,
  Loader2,
  Trash2,
  AlertCircle,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchHolidays,
  createHoliday,
  deleteHoliday,
  clearHolidayError,
} from "../../../redux/slices/holidaySlice";

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (_) {
    return value;
  }
};

function getYearRange(year) {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  return {
    start,
    end,
    display: year.toString(),
  };
}

function filterHolidaysByYear(holidays, yearStart, yearEnd) {
  return holidays.filter((holiday) => {
    return holiday.holiday >= yearStart && holiday.holiday <= yearEnd;
  });
}

export default function Holiday() {
  const dispatch = useDispatch();
  const { items, loading, creating, deletingId, error } = useSelector(
    (state) => state.holiday
  );

  const [holidayDate, setHolidayDate] = useState("");
  const [reason, setReason] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(fetchHolidays());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearHolidayError());
    }
  }, [error, dispatch]);

  const sortedHolidays = useMemo(() => {
    const yearRange = getYearRange(currentYear);
    const filtered = filterHolidaysByYear([...items], yearRange.start, yearRange.end);
    return filtered.sort((a, b) => new Date(a.holiday) - new Date(b.holiday));
  }, [items, currentYear]);

  const yearRange = useMemo(() => getYearRange(currentYear), [currentYear]);

  const recurringHolidays = sortedHolidays.filter((holiday) => holiday.isRecurring);
  const oneTimeHolidays = sortedHolidays.filter((holiday) => !holiday.isRecurring);

  const handlePreviousYear = () => {
    setCurrentYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setCurrentYear(prev => prev + 1);
  };

  const handleCurrentYear = () => {
    setCurrentYear(new Date().getFullYear());
  };

  const resetForm = () => {
    setHolidayDate("");
    setReason("");
    setIsRecurring(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!holidayDate) {
      toast.error("Please select a holiday date");
      return;
    }

    try {
      await dispatch(
        createHoliday({
          holiday: holidayDate,
          reason,
          isRecurring,
        })
      ).unwrap();

      toast.success("Holiday saved");
      resetForm();
      setIsHolidayModalOpen(false);
    } catch (submitError) {
      toast.error(submitError || "Unable to save holiday");
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteHoliday(id)).unwrap();
      toast.success("Holiday removed");
    } catch (deleteError) {
      toast.error(deleteError || "Unable to delete holiday");
    }
  };

  const renderHolidayRow = (holiday) => (
    <div
      key={holiday._id}
      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-semibold text-slate-900">{formatDate(holiday.holiday)}</span>
        </div>
        <p className="text-sm text-slate-600">{holiday.reason || "No reason provided"}</p>
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              holiday.isRecurring
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-50 text-slate-600"
            }`}
          >
            {holiday.isRecurring ? (
              <>
                <Repeat className="h-3 w-3" />
                Recurring every year
              </>
            ) : (
              "One-time holiday"
            )}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => handleDelete(holiday._id)}
        disabled={deletingId === holiday._id}
        className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {deletingId === holiday._id ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Removing...
          </>
        ) : (
          <>
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Holiday Calendar</h1>
          <p className="text-sm text-slate-500">
            Configure non-working days. Recurring holidays automatically apply every year.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsHolidayModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Add Holiday
          </button>
          <button
            type="button"
            onClick={() => dispatch(fetchHolidays())}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-1">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-800">
                <Repeat className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-semibold">Recurring holidays</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviousYear}
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-sm font-semibold text-slate-700">{yearRange.display}</span>
                </div>
                
                <button
                  type="button"
                  onClick={handleNextYear}
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                {new Date().getFullYear() !== currentYear ? (
                  <button
                    type="button"
                    onClick={handleCurrentYear}
                    className="text-xs font-semibold text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50"
                  >
                    Current
                  </button>
                ) : null}
              </div>
            </div>
            {recurringHolidays.length === 0 ? (
              <p className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                <AlertCircle className="h-4 w-4" />
                No recurring holidays yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recurringHolidays.map((holiday) => renderHolidayRow(holiday))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="mb-4 flex items-center gap-2 text-slate-800">
              <CalendarDays className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-semibold">One-time holidays</h2>
            </header>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
              </div>
            ) : oneTimeHolidays.length === 0 ? (
              <p className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                <AlertCircle className="h-4 w-4" />
                No one-time holidays have been added for {yearRange.display}.
              </p>
            ) : (
              <div className="space-y-3">
                {oneTimeHolidays.map((holiday) => renderHolidayRow(holiday))}
              </div>
            )}
          </section>
        </div>
      </section>

      {/* Holiday Modal */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div className="flex items-center gap-2 text-slate-800">
                <CalendarDays className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold">Add Holiday</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsHolidayModalOpen(false)}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Holiday date</label>
                <input
                  type="date"
                  value={holidayDate}
                  onChange={(event) => setHolidayDate(event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Reason / description</label>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  className="mt-1 block w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Describe why this date is a holiday"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(event) => setIsRecurring(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Make this holiday recur every year</p>
                  <p className="text-sm text-slate-500">
                    Perfect for fixed dates like Christmas (Dec 25) or New Year (Jan 1).
                  </p>
                </div>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsHolidayModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving holiday...
                    </>
                  ) : (
                    "Save holiday"
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
