import { expect, it } from "vitest";
import { CALCULATOR_SLUGS, POST_SLUGS } from "./known-routes";
import { calculatorSlugs } from "./finance/registry";
import { posts } from "@/content/posts";

it("proxy slug lists match the registry and posts", () => {
  expect([...CALCULATOR_SLUGS].sort()).toEqual([...calculatorSlugs].sort());
  expect([...POST_SLUGS].sort()).toEqual(posts.map((p) => p.slug).sort());
});

it("every post links to an existing calculator", () => {
  for (const p of posts) expect(calculatorSlugs).toContain(p.calculator);
});
