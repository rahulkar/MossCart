/**
 * @param {{
 *   children: import('react').ReactNode;
 *   type?: "button" | "submit" | "reset";
 *   variant?: "primary" | "secondary";
 *   disabled?: boolean;
 *   onClick?: () => void;
 *   className?: string;
 *   "data-testid"?: string;
 * }} props
 */
export default function Button({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  onClick,
  className = "",
  "data-testid": testId,
}) {
  const base =
    "rounded-lg px-[15px] py-2 text-[17px] font-normal border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-accent text-white hover:bg-accent-hover"
      : "bg-apple-filterBg border-apple-filterBorder text-ink-950 hover:bg-apple-gray";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${styles} ${className}`}
      data-testid={testId}
    >
      {children}
    </button>
  );
}
