import Link from "next/link";
import { brand } from "@/config/brand";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="brand-lockup" aria-label={`${brand.name} home`}>
    <span className="brand-symbol" aria-hidden="true">
      <svg viewBox="0 0 64 64" role="img">
        <rect x="2" y="2" width="60" height="60" rx="18" fill="#0F6B3F" />
        <path d="M16.5 39.5c0-7.2 5-12.5 11.2-12.5 4.4 0 7.2 2.1 9.4 5.4 2.2-3.3 5-5.4 9.4-5.4 6.2 0 11.2 5.3 11.2 12.5S52.7 52 46.5 52c-4.4 0-7.2-2.1-9.4-5.5-2.2 3.4-5 5.5-9.4 5.5-6.2 0-11.2-5.3-11.2-12.5Zm8.2 0c0 3.3 2.1 5.4 5 5.4 2.8 0 4.8-2.4 6.8-5.4-2-3-4-5.4-6.8-5.4-2.9 0-5 2.1-5 5.4Zm13 0c2 3 4 5.4 6.8 5.4 2.9 0 5-2.1 5-5.4s-2.1-5.4-5-5.4c-2.8 0-4.8 2.4-6.8 5.4Z" fill="white" />
        <path d="M31.8 27.3c-1.3-7.5 2.3-12.6 9.8-14-0.2 7.2-3.4 11.8-9.8 14Z" fill="#8DD9A4" />
        <path d="M31.2 27.4c-6.8-1.3-10.3-5.5-10.5-12.2 6.6 1.2 10.1 5.2 10.5 12.2Z" fill="#B8EBC6" />
      </svg>
    </span>
    {!compact && <span>{brand.name}</span>}
  </Link>;
}
