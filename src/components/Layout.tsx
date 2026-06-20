import type { ReactNode } from "react";
import { Header } from "./Header";
import { AICoachWidget } from "./AICoachWidget";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {children}
      </main>
      <footer className="mt-16 border-t border-border bg-muted/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground md:flex-row md:justify-between">
          <p>Verdant — Carbon Footprint Awareness Platform</p>
          <p>Factors: DEFRA 2023, CEA India v19, EPA WARM v15, Poore &amp; Nemecek 2018.</p>
        </div>
      </footer>
      <AICoachWidget />
    </>
  );
}
