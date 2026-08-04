import { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const baseFieldClass =
  "w-full rounded-lg border border-brand-beige px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent";

export function Label({ className = "", children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`mb-1.5 block text-sm font-semibold text-brand-green-dark ${className}`} {...props}>
      {children}
    </label>
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${baseFieldClass} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${baseFieldClass} ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${baseFieldClass} bg-white ${className}`} {...props}>
      {children}
    </select>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-brand-danger">{message}</p>;
}
