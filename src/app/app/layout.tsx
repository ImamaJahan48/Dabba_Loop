import {PortalLayout} from "@/components/portal/portal-layout";
export default function CustomerLayout({children}:{children:React.ReactNode}){return <PortalLayout mode="customer"><div className="portal-content">{children}</div></PortalLayout>}
