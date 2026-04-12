import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

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
    <div className="max-w-md mx-auto px-4 py-16" data-testid="page-login">
      <h1 className="font-display text-3xl font-bold text-ink-950 mb-2" data-testid="login-title">
        Log in
      </h1>
      <p className="text-slate-600 mb-8">
        No account?{" "}
        <Link to="/register" className="text-accent font-medium" data-testid="login-register-link">
          Sign up
        </Link>
      </p>
      <form onSubmit={submit} className="space-y-4" data-testid="login-form">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            data-testid="login-email"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            data-testid="login-password"
          />
        </div>
        {error && (
          <p className="text-red-600 text-sm" data-testid="login-error">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-lg bg-accent text-white py-3 font-semibold hover:bg-accent-hover"
          data-testid="login-submit"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
