import { PageHead } from "@/components/portal/page-head";
import { createMenuSlot, updateMenuSlot } from "@/actions/admin";
import { getAdminMeals, getAdminMenuSlots } from "@/lib/data";
import { formatDate, pkr } from "@/lib/utils";

export default async function CalendarPage() {
  const [slots, meals] = await Promise.all([getAdminMenuSlots(), getAdminMeals()]);
  const activeMeals = meals.filter((meal) => meal.active !== false);

  return <>
    <PageHead eyebrow="Menu calendar" title="Schedule meals, price and capacity." />
    <div className="portal-grid">
      <section className="panel">
        <div className="panel-head"><div><h2>Upcoming slots</h2><p className="form-note">Open any slot to change its selling price, meal, capacity, credit cost or cutoff.</p></div></div>
        <div className="admin-plan-list">
          {slots.map((slot) => <details className="admin-plan-editor" key={slot.id}>
            <summary>
              <span><b>{formatDate(slot.date)} · {String(slot.period).toUpperCase()}</b><small>{slot.mealName} · {pkr(slot.price)} · {slot.creditCost} credit</small></span>
              <span className={`badge ${slot.active ? "green" : "coral"}`}>{slot.active ? "Live" : "Hidden"}</span>
            </summary>
            <form action={updateMenuSlot} className="editor-form">
              <input type="hidden" name="slotId" value={slot.id} />
              <div className="form-two-col">
                <div className="field"><label>Date</label><input className="input" name="date" type="date" defaultValue={slot.date} required /></div>
                <div className="field"><label>Period</label><select className="input" name="period" defaultValue={slot.period}><option value="lunch">Lunch</option><option value="dinner">Dinner</option></select></div>
              </div>
              <div className="field"><label>Meal</label><select className="input" name="mealId" defaultValue={slot.mealId} required>{activeMeals.map((meal) => <option key={meal.id} value={meal.id}>{meal.name}</option>)}</select></div>
              <div className="form-two-col">
                <div className="field"><label>Price PKR</label><input className="input" name="price" type="number" defaultValue={slot.price} required /></div>
                <div className="field"><label>Credits</label><input className="input" name="creditCost" type="number" step="0.1" defaultValue={slot.creditCost} required /></div>
                <div className="field"><label>Capacity</label><input className="input" name="capacity" type="number" defaultValue={slot.capacity} required /></div>
                <div className="field"><label>Cutoff (Lahore)</label><input className="input" name="cutoff" type="time" defaultValue={slot.cutoff} required /></div>
              </div>
              <label className="check-row"><input type="checkbox" name="active" defaultChecked={slot.active} /> Visible and orderable</label>
              <button className="btn btn-primary">Save slot</button>
            </form>
          </details>)}
        </div>
      </section>

      <form action={createMenuSlot} className="panel admin-create-card">
        <span className="eyebrow">Publish availability</span>
        <h2>Add menu slot</h2>
        <div className="field"><label>Date</label><input className="input" name="date" type="date" required /></div>
        <div className="field"><label>Period</label><select className="input" name="period"><option value="lunch">Lunch</option><option value="dinner">Dinner</option></select></div>
        <div className="field"><label>Meal</label><select className="input" name="mealId" required>{activeMeals.map((meal) => <option key={meal.id} value={meal.id}>{meal.name}</option>)}</select></div>
        <div className="form-two-col">
          <div className="field"><label>Price PKR</label><input className="input" name="price" type="number" defaultValue="349" required /></div>
          <div className="field"><label>Credits</label><input className="input" name="creditCost" type="number" step="0.1" defaultValue="1" required /></div>
          <div className="field"><label>Capacity</label><input className="input" name="capacity" type="number" defaultValue="50" required /></div>
          <div className="field"><label>Cutoff (Lahore)</label><input className="input" name="cutoff" type="time" defaultValue="09:30" required /></div>
        </div>
        <button className="btn btn-primary">Create slot</button>
      </form>
    </div>
  </>;
}
