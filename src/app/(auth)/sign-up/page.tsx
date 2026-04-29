"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browser-client";
import { Button } from "@/components/ui/Button";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await supabase.auth.signUp({ email, password });
      if (res.error) throw res.error;
      // After sign-up, user may need email confirmation depending on Supabase settings.
      router.push("/sign-in");
    } catch (err: any) {
      setError(err?.message || "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={onSignUp}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
      >
        <div className="text-lg font-semibold">Create account</div>
        <div className="mt-1 text-sm text-white/60">
          Sign up first, then create multiple STAR resumes from your AI interview.
        </div>

        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <div className="text-xs text-white/60 mb-1">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-electric/40"
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="block text-sm">
            <div className="text-xs text-white/60 mb-1">Password</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-electric/40"
              type="password"
              autoComplete="new-password"
              required
            />
          </label>

          {error ? <div className="text-sm text-lavender/90">{error}</div> : null}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Creating..." : "Create account"}
          </Button>

          <div className="text-xs text-white/60 text-center">
            Already have an account?{" "}
            <a className="text-electric/90 hover:underline" href="/sign-in">
              Sign in
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}

