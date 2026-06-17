import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";

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
    <div className="bg-apple-gray min-h-full w-full">
      <div className="layout-container py-16 flex flex-col items-stretch sm:items-center">
        <div className="w-full max-w-md sm:mx-auto" data-testid="page-login">
          <h1
            className="font-display text-section-heading font-semibold text-ink-950 mb-2 leading-[1.1]"
            data-testid="login-title"
          >
            Log in
          </h1>
          <p className="text-apple-textSecondary mb-8 leading-[1.47] tracking-[-0.0234em]">
            No account?{" "}
            <Link
              to="/register"
              className="text-apple-link font-semibold hover:underline"
              data-testid="login-register-link"
            >
              Sign up
            </Link>
          </p>
          <form onSubmit={submit} className="space-y-4" data-testid="login-form">
            <Input
              id="login-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
              autoComplete="email"
              data-testid="login-email"
            />
            <Input
              id="login-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              required
              autoComplete="current-password"
              data-testid="login-password"
            />
            {error && (
              <p className="text-red-600 text-caption" data-testid="login-error">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" data-testid="login-submit">
              Log in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
