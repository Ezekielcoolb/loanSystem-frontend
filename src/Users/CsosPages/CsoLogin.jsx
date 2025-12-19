import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCsoAuthError, loginCso, resetCsoPassword } from "../../redux/slices/csoAuthSlice";

export default function CsoLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const { token, loading, resettingPassword, error } = useSelector((state) => state.csoAuth);

  useEffect(() => {
    dispatch(clearCsoAuthError());

    return () => {
      dispatch(clearCsoAuthError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      navigate("/cso", { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (isResetMode) {
      if (!email || !resetPassword) {
        setFormError("Please provide both email and new password.");
        return;
      }

      if (resetPassword.length < 8) {
        setFormError("New password must be at least 8 characters.");
        return;
      }

      try {
        const message = await dispatch(resetCsoPassword({ email, newPassword: resetPassword })).unwrap();
        setFormSuccess(message || "Password reset successfully. You can now sign in.");
        setResetPassword("");
        setPassword("");
        setIsResetMode(false);
      } catch (err) {
        setFormError(typeof err === "string" ? err : "Unable to reset password.");
      }
      return;
    }

    if (!email || !password) {
      setFormError("Please provide both email and password.");
      return;
    }

    await dispatch(loginCso({ email, password }));
  };

  const displayError = formError || error;
  const isSubmitting = isResetMode ? resettingPassword : loading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">CSO Portal</h1>
          <p className="mt-2 text-sm text-slate-500">
            {isResetMode ? "Enter your email and a new password to regain access." : "Sign in with your registered CSO email and password."}
          </p>
        </header>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="jane.doe@example.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor={isResetMode ? "newPassword" : "password"} className="text-sm font-medium text-slate-700">
              {isResetMode ? "New password" : "Password"}
            </label>
            <input
              id={isResetMode ? "newPassword" : "password"}
              type="password"
              value={isResetMode ? resetPassword : password}
              onChange={(event) =>
                isResetMode ? setResetPassword(event.target.value) : setPassword(event.target.value)
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder={isResetMode ? "Enter a new password" : "Enter your password"}
              autoComplete={isResetMode ? "new-password" : "current-password"}
            />
          </div>

          {displayError && <p className="text-sm text-rose-600">{displayError}</p>}
          {formSuccess && <p className="text-sm text-emerald-600">{formSuccess}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isResetMode ? (isSubmitting ? "Resetting..." : "Reset password") : isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <div className="text-center text-sm text-slate-600">
            {isResetMode ? "Remembered your password?" : "Forgot your password?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsResetMode((prev) => !prev);
                setFormError("");
                setFormSuccess("");
                setPassword("");
                setResetPassword("");
              }}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {isResetMode ? "Sign in instead" : "Reset it"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
