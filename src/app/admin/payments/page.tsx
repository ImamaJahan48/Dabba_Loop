import { PageHead } from "@/components/portal/page-head";
import { approvePayment } from "@/actions/admin";
import { getAdminPayments } from "@/lib/data";
import { pkr } from "@/lib/utils";

export default async function PaymentsPage() {
  const payments = await getAdminPayments();

  return <>
    <PageHead eyebrow="Finance" title="Payment verification" />
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Recent payments</h2>
          <p className="form-note">Approve pending manual transfers here. The existing database RPC prevents credits from being minted twice.</p>
        </div>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead><tr><th>Customer</th><th>Plan</th><th>Method</th><th>Amount</th><th>Reference</th><th>Status</th><th></th></tr></thead>
          <tbody>{payments.map((payment) => <tr key={payment.id}>
            <td>{payment.customer}</td>
            <td>{payment.pack}</td>
            <td>{payment.method}</td>
            <td>{pkr(payment.amount)}</td>
            <td>{payment.reference}</td>
            <td><span className={`badge ${payment.status === "paid" ? "green" : payment.status === "pending" ? "coral" : ""}`}>{payment.status}</span></td>
            <td>{payment.status === "pending" ? <form action={approvePayment}><input type="hidden" name="paymentId" value={payment.id} /><button className="btn btn-primary btn-sm" disabled={payment.id.startsWith("pay_demo_")}>Approve</button></form> : "—"}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
  </>;
}
