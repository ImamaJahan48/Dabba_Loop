import Link from "next/link";
import { ArrowRight, CalendarCheck2, MapPinned, PauseCircle, Repeat2, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Reveal } from "@/components/ui/reveal";
import { getMenu, getPlans } from "@/lib/data";
import { pkr } from "@/lib/utils";

const fallbackHeroImage =
  "https://images.unsplash.com/photo-1708782340793-ec5f2159a689?auto=format&fit=crop&fm=jpg&q=84&w=1600";

export default async function HomePage() {
  const [menu, plans] = await Promise.all([getMenu(), getPlans()]);
  const heroMeal = menu[0]?.meal;
  const heroImage = heroMeal?.imageUrl || fallbackHeroImage;

  return <div className="site-shell"><SiteHeader /><main>
    <section className="hero">
      <div className="hero-leaf hero-leaf-one" aria-hidden="true" />
      <div className="hero-leaf hero-leaf-two" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-content">
          <div className="eyebrow">Flexible home-style meals · Lahore</div>
          <h1 className="display">Plans change.<br /><span className="accent">Your meal doesn’t.</span></h1>
          <p className="hero-copy">Buy meal credits instead of fixed calendar days. Schedule lunch or dinner, skip before cutoff, move to another approved hub, and keep your unused value for later.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/signup">Get meal credits <ArrowRight size={17} /></Link>
            <Link className="btn btn-soft" href="/menu">See this week’s menu</Link>
          </div>
          <div className="hero-note"><i /> Fresh meals. Flexible scheduling. One simple wallet.</div>
        </div>

        <div className="hero-photo-stage" aria-label="DabbaLoop meal experience">
          <div className="hero-photo-glow" aria-hidden="true" />
          <div className="hero-photo-card">
            <img className="hero-main-photo" src={heroImage} alt={heroMeal?.name || "Fresh DabbaLoop meal"} />
            <div className="hero-photo-shade" />
            <div className="hero-photo-caption">
              <span className="eyebrow">Today’s lunch</span>
              <strong>{heroMeal?.name || "Home-style Chicken Karahi"}</strong>
              <span>Freshly prepared · 1 meal credit</span>
            </div>
          </div>
          <div className="hero-status-card hero-status-one">
            <span className="status-dot" />
            <div><small>Pickup</small><strong>UOL Hub · 12:45</strong></div>
          </div>
          <div className="hero-status-card hero-status-two">
            <div><small>Wallet</small><strong>13 meals left</strong></div>
          </div>
          <div className="hero-status-card hero-status-three">
            <strong>Skip = no loss</strong>
          </div>
        </div>
      </div>
    </section>

    <div className="marquee"><div className="marquee-track">{[...Array(2)].flatMap(() => ["Meal credits, not fixed days", "Switch lunch ↔ dinner", "Shared hostel & office hubs", "Home-style menus", "Plan your whole week", "Skip before cutoff"]).map((x, i) => <span className="marquee-item" key={i}>{x}</span>)}</div></div>

    <section className="section section-soft-pattern"><div className="container">
      <Reveal><div className="section-head"><h2 className="display">A food service built around real schedules.</h2><p>Traditional subscriptions assume every day looks the same. Student timetables, hybrid work and Lahore traffic disagree.</p></div></Reveal>
      <div className="steps-grid">{[
        ["01", "Buy credits", "Start with 5, 10 or 20 meal credits. No need to commit to every weekday."],
        ["02", "Plan", "Choose lunch or dinner from the menu and your approved delivery hub."],
        ["03", "Change", "Skip, switch meal period or move hubs before the configured cutoff."],
        ["04", "Collect", "Your labelled meal arrives with the hub batch. One route, many happy stomachs."]
      ].map(([n, t, d]) => <Reveal key={n}><article className="step-card"><span className="step-num">{n}</span><div className="step-orb" /><h3>{t}</h3><p>{d}</p></article></Reveal>)}</div>
    </div></section>

    <section className="section section-dark"><div className="container">
      <Reveal><div className="section-head"><h2 className="display">Today tastes like this.</h2><p>Real meal photography keeps the menu appetizing while capacity, cutoff and credit cost stay clear before ordering.</p></div></Reveal>
      <div className="menu-grid">{menu.slice(0, 4).map((slot) => <article className="meal-card" key={slot.id}>
        <div className="meal-copy">
          <span className="eyebrow meal-eyebrow">{slot.period} · {slot.cutoffLabel}</span>
          <h3>{slot.meal.name}</h3>
          <p>{slot.meal.description}</p>
          <div className="meal-meta"><div><span className="badge">{slot.creditCost} credit</span> <span className="badge">{slot.remaining} left</span></div><strong className="meal-price">{pkr(slot.price)}</strong></div>
        </div>
        <div className="meal-photo-wrap">
          {slot.meal.imageUrl
            ? <img className="meal-photo" src={slot.meal.imageUrl} alt={slot.meal.name} />
            : <div className="meal-image-fallback">DabbaLoop</div>}
          <span className="meal-photo-label">{slot.meal.category}</span>
        </div>
      </article>)}</div>
      <div style={{ marginTop: 24 }}><Link className="btn btn-coral" href="/menu">Explore menu <ArrowRight size={16} /></Link></div>
    </div></section>

    <section className="section section-dark" style={{ paddingTop: 0 }}><div className="container split-feature">
      <Reveal><div className="phone"><div className="phone-notch" /><div className="phone-ui"><span className="eyebrow">Tuesday · lunch</span><h4>Good afternoon.</h4><div className="phone-wallet"><div><small>MEALS LEFT</small><br /><strong>13</strong></div><span>Flex 20</span></div><div className="phone-row"><span>Chicken Karahi</span><b>1 credit</b></div><div className="phone-row"><span>UOL Hostel Hub</span><b>12:45</b></div><div className="phone-row"><span>Need dinner instead?</span><b>Switch →</b></div></div></div></Reveal>
      <div><div className="eyebrow dark-eyebrow">The flexible layer</div><h2 className="display feature-title">The website removes the annoying parts.</h2><div className="feature-list">{[
        [PauseCircle, "Skip without loss", "Cancel before cutoff and the credit returns automatically."],
        [Repeat2, "Lunch ↔ dinner", "Move the same meal credit to another available period."],
        [MapPinned, "Move my meal", "Change to another active hub if capacity is available."],
        [CalendarCheck2, "Weekly planner", "Set Monday to Sunday once and let the kitchen forecast demand."],
        [ShieldCheck, "Every credit is traceable", "Payments, debits and refunds stay in an immutable wallet ledger."]
      ].map(([Icon, t, d]: any) => <div className="feature-item" key={t}><div className="feature-icon"><Icon size={20} /></div><div><b>{t}</b><p>{d}</p></div><ArrowRight size={18} /></div>)}</div></div>
    </div></section>

    <section className="section pricing-section"><div className="container">
      <Reveal><div className="section-head"><h2 className="display">Choose flexibility, not fixed days.</h2><p>Credits give customers freedom while preserving prepaid demand for the kitchen.</p></div></Reveal>
      <div className="plan-grid">{plans.map((plan: any) => <article key={plan.id} className={`plan-card ${plan.featured ? "featured" : ""}`}>
        <div className="eyebrow">{plan.credits} meal credits</div>
        <h3>{plan.name}</h3>
        <div className="plan-price">{pkr(plan.price)}</div>
        <p>{plan.note}</p>
        <p><b>{pkr(Math.round(plan.price / plan.credits))}</b> average per credit.</p>
        <Link className={`btn ${plan.featured ? "btn-coral" : "btn-primary"}`} href="/signup">Choose {plan.name}</Link>
      </article>)}</div>
    </div></section>

    <section className="section section-coral"><div className="container"><div className="section-head" style={{ margin: 0 }}><h2 className="display">One drop for the whole hostel. One dashboard for the whole office.</h2><div><p className="inverse-copy">Shared Dabba Hubs turn delivery from dozens of scattered stops into predictable batches. Better customer price, healthier margins, fewer late riders.</p><div className="cta-row"><Link className="btn btn-inverse" href="/for-hostels">Bring it to a hostel</Link><Link className="btn btn-glass" href="/for-companies">Company meals</Link></div></div></div></div></section>
  </main><SiteFooter /></div>;
}
