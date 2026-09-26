import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import { signUp } from "@/actions/auth";

export default async function SignupPage({ searchParams }:{ searchParams:Promise<{error?:string}> }) {
  const params=await searchParams;
  return <main className="auth-page"><section className="auth-art" style={{background:"#171712"}}><BrandMark/><h1>Build a week around your life, not a mess schedule.</h1><div className="mono" style={{color:"#c7ff66"}}>Buy credits · plan · skip · switch</div></section><section className="auth-form-wrap"><form action={signUp} className="auth-form"><div className="eyebrow">Create account</div><h2>Start flexible.</h2>{params.error&&<p className="badge coral">{params.error}</p>}<div className="field"><label>Full name</label><input className="input" name="fullName" required/></div><div className="field"><label>Mobile</label><input className="input" name="phone" required placeholder="03xx xxxxxxx"/></div><div className="field"><label>Email</label><input className="input" type="email" name="email" required/></div><div className="field"><label>Password</label><input className="input" type="password" name="password" minLength={6} required/></div><button className="btn btn-coral" style={{width:"100%"}}>Create account</button><p className="form-note">Already registered? <Link href="/login"><b>Log in</b></Link></p></form></section></main>;
}
