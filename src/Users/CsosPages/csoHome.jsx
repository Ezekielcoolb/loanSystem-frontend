import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import SignatureCanvas from "react-signature-canvas";
import { Plus, Upload, Loader2, X, AlertCircle, CheckCircle2, Clock, FileText, Sparkles, ListChecks } from "lucide-react";
import { clearLoanError, fetchCsoLoans, submitLoan } from "../../redux/slices/loanSlice";
import { uploadImages } from "../../redux/slices/uploadSlice";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const TOTAL_STEPS = 2;

const STEP_ITEMS = [
  {
    id: 1,
    title: "Customer & guarantor",
    description: "Borrower details and guarantor contacts",
  },
  {
    id: 2,
    title: "Bank, loan & uploads",
    description: "Financial details, media uploads, and signatures",
  },
];

const MEDIA_UPLOAD_CONFIG = {
  customer: {
    label: "Customer photo",
    description: "Upload a clear photo of the borrower.",
    folder: "customer",
  },
  business: {
    label: "Business photo",
    description: "Show the business location or assets.",
    folder: "business",
  },
  disclosure: {
    label: "Disclosure document",
    description: "Upload the signed disclosure form.",
    folder: "disclosure",
  },
};

const REQUIRED_UPLOAD_KEYS = ["customer", "business", "disclosure"];

const SIGNATURE_UPLOAD_FOLDER = "signatures";
const MEDIA_UPLOAD_KEYS = Object.keys(MEDIA_UPLOAD_CONFIG);

const createInitialFormState = () => ({
  customerDetails: {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phoneOne: "",
    address: "",
    bvn: "",
    NextOfKin: "",
    NextOfKinNumber: "",
  },
  businessDetails: {
    businessName: "",
    natureOfBusiness: "",
    address: "",
    yearsHere: "",
    nameKnown: "",
    estimatedValue: "",
  },
  bankDetails: {
    accountName: "",
    bankName: "",
    accountNo: "",
  },
  loanDetails: {
    amountRequested: "",
    loanType: "daily",
    amountToBePaid: "",
    dailyAmount: "",
  },
  guarantorDetails: {
    name: "",
    address: "",
    phone: "",
    relationship: "",
    yearsKnown: "",
    signature: "",
  },
  pictures: {
    customer: "",
    business: "",
    disclosure: "",
    signature: "",
  },
});

const REQUIRED_FIELDS = [
  { section: "customerDetails", field: "firstName", label: "Customer first name" },
  { section: "customerDetails", field: "lastName", label: "Customer last name" },
  { section: "customerDetails", field: "phoneOne", label: "Customer phone number" },
  { section: "customerDetails", field: "address", label: "Customer address" },
  { section: "customerDetails", field: "bvn", label: "Customer BVN" },
  { section: "customerDetails", field: "NextOfKin", label: "Next of kin" },
  { section: "customerDetails", field: "NextOfKinNumber", label: "Next of kin phone" },
  { section: "businessDetails", field: "businessName", label: "Business name" },
  { section: "businessDetails", field: "natureOfBusiness", label: "Nature of business" },
  { section: "businessDetails", field: "address", label: "Business address" },
  { section: "businessDetails", field: "nameKnown", label: "How well known is the name" },
  { section: "bankDetails", field: "accountName", label: "Account name" },
  { section: "bankDetails", field: "bankName", label: "Bank name" },
  { section: "bankDetails", field: "accountNo", label: "Account number" },
  { section: "guarantorDetails", field: "name", label: "Guarantor name" },
  { section: "guarantorDetails", field: "address", label: "Guarantor address" },
  { section: "guarantorDetails", field: "phone", label: "Guarantor phone" },
  { section: "guarantorDetails", field: "relationship", label: "Guarantor relationship" },
  { section: "guarantorDetails", field: "yearsKnown", label: "Years known" },
];

const STEP1_REQUIRED_FIELDS = REQUIRED_FIELDS.filter(({ section }) =>
  ["customerDetails", "businessDetails", "guarantorDetails"].includes(section)
);

const STEP2_REQUIRED_FIELDS = REQUIRED_FIELDS.filter(({ section }) => section === "bankDetails");

const LOAN_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

const CUSTOMER_FIELDS = [
  { key: "firstName", label: "First name", type: "text", placeholder: "Customer first name" },
  { key: "lastName", label: "Last name", type: "text", placeholder: "Customer last name" },
  { key: "dateOfBirth", label: "Date of birth", type: "date" },
  { key: "phoneOne", label: "Phone number", type: "tel", placeholder: "0801 234 5678" },
  { key: "address", label: "Residential address", type: "text", colSpan: 2, placeholder: "Street, city, state" },
  { key: "bvn", label: "BVN", type: "text", placeholder: "Enter BVN" },
  { key: "NextOfKin", label: "Next of kin", type: "text", placeholder: "Next of kin name" },
  { key: "NextOfKinNumber", label: "Next of kin phone", type: "tel", placeholder: "0801 234 5678" },
];

const BUSINESS_FIELDS = [
  { key: "businessName", label: "Business name", type: "text" },
  { key: "natureOfBusiness", label: "Nature of business", type: "text", placeholder: "Retail, services, etc." },
  { key: "address", label: "Business address", type: "text", colSpan: 2, placeholder: "Shop address" },
  { key: "yearsHere", label: "Years at location", type: "number", min: 0, placeholder: "0" },
  { key: "nameKnown", label: "How well known is the name?", type: "text", placeholder: "Popular in the market" },
  { key: "estimatedValue", label: "Estimated business value (₦)", type: "number", min: 0, placeholder: "Optional" },
];

const GUARANTOR_FIELDS = [
  { key: "name", label: "Guarantor name", type: "text" },
  { key: "phone", label: "Guarantor phone", type: "tel", placeholder: "0801 234 5678" },
  { key: "address", label: "Guarantor address", type: "text", colSpan: 2, placeholder: "Residential address" },
  { key: "relationship", label: "Relationship", type: "text", placeholder: "Brother, friend, etc." },
  { key: "yearsKnown", label: "Years known", type: "number", min: 0, placeholder: "0" },
];

const BANK_FIELDS = [
  { key: "accountName", label: "Account name", type: "text" },
  { key: "bankName", label: "Bank name", type: "text" },
  { key: "accountNo", label: "Account number", type: "text", inputMode: "numeric", colSpan: 2, placeholder: "0123456789" },
];

const STATUS_BADGE_STYLES = {
  "waiting for approval": "bg-amber-500",
  approved: "bg-emerald-500",
  "active loan": "bg-indigo-500",
  "fully paid": "bg-teal-500",
  rejected: "bg-rose-500",
  edited: "bg-slate-500",
};

function getStatusBadgeClass(status) {
  const normalized = typeof status === "string" ? status.toLowerCase() : "";
  return STATUS_BADGE_STYLES[normalized] || "bg-slate-400";
}

function resolveAssetUrl(url) {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

import { fetchCsoProfile } from "../../redux/slices/csoSlice";

export default function CsoHome() {
  const dispatch = useDispatch();
  const { loans, loading, submitting, error } = useSelector((state) => state.loan);
  const { token } = useSelector((state) => state.csoAuth);
  const { profile: csoProfile } = useSelector((state) => state.cso);
  const { imageUploadLoading } = useSelector((state) => state.upload);

  const [form, setForm] = useState(createInitialFormState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingFromModal, setIsSubmittingFromModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeUploadTarget, setActiveUploadTarget] = useState(null);
  const [loanStatusModal, setLoanStatusModal] = useState(null);
  
  // Blocking Modal State
  const [showBlockingModal, setShowBlockingModal] = useState(false);
  const [blockingModalType, setBlockingModalType] = useState(null); // 'missing' | 'partial'

  const navigate = useNavigate();

  const customerSignatureRef = useRef(null);
  const guarantorSignatureRef = useRef(null);

  console.log(loans);

  useEffect(() => {
    if (token) {
      dispatch(fetchCsoLoans());
      dispatch(fetchCsoProfile());
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (csoProfile) {
        checkYesterdayRemittance(csoProfile);
    }
  }, [csoProfile]);

  const checkYesterdayRemittance = (profile) => {
    if (!profile || !profile.remittance) return;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    
    const yesterdayRemittances = profile.remittance.filter(r => {
        const rDate = new Date(r.date).toISOString().slice(0, 10);
        return rDate === yesterdayStr;
    });

    // Case 1: No remittance record at all for yesterday
    if (yesterdayRemittances.length === 0) {
        setBlockingModalType('missing');
        setShowBlockingModal(true);
        return;
    }

    // Case 2: Remittance exists, check if resolved
    const isResolved = yesterdayRemittances.some(r => r.resolvedIssue);
    if (isResolved) {
        setShowBlockingModal(false);
        return;
    }

    // Case 3: Check for partial payment
    const amountCollected = Math.max(...yesterdayRemittances.map(r => Number(r.amountCollected) || 0));
    const totalPaid = yesterdayRemittances.reduce((sum, r) => sum + (Number(r.amountPaid) || 0), 0);

    if (totalPaid < amountCollected) {
        setBlockingModalType('partial');
        setShowBlockingModal(true);
    } else {
        setShowBlockingModal(false);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearLoanError());
    }
  }, [error, dispatch]);

  const handleNestedChange = (section, field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const step1Valid = useMemo(() => {
    return STEP1_REQUIRED_FIELDS.every(({ section, field }) => {
      const candidate = form[section]?.[field];
      return typeof candidate === "string" ? candidate.trim().length > 0 : Boolean(candidate);
    });
  }, [form]);

  const step2Valid = useMemo(() => {
    const hasRequiredStrings = STEP2_REQUIRED_FIELDS.every(({ section, field }) => {
      const candidate = form[section]?.[field];
      return typeof candidate === "string" ? candidate.trim().length > 0 : Boolean(candidate);
    });

    const amountRequested = toNumber(form.loanDetails.amountRequested);
    const businessYears = toNumber(form.businessDetails.yearsHere);
    const estimatedValue = toNumber(form.businessDetails.estimatedValue);
    const amountToBePaid = toNumber(form.loanDetails.amountToBePaid);
    const dailyAmount = toNumber(form.loanDetails.dailyAmount);
    const yearsKnown = toNumber(form.guarantorDetails.yearsKnown);

    const sanitizedPictures = Object.entries(form.pictures).reduce((acc, [key, value]) => {
      if (typeof value === "string" && value.trim()) {
        acc[key] = value.trim();
      }
      return acc;
    }, {});

    const payload = {
      customerDetails: {
        firstName: form.customerDetails.firstName.trim(),
        lastName: form.customerDetails.lastName.trim(),
        dateOfBirth: form.customerDetails.dateOfBirth.trim() || undefined,
        phoneOne: form.customerDetails.phoneOne.trim(),
        address: form.customerDetails.address.trim(),
        bvn: form.customerDetails.bvn.trim(),
        NextOfKin: form.customerDetails.NextOfKin.trim(),
        NextOfKinNumber: form.customerDetails.NextOfKinNumber.trim(),
      },
      businessDetails: {
        businessName: form.businessDetails.businessName.trim(),
        natureOfBusiness: form.businessDetails.natureOfBusiness.trim(),
        address: form.businessDetails.address.trim(),
        nameKnown: form.businessDetails.nameKnown.trim(),
        ...(businessYears !== undefined ? { yearsHere: businessYears } : {}),
        ...(estimatedValue !== undefined ? { estimatedValue } : {}),
      },
      bankDetails: {
        accountName: form.bankDetails.accountName.trim(),
        bankName: form.bankDetails.bankName.trim(),
        accountNo: form.bankDetails.accountNo.trim(),
      },
      loanDetails: {
        amountRequested,
        loanType: form.loanDetails.loanType,
        ...(amountToBePaid !== undefined ? { amountToBePaid } : {}),
        ...(dailyAmount !== undefined ? { dailyAmount } : {}),
      },
      guarantorDetails: {
        name: form.guarantorDetails.name.trim(),
        address: form.guarantorDetails.address.trim(),
        phone: form.guarantorDetails.phone.trim(),
        relationship: form.guarantorDetails.relationship.trim(),
        yearsKnown,
        signature: form.guarantorDetails.signature?.trim() || undefined,
      },
      pictures: sanitizedPictures,
    };

    return (
      hasRequiredStrings &&
      amountRequested &&
      amountRequested > 0 &&
      Boolean(form.loanDetails.loanType) &&
      yearsKnown !== undefined &&
      yearsKnown >= 0 &&
      REQUIRED_UPLOAD_KEYS.every((key) => form.pictures[key]) &&
      Boolean(form.pictures.signature) &&
      Boolean(form.guarantorDetails.signature)
    );
  }, [form]);

  console.log(step1Valid, step2Valid);
  const isUploading = imageUploadLoading || Boolean(activeUploadTarget);

  const isSubmitDisabled = submitting || isUploading || !step1Valid || !step2Valid;

  const describeMissingStep1 = () => {
    const missing = STEP1_REQUIRED_FIELDS.filter(({ section, field }) => {
      const candidate = form[section]?.[field];
      return !(typeof candidate === "string" ? candidate.trim().length > 0 : Boolean(candidate));
    });

    if (missing.length === 0) return null;

    const labels = missing.map(({ label }) => label);
    return `Fill these fields: ${labels.join(", ")}`;
  };

  const describeMissingStep2 = () => {
    const missing = STEP2_REQUIRED_FIELDS.filter(({ section, field }) => {
      const candidate = form[section]?.[field];
      return !(typeof candidate === "string" ? candidate.trim().length > 0 : Boolean(candidate));
    });

    const uploadIssues = REQUIRED_UPLOAD_KEYS.filter((key) => !form.pictures[key]);
    const signatureMissing = !form.pictures.signature;
    const guarantorSignatureMissing = !form.guarantorDetails.signature;

    const messages = [];

    if (missing.length > 0) {
      messages.push(`Bank details: ${missing.map(({ label }) => label).join(", ")}`);
    }

    if (uploadIssues.length > 0) {
      messages.push(`Uploads required for: ${uploadIssues.join(", ")}`);
    }

    if (signatureMissing) {
      messages.push("Customer signature upload is required");
    }

    if (guarantorSignatureMissing) {
      messages.push("Guarantor signature upload is required");
    }

    if (!messages.length) {
      return null;
    }

    return messages.join(". ");
  };

  const resetSignatures = () => {
    customerSignatureRef.current?.clear();
    guarantorSignatureRef.current?.clear();
  };

  const resetForm = () => {
    setForm(createInitialFormState());
    setCurrentStep(1);
    resetSignatures();
    setActiveUploadTarget(null);
  };

  const closeModal = () => {
    if (!submitting) {
      setIsModalOpen(false);
      setIsSubmittingFromModal(false);
      resetForm();
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const goToNextStep = () => {
    if (currentStep === 1 && !step1Valid) {
      const summary = describeMissingStep1();
      toast.error(summary || "Fill in all required customer, business, and guarantor details before continuing");
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleUpload = async (event, targetKey, folderName) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    try {
      setActiveUploadTarget(targetKey);
      const { urls } = await dispatch(uploadImages({ files, folderName, target: targetKey })).unwrap();
      setForm((prev) => ({
        ...prev,
        pictures: {
          ...prev.pictures,
          [targetKey]: urls[0],
        },
      }));
      toast.success("Upload completed");
    } catch (uploadError) {
      const message = typeof uploadError === "string" ? uploadError : "Upload failed";
      toast.error(message);
    } finally {
      setActiveUploadTarget(null);
      event.target.value = "";
    }
  };

  const handleSignatureUpload = async (canvasRef, { uploadKey, applyToForm }) => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.isEmpty()) {
      toast.error("Draw the signature before uploading");
      return;
    }

    const dataUrl = canvas.toDataURL("image/png");

    try {
      setActiveUploadTarget(uploadKey);
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `${uploadKey}-signature.png`, { type: "image/png" });

      const { urls } = await dispatch(
        uploadImages({ files: [file], folderName: SIGNATURE_UPLOAD_FOLDER, target: uploadKey })
      ).unwrap();

      const uploadedUrl = urls[0];
      setForm((prev) => applyToForm(prev, uploadedUrl));

      toast.success("Signature uploaded");
    } catch (signatureError) {
      const message = typeof signatureError === "string" ? signatureError : "Unable to upload signature";
      toast.error(message);
    } finally {
      setActiveUploadTarget(null);
    }
  };

  const clearSignaturePad = (canvasRef) => {
    canvasRef.current?.clear();
  };

  const removeUploadedMedia = (key) => {
    setForm((prev) => ({
      ...prev,
      pictures: {
        ...prev.pictures,
        [key]: "",
      },
    }));
  };

  const removeSignature = (type) => {
    setForm((prev) => {
      if (type === "customer") {
        return {
          ...prev,
          pictures: {
            ...prev.pictures,
            signature: "",
          },
        };
      }

      if (type === "guarantor") {
        return {
          ...prev,
          guarantorDetails: {
            ...prev.guarantorDetails,
            signature: "",
          },
        };
      }

      return prev;
    });

    if (type === "customer") {
      customerSignatureRef.current?.clear();
    } else if (type === "guarantor") {
      guarantorSignatureRef.current?.clear();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (currentStep !== TOTAL_STEPS) {
      toast.error("Complete all steps before submitting");
      return;
    }

    if (!step1Valid || !step2Valid) {
      const summary = describeMissingStep2();
      toast.error(summary || "Resolve all outstanding fields before submitting");
      return;
    }

    const amountRequested = toNumber(form.loanDetails.amountRequested);
    const businessYears = toNumber(form.businessDetails.yearsHere);
    const estimatedValue = toNumber(form.businessDetails.estimatedValue);
    const amountToBePaid = toNumber(form.loanDetails.amountToBePaid);
    const dailyAmount = toNumber(form.loanDetails.dailyAmount);
    const yearsKnown = toNumber(form.guarantorDetails.yearsKnown);

    const sanitizedPictures = Object.entries(form.pictures).reduce((acc, [key, value]) => {
      if (typeof value === "string" && value.trim()) {
        acc[key] = value.trim();
      }
      return acc;
    }, {});

    const payload = {
      customerDetails: {
        firstName: form.customerDetails.firstName.trim(),
        lastName: form.customerDetails.lastName.trim(),
        dateOfBirth: form.customerDetails.dateOfBirth.trim() || undefined,
        phoneOne: form.customerDetails.phoneOne.trim(),
        address: form.customerDetails.address.trim(),
        bvn: form.customerDetails.bvn.trim(),
        NextOfKin: form.customerDetails.NextOfKin.trim(),
        NextOfKinNumber: form.customerDetails.NextOfKinNumber.trim(),
      },
      businessDetails: {
        businessName: form.businessDetails.businessName.trim(),
        natureOfBusiness: form.businessDetails.natureOfBusiness.trim(),
        address: form.businessDetails.address.trim(),
        nameKnown: form.businessDetails.nameKnown.trim(),
        ...(businessYears !== undefined ? { yearsHere: businessYears } : {}),
        ...(estimatedValue !== undefined ? { estimatedValue } : {}),
      },
      bankDetails: {
        accountName: form.bankDetails.accountName.trim(),
        bankName: form.bankDetails.bankName.trim(),
        accountNo: form.bankDetails.accountNo.trim(),
      },
      loanDetails: {
        amountRequested,
        loanType: form.loanDetails.loanType,
        ...(amountToBePaid !== undefined ? { amountToBePaid } : {}),
        ...(dailyAmount !== undefined ? { dailyAmount } : {}),
      },
      guarantorDetails: {
        name: form.guarantorDetails.name.trim(),
        address: form.guarantorDetails.address.trim(),
        phone: form.guarantorDetails.phone.trim(),
        relationship: form.guarantorDetails.relationship.trim(),
        yearsKnown,
        signature: form.guarantorDetails.signature?.trim() || undefined,
      },
      pictures: sanitizedPictures,
    };

    try {
      setIsSubmittingFromModal(true);
      await dispatch(submitLoan(payload)).unwrap();
      toast.success("Loan submitted successfully");
      closeModal();
    } catch (submissionError) {
      const message = typeof submissionError === "string" ? submissionError : "Unable to submit loan";
      toast.error(message);
    } finally {
      setIsSubmittingFromModal(false);
    }
  };

  const handleLoanCardClick = (loan) => {
    if (!loan) {
      return;
    }

    const status = loan.status;

    if (status === "waiting for approval") {
      setLoanStatusModal({
        title: "Waiting for approval",
        message: "This loan is pending admin review. Please wait for approval.",
        bvn: loan?.customerDetails?.bvn,
        icon: <Clock className="h-10 w-10 text-amber-500" />,
      });
      return;
    }

    if (status === "approved") {
      setLoanStatusModal({
        title: "Awaiting disbursement",
        message: "This loan has been approved. An admin will disburse the funds soon.",
        bvn: loan?.customerDetails?.bvn,
        icon: <CheckCircle2 className="h-10 w-10 text-emerald-500" />,
      });
      return;
    }

    if (status === "rejected") {
      setLoanStatusModal({
        title: "Loan rejected",
        message: loan.rejectionReason
          ? `Reason provided: ${loan.rejectionReason}`
          : "This loan was rejected by admin.",
        bvn: loan?.customerDetails?.bvn,
        icon: <AlertCircle className="h-10 w-10 text-rose-500" />,
      });
      return;
    }

    if (status === "active loan") {
      navigate(`/cso/loans/${loan._id}`);
      return;
    }

    setLoanStatusModal({
      title: "Loan status",
      message: `Current status: ${status}`,
      icon: <FileText className="h-10 w-10 text-indigo-500" />,
    });
  };

  const handleGiveNewLoan = (event, loan) => {
    event.stopPropagation();
    if (!loan) {
      return;
    }

    navigate(`/cso/loans/${loan._id}/new-loan`, { state: { previousLoan: loan } });
  };

  const handleViewCustomerHistory = (bvn) => {
    if (!bvn) {
      toast.error("Customer BVN unavailable");
      return;
    }

    setLoanStatusModal(null);
    navigate(`/cso/customers/${bvn}/loans`);
  };

  const renderLoanCard = (loan) => {
    const customer = loan?.customerDetails || {};
    const business = loan?.businessDetails || {};
    const businessImage = resolveAssetUrl(loan?.pictures?.customer) || resolveAssetUrl(loan?.pictures?.business);
    const statusLabel = loan?.status || "waiting for approval";
    const statusClass = getStatusBadgeClass(statusLabel);

    return (
      <article
        key={loan?._id || loan?.loanId}
        className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        onClick={() => handleLoanCardClick(loan)}
      >
        <div className="relative aspect-square w-full">
          <div
            className="absolute inset-0"
            style={
              businessImage
                ? {
                    backgroundImage: `linear-gradient(200deg, rgba(15,23,42,0.6), rgba(15,23,42,0.05)), url(${businessImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : { backgroundColor: "#e2e8f0" }
            }
          />
          <span
            className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-2 py-2 text-xs uppercase tracking-wide shadow sm:px-3 sm:py-1"
            aria-label={`Loan status: ${statusLabel}`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${statusClass}`} />
            <span className="hidden font-semibold text-slate-700 sm:inline">{statusLabel}</span>
          </span>
        </div>

        <div className="space-y-2 p-4">
          <h3 className="text-sm font-semibold leading-tight text-slate-900">
            {[customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Unnamed customer"}
          </h3>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {business.natureOfBusiness || business.businessName || "Business type unavailable"}
          </p>
          <p className="text-xs font-semibold text-slate-600">
            Loan type: <span className="capitalize">{loan?.loanDetails?.loanType || "—"}</span>
          </p>
          {statusLabel === "fully paid" && (
            <button
              type="button"
              onClick={(event) => handleGiveNewLoan(event, loan)}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Sparkles className="h-3.5 w-3.5" /> Give new loan
            </button>
          )}
          {loan?.customerDetails?.bvn && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleViewCustomerHistory(loan.customerDetails.bvn);
              }}
              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-400 hover:text-indigo-600"
            >
              <ListChecks className="h-3.5 w-3.5" /> Loan history
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-10 relative">
      {/* Blocking Modal for Missing Remittance */}
      {showBlockingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900">Action Required</h2>
            {blockingModalType === 'missing' ? (
                <p className="text-slate-600">
                    You did not submit remittance for yesterday. Please contact the admin immediately to resolve this issue.
                </p>
            ) : (
                <div className="space-y-4">
                    <p className="text-slate-600">
                        Your remittance for yesterday is incomplete. Please complete the payment to continue.
                    </p>
                    <button
                        onClick={() => navigate('/cso/collections')}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                        Go to Remittance Page
                    </button>
                </div>
            )}
          </div>
        </div>
      )}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Your loan submissions</h1>
          <p className="text-sm text-slate-500">Review your customers and follow up approvals.</p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          Submit new loan
        </button>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between text-sm text-slate-500">
          {loading ? (
            <span className="inline-flex items-center gap-2 text-indigo-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Fetching loans...
            </span>
          ) : (
            <span>{loans.length} loan(s)</span>
          )}
        </div>

        {loans.length === 0 && !loading ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
            <p className="text-base font-medium">No loans submitted yet.</p>
            <p className="text-sm">Use the button above to submit your first loan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {loans.map(renderLoanCard)}
          </div>
        )}
      </section>

      {loanStatusModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setLoanStatusModal(null)}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setLoanStatusModal(null)}
                className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close status modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center gap-4 text-center text-slate-600">
                <div className="rounded-full bg-slate-100 p-4">{loanStatusModal.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{loanStatusModal.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed">{loanStatusModal.message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={closeModal}
          />

          <div className="absolute inset-0 overflow-y-auto">
            <div className="flex min-h-full items-start justify-center p-6">
              <div className="relative w-full max-w-5xl rounded-3xl bg-white p-6 shadow-xl">
                <div className="sticky -top-6 mb-4 flex items-center justify-between rounded-3xl bg-white/90 px-4 py-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Submit a new loan</h2>
                    <p className="text-sm text-slate-500">
                      Capture borrower, business, and guarantor details. Form amount is fixed at ₦2,000.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    aria-label="Close loan submission form"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="flex gap-3 rounded-2xl bg-slate-50 p-3 text-xs font-medium text-slate-500">
                    {STEP_ITEMS.map((item) => (
                      <div key={item.id} className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold sm:h-7 sm:w-7 ${
                            currentStep === item.id
                              ? "bg-indigo-600 text-white"
                              : item.id < currentStep
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-white text-slate-400"
                          }`}
                        >
                          {item.id}
                        </div>
                        <div className="hidden text-center sm:block sm:text-left">
                          <p className="font-semibold text-slate-700">{item.title}</p>
                          <p className="text-[11px] text-slate-500">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {currentStep === 1 && (
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">Customer information</h2>
                          <p className="text-sm text-slate-500">Provide the borrower’s personal details and next of kin.</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          {CUSTOMER_FIELDS.map((field) => (
                            <div key={field.key} className={field.colSpan ? "sm:col-span-2" : undefined}>
                              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor={`customer-${field.key}`}>
                                {field.label}
                                <input
                                  id={`customer-${field.key}`}
                                  type={field.type}
                                  value={form.customerDetails[field.key]}
                                  onChange={handleNestedChange("customerDetails", field.key)}
                                  placeholder={field.placeholder}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                />
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">Business & guarantor</h2>
                          <p className="text-sm text-slate-500">Outline the business operations and provide guarantor support.</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          {BUSINESS_FIELDS.map((field) => (
                            <div key={field.key} className={field.colSpan ? "sm:col-span-2" : undefined}>
                              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor={`business-${field.key}`}>
                                {field.label}
                                <input
                                  id={`business-${field.key}`}
                                  type={field.type}
                                  min={field.min}
                                  value={form.businessDetails[field.key]}
                                  onChange={handleNestedChange("businessDetails", field.key)}
                                  placeholder={field.placeholder}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                />
                              </label>
                            </div>
                          ))}

                          {GUARANTOR_FIELDS.map((field) => (
                            <div key={field.key} className={field.colSpan ? "sm:col-span-2" : undefined}>
                              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor={`guarantor-${field.key}`}>
                                {field.label}
                                <input
                                  id={`guarantor-${field.key}`}
                                  type={field.type}
                                  min={field.min}
                                  value={form.guarantorDetails[field.key]}
                                  onChange={handleNestedChange("guarantorDetails", field.key)}
                                  placeholder={field.placeholder}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                />
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">Bank details</h2>
                          <p className="text-sm text-slate-500">Settlement account for approved disbursement.</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          {BANK_FIELDS.map((field) => (
                            <div key={field.key} className={field.colSpan ? "sm:col-span-2" : undefined}>
                              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor={`bank-${field.key}`}>
                                {field.label}
                                <input
                                  id={`bank-${field.key}`}
                                  type={field.type}
                                  inputMode={field.inputMode}
                                  value={form.bankDetails[field.key]}
                                  onChange={handleNestedChange("bankDetails", field.key)}
                                  placeholder={field.placeholder}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                />
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">Loan details</h2>
                          <p className="text-sm text-slate-500">Provide request specifics alongside supporting assets.</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor="loan-amountRequested">
                            Amount requested (₦)
                            <input
                              id="loan-amountRequested"
                              type="number"
                              min="0"
                              value={form.loanDetails.amountRequested}
                              onChange={handleNestedChange("loanDetails", "amountRequested")}
                              placeholder="0"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                          </label>

                          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor="loan-loanType">
                            Loan type
                            <select
                              id="loan-loanType"
                              value={form.loanDetails.loanType}
                              onChange={handleNestedChange("loanDetails", "loanType")}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            >
                              {LOAN_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </label>

                          {/* <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor="loan-amountToBePaid">
                            Amount to be paid (₦)
                            <input
                              id="loan-amountToBePaid"
                              type="number"
                              min="0"
                              value={form.loanDetails.amountToBePaid}
                              onChange={handleNestedChange("loanDetails", "amountToBePaid")}
                              placeholder="Optional"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                          </label>

                          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor="loan-dailyAmount">
                            Daily/weekly amount (₦)
                            <input
                              id="loan-dailyAmount"
                              type="number"
                              min="0"
                              value={form.loanDetails.dailyAmount}
                              onChange={handleNestedChange("loanDetails", "dailyAmount")}
                              placeholder="Optional"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                          </label> */}
                        </div>
                      </div>

                      <div className="space-y-4 lg:col-span-2">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">Uploads</h2>
                          <p className="text-sm text-slate-500">Attach supporting photos and signatures. Uploaded files are stored and linked to this loan.</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {MEDIA_UPLOAD_KEYS.map((key) => {
                            const config = MEDIA_UPLOAD_CONFIG[key];
                            const currentUrl = form.pictures[key];
                            const isProcessing = activeUploadTarget === key;

                            return (
                              <div key={key} className="rounded-2xl border border-slate-200 p-4">
                                <p className="text-sm font-semibold text-slate-800">{config.label}</p>
                                <p className="mb-3 text-xs text-slate-500">{config.description}</p>

                                {currentUrl ? (
                                  <div className="space-y-3">
                                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                      <img
                                        src={resolveAssetUrl(currentUrl)}
                                        alt={`${config.label} upload`}
                                        className="h-32 w-full object-cover"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeUploadedMedia(key)}
                                      className="text-xs font-semibold text-rose-600 hover:underline"
                                      disabled={isUploading}
                                    >
                                      Remove and re-upload
                                    </button>
                                  </div>
                                ) : (
                                  <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50">
                                    <span className="text-xs font-semibold text-indigo-600">Click to upload</span>
                                    <span className="text-[11px] text-slate-500">JPG, PNG, or PDF files allowed</span>
                                    <input
                                      type="file"
                                      accept="image/*,application/pdf"
                                      className="hidden"
                                      onChange={(event) => handleUpload(event, key, config.folder)}
                                      disabled={isUploading}
                                    />
                                  </label>
                                )}

                                {isProcessing && (
                                  <p className="mt-2 text-xs text-indigo-600">Uploading...</p>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">Customer signature</p>
                                <p className="text-xs text-slate-500">Draw the customer’s signature directly on the pad.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => clearSignaturePad(customerSignatureRef)}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                              >
                                Clear
                              </button>
                            </div>

                            <SignatureCanvas
                              ref={customerSignatureRef}
                              penColor="#111827"
                              canvasProps={{ className: "h-40 w-full rounded-xl border border-slate-200 bg-white" }}
                            />

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSignatureUpload(customerSignatureRef, {
                                    uploadKey: "signature",
                                    applyToForm: (prev, url) => ({
                                      ...prev,
                                      pictures: {
                                        ...prev.pictures,
                                        signature: url,
                                      },
                                    }),
                                  })
                                }
                                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                                disabled={isUploading}
                              >
                                Upload signature
                              </button>
                              {form.pictures.signature && (
                                <button
                                  type="button"
                                  onClick={() => removeSignature("customer")}
                                  className="text-xs font-semibold text-rose-600 hover:underline"
                                  disabled={isUploading}
                                >
                                  Remove uploaded signature
                                </button>
                              )}
                            </div>

                            {form.pictures.signature && (
                              <p className="text-[11px] text-slate-500">Uploaded to: {form.pictures.signature}</p>
                            )}
                          </div>

                          <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">Guarantor signature</p>
                                <p className="text-xs text-slate-500">Capture the guarantor’s consent. This will be stored with the loan.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => clearSignaturePad(guarantorSignatureRef)}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                              >
                                Clear
                              </button>
                            </div>

                            <SignatureCanvas
                              ref={guarantorSignatureRef}
                              penColor="#111827"
                              canvasProps={{ className: "h-40 w-full rounded-xl border border-slate-200 bg-white" }}
                            />

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSignatureUpload(guarantorSignatureRef, {
                                    uploadKey: "guarantor-signature",
                                    applyToForm: (prev, url) => ({
                                      ...prev,
                                      guarantorDetails: {
                                        ...prev.guarantorDetails,
                                        signature: url,
                                      },
                                    }),
                                  })
                                }
                                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                                disabled={isUploading}
                              >
                                Upload signature
                              </button>
                              {form.guarantorDetails.signature && (
                                <button
                                  type="button"
                                  onClick={() => removeSignature("guarantor")}
                                  className="text-xs font-semibold text-rose-600 hover:underline"
                                  disabled={isUploading}
                                >
                                  Remove uploaded signature
                                </button>
                              )}
                            </div>

                            {form.guarantorDetails.signature && (
                              <p className="text-[11px] text-slate-500">Uploaded to: {form.guarantorDetails.signature}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-slate-500">Form amount is automatically set to ₦2,000 for every loan.</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                        disabled={isSubmittingFromModal || isUploading}
                      >
                        Reset form
                      </button>

                      <div className="flex items-center gap-3">
                        {currentStep > 1 && (
                          <button
                            type="button"
                            onClick={goToPreviousStep}
                            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                            disabled={isSubmittingFromModal || isUploading}
                          >
                            Previous
                          </button>
                        )}

                        {currentStep < TOTAL_STEPS && (
                          <button
                            type="button"
                            onClick={goToNextStep}
                            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                            disabled={!step1Valid || isUploading}
                          >
                            Next step
                          </button>
                        )}

                        {currentStep === TOTAL_STEPS && (
                          <button onClick={handleSubmit}
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                            disabled={isSubmitDisabled || isSubmittingFromModal}
                          >
                            {isSubmittingFromModal ? "Submitting..." : "Submit loan"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
