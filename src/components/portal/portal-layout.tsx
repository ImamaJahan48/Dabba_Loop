import type { ReactNode } from "react";
import { Bell, LogOut } from "lucide-react";
import { Sidebar } from "./sidebar";
import { signOut } from "@/actions/auth";

export function PortalLayout({ mode, children }: { mode:"customer"|"admin"|"partner"; children:ReactNode }) {
  return <div className="portal-body"><div className="portal-shell"><Sidebar mode={mode}/><div className="portal-main"><div className="portal-topbar"><span className="eyebrow">{mode === "customer" ? "My meal space" : mode === "admin" ? "Operations control" : "Partner hub"}</span><div style={{display:"flex",gap:8}}><button className="btn btn-soft btn-sm" aria-label="Notifications"><Bell size={15}/></button><form action={signOut}><button className="btn btn-soft btn-sm"><LogOut size={15}/> Sign out</button></form></div></div>{children}</div></div></div>;
}
