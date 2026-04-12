import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

function navClass({ isActive }) {
  return `text-sm font-medium transition ${isActive ? "text-accent" : "text-slate-600 hover:text-ink-900"}`;
}

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col" data-testid="layout-root">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="font-display text-xl font-semibold text-ink-950 tracking-tight"
            data-testid="nav-logo"
          >
            MossCart
          </Link>
          <nav className="flex items-center gap-6" data-testid="nav-main">
            <NavLink to="/" end className={navClass} data-testid="nav-home">
              Home
            </NavLink>
            <NavLink to="/products" className={navClass} data-testid="nav-products">
              Products
            </NavLink>
            <NavLink to="/cart" className={navClass} data-testid="nav-cart">
              Cart
            </NavLink>
            {user ? (
              <>
                <NavLink to="/profile" className={navClass} data-testid="nav-profile">
                  Profile
                </NavLink>
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm font-medium text-slate-600 hover:text-ink-900"
                  data-testid="nav-logout"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClass} data-testid="nav-login">
                  Log in
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
                  data-testid="nav-register"
                >
                  Sign up
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-500" data-testid="footer">
          MossCart — aquascaping moss, hardscape stone, and tank supplies. Local demo; mock payments only.
        </div>
      </footer>
    </div>
  );
}
