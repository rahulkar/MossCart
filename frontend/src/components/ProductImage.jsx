import { useState } from "react";

export default function ProductImage({
  src,
  alt = "",
  className = "",
  testId = "product-image",
  wrapClassName = "",
}) {
  const [broken, setBroken] = useState(false);
  const missing = !src || String(src).trim() === "";
  const showPlaceholder = missing || broken;

  return (
    <div className={wrapClassName || undefined}>
      {showPlaceholder ? (
        <div
          className={`flex h-full w-full min-h-[8rem] items-center justify-center bg-apple-gray text-apple-textTertiary text-caption font-medium text-center px-4 tracking-[-0.224px] ${className}`}
          data-testid={`${testId}-placeholder`}
        >
          Image coming soon
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={className}
          data-testid={testId}
          onError={() => setBroken(true)}
        />
      )}
    </div>
  );
}
