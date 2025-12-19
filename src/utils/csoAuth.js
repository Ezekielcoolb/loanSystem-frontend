export const CSO_TOKEN_STORAGE_KEY = "loanSystem.csoToken";
export const CSO_USER_STORAGE_KEY = "loanSystem.csoUser";

export function getStoredCsoAuth() {
  if (typeof window === "undefined") {
    return { token: null, cso: null };
  }

  const token = window.localStorage.getItem(CSO_TOKEN_STORAGE_KEY);
  const rawCso = window.localStorage.getItem(CSO_USER_STORAGE_KEY);

  if (!rawCso) {
    return { token, cso: null };
  }

  try {
    const cso = JSON.parse(rawCso);
    return { token, cso };
  } catch (_error) {
    window.localStorage.removeItem(CSO_USER_STORAGE_KEY);
    return { token, cso: null };
  }
}

export function saveCsoAuth(token, cso) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CSO_TOKEN_STORAGE_KEY, token);
  window.localStorage.setItem(CSO_USER_STORAGE_KEY, JSON.stringify(cso));
}

export function clearCsoAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CSO_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(CSO_USER_STORAGE_KEY);
}
