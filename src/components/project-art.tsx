"use client";

import { projects } from "@/lib/content";
import { projectMedia } from "@/lib/experience";

export function ProjectArt({ index, compact = false }: { index: number; compact?: boolean }) {
  const p = projects[index % projects.length];
  return <div className={`project-art art-${p.color} media-art ${compact ? "art-compact" : ""}`}>
    <img className="project-photo" src={`/media/${projectMedia[index % projectMedia.length]}.jpg`} alt="" loading="lazy" decoding="async"/>
    <div className="project-shade"/>
    <div className="art-top"><span>{p.name}®</span><span>Independent perspective ↗</span></div>
    <div className="art-caption"><span>{p.category}</span><strong>{p.line}</strong></div>
    <span className="art-corner" aria-hidden="true">↗</span>
  </div>;
}
