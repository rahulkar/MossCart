import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="bg-apple-gray min-h-full w-full">
      <div className="layout-container py-16 text-center" data-testid="page-not-found">
        <h1 className="font-display text-section-heading font-semibold text-ink-950 mb-2 leading-[1.1]">
          Page not found
        </h1>
        <p className="text-apple-textSecondary mb-8 leading-[1.47] tracking-[-0.0234em]">
          We couldn&apos;t find what you were looking for.
        </p>
        <Link
          to="/"
          className="inline-block rounded-lg bg-accent text-white px-[15px] py-2 text-[17px] font-normal hover:bg-accent-hover border border-transparent"
          data-testid="not-found-home"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
