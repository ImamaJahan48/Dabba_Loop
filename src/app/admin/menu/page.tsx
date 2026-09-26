import { PageHead } from "@/components/portal/page-head";
import { createMeal, toggleMealActive, updateMeal } from "@/actions/admin";
import { getAdminMeals } from "@/lib/data";

export default async function MealsPage() {
  const meals = await getAdminMeals();

  return <>
    <PageHead
      eyebrow="Catalogue"
      title="Meals & photos"
    />

    <div className="portal-grid admin-menu-layout">
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Meal catalogue</h2>
            <p className="form-note">Edit descriptions, nutrition, photos and visibility. Changes appear on the public menu.</p>
          </div>
          <span className="badge green">{meals.filter((m) => m.active !== false).length} active</span>
        </div>

        <div className="admin-meal-list">
          {meals.map((meal) => <article className="admin-meal-card" key={meal.id}>
            <div className="admin-meal-thumb">
              {meal.imageUrl
                ? <img src={meal.imageUrl} alt={meal.name} />
                : <div className="meal-image-fallback">DL</div>}
            </div>

            <div className="admin-meal-summary">
              <div>
                <span className="eyebrow">{meal.category}</span>
                <h3>{meal.name}</h3>
                <p>{meal.description || "No description yet."}</p>
              </div>
              <div className="admin-meal-badges">
                <span className={`badge ${meal.active === false ? "coral" : "green"}`}>{meal.active === false ? "Hidden" : "Active"}</span>
                {meal.calories ? <span className="badge">{meal.calories} kcal</span> : null}
                {meal.protein ? <span className="badge">{meal.protein}g protein</span> : null}
              </div>
            </div>

            <details className="admin-editor">
              <summary>Edit meal</summary>
              <form action={updateMeal} className="editor-form">
                <input type="hidden" name="mealId" value={meal.id} />
                <input type="hidden" name="existingImage" value={meal.imagePath || ""} />

                <div className="field"><label>Name</label><input className="input" name="name" defaultValue={meal.name} required /></div>
                <div className="field"><label>Category</label><input className="input" name="category" defaultValue={meal.category} /></div>
                <div className="field"><label>Description</label><textarea className="input" name="description" defaultValue={meal.description} /></div>
                <div className="field"><label>Ingredients</label><textarea className="input" name="ingredients" defaultValue={meal.ingredients || ""} /></div>
                <div className="field"><label>Allergens</label><input className="input" name="allergens" defaultValue={meal.allergens.join(", ")} placeholder="dairy, nuts" /></div>

                <div className="form-two-col">
                  <div className="field"><label>Calories</label><input className="input" name="calories" type="number" defaultValue={meal.calories || ""} /></div>
                  <div className="field"><label>Protein (g)</label><input className="input" name="protein" type="number" step="0.1" defaultValue={meal.protein || ""} /></div>
                </div>

                <div className="field"><label>Replace photo</label><input className="input" name="image" type="file" accept="image/*" /></div>
                <div className="field"><label>Or image URL</label><input className="input" name="imageUrl" type="url" placeholder="https://..." /></div>
                <label className="check-row"><input type="checkbox" name="active" defaultChecked={meal.active !== false} /> Show this meal to customers</label>
                <button className="btn btn-primary">Save changes</button>
              </form>
            </details>

            <form action={toggleMealActive}>
              <input type="hidden" name="mealId" value={meal.id} />
              <input type="hidden" name="nextActive" value={meal.active === false ? "true" : "false"} />
              <button className="btn btn-soft btn-sm">{meal.active === false ? "Activate" : "Hide"}</button>
            </form>
          </article>)}
        </div>
      </section>

      <form action={createMeal} className="panel admin-create-card">
        <span className="eyebrow">New catalogue item</span>
        <h2>Create meal</h2>
        <div className="field"><label>Name</label><input className="input" name="name" required placeholder="Chicken Karahi" /></div>
        <div className="field"><label>Category</label><input className="input" name="category" defaultValue="Daily" /></div>
        <div className="field"><label>Description</label><textarea className="input" name="description" placeholder="What comes in the meal?" /></div>
        <div className="field"><label>Ingredients</label><textarea className="input" name="ingredients" placeholder="Chicken, tomato, ginger..." /></div>
        <div className="field"><label>Allergens</label><input className="input" name="allergens" placeholder="dairy, nuts" /></div>
        <div className="form-two-col">
          <div className="field"><label>Calories</label><input className="input" name="calories" type="number" /></div>
          <div className="field"><label>Protein (g)</label><input className="input" name="protein" type="number" step="0.1" /></div>
        </div>
        <div className="field"><label>Meal photo</label><input className="input" name="image" type="file" accept="image/*" /></div>
        <div className="field"><label>Or image URL</label><input className="input" name="imageUrl" type="url" placeholder="https://..." /></div>
        <p className="form-note">In live mode uploaded images go to the existing <b>meal-images</b> Supabase bucket.</p>
        <button className="btn btn-primary">Save meal</button>
      </form>
    </div>
  </>;
}
