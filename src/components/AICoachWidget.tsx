import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { chatWithCoach } from "@/lib/ai-coach.functions";
import { getFootprintHistory, getProfile } from "@/lib/footprint.functions";
import { calculateFootprint } from "@/lib/calculator";
import { sanitizeFootprintInput } from "@/lib/validation";
import type { FootprintEntryRow, FootprintInput, Persona } from "@/types/footprint";
import { Button } from "@/components/ui/button";

type Msg = { role: "user" | "assistant"; content: string };

export function AICoachWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your Verdant carbon coach. Ask me anything about shrinking your footprint — transport, energy, food, water or waste.",
    },
  ]);

  const chat = useServerFn(chatWithCoach);
  const histFn = useServerFn(getFootprintHistory);
  const profileFn = useServerFn(getProfile);

  // Context is best-effort. If user isn't signed in, these queries fail silently.
  const history = useQuery({
    queryKey: ["coach-history"],
    queryFn: () => histFn({}).catch(() => [] as FootprintEntryRow[]),
    enabled: open,
    staleTime: 60_000,
  });
  const profile = useQuery({
    queryKey: ["coach-profile"],
    queryFn: () => profileFn({}).catch(() => null),
    enabled: open,
    staleTime: 60_000,
  });

  const latest = (history.data as FootprintEntryRow[] | undefined)?.[0];
  const context = latest
    ? (() => {
        const result = calculateFootprint(sanitizeFootprintInput(latest.inputs as Partial<FootprintInput>));
        return {
          persona: ((profile.data?.persona as Persona) ?? "student") as Persona,
          totalKg: latest.total_kg,
          topCategory: result.topCategory,
          previousTotalKg: (history.data as FootprintEntryRow[] | undefined)?.[1]?.total_kg ?? null,
        };
      })()
    : undefined;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await chat({ data: { messages: next.slice(-10), context } });
      setMessages((m) => [...m, { role: "assistant", content: res.message }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: e instanceof Error ? e.message : "Coach is unavailable right now." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating launcher button */}
      <button
        type="button"
        aria-label={open ? "Close AI coach" : "Open AI coach"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-elev-2,0_10px_30px_rgba(0,0,0,0.2))] ring-4 ring-primary/15 transition hover:scale-105 hover:bg-primary/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-7 w-7" />}
        {!open && (
          <span className="absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-background" aria-hidden />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Verdant AI coach"
          className="fixed bottom-24 right-5 z-50 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          <header className="flex items-center gap-3 border-b border-border bg-[image:var(--gradient-hero)] p-4 text-primary-foreground">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
              <Bot className="h-5 w-5" aria-hidden />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">Verdant AI Coach</p>
              <p className="text-xs text-primary-foreground/80">
                {context ? `Tuned to your ${Math.round(context.totalKg)} kg footprint` : "Ask anything about your footprint"}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-md p-1 hover:bg-white/15"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "max-w-[90%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-foreground"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Coach is thinking…
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-border bg-background p-3"
          >
            <label htmlFor="coach-input" className="sr-only">
              Message
            </label>
            <input
              id="coach-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the coach…"
              autoComplete="off"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button type="submit" size="icon" disabled={sending || !input.trim()} aria-label="Send">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
