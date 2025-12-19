const DAILY_INSTALLMENT_COUNT = 22;

export const formatCurrency = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(value);
  } catch (_error) {
    return `${value}`;
  }
};

export const formatDateWithTime = (value) => {
  if (!value) {
    return "—";
  }

  try {
    return new Date(value).toLocaleString();
  } catch (_error) {
    return `${value}`;
  }
};

const toDateOrNull = (value) => {
  if (!value) {
    return null;
  }

  try {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  } catch (_error) {
    return null;
  }
};

export const isWeekend = (date) => {
  if (!(date instanceof Date)) {
    return false;
  }

  const day = date.getDay();
  return day === 0 || day === 6;
};

export const addDays = (date, days) => {
  if (!(date instanceof Date)) {
    return null;
  }

  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addBusinessDays = (startDate, businessDays) => {
  if (!(startDate instanceof Date) || !Number.isFinite(businessDays)) {
    return null;
  }

  const date = new Date(startDate);
  let daysAdded = 0;

  while (daysAdded < businessDays) {
    date.setDate(date.getDate() + 1);
    if (!isWeekend(date)) {
      daysAdded += 1;
    }
  }

  return date;
};

export const countBusinessDays = (startDate, endDate) => {
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    return 0;
  }

  if (startDate > endDate) {
    return 0;
  }

  let days = 0;
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    if (!isWeekend(cursor)) {
      days += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};

export const computeLoanMetrics = (loan) => {
  if (!loan) {
    return {
      disbursedAt: null,
      projectedEndDate: null,
      amountDisbursed: 0,
      amountToBePaid: 0,
      amountPaidSoFar: 0,
      dailyAmount: 0,
      businessDaysSinceDisbursement: 0,
      expectedRepaymentsByNow: 0,
      outstandingDue: 0,
      balanceRemaining: 0,
    };
  }

  const disbursedAt = toDateOrNull(loan.disbursedAt);
  const amountDisbursed = loan?.loanDetails?.amountDisbursed ?? 0;
  const amountToBePaid = loan?.loanDetails?.amountToBePaid ?? 0;
  const amountPaidSoFar = loan?.loanDetails?.amountPaidSoFar ?? 0;
  const dailyAmount = loan?.loanDetails?.dailyAmount ?? 0;

  const projectedEndDate = disbursedAt ? addBusinessDays(disbursedAt, DAILY_INSTALLMENT_COUNT) : null;

  const businessDaysSinceDisbursement = disbursedAt
    ? Math.max(countBusinessDays(addDays(disbursedAt, 1), new Date()), 0)
    : 0;

  const expectedRepaymentsByNow = dailyAmount * businessDaysSinceDisbursement;
  const outstandingDue = Math.max(expectedRepaymentsByNow - amountPaidSoFar, 0);
  const balanceRemaining = Math.max(amountToBePaid - amountPaidSoFar, 0);

  return {
    disbursedAt,
    projectedEndDate,
    amountDisbursed,
    amountToBePaid,
    amountPaidSoFar,
    dailyAmount,
    businessDaysSinceDisbursement,
    expectedRepaymentsByNow,
    outstandingDue,
    balanceRemaining,
  };
};
