import { PageHead } from "@/components/portal/page-head";
import { updateBusinessSettings } from "@/actions/admin";

export default function SettingsPage() {
  return <>
    <PageHead eyebrow="System" title="Business rules" />
    <form action={updateBusinessSettings} className="panel" style={{ maxWidth: 820 }}>
      <div className="form-two-col">
        <div className="field"><label>Lunch order cutoff</label><input className="input" name="lunchCutoff" type="time" defaultValue="09:30" /></div>
        <div className="field"><label>Dinner order cutoff</label><input className="input" name="dinnerCutoff" type="time" defaultValue="15:30" /></div>
      </div>
      <div className="form-two-col">
        <div className="field"><label>Lunch delivery window</label><input className="input" name="lunchWindow" defaultValue="12:00-14:00" /></div>
        <div className="field"><label>Dinner delivery window</label><input className="input" name="dinnerWindow" defaultValue="18:30-20:30" /></div>
      </div>
      <div className="field"><label>Before-cutoff cancellation rule</label><select className="input" name="beforeCutoff" defaultValue="full_credit_return"><option value="full_credit_return">Return full meal credit</option><option value="admin_review">Send to admin review</option></select></div>
      <div className="field"><label>After-cutoff cancellation rule</label><select className="input" name="afterCutoff" defaultValue="admin_exception_only"><option value="admin_exception_only">Admin exception only</option><option value="no_refund">No automatic refund</option></select></div>
      <p className="form-note">These values are stored in <code>app_settings</code>. Keep customer-facing policy text consistent with these rules.</p>
      <button className="btn btn-primary">Save business settings</button>
    </form>
  </>;
}
