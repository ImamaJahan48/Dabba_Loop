import {PortalLayout} from "@/components/portal/portal-layout";
export default function PartnerLayout({children}:{children:React.ReactNode}){return <PortalLayout mode="partner"><div className="portal-content">{children}</div></PortalLayout>}
