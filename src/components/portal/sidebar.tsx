import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import { Home, CalendarDays, WalletCards, PackageCheck, MapPinned, ReceiptText, Users, CookingPot, Truck, MessageSquareMore, BarChart3, Settings, Building2, CircleHelp, BadgePercent, UtensilsCrossed } from "lucide-react";

const customer = [
  ["/app","Home",Home],["/app/today","Today",UtensilsCrossed],["/app/planner","Planner",CalendarDays],["/app/wallet","Wallet",WalletCards],["/app/orders","Orders",PackageCheck],["/app/hubs","Hubs",MapPinned],["/app/payments","Payments",ReceiptText],["/app/referrals","Referrals",BadgePercent],["/app/feedback","Feedback",MessageSquareMore],["/app/profile","Profile",Users],["/app/support","Support",CircleHelp]
] as const;
const admin = [
  ["/admin","Overview",Home],["/admin/orders","Orders",PackageCheck],["/admin/menu","Meals",UtensilsCrossed],["/admin/calendar","Calendar",CalendarDays],["/admin/plans","Plans",WalletCards],["/admin/kitchen","Kitchen",CookingPot],["/admin/customers","Customers",Users],["/admin/payments","Payments",ReceiptText],["/admin/wallets","Wallets",WalletCards],["/admin/hubs","Hubs",MapPinned],["/admin/delivery","Delivery",Truck],["/admin/feedback","Feedback",MessageSquareMore],["/admin/promos","Promos",BadgePercent],["/admin/reports","Reports",BarChart3],["/admin/staff","Staff",Users],["/admin/settings","Settings",Settings]
] as const;
const partner = [["/partner","Overview",Home],["/partner/hub","Hub",Building2],["/partner/orders","Orders",PackageCheck],["/partner/invoices","Invoices",ReceiptText],["/partner/support","Support",CircleHelp]] as const;

export function Sidebar({ mode }: { mode: "customer"|"admin"|"partner" }) {
  const items = mode === "admin" ? admin : mode === "partner" ? partner : customer;
  return <aside className="sidebar"><BrandMark/><nav>{items.map(([href,label,Icon]) => <Link key={href} href={href}><Icon size={17}/><span>{label}</span></Link>)}</nav><div className="sidebar-bottom">{mode.toUpperCase()} PORTAL<br/>Secure role-based access</div></aside>;
}
