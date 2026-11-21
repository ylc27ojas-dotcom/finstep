import type { MetadataRoute } from "next";
import { calculators } from "@/lib/finance/registry";
import { posts } from "@/content/posts";
import { absoluteUrl } from "@/lib/site";

const SITE_UPDATED = "2026-11-21";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: SITE_UPDATED, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/calculators"), lastModified: SITE_UPDATED, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/formula-sheet"), lastModified: SITE_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/blog"), lastModified: SITE_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/pro"), lastModified: SITE_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/feedback"), lastModified: SITE_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/privacy"), lastModified: SITE_UPDATED, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), lastModified: SITE_UPDATED, changeFrequency: "yearly", priority: 0.2 },
  ];

  const calcPages: MetadataRoute.Sitemap = calculators.map((c) => ({
    url: absoluteUrl(`/calculators/${c.slug}`),
    lastModified: SITE_UPDATED,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: p.date,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...calcPages, ...postPages];
}
