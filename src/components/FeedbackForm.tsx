"use client";

import { useState } from "react";

const KINDS = [
  { value: "wrong-answer", label: "An answer looks wrong" },
  { value: "idea", label: "Idea / new calculator" },
  { value: "bug", label: "Something is broken" },
  { value: "praise", label: "This helped me" },
];

type Status = { state: "idle" } | { state: "sending" } | { state: "sent" } | { state: "error"; message: string };

export function FeedbackForm({ slug, compact = false }: { slug?: string; compact?: boolean }) {
  const [kind, setKind] = useState(slug ? "wrong-answer" : "idea");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot: humans never see this field
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 3) {
      setStatus({ state: "error", message: "Please write a few words so we know what to fix." });
      return;
    }
    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          message: message.trim(),
          email: email.trim() || undefined,
          slug,
          pageUrl: window.location.href.slice(0, 500),
          website,
        }),
      });
      if (res.ok) {
        setStatus({ state: "sent" });
        setMessage("");
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setStatus({ state: "error", message: data?.error ?? "Could not send feedback. Please try again." });
    } catch {
      setStatus({ state: "error", message: "You seem to be offline. Please try again in a moment." });
    }
  };

  if (status.state === "sent") {
    return (
      <div role="status" className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-4 text-sm text-ink">
        <p className="font-semibold">Thanks — got it.</p>
        <p className="mt-1 text-ink-soft">Every report is read, and wrong-answer reports are checked first.</p>
        <button type="button" onClick={() => setStatus({ state: "idle" })} className="mt-2 font-medium text-accent-ink hover:text-accent">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <div className={compact ? "grid gap-3 sm:grid-cols-[200px_1fr]" : "space-y-3"}>
        <div>
          <label htmlFor="fb-kind" className="mb-1 block text-sm font-medium">
            Type
          </label>
          <select
            id="fb-kind"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
          >
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="fb-email" className="mb-1 block text-sm font-medium">
            Email <span className="font-normal text-muted">(optional, for a reply)</span>
          </label>
          <input
            id="fb-email"
            type="email"
            autoComplete="email"
            maxLength={200}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
          />
        </div>
      </div>
      <div>
        <label htmlFor="fb-message" className="mb-1 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="fb-message"
          required
          rows={compact ? 3 : 5}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={slug ? "e.g. My textbook says the answer is 4.76, I get 4.75 here…" : "What should FinStep do next?"}
          className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
        />
      </div>
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="fb-website">Website</label>
        <input id="fb-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      {status.state === "error" && (
        <p role="alert" className="text-sm text-danger">
          {status.message}
        </p>
      )}
      <button
        type="submit"
        disabled={status.state === "sending"}
        className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
      >
        {status.state === "sending" ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}
