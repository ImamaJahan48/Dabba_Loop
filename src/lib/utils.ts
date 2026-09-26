import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) { return clsx(inputs); }
export function pkr(value: number) { return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(value); }
export function formatDate(value: string | Date) { return new Intl.DateTimeFormat("en-PK", { weekday: "short", month: "short", day: "numeric" }).format(new Date(value)); }
