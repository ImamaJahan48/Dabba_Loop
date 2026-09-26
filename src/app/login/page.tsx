import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import { signIn } from "@/actions/auth";
import { brand } from "@/config/brand";
import { hasSupabaseEnv, isDemoMode } from "@/lib/env";

export default async function LoginPage({ searchParams }:{ searchParams:Promise<{error?:string}> }) {
  const params = await searchParams;
  const demo = isDemoMode() || !hasSupabaseEnv();

  return <main className="auth-page">
    <section className="auth-art">
      <BrandMark/>
      <h1>Lunch plans change. Your credits don’t.</h1>
      <div className="mono" style={{color:"white"}}>{brand.tagline}</div>
    </section>

    <section className="auth-form-wrap">
      <form action={signIn} className="auth-form">
        <div className="eyebrow">Welcome back</div>
        <h2>Log in.</h2>

        {demo ? (
          <p className="form-note">Demo mode is active. Enter any valid-looking email and a password with at least 6 characters to open the customer portal.</p>
        ) : (
          <p className="form-note">Real account mode is active. Use an account created in your connected Supabase project.</p>
        )}

        {!demo && params.error && <p className="badge coral">{params.error}</p>}

        <div className="field">
          <label>Email</label>
          <input className="input" type="email" name="email" required placeholder="you@example.com"/>
        </div>
        <div className="field">
          <label>Password</label>
          <input className="input" type="password" name="password" required minLength={6}/>
        </div>
        <button className="btn btn-primary" style={{width:"100%"}}>Log in</button>

        {!demo && (
          <p className="auth-mode-hint">Seeing “Invalid login credentials” means Supabase authentication is active and the account/password does not match.</p>
        )}

        <p className="form-note">New here? <Link href="/signup"><b>Create an account</b></Link></p>
        <p className="form-note"><Link href="/">← Back to website</Link></p>
      </form>
    </section>
  </main>;
}
