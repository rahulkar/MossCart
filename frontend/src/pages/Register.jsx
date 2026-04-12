import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

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
    <div className="max-w-md mx-auto px-4 py-16" data-testid="page-register">
      <h1 className="font-display text-3xl font-bold text-ink-950 mb-2" data-testid="register-title">
        Create account
      </h1>
      <p className="text-slate-600 mb-8">
        Already have an account?{" "}
        <Link to="/login" className="text-accent font-medium" data-testid="register-login-link">
          Log in
        </Link>
      </p>
      <form onSubmit={submit} className="space-y-4" data-testid="register-form">
        <div>
          <label htmlFor="register-name" className="block text-sm font-medium text-slate-700 mb-1">
            Name
          </label>
          <input
            id="register-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            data-testid="register-name"
          />
        </div>
        <div>
          <label htmlFor="register-email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            data-testid="register-email"
          />
        </div>
        <div>
          <label htmlFor="register-password" className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            id="register-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            data-testid="register-password"
          />
        </div>
        {error && (
          <p className="text-red-600 text-sm" data-testid="register-error">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-lg bg-accent text-white py-3 font-semibold hover:bg-accent-hover"
          data-testid="register-submit"
        >
          Sign up
        </button>
      </form>
    </div>
  );
}
