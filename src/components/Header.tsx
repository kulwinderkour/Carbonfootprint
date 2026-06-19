import { Link, useRouter } from "@tanstack/react-router";
import { Leaf, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"
          >
            <Leaf className="h-4 w-4" />
          </span>
          <span>Verdant</span>
        </Link>
        <nav aria-label="Primary" className="hidden gap-1 md:flex">
          <Link to="/" activeOptions={{ exact: true }} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>Home</Link>
          {user && (
            <>
              <Link to="/calculator" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>Calculator</Link>
              <Link to="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>Dashboard</Link>
              <Link to="/progress" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>Progress</Link>
            </>
          )}
          <Link to="/about" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>About</Link>
        </nav>
        <div>
          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sign out">
              <LogOut className="mr-1.5 h-4 w-4" /> Sign out
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
