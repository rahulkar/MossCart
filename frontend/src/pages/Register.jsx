import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

const field =
  "w-full rounded-[11px] bg-apple-filterBg border-[3px] border-apple-filterBorder px-3.5 py-2.5 text-[17px] text-ink-950 focus:ring-2 focus:ring-accent outline-none";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register({ name, email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="bg-apple-gray min-h-full">
      <div className="max-w-md mx-auto px-4 py-16" data-testid="page-register">
        <h1 className="font-display text-section-heading font-semibold text-ink-950 mb-2 leading-[1.1]" data-testid="register-title">
          Create account
        </h1>
        <p className="text-apple-textSecondary mb-8 leading-[1.47] tracking-[-0.0234em]">
          Already have an account?{" "}
          <Link to="/login" className="text-apple-link font-semibold hover:underline" data-testid="register-login-link">
            Log in
          </Link>
        </p>
        <form onSubmit={submit} className="space-y-4" data-testid="register-form">
          <div>
            <label htmlFor="register-name" className="block text-caption font-semibold text-ink-950 mb-1 tracking-[-0.224px]">
              Name
            </label>
            <input
              id="register-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={field}
              data-testid="register-name"
            />
          </div>
          <div>
            <label htmlFor="register-email" className="block text-caption font-semibold text-ink-950 mb-1 tracking-[-0.224px]">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
              data-testid="register-email"
            />
          </div>
          <div>
            <label htmlFor="register-password" className="block text-caption font-semibold text-ink-950 mb-1 tracking-[-0.224px]">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
              data-testid="register-password"
            />
          </div>
          {error && (
            <p className="text-red-600 text-caption" data-testid="register-error">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-accent text-white py-2 px-[15px] text-[17px] font-normal hover:bg-accent-hover border border-transparent"
            data-testid="register-submit"
          >
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
}
