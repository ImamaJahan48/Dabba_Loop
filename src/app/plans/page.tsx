import Link from "next/link";
import { PageShell } from "@/components/marketing/page-shell";
import { getPlans } from "@/lib/data";
import { pkr } from "@/lib/utils";

export default async function PlansPage() {
  const plans = await getPlans();
  return <PageShell eyebrow="Meal wallet" title="Prepaid, but still flexible." intro="Credits are consumed only by confirmed meals. Skip before cutoff and the value goes back to your wallet instead of disappearing with the calendar.">
    <section className="section-tight pricing-section"><div className="container plan-grid">{plans.map((plan: any) => <article className={`plan-card ${plan.featured ? "featured" : ""}`} key={plan.id}>
      {plan.featured ? <span className="popular-pill">Most flexible</span> : null}
      <div className="eyebrow">{plan.credits} credits</div>
      <h3>{plan.name}</h3>
      <div className="plan-price">{pkr(plan.price)}</div>
      <p>{plan.note}</p>
      {plan.validityDays ? <p><b>{plan.validityDays} days</b> validity.</p> : null}
      <p>Average <b>{pkr(Math.round(plan.price / plan.credits))}</b> / credit.</p>
      <Link href="/signup" className={`btn ${plan.featured ? "btn-coral" : "btn-primary"}`}>Get started</Link>
    </article>)}</div></section>
  </PageShell>;
}
