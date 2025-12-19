import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, Loader2, XCircle } from "lucide-react";
import {
  approveLoan,
  clearAdminLoanErrors,
  fetchLoanById,
  rejectLoan,
  resetLoanDetail,
} from "../../../redux/slices/adminLoanSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const resolveAssetUrl = (url) => {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

const formatCurrency = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(value);
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  try {
    return new Date(value).toLocaleString();
  } catch (_error) {
    return value;
  }
};

const MediaThumbnail = ({ url, alt }) => {
  const resolved = resolveAssetUrl(url);

  if (!resolved) {
    return "—";
  }

  return (
    <a
      href={resolved}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block w-max overflow-hidden rounded-lg border border-slate-200"
    >
      <img src={resolved} alt={alt} className="h-32 w-40 object-cover" />
    </a>
  );
};

const InfoSection = ({ title, items }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <header className="mb-4">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
    </header>
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map(({ label, value, render }) => {
        const content = render ? render() : value;

        return (
          <div key={label}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
            <dd className="mt-1 text-sm font-medium text-slate-700">{content ?? "—"}</dd>
          </div>
        );
      })}
    </dl>
  </section>
);

export default function NewLoanDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { detail, detailLoading, detailError, updating, updateError } = useSelector((state) => state.adminLoans);

  const [amountApproved, setAmountApproved] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!id) {
      navigate("/admin/loans", { replace: true });
      return () => {};
    }

    dispatch(fetchLoanById(id));

    return () => {
      dispatch(resetLoanDetail());
    };
  }, [dispatch, id, navigate]);

  useEffect(() => {
    if (detailError) {
      toast.error(detailError);
      dispatch(clearAdminLoanErrors());
    }
  }, [detailError, dispatch]);

  useEffect(() => {
    if (updateError) {
      toast.error(updateError);
      dispatch(clearAdminLoanErrors());
    }
  }, [updateError, dispatch]);

  useEffect(() => {
    if (!detail) {
      return;
    }

    const requestedAmount = detail?.loanDetails?.amountRequested;
    setAmountApproved(
      typeof requestedAmount === "number" && !Number.isNaN(requestedAmount) ? requestedAmount.toString() : ""
    );
    setRejectionReason("");
  }, [detail]);

  const customerInfo = useMemo(() => {
    const customer = detail?.customerDetails || {};
    const pictures = detail?.pictures || {};
    return [
      { label: "First name", value: customer.firstName },
      { label: "Last name", value: customer.lastName },
      { label: "Phone", value: customer.phoneOne },
      { label: "Address", value: customer.address },
      { label: "BVN", value: customer.bvn },
      { label: "Next of kin", value: customer.NextOfKin },
      { label: "Next of kin phone", value: customer.NextOfKinNumber },
      { label: "Date of birth", value: customer.dateOfBirth },
      {
        label: "Customer signature",
        render: () => <MediaThumbnail url={pictures.signature} alt="Customer signature" />,
      },
    ];
  }, [detail]);

  const businessInfo = useMemo(() => {
    const business = detail?.businessDetails || {};
    return [
      { label: "Business name", value: business.businessName },
      { label: "Nature of business", value: business.natureOfBusiness },
      { label: "Business address", value: business.address },
      { label: "Years at location", value: business.yearsHere },
      { label: "Name known", value: business.nameKnown },
      { label: "Estimated value", value: formatCurrency(business.estimatedValue) },
    ];
  }, [detail]);

  const bankInfo = useMemo(() => {
    const bank = detail?.bankDetails || {};
    return [
      { label: "Account name", value: bank.accountName },
      { label: "Bank name", value: bank.bankName },
      { label: "Account number", value: bank.accountNo },
    ];
  }, [detail]);

  const guarantorInfo = useMemo(() => {
    const guarantor = detail?.guarantorDetails || {};
    return [
      { label: "Guarantor name", value: guarantor.name },
      { label: "Relationship", value: guarantor.relationship },
      { label: "Phone", value: guarantor.phone },
      { label: "Address", value: guarantor.address },
      { label: "Years known", value: guarantor.yearsKnown },
      {
        label: "Guarantor signature",
        render: () => <MediaThumbnail url={guarantor.signature} alt="Guarantor signature" />,
      },
    ];
  }, [detail]);

  const csoInfo = useMemo(() => {
    return [
      { label: "CSO name", value: detail?.csoName },
      { label: "CSO ID", value: detail?.csoId },
      { label: "Branch", value: detail?.branch },
      {
        label: "CSO signature",
        render: () => <MediaThumbnail url={detail?.csoSignature} alt="CSO signature" />,
      },
    ];
  }, [detail]);

  const loanInfo = useMemo(() => {
    const loanDetails = detail?.loanDetails || {};
    return [
      { label: "Loan type", value: loanDetails.loanType },
      { label: "Amount requested", value: formatCurrency(loanDetails.amountRequested) },
      { label: "Amount approved", value: formatCurrency(loanDetails.amountApproved) },
      { label: "Interest", value: formatCurrency(loanDetails.interest) },
      { label: "Amount to be paid", value: formatCurrency(loanDetails.amountToBePaid) },
      { label: "Daily/Weekly amount", value: formatCurrency(loanDetails.dailyAmount) },
      { label: "Status", value: detail?.status },
      { label: "Submitted", value: formatDate(detail?.createdAt) },
    ];
  }, [detail]);

  const pictures = detail?.pictures || {};
  const previewItems = [
    { label: "Customer photo", url: pictures.customer },
    { label: "Business photo", url: pictures.business },
    { label: "Disclosure", url: pictures.disclosure },
  ].filter((item) => item.url);

  const handleApprove = async () => {
    const parsedAmount = Number(amountApproved);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Provide a valid approval amount greater than zero");
      return;
    }

    try {
      await dispatch(approveLoan({ loanId: detail._id, amountApproved: parsedAmount })).unwrap();
      toast.success("Loan approved");
      navigate("/admin/loans", { replace: true });
    } catch (error) {
      const message = typeof error === "string" ? error : "Unable to approve loan";
      toast.error(message);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Provide a reason for rejection");
      return;
    }

    try {
      await dispatch(rejectLoan({ loanId: detail._id, reason: rejectionReason.trim() })).unwrap();
      toast.success("Loan rejected");
      navigate("/admin/loans", { replace: true });
    } catch (error) {
      const message = typeof error === "string" ? error : "Unable to reject loan";
      toast.error(message);
    }
  };

  if (detailLoading || !detail) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-white px-6 py-4 text-sm text-slate-500 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
          Loading loan details...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/admin/loans")}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to waiting approvals
        </button>

        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Status: <span className="capitalize">{detail.status}</span>
        </span>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{detail.loanId || detail._id}</h1>
            <p className="text-sm text-slate-500">Submitted {formatDate(detail.createdAt)}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
              Requested: {formatCurrency(detail?.loanDetails?.amountRequested)}
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
              CSO: {detail.csoName || "—"}
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
              Branch: {detail.branch || "—"}
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700" htmlFor="amountApproved">
              Approve amount (₦)
            </label>
            <input
              id="amountApproved"
              type="number"
              min="0"
              value={amountApproved}
              onChange={(event) => setAmountApproved(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Enter amount"
              disabled={updating}
            />
            <button
              type="button"
              onClick={handleApprove}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
              disabled={updating}
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Approve loan
            </button>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700" htmlFor="rejectionReason">
              Reject loan (reason)
            </label>
            <textarea
              id="rejectionReason"
              rows={4}
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Provide context for rejection"
              disabled={updating}
            />
            <button
              type="button"
              onClick={handleReject}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
              disabled={updating}
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Reject loan
            </button>
          </div>
        </div>

        {detail.rejectionReason && (
          <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Previously rejected with reason: {detail.rejectionReason}
          </div>
        )}
      </section>

      <InfoSection title="CSO details" items={csoInfo} />
      <InfoSection title="Customer details" items={customerInfo} />
      <InfoSection title="Business details" items={businessInfo} />
      <InfoSection title="Bank details" items={bankInfo} />
      <InfoSection title="Guarantor details" items={guarantorInfo} />
      <InfoSection title="Loan details" items={loanInfo} />

      {previewItems.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Supporting media</h2>
            <p className="text-sm text-slate-500">Uploaded documents and signatures.</p>
          </header>
          <div className="grid gap-4 md:grid-cols-3">
            {previewItems.map(({ label, url }) => (
              <div key={label} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <a
                  href={resolveAssetUrl(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-lg border border-slate-200"
                >
                  <img
                    src={resolveAssetUrl(url)}
                    alt={label}
                    className="h-48 w-full object-cover"
                  />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
