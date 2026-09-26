import { PageHead } from "@/components/portal/page-head";
import { getAdminCustomers, getAdminOrders, getAdminPayments } from "@/lib/data";
import { pkr } from "@/lib/utils";

export default async function ReportsPage() {
  const [orders, customers, payments] = await Promise.all([getAdminOrders(), getAdminCustomers(), getAdminPayments()]);
  const fulfilled = orders.filter((o) => ["delivered", "collected"].includes(String(o.status).toLowerCase())).length;
  const cancelled = orders.filter((o) => String(o.status).toLowerCase() === "cancelled").length;
  const walletLiability = customers.reduce((sum, customer) => sum + Number(customer.balance || 0), 0);
  const pendingPayments = payments.filter((payment) => payment.status === "pending").length;
  const verifiedRevenue = payments.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const mealCounts = orders.reduce((acc: Record<string, number>, order) => {
    acc[order.meal] = (acc[order.meal] || 0) + 1;
    return acc;
  }, {});
  const topMeal = Object.entries(mealCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "No orders yet";

  const reports = [
    ["Customers", String(customers.length), "Visible customer accounts"],
    ["Recent orders", String(orders.length), "Latest queue loaded into admin"],
    ["Fulfilled", String(fulfilled), "Delivered or collected in loaded orders"],
    ["Cancelled", String(cancelled), "Cancelled in loaded orders"],
    ["Wallet liability", `${walletLiability.toFixed(1)} credits`, "Outstanding prepaid meal value"],
    ["Pending payments", String(pendingPayments), "Need verification"],
    ["Verified revenue", pkr(verifiedRevenue), "Paid records in current admin window"],
    ["Top recent meal", topMeal, "Most frequent meal in loaded orders"]
  ];

  return <>
    <PageHead eyebrow="KPIs" title="Reports that change decisions." />
    <div className="info-grid admin-report-grid">{reports.map(([title, value, description]) => <article className="stat-card" key={title}><span>{title}</span><strong className="report-value">{value}</strong><small>{description}</small></article>)}</div>
    <section className="panel" style={{ marginTop: 14 }}><p className="form-note">These cards use the live admin data window already loaded by the site. For accounting-grade reporting, add date filters and SQL aggregate views so large order histories remain fast and accurate.</p></section>
  </>;
}
