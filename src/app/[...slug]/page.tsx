import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerPage } from "@/components/portfolio";
import { projects } from "@/lib/content";

const routes = ["work", "services", "about", "contact", "story", ...projects.map(p => `work/${p.slug}`)];
export function generateStaticParams() { return routes.map(route => ({ slug: route.split("/") })); }
type Props = { params: Promise<{ slug: string[] }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find(p => p.slug === slug[1]);
  return { title: project?.name || slug[0].charAt(0).toUpperCase() + slug[0].slice(1) };
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const route = slug.join("/");
  if (!routes.includes(route)) notFound();
  return <InnerPage key={route} slug={route}/>;
}
