import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { calculators, calculatorSlugs, getCalculator } from "@/lib/finance/registry";
import { calculatorGuides } from "@/content/calculator-guides";
import { getPost } from "@/content/posts";
import { CalculatorView } from "@/components/calculator/CalculatorView";
import { FeedbackForm } from "@/components/FeedbackForm";
import { JsonLd } from "@/components/JsonLd";
import { Tex } from "@/components/Tex";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl, site } from "@/lib/site";

export function generateStaticParams() {
  return calculatorSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/calculators/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const def = getCalculator(slug);
  if (!def) return { title: "Calculator not found" };
  const path = `/calculators/${def.slug}`;
  return {
    title: def.name,
    description: `${def.tagline} Free, with step-by-step working and BA II Plus keystrokes.`,
    alternates: { canonical: path },
    openGraph: { title: def.name, description: def.tagline, url: path, type: "website" },
    twitter: { title: def.name, description: def.tagline },
  };
}

export default async function CalculatorPage({ params }: PageProps<"/calculators/[slug]">) {
  const { slug } = await params;
  const def = getCalculator(slug);
  if (!def) notFound();

  const guide = calculatorGuides[def.slug];
  const related = calculators.filter((c) => c.slug !== def.slug && c.category === def.category);
  const others = calculators.filter((c) => c.slug !== def.slug && c.category !== def.category);
  const relatedList = [...related, ...others].slice(0, 4);
  const post = guide?.post ? getPost(guide.post) : undefined;
  const url = absoluteUrl(`/calculators/${def.slug}`);

  return (
    <>
      <div className="border-b border-line bg-card/60">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6">
          <nav aria-label="Breadcrumb" className="no-print text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/calculators" className="hover:text-ink">
                  Calculators
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-ink">{def.category}</li>
            </ol>
          </nav>
          <h1 className="mt-3 max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{def.name}</h1>
          <p className="mt-3 max-w-2xl text-pretty text-lg leading-relaxed text-muted">{def.tagline}</p>
          <p className="mt-4 inline-flex rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-xs font-medium text-accent-ink">
            {def.syllabus}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <CalculatorView slug={def.slug} />
      </div>

      <div className="no-print mx-auto mt-16 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          {guide && <div className="prose-fin" dangerouslySetInnerHTML={{ __html: renderMarkdown(guide.about) }} />}

          {post && (
            <Link
              href={`/blog/${post.slug}`}
              className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-line bg-card p-5 transition-colors hover:border-accent/40"
            >
              <span>
                <span className="text-xs font-semibold uppercase tracking-wider text-accent-ink">Study guide</span>
                <span className="mt-1 block font-semibold text-ink">{post.title}</span>
              </span>
              <span aria-hidden="true" className="text-xl text-muted">
                →
              </span>
            </Link>
          )}

          {guide && guide.faqs.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
              <div className="mt-5 divide-y divide-line rounded-2xl border border-line bg-card">
                {guide.faqs.map((f) => (
                  <details key={f.q} className="group px-5 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                      {f.q}
                      <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-2 leading-relaxed text-ink-soft">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-line bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Formulas used</h2>
            <ul className="mt-4 space-y-4">
              {def.formulas.map((f) => (
                <li key={f.name}>
                  <p className="text-sm font-medium text-ink">{f.name}</p>
                  <div className="mt-1 rounded-lg bg-paper px-2 text-[0.92rem]">
                    <Tex tex={f.tex} block />
                  </div>
                  {f.note && <p className="mt-1 text-xs leading-5 text-muted">{f.note}</p>}
                </li>
              ))}
            </ul>
            <Link href="/formula-sheet" className="mt-5 inline-block text-sm font-medium text-accent-ink hover:text-accent">
              All formulas on one page →
            </Link>
          </section>

          <section className="rounded-2xl border border-line bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">More calculators</h2>
            <ul className="mt-3 space-y-1">
              {relatedList.map((c) => (
                <li key={c.slug}>
                  <Link href={`/calculators/${c.slug}`} className="block rounded-lg px-2 py-2 text-sm hover:bg-paper">
                    <span className="font-medium text-ink">{c.shortName}</span>
                    <span className="block text-xs text-muted">{c.category}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section id="feedback" className="rounded-2xl border border-line bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Spotted a problem?</h2>
            <p className="mb-4 mt-2 text-sm text-muted">Tell us if an answer differs from your textbook — we check every report.</p>
            <FeedbackForm slug={def.slug} />
          </section>
        </aside>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: def.name,
              url,
              description: def.tagline,
              applicationCategory: "EducationalApplication",
              operatingSystem: "Any",
              isAccessibleForFree: true,
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              publisher: { "@id": `${site.url}/#org` },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Calculators", item: absoluteUrl("/calculators") },
                { "@type": "ListItem", position: 2, name: def.shortName, item: url },
              ],
            },
            ...(guide && guide.faqs.length > 0
              ? [
                  {
                    "@type": "FAQPage",
                    mainEntity: guide.faqs.map((f) => ({
                      "@type": "Question",
                      name: f.q,
                      acceptedAnswer: { "@type": "Answer", text: f.a },
                    })),
                  },
                ]
              : []),
          ],
        }}
      />
    </>
  );
}
