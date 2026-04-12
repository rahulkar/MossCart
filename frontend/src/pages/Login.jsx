import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

const field =
  "w-full rounded-[11px] bg-apple-filterBg border-[3px] border-apple-filterBorder px-3.5 py-2.5 text-[17px] text-ink-950 focus:ring-2 focus:ring-accent outline-none";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="bg-apple-gray min-h-full">
      <div className="max-w-md mx-auto px-4 py-16" data-testid="page-login">
        <h1 className="font-display text-section-heading font-semibold text-ink-950 mb-2 leading-[1.1]" data-testid="login-title">
          Log in
        </h1>
        <p className="text-apple-textSecondary mb-8 leading-[1.47] tracking-[-0.0234em]">
          No account?{" "}
          <Link to="/register" className="text-apple-link font-semibold hover:underline" data-testid="login-register-link">
            Sign up
          </Link>
        </p>
        <form onSubmit={submit} className="space-y-4" data-testid="login-form">
          <div>
            <label htmlFor="login-email" className="block text-caption font-semibold text-ink-950 mb-1 tracking-[-0.224px]">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
              data-testid="login-email"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-caption font-semibold text-ink-950 mb-1 tracking-[-0.224px]">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
              data-testid="login-password"
            />
          </div>
          {error && (
            <p className="text-red-600 text-caption" data-testid="login-error">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-accent text-white py-2 px-[15px] text-[17px] font-normal hover:bg-accent-hover border border-transparent"
            data-testid="login-submit"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
