import { HTMLAttributes } from "react";

export function Card({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-card bg-white border border-brand-beige shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
