import {PortalLayout} from "@/components/portal/portal-layout";
export default function AdminLayout({children}:{children:React.ReactNode}){return <PortalLayout mode="admin"><div className="portal-content">{children}</div></PortalLayout>}
