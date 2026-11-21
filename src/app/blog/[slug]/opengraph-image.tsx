import { getPost, posts } from "@/content/posts";
import { ogSize, renderOgImage } from "@/lib/og";

export const alt = "FinStep study guide";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  return renderOgImage({
    eyebrow: `Study guide · ${post?.readMinutes ?? 5} min read`,
    title: post?.title ?? "FinStep study guide",
    subtitle: post?.tags.join(" · ") ?? "",
  });
}
