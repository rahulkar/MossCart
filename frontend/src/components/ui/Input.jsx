const field =
  "w-full rounded-[11px] bg-apple-filterBg border-[3px] border-apple-filterBorder px-3.5 py-2.5 text-[17px] text-ink-950 focus:ring-2 focus:ring-accent outline-none";

/**
 * @param {{
 *   id: string;
 *   label: string;
 *   type?: string;
 *   value: string;
 *   onChange: (value: string) => void;
 *   required?: boolean;
 *   minLength?: number;
 *   autoComplete?: string;
 *   list?: string;
 *   "data-testid"?: string;
 * }} props
 */
export default function Input({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  minLength,
  autoComplete,
  list,
  "data-testid": testId,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-caption font-semibold text-ink-950 mb-1 tracking-[-0.224px]"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        list={list}
        className={field}
        data-testid={testId}
      />
    </div>
  );
}
