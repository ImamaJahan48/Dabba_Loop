"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/ui/brand-mark";

const links = [
  ["/menu", "Menu"],
  ["/how-it-works", "How it works"],
  ["/plans", "Plans"],
  ["/hubs", "Hubs"],
  ["/for-companies", "For companies"]
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return <header className="site-header">
    <div className="container header-row">
      <BrandMark />
      <nav className="header-nav" aria-label="Main navigation">
        {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <div className="nav-actions">
        <Link className="btn btn-ghost btn-sm" href="/login">Log in</Link>
        <Link className="btn btn-primary btn-sm" href="/signup">Start eating</Link>
        <button className="btn btn-soft btn-sm menu-toggle" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X size={16} /> : <Menu size={16} />}</button>
      </div>
    </div>
    <div className={`mobile-nav ${open ? "open" : ""}`}>
      <nav className="container" aria-label="Mobile navigation">
        {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link href="/signup" className="mobile-nav-cta" onClick={() => setOpen(false)}>Get meal credits →</Link>
      </nav>
    </div>
  </header>;
}
