import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "false" || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return NextResponse.next({ request });
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });
  const { data:{ user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const protectedPath = path.startsWith("/app") || path.startsWith("/admin") || path.startsWith("/partner");
  if (protectedPath && !user) {
    const url = request.nextUrl.clone(); url.pathname = "/login"; url.searchParams.set("next", path); return NextResponse.redirect(url);
  }
  if (user && (path.startsWith("/admin") || path.startsWith("/partner"))) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const role = profile?.role || "customer";
    if (path.startsWith("/partner") && !["partner","admin"].includes(role)) return NextResponse.redirect(new URL("/app",request.url));
    if (path.startsWith("/admin") && role !== "admin") {
      const allowed:Record<string,string[]> = {
        finance:["/admin/payments","/admin/wallets","/admin/reports"],
        kitchen:["/admin/kitchen","/admin/menu","/admin/calendar","/admin/orders"],
        delivery:["/admin/delivery","/admin/orders"]
      };
      const targets=allowed[role] || [];
      if (path === "/admin") return NextResponse.redirect(new URL(targets[0] || "/app",request.url));
      if (!targets.some(prefix=>path.startsWith(prefix))) return NextResponse.redirect(new URL(targets[0] || "/app",request.url));
    }
  }
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
