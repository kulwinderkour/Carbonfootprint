import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

declare global {
  interface Window {
    google?: any;
  }
}

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Verdant" }, { name: "description", content: "Sign in to track your carbon footprint." }] }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [gsiLoaded, setGsiLoaded] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.navigate({ to: "/dashboard" });
    });
  }, [router]);

  useEffect(() => {
    if (!googleClientId) return;

    if (window.google?.accounts?.id) {
      setGsiLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Keep script to avoid reloading on simple toggle, but clean up if needed
    };
  }, [googleClientId]);

  useEffect(() => {
    if (!gsiLoaded || !googleClientId) return;

    try {
      window.google?.accounts?.id.initialize({
        client_id: googleClientId,
        callback: async (response: any) => {
          setBusy(true);
          try {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
            });
            if (error) {
              toast.error(error.message);
            } else if (data.session) {
              router.navigate({ to: "/dashboard" });
            }
          } catch (err) {
            toast.error("Google authentication failed.");
          } finally {
            setBusy(false);
          }
        },
      });

      const btnContainer = document.getElementById("google-signin-btn");
      if (btnContainer) {
        window.google?.accounts?.id.renderButton(
          btnContainer,
          { 
            theme: "outline", 
            size: "large", 
            width: btnContainer.offsetWidth || 384, 
            text: "continue_with",
          }
        );
      }
    } catch (err) {
      console.error("Failed to initialize Google GSI:", err);
    }
  }, [gsiLoaded, googleClientId, router, mode]); // Re-render button on mode toggle to ensure it is in the DOM

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (res.error) { toast.error(res.error.message); return; }
      if (res.data.session) router.navigate({ to: "/dashboard" });
      else toast.success("Check your email to confirm your account.");
    } finally { setBusy(false); }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in could not start.");
      setBusy(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-elev-2)]">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin" ? "Sign in to track your footprint." : "Start tracking and shrinking your footprint."}
        </p>

        {googleClientId ? (
          <div className="mt-6 flex justify-center w-full min-h-[40px]">
            <div id="google-signin-btn" className="w-full flex justify-center" />
          </div>
        ) : (
          <Button type="button" variant="outline" className="mt-6 w-full" onClick={handleGoogle} disabled={busy}>
            Continue with Google
          </Button>
        )}

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleEmail} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                autoComplete={mode === "signin" ? "current-password" : "new-password"} 
                required 
                minLength={6} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </Layout>
  );
}

