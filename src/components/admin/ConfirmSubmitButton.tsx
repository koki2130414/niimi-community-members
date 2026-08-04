"use client";

export function ConfirmSubmitButton({
  confirmMessage,
  className = "text-xs font-semibold text-brand-danger hover:underline",
  children,
}: {
  confirmMessage: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
