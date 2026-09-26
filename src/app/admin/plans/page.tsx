import { PageHead } from "@/components/portal/page-head";
import { createCreditPack, updateCreditPack } from "@/actions/admin";
import { getAdminPlans } from "@/lib/data";
import { pkr } from "@/lib/utils";

export default async function AdminPlansPage() {
  const plans = await getAdminPlans();

  return <>
    <PageHead eyebrow="Pricing" title="Meal plans & credit packs" />

    <div className="portal-grid admin-plans-layout">
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Current plans</h2>
            <p className="form-note">Change customer-facing prices here. No code edits required after Supabase is connected.</p>
          </div>
        </div>

        <div className="admin-plan-list">
          {plans.map((plan) => <details className="admin-plan-editor" key={plan.id}>
            <summary>
              <span><b>{plan.name}</b><small>{plan.credits} credits · {pkr(plan.price)}</small></span>
              <span className={`badge ${plan.active ? "green" : "coral"}`}>{plan.active ? "Active" : "Hidden"}</span>
            </summary>
            <form action={updateCreditPack} className="editor-form">
              <input type="hidden" name="packId" value={plan.id} />
              <div className="form-two-col">
                <div className="field"><label>Name</label><input className="input" name="name" defaultValue={plan.name} required /></div>
                <div className="field"><label>Price PKR</label><input className="input" name="price" type="number" step="1" defaultValue={plan.price} required /></div>
                <div className="field"><label>Meal credits</label><input className="input" name="credits" type="number" step="0.5" defaultValue={plan.credits} required /></div>
                <div className="field"><label>Validity days</label><input className="input" name="validityDays" type="number" defaultValue={plan.validityDays || ""} /></div>
                <div className="field"><label>Bonus credits</label><input className="input" name="bonusCredits" type="number" step="0.5" defaultValue={plan.bonusCredits || 0} /></div>
              </div>
              <div className="field"><label>Description</label><textarea className="input" name="description" defaultValue={plan.note} /></div>
              <div className="check-stack">
                <label className="check-row"><input type="checkbox" name="featured" defaultChecked={plan.featured} /> Feature this plan</label>
                <label className="check-row"><input type="checkbox" name="active" defaultChecked={plan.active} /> Available for purchase</label>
              </div>
              <button className="btn btn-primary">Save plan</button>
            </form>
          </details>)}
        </div>
      </section>

      <form action={createCreditPack} className="panel admin-create-card">
        <span className="eyebrow">Add pricing option</span>
        <h2>Create plan</h2>
        <div className="field"><label>Name</label><input className="input" name="name" placeholder="Flex 15" required /></div>
        <div className="form-two-col">
          <div className="field"><label>Credits</label><input className="input" name="credits" type="number" step="0.5" required /></div>
          <div className="field"><label>Price PKR</label><input className="input" name="price" type="number" required /></div>
          <div className="field"><label>Validity days</label><input className="input" name="validityDays" type="number" defaultValue="45" /></div>
          <div className="field"><label>Bonus credits</label><input className="input" name="bonusCredits" type="number" step="0.5" defaultValue="0" /></div>
        </div>
        <div className="field"><label>Description</label><textarea className="input" name="description" placeholder="Who is this plan best for?" /></div>
        <label className="check-row"><input type="checkbox" name="featured" /> Feature this plan</label>
        <button className="btn btn-primary">Create plan</button>
      </form>
    </div>
  </>;
}
