import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What FinStep collects (very little) and why.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Privacy policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated 21 November 2026</p>
      <div className="prose-fin mt-8">
        <p>FinStep is a free study tool. We collect as little as possible.</p>
        <h2>Calculations</h2>
        <p>
          Everything you type into a calculator is processed in your browser. Your inputs are never sent to our servers. When
          you use a calculator we record one anonymous count against that calculator so we know which ones are useful.
        </p>
        <h2>Feedback</h2>
        <p>
          If you send feedback we store your message, the page it came from and — only if you choose to give it — your email
          address, so we can reply. We never sell or share it.
        </p>
        <h2>Analytics</h2>
        <p>
          We use Microsoft Clarity to understand how the site is used (for example, which pages are visited and where people
          click). Clarity uses cookies and collects usage data as described in the{" "}
          <a href="https://privacy.microsoft.com/privacystatement" rel="noopener noreferrer" target="_blank">
            Microsoft Privacy Statement
          </a>
          . Text you type into the calculators is masked.
        </p>
        <h2>Payments</h2>
        <p>
          Purchases of the Pro PDF are handled by Dodo Payments, the merchant of record. We receive your email address and
          the payment status so we can deliver the file and handle refunds; we never see your card or UPI details.
        </p>
        <h2>Contact</h2>
        <p>Use the feedback form to ask for your data to be deleted.</p>
      </div>
    </div>
  );
}
