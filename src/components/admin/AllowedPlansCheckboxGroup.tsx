import { ALL_PLANS, PLAN_LABELS, type MembershipPlan } from "@/lib/permissions";
import { Label } from "@/components/ui/FormField";

export function AllowedPlansCheckboxGroup({ defaultValue }: { defaultValue: MembershipPlan[] }) {
  return (
    <div>
      <Label>対象会員種別</Label>
      <div className="flex flex-wrap gap-3">
        {ALL_PLANS.filter((p) => p !== "ADMIN").map((plan) => (
          <label key={plan} className="flex items-center gap-1.5 text-sm text-brand-green-dark">
            <input
              type="checkbox"
              name="allowedPlans"
              value={plan}
              defaultChecked={defaultValue.includes(plan)}
              className="rounded border-brand-beige text-brand-green focus:ring-brand-green"
            />
            {PLAN_LABELS[plan]}
          </label>
        ))}
      </div>
    </div>
  );
}
