import { PageHead } from "@/components/portal/page-head";
import { adjustWallet, setCustomerBlocked } from "@/actions/admin";
import { getAdminCustomers } from "@/lib/data";

export default async function CustomersPage() {
  const customers = await getAdminCustomers();

  return <>
    <PageHead eyebrow="CRM" title="Customers" />
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Customer accounts</h2>
          <p className="form-note">Wallet balance, contact details, default hub and account controls in one place.</p>
        </div>
        <span className="badge green">{customers.length} customers</span>
      </div>

      <div className="admin-customer-list">
        {customers.map((customer) => <details className="customer-row" key={customer.id}>
          <summary>
            <span><b>{customer.name}</b><small>{customer.email} · {customer.phone}</small></span>
            <span><b>{customer.balance} credits</b><small>{customer.hub}</small></span>
            <span className={`badge ${customer.blocked ? "coral" : "green"}`}>{customer.blocked ? "Blocked" : "Active"}</span>
          </summary>
          <div className="customer-actions">
            <form action={adjustWallet} className="compact-form">
              <input type="hidden" name="userId" value={customer.id} />
              <div className="field"><label>Credit adjustment</label><input className="input" name="amount" type="number" step="0.5" placeholder="+2 or -1" required /></div>
              <div className="field"><label>Reason</label><input className="input" name="reason" placeholder="Customer support adjustment" required /></div>
              <button className="btn btn-primary btn-sm">Apply wallet adjustment</button>
            </form>
            <form action={setCustomerBlocked}>
              <input type="hidden" name="userId" value={customer.id} />
              <input type="hidden" name="blocked" value={customer.blocked ? "false" : "true"} />
              <button className="btn btn-soft btn-sm">{customer.blocked ? "Unblock account" : "Block account"}</button>
            </form>
          </div>
        </details>)}
      </div>
    </section>
  </>;
}
