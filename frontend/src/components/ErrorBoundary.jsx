import { Component } from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-apple-gray min-h-full w-full">
          <div className="layout-container py-16 text-center" data-testid="error-boundary">
            <h1 className="font-display text-section-heading font-semibold text-ink-950 mb-2 leading-[1.1]">
              Something went wrong
            </h1>
            <p className="text-apple-textSecondary mb-8 leading-[1.47] tracking-[-0.0234em]">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <Link
              to="/"
              className="inline-block rounded-lg bg-accent text-white px-[15px] py-2 text-[17px] font-normal hover:bg-accent-hover border border-transparent"
              data-testid="error-boundary-home"
            >
              Go home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
