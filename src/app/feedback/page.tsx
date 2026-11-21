import type { Metadata } from "next";
import { FeedbackForm } from "@/components/FeedbackForm";

export const metadata: Metadata = {
  title: "Send feedback",
  description: "Report a wrong answer, suggest a calculator or tell us what helped.",
  alternates: { canonical: "/feedback" },
};

export default function FeedbackPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Feedback</h1>
      <p className="mt-3 text-lg text-muted">
        Which calculator should come next? Did an answer differ from your textbook? Every message is read.
      </p>
      <div className="mt-8 rounded-2xl border border-line bg-card p-6">
        <FeedbackForm />
      </div>
    </div>
  );
}
