import Link from "next/link";
import { brand } from "@/config/brand";

export function SiteFooter() {
  return <footer className="footer"><div className="container">
    <div className="footer-top"><h2>Lunch that<br/><span>keeps up.</span></h2><div className="footer-links">
      <Link href="/menu">Menu</Link><Link href="/plans">Plans</Link><Link href="/hubs">Delivery hubs</Link><Link href="/for-hostels">For hostels</Link><Link href="/for-companies">For companies</Link><Link href="/faq">FAQ</Link><Link href="/contact">Contact</Link><Link href="/app">Customer app</Link>
    </div></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} {brand.name}. Lahore, Pakistan.</span><span>{brand.tagline}</span></div>
  </div></footer>;
}
