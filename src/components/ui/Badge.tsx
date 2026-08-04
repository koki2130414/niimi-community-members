type BadgeTone = "green" | "gold" | "danger" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  green: "bg-brand-green text-white",
  gold: "bg-brand-gold text-white",
  danger: "bg-brand-danger text-white",
  neutral: "bg-brand-beige text-brand-green-dark",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
