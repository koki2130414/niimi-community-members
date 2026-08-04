import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-green text-white hover:bg-brand-green-dark",
  secondary: "bg-brand-beige text-brand-green-dark hover:bg-brand-gold-light",
  danger: "bg-brand-danger text-white hover:opacity-90",
  ghost: "bg-transparent text-brand-green-dark hover:bg-brand-cream border border-brand-green",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center justify-center rounded-card px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
