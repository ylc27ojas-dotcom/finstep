import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, posts } from "@/content/posts";
import { getCalculator } from "@/lib/finance/registry";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl, site } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Guide not found" };
  const path = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: path },
    authors: [{ name: site.author }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: path,
      publishedTime: post.date,
      authors: [site.author],
      tags: post.tags,
    },
    twitter: { title: post.title, description: post.description },
  };
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const calc = getCalculator(post.calculator);
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/blog" className="hover:text-ink">
          ← All guides
        </Link>
      </nav>
      <article className="mt-6">
        <header>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent-ink">
                {t}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
          <p className="mt-3 text-lg leading-relaxed text-muted">{post.description}</p>
          <p className="mt-4 text-sm text-muted">
            By {site.author} · <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readMinutes} min read
          </p>
        </header>
        <div className="prose-fin mt-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
      </article>

      {calc && (
        <aside className="mt-12 rounded-2xl bg-ink p-6 text-white sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9fe3cf]">Try it with your own numbers</p>
          <p className="mt-2 text-xl font-semibold">{calc.shortName} calculator</p>
          <p className="mt-2 text-white/70">{calc.tagline}</p>
          <Link
            href={`/calculators/${calc.slug}`}
            className="mt-5 inline-block rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-accent-soft"
          >
            Open the calculator
          </Link>
        </aside>
      )}

      <section className="mt-14">
        <h2 className="text-lg font-semibold">More guides</h2>
        <ul className="mt-4 space-y-3">
          {more.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="font-medium text-accent-ink hover:text-accent">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.date,
          author: { "@type": "Person", name: site.author },
          publisher: { "@id": `${site.url}/#org` },
          mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
          keywords: post.tags.join(", "),
        }}
      />
    </div>
  );
}
