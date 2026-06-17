import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";

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
    <div className="bg-apple-gray min-h-full w-full">
      <div className="layout-container py-16 flex flex-col items-stretch sm:items-center">
        <div className="w-full max-w-md sm:mx-auto" data-testid="page-register">
          <h1
            className="font-display text-section-heading font-semibold text-ink-950 mb-2 leading-[1.1]"
            data-testid="register-title"
          >
            Create account
          </h1>
          <p className="text-apple-textSecondary mb-8 leading-[1.47] tracking-[-0.0234em]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-apple-link font-semibold hover:underline"
              data-testid="register-login-link"
            >
              Log in
            </Link>
          </p>
          <form onSubmit={submit} className="space-y-4" data-testid="register-form">
            <Input
              id="register-name"
              label="Name"
              value={name}
              onChange={setName}
              required
              data-testid="register-name"
            />
            <Input
              id="register-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
              data-testid="register-email"
            />
            <Input
              id="register-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              required
              minLength={6}
              data-testid="register-password"
            />
            {error && (
              <p className="text-red-600 text-caption" data-testid="register-error">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" data-testid="register-submit">
              Sign up
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
