import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileUser,
  Building,
  CreditCard,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import {
  fetchCustomerDetailsByBvn,
  clearAdminLoanErrors,
} from "../../../redux/slices/adminLoanSlice";

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (_error) {
    return value;
  }
};

export default function CustomerDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bvn } = useParams();
  const downloadSectionRef = useRef(null);

  const {
    customerDetailsRecord,
    customerDetailsLoading,
    customerDetailsError,
  } = useSelector((state) => state.adminLoans);

  useEffect(() => {
    if (!bvn) {
      toast.error("Customer BVN is required");
      navigate("/admin/customers", { replace: true });
      return;
    }

    dispatch(fetchCustomerDetailsByBvn(bvn));
  }, [dispatch, bvn, navigate]);

  useEffect(() => {
    if (customerDetailsError) {
      toast.error(customerDetailsError);
      dispatch(clearAdminLoanErrors());
    }
  }, [customerDetailsError, dispatch]);

  const URL = "http://localhost:5000";
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return value;
    }
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(numeric);
  };

  const customerInfo = useMemo(() => {
    const details = customerDetailsRecord?.customerDetails || {};
    return [
      { label: "First name", value: details.firstName },
      { label: "Last name", value: details.lastName },
      { label: "Phone", value: details.phoneOne },
      { label: "Address", value: details.address },
      { label: "Date of birth", value: details.dateOfBirth },
      { label: "BVN", value: details.bvn },
      { label: "NIN", value: details.nin },
      { label: "Next of kin", value: details.NextOfKin },
      { label: "Next of kin phone", value: details.NextOfKinNumber },
    ];
  }, [customerDetailsRecord]);

  const businessInfo = useMemo(() => {
    const details = customerDetailsRecord?.businessDetails || {};
    return [
      { label: "Business name", value: details.businessName },
      { label: "Nature of business", value: details.natureOfBusiness },
      { label: "Business address", value: details.address },
      { label: "Years at location", value: details.yearsHere },
      { label: "Name known", value: details.nameKnown },
      { label: "Estimated value", value: details.estimatedValue },
    ];
  }, [customerDetailsRecord]);

  const bankInfo = useMemo(() => {
    const details = customerDetailsRecord?.bankDetails || {};
    return [
      { label: "Account name", value: details.accountName },
      { label: "Bank name", value: details.bankName },
      { label: "Account number", value: details.accountNo },
    ];
  }, [customerDetailsRecord]);

  const guarantorInfo = useMemo(() => {
    const details = customerDetailsRecord?.guarantorDetails || {};
    return [
      { label: "Name", value: details.name },
      { label: "Relationship", value: details.relationship },
      { label: "Phone", value: details.phone },
      { label: "Address", value: details.address },
      { label: "Years known", value: details.yearsKnown },
    ];
  }, [customerDetailsRecord]);

  const groupInfo = useMemo(() => {
    const details = customerDetailsRecord?.groupDetails || {};
    return [
      { label: "Group Name", value: details.groupName },
      { label: "Leader Name", value: details.leaderName },
      { label: "Leader Phone", value: details.mobileNo },
      { label: "Leader Address", value: details.address },
    ];
  }, [customerDetailsRecord]);

  const csoInfo = useMemo(() => {
    const { csoDetails = {} } = customerDetailsRecord || {};
    return [
      { label: "CSO name", value: csoDetails.name },
      { label: "CSO ID", value: csoDetails.id },
      { label: "Branch", value: csoDetails.branch },
    ];
  }, [customerDetailsRecord]);

  const loanInfo = useMemo(() => {
    const details = customerDetailsRecord?.loanDetails || {};
    return [
      { label: "Amount requested", value: formatCurrency(details.amountRequested) },
      { label: "Loan type", value: details.loanType },
      { label: "Loan duration", value: details.loanDuration },
      { label: "Daily payment", value: formatCurrency(details.dailyPayment?.[0]?.amount || details.dailyPaymentAmount) },
    ];
  }, [customerDetailsRecord]);

  const pictures = customerDetailsRecord?.pictures || {};
  const mediaItems = [
    { label: "Customer photo", url: pictures.customer },
    { label: "Business photo", url: pictures.business },
    { label: "Disclosure photo", url: pictures.disclosure },
    { label: "Customer signature", url: pictures.signature },
    {
      label: "Guarantor signature",
      url: customerDetailsRecord?.guarantorDetails?.signature,
    },
    {
      label: "CSO signature",
      url: customerDetailsRecord?.csoDetails?.signature,
    },
  ].filter((item) => item.url);

  const ensureImagesLoaded = async (node) => {
    if (!node) {
      return;
    }

    const images = Array.from(node.querySelectorAll("img"));
    if (!images.length) {
      return;
    }

    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              return resolve();
            }

            const handleResolve = () => {
              img.removeEventListener("load", handleResolve);
              img.removeEventListener("error", handleResolve);
              resolve();
            };

            img.addEventListener("load", handleResolve, { once: true });
            img.addEventListener("error", handleResolve, { once: true });
          })
      )
    );
  };

  const handleDownload = async () => {
    if (!customerDetailsRecord || !downloadSectionRef.current) {
      toast.error("Customer details are not loaded yet.");
      return;
    }

    const templateNode = downloadSectionRef.current;
    const clone = templateNode.cloneNode(true);
    const templateWidth = templateNode.style.width || "794px";
    const templatePadding = templateNode.style.padding || "32px";

    Object.assign(clone.style, {
      position: "absolute",
      left: "-9999px",
      top: "0",
      width: templateWidth,
      maxWidth: "none",
      opacity: "1",
      visibility: "visible",
      pointerEvents: "none",
      display: "block",
      zIndex: "9999",
      backgroundColor: "#ffffff",
      padding: templatePadding,
      boxSizing: "border-box",
    });

    document.body.appendChild(clone);

    await ensureImagesLoaded(clone);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    try {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `customer_${bvn}_details.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      };

      await html2pdf().set(opt).from(clone).save();
    } catch (error) {
      console.error("PDF download failed:", error);
      toast.error("Unable to generate PDF. Please try again.");
    } finally {
      document.body.removeChild(clone);
    }
  };

  const Section = ({ icon: Icon, title, items }) => (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-center gap-2 text-slate-800">
        <Icon className="h-5 w-5 text-indigo-500" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </header>
      <dl className="grid gap-4 md:grid-cols-2">
        {items.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">
              {value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );

  const renderContent = () => {
    if (customerDetailsLoading) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      );
    }

    if (!customerDetailsRecord) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
          No customer details available for this BVN.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Customer BVN</p>
              <h1 className="text-2xl font-semibold text-slate-900">{bvn}</h1>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-slate-400">Last updated</p>
              <p className="text-sm font-semibold text-slate-800">
                {formatDateTime(customerDetailsRecord.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        <Section icon={FileUser} title="Customer details" items={customerInfo} />
        <Section icon={Building} title="Business details" items={businessInfo} />
        <Section icon={CreditCard} title="Bank details" items={bankInfo} />
        <Section icon={ShieldCheck} title="Guarantor details" items={guarantorInfo} />
        <Section icon={Users} title="Group details" items={groupInfo} />
        <Section icon={UserCheck} title="CSO details" items={csoInfo} />
        <Section icon={UserCheck} title="Loan details" items={loanInfo} />

        {mediaItems.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="mb-4 text-lg font-semibold text-slate-900">
              Supporting media
            </header>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mediaItems.map(({ label, url }) => (
                <div key={label} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-xl border border-slate-200"
                  >
                    <img src={`${URL}${url}`} alt={label} className="h-48 w-full object-cover" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/customers")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to customers
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
            >
              Download customer form
            </button>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Latest submission
            </div>
          </div>
        </div>

        {customerDetailsError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>{customerDetailsError}</p>
            </div>
          </div>
        )}

        {renderContent()}
      </div>

      <div
        ref={downloadSectionRef}
        style={{
          width: "794px",
          maxWidth: "100%",
          backgroundColor: "#fff",
          color: "#1f2937",
          padding: "32px",
          fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          lineHeight: 1.4,
          pointerEvents: "none",
          opacity: 0,
          visibility: "hidden",
          display: "none",
        }}
      >
        {customerDetailsRecord && (
          <DownloadTemplate
            record={customerDetailsRecord}
            formatDateTime={formatDateTime}
            formatCurrency={formatCurrency}
            assetBaseUrl={URL}
          />
        )}
      </div>
    </>
  );
}

function DownloadTemplate({ record, formatDateTime, formatCurrency, assetBaseUrl }) {
  const headerColor = "#8aa322";
  const headingStyle = {
    backgroundColor: headerColor,
    color: "#fff",
    padding: "6px 12px",
    fontSize: "12px",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    fontWeight: 600,
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    border: "1px solid #d1d5db",
  };

  const fieldStyle = {
    padding: "8px 12px",
    borderRight: "1px solid #e5e7eb",
    borderBottom: "1px solid #e5e7eb",
    minHeight: "56px",
  };

  const labelStyle = {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#6b7280",
    marginBottom: "2px",
    fontWeight: 600,
  };

  const valueStyle = {
    fontSize: "13px",
    fontWeight: 600,
    color: "#111827",
  };

  const renderField = (label, value, span = 1) => (
    <div
      key={label}
      style={{
        ...fieldStyle,
        gridColumn: `span ${span} / span ${span}`,
      }}
    >
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value || "—"}</div>
    </div>
  );

  const customer = record.customerDetails || {};
  const business = record.businessDetails || {};
  const bank = record.bankDetails || {};
  const guarantor = record.guarantorDetails || {};

  const loan = record.loanDetails || {};
  const cso = record.csoDetails || {};
  const pictures = record.pictures || {};

  const customerFullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ");

  const documentSections = [
    {
      title: "Personal data information",
      fields: [
        { label: "Full name", value: customerFullName, span: 1 },
        { label: "NIN", value: customer.nin },
        { label: "Address", value: customer.address, span: 2 },
        { label: "Next of kin", value: customer.NextOfKin },
        { label: "Next of kin phone", value: customer.NextOfKinNumber },
        { label: "Mobile number", value: customer.phoneOne },
        { label: "Date of birth", value: customer.dateOfBirth },
      ],
    },
    {
      title: "Business details",
      fields: [
        { label: "Business name", value: business.businessName },
        { label: "Nature of business", value: business.natureOfBusiness },
        { label: "Business address", value: business.address, span: 2 },
        { label: "Years at location", value: business.yearsHere },
        { label: "Known as in area", value: business.nameKnown },
        { label: "Estimated worth", value: business.estimatedValue },
      ],
    },
    {
      title: "Loan details",
      fields: [
        { label: "Amount requested", value: formatCurrency(loan.amountRequested) },
        { label: "Loan type", value: loan.loanType },
        {
          label: "Daily payment",
          value: formatCurrency(loan.dailyPaymentAmount || loan.dailyPayment?.[0]?.amount),
        },
        { label: "Penalty", value: formatCurrency(loan.penalty) },
        { label: "Outstanding", value: formatCurrency(loan.outstandingBalance) },
      ],
    },
    {
      title: "Account details",
      fields: [
        { label: "Account name", value: bank.accountName },
        { label: "Account number", value: bank.accountNo },
        { label: "Bank name", value: bank.bankName },
      ],
    },
    {
      title: "Guarantor details",
      fields: [
        { label: "Guarantor name", value: guarantor.name },
        { label: "Relationship", value: guarantor.relationship },
        { label: "Address", value: guarantor.address, span: 2 },
        { label: "Phone number", value: guarantor.phone },
        { label: "Years known", value: guarantor.yearsKnown },
      ],
    },
    {
      title: "Group details",
      fields: [
        { label: "Group Name", value: (record.groupDetails || {}).groupName },
        { label: "Leader Name", value: (record.groupDetails || {}).leaderName },
        { label: "Leader Phone", value: (record.groupDetails || {}).mobileNo },
        { label: "Leader Address", value: (record.groupDetails || {}).address, span: 2 },
      ],
    },
    {
      title: "CSO details",
      fields: [
        { label: "CSO in charge", value: cso.name },
        { label: "CSO ID", value: cso.id },
        { label: "Branch", value: cso.branch },
        { label: "Date submitted", value: formatDateTime(record.createdAt) },
      ],
    },
  ];

  const signatureBlocks = [
    { label: "Customer signature", url: pictures.signature },
    { label: "CSO signature", url: cso.signature },
    { label: "Guarantor signature", url: guarantor.signature },
  ];

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "0.08em" }}>
            JK POS SOLUTION ENTERPRISES
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700 }}>Loan Application Form</div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            1, Adesuyi Street, Back of Path Filling Station, Oke-Ogun State
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>jkposltd.com</div>
        </div>
      </header>

      <section style={{ border: "1px solid #d1d5db", marginBottom: "16px" }}>
        <div style={headingStyle}>Form details</div>
        <div style={{ padding: "12px" }}>
          <div style={{ display: "flex", gap: "24px", fontSize: "13px", fontWeight: 600 }}>
            <p>
              CSO in charge: <span style={{ fontWeight: 700 }}>{cso.name || "—"}</span>
            </p>
            <p>
              Date submitted: <span style={{ fontWeight: 700 }}>{formatDateTime(record.createdAt)}</span>
            </p>
          </div>
        </div>
      </section>

      {documentSections.map((section) => (
        <section key={section.title} style={{ marginBottom: "16px" }}>
          <div style={headingStyle}>{section.title}</div>
          <div style={gridStyle}>
            {section.fields.map((field) => renderField(field.label, field.value, field.span || 1))}
          </div>
        </section>
      ))}

      <section style={{ marginBottom: "16px" }}>
        <div style={headingStyle}>Pictures</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "16px",
            padding: "16px",
          }}
        >
          {[{ label: "Customer picture", url: pictures.customer }, { label: "Business picture", url: pictures.business }].map(
            (item) => (
              <div key={item.label}>
                <div style={{ ...labelStyle, marginBottom: "8px" }}>{item.label}</div>
                {item.url ? (
                  <img
                    src={`${assetBaseUrl}${item.url}`}
                    alt={item.label}
                    crossOrigin="anonymous"
                    style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px" }}
                  />
                ) : (
                  <div style={{ border: "1px dashed #d1d5db", padding: "32px", textAlign: "center" }}>No image</div>
                )}
              </div>
            )
          )}
        </div>
      </section>

      <section style={{ marginBottom: "16px" }}>
        <div style={headingStyle}>Terms and conditions</div>
        <div style={{ padding: "16px", fontSize: "12px", color: "#374151" }}>
          <ol style={{ paddingLeft: "16px", display: "grid", gap: "8px" }}>
            <li>
              I affirm that every detail provided in this form is accurate, and I understand that supplying falsified
              information could lead to a rejection of my application.
            </li>
            <li>
              I acknowledge that the loan must be repaid according to the agreed schedule, and any default may attract
              penalties or legal action.
            </li>
            <li>
              I authorize JK POS Solution Enterprises to verify all information and contact any references provided.
            </li>
            <li>
              I understand that photographs, signatures, and supporting documents may be used to validate this
              application.
            </li>
            <li>
              I consent to the processing of my data for operational and compliance purposes.
            </li>
          </ol>
        </div>
      </section>

      <section>
        <div style={headingStyle}>Signatures</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "16px",
            padding: "16px",
          }}
        >
          {signatureBlocks.map((sign) => (
            <div key={sign.label} style={{ textAlign: "center" }}>
              {sign.url ? (
                <img
                  src={`${assetBaseUrl}${sign.url}`}
                  alt={sign.label}
                  crossOrigin="anonymous"
                  style={{ height: "80px", objectFit: "contain", margin: "0 auto" }}
                />
              ) : (
                <div
                  style={{
                    borderBottom: "1px solid #9ca3af",
                    height: "60px",
                    marginBottom: "12px",
                  }}
                />
              )}
              <div style={{ fontSize: "12px", fontWeight: 600 }}>{sign.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}