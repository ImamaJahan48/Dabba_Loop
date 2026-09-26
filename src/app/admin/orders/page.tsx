import { PageHead } from "@/components/portal/page-head";
import { updateOrderStatus } from "@/actions/admin";
import { getAdminOrders } from "@/lib/data";
import { pkr } from "@/lib/utils";

const statuses = ["scheduled", "confirmed", "preparing", "packed", "out_for_hub", "delivered", "collected", "cancelled"];

export default async function OrdersPage() {
  const orders = await getAdminOrders();

  return <>
    <PageHead eyebrow="Operations" title="Orders" />
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Live order queue</h2>
          <p className="form-note">Newest orders first. Update fulfillment status directly from this table.</p>
        </div>
        <span className="badge green">{orders.length} shown</span>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Meal</th><th>Hub</th><th>Period</th><th>Value</th><th>Status</th></tr></thead>
          <tbody>{orders.map((order) => <tr key={order.rawId || order.id}>
            <td><b>{order.id}</b></td>
            <td>{order.customer}<small className="table-sub">{order.phone}</small></td>
            <td>{order.date}</td>
            <td>{order.meal}</td>
            <td>{order.hub}</td>
            <td>{String(order.period).toUpperCase()}</td>
            <td>{order.cashTotal > 0 ? pkr(order.cashTotal) : `${order.credits} credit`}</td>
            <td>
              <form action={updateOrderStatus} className="inline-status-form">
                <input type="hidden" name="orderId" value={order.rawId || ""} />
                <select className="input status-select" name="status" defaultValue={String(order.status).toLowerCase()}>
                  {statuses.map((status) => <option value={status} key={status}>{status.replaceAll("_", " ")}</option>)}
                </select>
                <button className="btn btn-soft btn-sm" disabled={!order.rawId || String(order.rawId).startsWith("demo-")}>Save</button>
              </form>
            </td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="form-note">Demo mode shows sample orders and disables status writes. Set <code>NEXT_PUBLIC_DEMO_MODE=false</code> to use Supabase data.</p>
    </section>
  </>;
}
