import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

function navClass({ isActive }) {
  return `text-xs font-normal tracking-tight transition-colors ${
    isActive ? "text-white underline decoration-white/80 underline-offset-4" : "text-white/90 hover:text-white hover:underline underline-offset-4"
  }`;
}

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-apple-gray" data-testid="layout-root">
      <header
        className="sticky top-0 z-40 h-12 border-b border-white/10 bg-black/80 backdrop-blur-[20px] backdrop-saturate-[180%]"
        style={{ WebkitBackdropFilter: "saturate(180%) blur(20px)" }}
      >
        <div className="max-w-content mx-auto px-4 h-full flex items-center justify-between gap-4">
          <Link
            to="/"
            className="text-[17px] font-semibold text-white tracking-[-0.022em] leading-none"
            data-testid="nav-logo"
          >
            MossCart
          </Link>
          <nav className="flex items-center gap-5 md:gap-6 flex-wrap justify-end" data-testid="nav-main">
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
                  className="text-xs font-normal text-white/90 hover:text-white hover:underline underline-offset-4"
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
                  className="rounded-lg bg-accent px-[15px] py-2 text-[17px] font-normal text-white hover:bg-accent-hover border border-transparent"
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
      <footer className="bg-apple-gray py-10 mt-auto">
        <div className="max-w-content mx-auto px-4 text-center text-micro text-apple-textTertiary" data-testid="footer">
          MossCart — aquascaping moss, hardscape stone, and tank supplies. Local demo; mock payments only.
        </div>
      </footer>
    </div>
  );
}
