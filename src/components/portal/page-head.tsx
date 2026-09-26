import type { ReactNode } from "react";
export function PageHead({ eyebrow, title, action }: { eyebrow:string; title:string; action?:ReactNode }) { return <div className="portal-head"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div>{action}</div>; }
