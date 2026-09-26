import { PageShell } from "@/components/marketing/page-shell";
import { getMenu } from "@/lib/data";
import { formatDate, pkr } from "@/lib/utils";

export default async function MenuPage() {
  const menu = await getMenu();
  return <PageShell eyebrow="Menu calendar" title="Small menu. Serious consistency." intro="Real meal photos, real dates and clear lunch/dinner slots. Capacity and cutoff rules stay visible before you commit.">
    <section className="section-tight section-dark"><div className="container"><div className="menu-grid">{menu.map((slot) => <article className="meal-card" key={slot.id}>
      <div className="meal-copy">
        <span className="eyebrow meal-eyebrow">{formatDate(slot.date)} · {slot.period}</span>
        <h3>{slot.meal.name}</h3>
        <p>{slot.meal.description}</p>
        <div className="meal-meta"><div><span className="badge">{slot.creditCost} credit</span> <span className="badge">{slot.cutoffLabel}</span></div><strong className="meal-price">{pkr(slot.price)}</strong></div>
      </div>
      <div className="meal-photo-wrap">
        {slot.meal.imageUrl ? <img className="meal-photo" src={slot.meal.imageUrl} alt={slot.meal.name} /> : <div className="meal-image-fallback">DabbaLoop</div>}
        <span className="meal-photo-label">{slot.meal.category}</span>
      </div>
    </article>)}</div></div></section>
  </PageShell>;
}
