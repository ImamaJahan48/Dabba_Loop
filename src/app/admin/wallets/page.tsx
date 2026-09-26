import Link from "next/link";
import { PageHead } from "@/components/portal/page-head";
import { getAdminWalletTransactions } from "@/lib/data";

export default async function WalletsPage() {
  const transactions = await getAdminWalletTransactions();

  return <>
    <PageHead eyebrow="Finance" title="Wallet ledger" action={<Link className="btn btn-primary" href="/admin/customers">Adjust customer wallet</Link>} />
    <section className="panel">
      <div className="panel-head"><div><h2>Recent credit movement</h2><p className="form-note">Purchases, meal debits, refunds, promotions and controlled admin adjustments are all traceable here.</p></div></div>
      <div className="table-scroll"><table className="data-table">
        <thead><tr><th>Time</th><th>Customer</th><th>Type</th><th>Amount</th><th>Reference</th><th>Reason</th></tr></thead>
        <tbody>{transactions.map((tx) => <tr key={tx.id}>
          <td>{new Date(tx.time).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}</td>
          <td>{tx.customer}</td>
          <td>{tx.type.replaceAll("_", " ")}</td>
          <td><span className={`badge ${tx.amount > 0 ? "green" : "coral"}`}>{tx.amount > 0 ? "+" : ""}{tx.amount}</span></td>
          <td>{tx.reference}</td>
          <td>{tx.reason}</td>
        </tr>)}</tbody>
      </table></div>
    </section>
  </>;
}
