"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap, ScrollTrigger, SplitText, Action, ExperienceBadge, RouteLink, useRuntime } from "./runtime";
import { ProjectArt } from "./project-art";
import { ServiceArtwork } from "./service-artwork";
import { projects, services } from "@/lib/content";
import { processSteps, team, technology, values } from "@/lib/experience";

type Scope = RefObject<HTMLDivElement | null>;
const clamp = (value: number) => Math.max(0, Math.min(1, value));

function useIntro(scope: Scope) {
  const { ready, reduced } = useRuntime();
  useLayoutEffect(() => {
    if (!ready || reduced) return;
    const splits: SplitText[] = [];
    const context = gsap.context(() => {
      scope.current?.querySelectorAll<HTMLElement>("[data-focus]").forEach(element => {
        const split = SplitText.create(element, { type: "chars,words", aria: "auto" }); splits.push(split);
        gsap.from(split.chars, { opacity: 0, filter: "blur(12px)", duration: .8, stagger: { amount: .95, from: "random" }, ease: "power2.out", scrollTrigger: { trigger: element, start: "top 88%", once: true }, onComplete: () => gsap.set(split.chars, { clearProps: "filter,willChange" }) });
      });
    }, scope);
    return () => { context.revert(); splits.forEach(s => s.revert()); };
  }, [ready, reduced, scope]);
}

export function Shutters({ dark = false }: { dark?: boolean }) {
  return <div className={`phase-shutters ${dark ? "shutters-dark" : ""}`} aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <i key={i} style={{ top: `${i * 100 / 7}%` }}/>)}</div>;
}

export function VisionPhase({ service = false }: { service?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useRuntime();
  useLayoutEffect(() => {
    if (!ready || reduced) return;
    const context = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${innerHeight * .5}`, pin: true, scrub: .6, invalidateOnRefresh: true } });
      tl.fromTo(".vision-words", { xPercent: 0 }, { xPercent: -22, ease: "none", duration: 1 }, 0)
        .to(".phase-shutters i", { scaleY: 1.015, stagger: .035, duration: .28, ease: "none" }, .55);
    }, root);
    return () => context.revert();
  }, [ready, reduced]);
  const words = service ? ["A.I.", "DESIGN", "DEVELOPMENT", "BRANDING"] : ["IMAGINE", "CREATE", "MATTER"];
  return <section ref={root} className="vision-phase"><p className="eyebrow vision-caption">{service ? <>Different disciplines.<br/>A connected perspective.</> : <>An open perspective.<br/>A considered outcome.</>}</p><div className="vision-words" aria-label={service ? "AI, design, development, branding" : "Imagine, create, matter"}>{[0, 1, 2].map(i => <span key={i} aria-hidden={i > 0}>{words.map(word => <span key={word}>{word}<b className="vision-plus">+</b></span>)}</span>)}</div><span className="eyebrow vision-note">✦ From a possibility to something real.</span><Shutters/></section>;
}

function WorkCloud() {
  const root = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useRuntime();
  useLayoutEffect(() => {
    if (!ready || reduced) return;
    const context = gsap.context(() => {
      gsap.from(".cloud-card", { opacity: 0, scale: .4, filter: "blur(8px)", duration: 1.3, stagger: .04, ease: "power3.out" });
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${innerHeight}`, scrub: .6, pin: true, invalidateOnRefresh: true } });
      tl.to(".cloud-card", { x: i => (i % 2 ? 1 : -1) * innerWidth * .4, y: i => (i % 3 - 1) * innerHeight * .55, opacity: 0, scale: .2, stagger: .012, duration: .65, ease: "power2.in" }, 0)
        .to(".cloud-mark", { opacity: 1, scale: 1.12, duration: .6 }, 0)
        .to(".cloud-heading", { y: -30, duration: .6 }, .1);
    }, root);
    return () => context.revert();
  }, [ready, reduced]);
  const positions = [[8, 7, 7], [34, 2, 8], [68, 8, 6], [84, 23, 11], [3, 37, 10], [26, 29, 7], [51, 19, 10], [71, 42, 7], [92, 56, 8], [12, 66, 11], [39, 76, 8], [58, 69, 11], [80, 82, 7], [47, 46, 8], [21, 91, 6], [89, 2, 5], [6, 89, 8], [68, 92, 9]];
  return <section ref={root} className="work-cloud" onPointerMove={e => { if (!reduced && e.pointerType !== "touch") { const rect = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--cloud-x", `${(e.clientX / rect.width - .5) * -22}px`); e.currentTarget.style.setProperty("--cloud-y", `${(e.clientY / rect.height - .5) * -16}px`); } }}><div className="cloud-plane">{positions.map(([x, y, width], i) => <div className="cloud-card" key={i} style={{ left: `${x}%`, top: `${y}%`, width: `${width}vw` }}><RouteLink href={`/work/${projects[i].slug}`} label={`Explore ${projects[i].name}`}><ProjectArt index={i} compact/></RouteLink></div>)}</div><div className="cloud-center"><img className="cloud-mark" src="/media/rahul-mark.png" alt=""/><div className="cloud-heading"><h1 data-focus>Selected work</h1><p>A collection of independent ideas,<br/>digital places, and fresh perspectives.</p></div></div><a href="#connected-work" className="page-scroll" aria-label="Explore the projects">↓</a></section>;
}

function ConnectedProjects() {
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const { ready, reduced } = useRuntime();
  useLayoutEffect(() => {
    if (!ready) return;
    const context = gsap.context(() => {
      const cards = [...root.current!.querySelectorAll<HTMLElement>(".connected-card")];
      if (!reduced) cards.forEach(card => gsap.fromTo(card, { y: 75 }, { y: -40, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: .6 } }));
      const draw = () => {
        if (!root.current || !svg.current) return;
        const base = root.current.getBoundingClientRect();
        svg.current.setAttribute("viewBox", `0 0 ${base.width} ${root.current.scrollHeight}`);
        const paths = [...svg.current.querySelectorAll("path")];
        for (let i = 0; i < cards.length - 1; i++) {
          const a = cards[i].getBoundingClientRect(), b = cards[i + 1].getBoundingClientRect();
          const sx = a.left - base.left + a.width * .5, sy = a.top - base.top + 8;
          const ex = b.left - base.left + b.width * .5, ey = b.top - base.top + 8;
          const dir = ex > sx ? 1 : -1;
          for (let j = 0; j < 3; j++) {
            const spread = base.width * (.18 + j * .1);
            paths[i * 3 + j]?.setAttribute("d", `M${sx},${sy} C${sx + dir * spread},${sy + (ey - sy) * .05} ${ex - dir * spread},${ey - (ey - sy) * .05} ${ex},${ey}`);
          }
        }
      };
      let visible = true;
      const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { rootMargin: "900px" }); observer.observe(root.current!);
      const tick = () => { if (visible) draw(); }; gsap.ticker.add(tick); draw();
      return () => { gsap.ticker.remove(tick); observer.disconnect(); };
    }, root);
    return () => context.revert();
  }, [ready, reduced]);
  const widths = [41, 29, 46, 36, 36, 29, 46, 29];
  return <div ref={root} id="connected-work" className="connected-work"><svg ref={svg} className="project-connections" aria-hidden="true">{Array.from({ length: (projects.length - 1) * 3 }, (_, i) => <path key={i} fill="none" stroke="currentColor" strokeWidth=".7"/>)}</svg>{projects.map((p, i) => <article key={p.slug} className={`connected-item connected-${i % 2 ? "right" : "left"}`}><div className="connected-card" style={{ "--project-width": `${widths[i % widths.length]}vw` } as CSSProperties}><RouteLink href={`/work/${p.slug}`} label={`Explore ${p.name}`}><ProjectArt index={i}/></RouteLink><div className="connected-caption"><h2>{p.name}</h2><div><p>{p.description}</p><Action href={`/work/${p.slug}`}>Explore project</Action></div></div></div></article>)}</div>;
}

export function WorkExperience() {
  const root = useRef<HTMLDivElement>(null); useIntro(root);
  const { contact } = useRuntime();
  return <div ref={root} className="work-experience"><WorkCloud/><ConnectedProjects/><section className="work-invitation"><Action onClick={contact}>Let’s connect</Action><h2 data-focus>Every collaboration starts with a possibility. If you have something in mind, I’d love to explore where we can take it together.</h2><div className="cross-rule" aria-hidden="true">+</div></section></div>;
}

function OrbitalForms() {
  return <div className="orbital-forms" aria-hidden="true"><svg className="orbital-rings" viewBox="0 0 1200 700"><ellipse cx="600" cy="350" rx="530" ry="115"/><ellipse cx="600" cy="350" rx="520" ry="85"/><ellipse cx="600" cy="350" rx="505" ry="55"/></svg>{Array.from({ length: 7 }, (_, i) => <svg key={i} className={`orbit-form form-${i}`} viewBox="0 0 120 120">{Array.from({ length: 9 }, (_, j) => i % 3 === 0 ? <ellipse key={j} cx="60" cy="60" rx={50 - j * 5} ry={45 - j * 4}/> : i % 3 === 1 ? <rect key={j} x={10 + j * 5} y={10 + j * 5} width={100 - j * 10} height={100 - j * 10}/> : <path key={j} d={`M${12 + j * 3} ${15 + j * 10} Q60 ${j * 8} ${108 - j * 3} ${15 + j * 10}`}/>)}</svg>)}</div>;
}

function ServiceIntro() {
  const root = useRef<HTMLDivElement>(null);
  const { ready, reduced, contact } = useRuntime();
  useLayoutEffect(() => {
    if (!ready || reduced) return;
    const context = gsap.context(() => {
      gsap.to(".orbit-form", { rotationY: "+=360", rotationZ: i => i % 2 ? 18 : -18, duration: 18, repeat: -1, ease: "none", stagger: .3 });
      gsap.to(".orbital-forms", { rotationZ: -12, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: .6 } });
    }, root);
    return () => context.revert();
  }, [ready, reduced]);
  return <div ref={root} className="service-intro-sequence"><div className="service-orbit-sticky"><OrbitalForms/></div><section className="service-page-hero"><span className="eyebrow">✦ What we bring</span><h1 data-focus>Areas of expertise</h1><p className="eyebrow">AI & automation · Website & mobile design<br/>Product design · Development · Branding</p><a href="#service-perspective" className="page-scroll" aria-label="Explore our disciplines">↓</a></section><section id="service-perspective" className="service-perspective"><h2 data-focus>Thoughtful disciplines where ideas, design, and technology come together.</h2><div><Action href="/work">Explore the work</Action><Action onClick={contact}>Let’s connect</Action></div></section><VisionPhase service/></div>;
}

function ServicePanels() {
  const root = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useRuntime();
  useLayoutEffect(() => {
    if (!ready || reduced) return;
    const media = gsap.matchMedia();
    media.add("(min-width: 768px)", () => {
      const context = gsap.context(() => {
        const panels = root.current!.querySelectorAll<HTMLElement>(".discipline-panel");
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${innerHeight * 7.2}`, pin: true, scrub: .6, invalidateOnRefresh: true } });
        panels.forEach((panel, i) => {
          if (i) tl.fromTo(panel, { yPercent: 100 }, { yPercent: 0, duration: .72, ease: "none" }, i);
          tl.fromTo(panel.querySelectorAll(".capability-rule"), { scaleX: 0 }, { scaleX: 1, stagger: .045, duration: .4 }, i + .3);
        });
        tl.to({}, { duration: .65 });
      }, root);
      return () => context.revert();
    });
    return () => media.revert();
  }, [ready, reduced]);
  const extra = [["Intelligent search", "Product integrations"], ["Interaction design", "Responsive storytelling"], ["Interaction architecture", "Rapid validation"], ["Headless architecture", "Interactive storytelling"], [], ["Creative direction", "Digital brand worlds"]];
  return <section ref={root} className="discipline-panels" aria-label="Our disciplines">{services.map((s, i) => <article className={`discipline-panel discipline-${i}`} key={s.title}><div className="discipline-visual"><span className="eyebrow">{["Turning possibility into useful intelligence.", "Thoughtful experiences on every screen.", "Products shaped around real people.", "Expressive ideas. Dependable foundations.", "Made for content, built for what’s next.", "Distinctive ideas. Lasting impressions."][i]}</span><div className="discipline-mockup"><ServiceArtwork index={i}/>{i === 1 && <div className="phone-mockup"><ProjectArt index={12} compact/></div>}{i === 2 && <div className="interface-toolbar"><i/><i/><i/><span>YOUR WORKSPACE, SIMPLIFIED.</span></div>}</div></div><div className="discipline-copy"><h2>{s.title}</h2><p>{s.text}</p><span className="eyebrow">Ways we can help</span><ul>{[...s.items, ...extra[i]].map(item => <li key={item}>{item}<span className="capability-rule"/></li>)}</ul></div></article>)}</section>;
}

function TechnologyStack() {
  const [open, setOpen] = useState(0);
  useEffect(() => { const timer = setTimeout(() => ScrollTrigger.refresh(), 380); return () => clearTimeout(timer); }, [open]);
  return <section className="technology-section"><span className="eyebrow">Systems that support the idea.</span><h2 data-focus><span>TECHNOLOGY</span><span>STACK</span></h2><p className="eyebrow tech-subtitle">A considered toolkit.<br/>Chosen around the challenge.</p><div className="technology-list">{technology.map((t, i) => <article className={open === i ? "is-open" : ""} key={t.title}><button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} aria-controls={`technology-${i}`}><span>0{i + 1}.</span><h3>{t.title}</h3><span>{open === i ? "−" : "+"}</span></button><div id={`technology-${i}`} className="technology-content" inert={open !== i}><div><div className="technology-tools">{t.tools.map(tool => <span key={tool}>{tool}</span>)}</div><p>{t.text}</p></div></div></article>)}</div></section>;
}

export function ProcessSequence({ dark = false, wipe = false }: { dark?: boolean; wipe?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useRuntime();
  useLayoutEffect(() => {
    if (!ready || reduced) return;
    const context = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${innerHeight * (innerWidth < 768 ? 1.5 : wipe ? 3 : 2.5)}`, scrub: .6, pin: true, invalidateOnRefresh: true } });
      tl.fromTo(".process-step", { opacity: .12 }, { opacity: 1, stagger: .7, duration: .55, ease: "none" }, 0)
        .fromTo(".process-trace", { scaleX: 0 }, { scaleX: 1, duration: 2, ease: "none" }, 0);
      if (wipe) tl.to(".phase-shutters i", { scaleY: 1.015, duration: .4, stagger: .03, ease: "none" }, 2.4);
      else tl.to({}, { duration: .4 });
    }, root);
    return () => context.revert();
  }, [ready, reduced, wipe]);
  return <section ref={root} className={`process-sequence ${dark ? "process-dark" : ""}`}><span className="eyebrow process-label">Our approach</span><div className="process-inner"><h2 data-focus>How we work</h2><p>A clear, collaborative rhythm<br/>for every new possibility.</p><div className="process-steps">{processSteps.map((step, i) => <article className="process-step" key={step.title}><span className="eyebrow">Step / 0{i + 1}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div><div className="process-line"><div className="process-trace"/>{[0, 1, 2, 3].map(i => <span key={i}>+</span>)}</div></div>{wipe && <Shutters dark/>}</section>;
}

export function ServicesExperience() {
  const root = useRef<HTMLDivElement>(null); useIntro(root);
  return <div ref={root} className="services-experience"><ServiceIntro/><ServicePanels/><TechnologyStack/><ProcessSequence wipe/></div>;
}

function AboutCurtain() {
  const root = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useRuntime();
  const dragging = useRef<{ index: number; y: number } | null>(null);
  useLayoutEffect(() => {
    if (!ready || reduced) return;
    const context = gsap.context(() => {
      gsap.fromTo(".portrait-slat", { scaleY: 1, x: 0 }, { scaleY: .28, x: i => Math.sin(i * .7) * 13, delay: 1.25, duration: 1.35, stagger: .035, ease: "power3.inOut" });
      gsap.to(".about-floating-words", { xPercent: -23, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: .6 } });
    }, root);
    return () => context.revert();
  }, [ready, reduced]);
  return <section ref={root} className="about-curtain"><h1 data-focus>An independent creative practice built on curiosity, thoughtful craft, and a shared ambition.</h1><p className="eyebrow">Where ideas, design,<br/>and technology find a connection.</p><div className="curtain-art" onPointerMove={e => { if (dragging.current) { const distance = e.clientY - dragging.current.y; const slats = e.currentTarget.querySelectorAll(".portrait-slat"); slats.forEach((slat, i) => gsap.to(slat, { y: distance * Math.exp(-Math.abs(i - dragging.current!.index) * .5), duration: .12, overwrite: true })); } else if (!reduced && e.pointerType !== "touch") { e.currentTarget.style.setProperty("--portrait-x", `${(e.nativeEvent.offsetX / e.currentTarget.clientWidth - .5) * 14}px`); } }} onPointerUp={e => { dragging.current = null; if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); gsap.to(e.currentTarget.querySelectorAll(".portrait-slat"), { y: 0, duration: .85, ease: "elastic.out(1,.4)" }); }} onPointerCancel={e => { dragging.current = null; gsap.to(e.currentTarget.querySelectorAll(".portrait-slat"), { y: 0, duration: .5 }); }}><div className="curtain-portrait"><img src="/media/rahul-mark.png" alt="Rahul’s flowing R monogram"/><div className="portrait-glow"/></div>{Array.from({ length: 16 }, (_, i) => <div className="portrait-slat" key={i} style={{ top: `${i * 6.25}%` }} onPointerDown={e => { if (reduced) return; e.preventDefault(); dragging.current = { index: i, y: e.clientY }; e.currentTarget.parentElement?.setPointerCapture(e.pointerId); }}/>)}</div><div className="about-floating-words" aria-hidden="true">IMAGINE + CREATE + MATTER + IMAGINE + CREATE +</div><span className="eyebrow curtain-hint">Drag the lines. Reveal a perspective.</span></section>;
}

function AboutIntroduction() {
  const { contact } = useRuntime();
  return <section className="about-introduction"><div className="about-intro-copy"><span className="eyebrow">A SMALL PRACTICE.<br/>A SHARED PERSPECTIVE.</span><h2 data-focus>Good ideas bring people together. Every project finds its own mix of creative thinking, thoughtful design, and precise engineering.</h2></div><div className="about-intro-bottom"><ExperienceBadge/><div><p>A project starts with the right questions. From there, I work with a network of independent collaborators to bring the right skills to each challenge.</p><p>Clear thinking, open communication, and attention to detail connect every part of the process.</p><Action onClick={contact}>Let’s connect</Action></div></div><div className="cross-rule" aria-hidden="true">+</div></section>;
}

function ValuesSection() {
  const root = useRef<HTMLElement>(null);
  const { ready, reduced } = useRuntime();
  useLayoutEffect(() => {
    if (!ready || reduced) return;
    const context = gsap.context(() => {
      root.current?.querySelectorAll(".values-list article").forEach(card => gsap.fromTo(card, { rotationX: -48, opacity: .45, filter: "brightness(.82)" }, { rotationX: 0, opacity: 1, filter: "brightness(1)", ease: "none", scrollTrigger: { trigger: card, start: "top 94%", end: "top 62%", scrub: .5 } }));
    }, root);
    return () => context.revert();
  }, [ready, reduced]);
  return <section ref={root} className="values-sequence"><div className="values-title"><h2 data-focus>Our values</h2></div><div className="values-list"><p>The principles behind the practice. A few things that guide our decisions, shape the work, and keep us moving in a meaningful direction.</p>{values.map((v, i) => <article key={v.title} style={{ "--value-index": i } as CSSProperties}><h3>{v.title}</h3><p>{v.text}</p></article>)}<span className="eyebrow">✦ A shared belief in thoughtful work.</span></div></section>;
}

function FounderSection() {
  return <section className="founder-section"><div className="founder-image"><img src="/media/portrait.jpg" alt="Editorial portrait study, placeholder photography"/><div/></div><div className="founder-heading"><h2 data-focus>Rahul</h2><p>Designer & creative developer</p></div><div className="founder-side eyebrow">An independent mind.<br/>A collaborative practice.</div><div className="founder-quote"><h2 data-focus>Progress begins with<br/>a different way<br/>of seeing things.</h2><p>A curious perspective, an open conversation,<br/>and care for the details that matter.</p><span className="eyebrow">This is where the work begins.</span></div></section>;
}

function TeamSequence() {
  const root = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(-1);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const { ready, reduced } = useRuntime();
  useLayoutEffect(() => {
    if (!ready || reduced) return;
    const context = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${innerHeight * (innerWidth < 768 ? 1.8 : 3)}`, pin: true, scrub: .6, invalidateOnRefresh: true } });
      tl.from(".team-card", { y: () => innerHeight * .65, opacity: 0, rotateY: 60, scale: .4, stagger: .035, duration: .8 }, 0)
        .to(".team-card", { y: i => (i % 3 - 1) * 8, duration: 1.4 }, .8)
        .to(".phase-shutters i", { scaleY: 1.015, stagger: .03, duration: .4 }, 2.1);
    }, root);
    return () => context.revert();
  }, [ready, reduced]);
  return <><section className="team-prelude"><h2 data-focus>DIFFERENT<br/>MINDS. ONE<br/>PERSPECTIVE.</h2></section><div className="team-section-heading"><h2 data-focus>The collaborators</h2><p>Independent thinkers, makers, and problem solvers.<br/>Different strengths, connected by care.</p></div><section ref={root} className="team-sequence"><svg className="team-guides" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${180 + i % 3 * 90} ${120 + Math.floor(i / 3) * 260} L570 450 L870 450 L${1260 - i % 3 * 90} ${120 + Math.floor(i / 3) * 260}`}/>)}</svg><div className="team-cards">{Array.from({ length: 18 }, (_, i) => { const member = team[i % team.length]; const side = i < 9 ? -1 : 1; const j = i % 9; return <button className={`team-card ${selected === i ? "team-selected" : ""}`} key={i} onClick={() => { if (!suppressClick.current) setSelected(selected === i ? -1 : i); suppressClick.current = false; }}
      onPointerDown={e => { if (reduced) return; e.preventDefault(); e.currentTarget.focus({ preventScroll: true }); drag.current = { x: e.clientX, y: e.clientY, moved: false }; e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.style.zIndex = "9"; }}
      onPointerMove={e => { if (!drag.current || !e.currentTarget.hasPointerCapture(e.pointerId)) return; const x = e.clientX - drag.current.x, y = e.clientY - drag.current.y; if (Math.abs(x) + Math.abs(y) > 8) drag.current.moved = true; e.currentTarget.style.translate = `${x}px ${y}px`; }}
      onPointerUp={e => { if (!drag.current) return; suppressClick.current = drag.current.moved; if (drag.current.moved) setSelected(i); drag.current = null; if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); const button = e.currentTarget; gsap.to(button, { translate: "0px 0px", duration: .7, ease: "power3.out", onComplete: () => { button.style.removeProperty("z-index"); } }); }}
      onPointerCancel={e => { drag.current = null; e.currentTarget.style.translate = "0px 0px"; e.currentTarget.style.removeProperty("z-index"); }}
      aria-label={`Meet ${member.name}, ${member.role}`} style={{ "--team-x": `${side * (36 - j % 3 * 8)}vw`, "--team-y": `${(Math.floor(j / 3) - 1) * 25 + j % 3 * 9}vh`, "--team-angle": `${side * -16}deg` } as CSSProperties}><img src={`/media/${member.image}.jpg`} alt="" loading="lazy" draggable={false}/><span>{member.name}<small>{member.role}</small></span></button>; })}</div><div className="team-center">{selected >= 0 && <img src={`/media/${team[selected % team.length].image}.jpg`} alt=""/>}<span className="eyebrow">{selected < 0 ? "Ideas connect us." : team[selected % team.length].name}</span><p>{selected < 0 ? "Drag a card here, or choose a face." : team[selected % team.length].role}</p></div><span className="eyebrow team-note">Drag or select a collaborator to discover more.</span><Shutters/></section></>;
}

function FitSection() {
  return <section className="fit-section"><span className="eyebrow">A shared ambition</span><h2 data-focus>The right connection<br/>makes better work.</h2><div>{[["Clarity before decoration", "We look for the idea underneath the surface and build the expression around it."], ["A thoughtful pace", "We make room for questions, exploration, and the decisions that move a project forward."], ["Partnership over handoff", "We value people who care about what they make and stay involved in making it better."]].map(([title, text]) => <article key={title}><span aria-hidden="true">+</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>;
}

function RecognitionSequence() {
  const root = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useRuntime();
  useLayoutEffect(() => {
    if (!ready || reduced) return;
    const context = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${innerHeight * (innerWidth < 768 ? 4 : 6)}`, pin: true, scrub: .6, invalidateOnRefresh: true } });
      tl.fromTo(".recognition-backdrop", { clipPath: "circle(14% at 50% 50%)" }, { clipPath: "circle(80% at 50% 50%)", duration: .3, ease: "none" }, 0)
        .fromTo(".recognition-marquee", { xPercent: 8 }, { xPercent: -30, duration: .6, ease: "none" }, 0)
        .to(".recognition-marquee", { opacity: 0, duration: .1 }, .35)
        .from(".recognition-track", { yPercent: 150, opacity: 0, duration: .12 }, .32)
        .to(".recognition-track", { x: () => -Math.max(0, (root.current?.querySelector<HTMLElement>(".recognition-track")?.scrollWidth || 0) - innerWidth * .84), duration: .46, ease: "none" }, .4)
        .to(".phase-shutters i", { scaleY: 1.015, duration: .13, stagger: .012 }, .85);
    }, root);
    return () => context.revert();
  }, [ready, reduced]);
  const milestones = ["Independent thinking", "Digital craft", "Thoughtful interfaces", "Creative technology", "A connected practice", "New perspectives", "Ideas made real", "Details that matter"];
  return <section ref={root} className="recognition-sequence"><div className="recognition-backdrop"><div className="recognition-medal"><img src="/media/rahul-mark.png" alt=""/></div></div><span className="eyebrow recognition-label">Progress, perspectives,<br/>and moments along the way.</span><div className="recognition-marquee" aria-hidden="true">MILESTONES + RECOGNITION + MILESTONES +</div><div className="recognition-track">{milestones.map((m, i) => <article key={m}><span className="eyebrow">Selected moment / 0{i + 1}</span><div className={`milestone-art milestone-${i % 3}`} aria-hidden="true">{i % 3 === 0 ? "✳" : i % 3 === 1 ? "R" : "↗"}</div><h3>{m}</h3><span className="eyebrow">A continuing exploration</span></article>)}</div><Shutters/></section>;
}

function ClientCollection() {
  return <section className="client-collection"><span className="eyebrow">Good company.<br/>Shared possibilities.</span><h2 data-focus>Northstar, Common Ground,<br/>Form & Field, Openhouse,<br/>After Hours, First Light.</h2><div>{projects.slice(0, 16).map(p => <span key={p.slug}>{p.name}</span>)}</div><div className="cross-rule" aria-hidden="true">+</div></section>;
}

function ScatterGallery() {
  const root = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useRuntime();
  const slots = [[76, 18], [83, 57], [13, 56], [48, 74], [32, 31], [64, 42], [20, 84], [54, 14], [78, 85], [17, 22], [44, 49]];
  const photos = ["studio", "collaboration", "meeting", "desk", "workspace", "portrait", "interior", "coffee", "fashion", "nature", "architecture"];
  useLayoutEffect(() => {
    if (!ready || reduced) return;
    const context = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${innerHeight * 7}`, pin: true, scrub: .6, invalidateOnRefresh: true } });
      root.current?.querySelectorAll<HTMLElement>(".scatter-card").forEach((card, i) => tl.from(card, { x: (i % 2 ? 1 : -1) * innerWidth, y: (i % 3 - 1) * innerHeight, opacity: 0, rotate: (i % 2 ? 1 : -1) * 18, duration: 1.2 }, i * .34));
      tl.to({}, { duration: 1 }).to(".phase-shutters i", { scaleY: 1.015, stagger: .04, duration: .65 });
    }, root);
    return () => context.revert();
  }, [ready, reduced]);
  const interact = (button: HTMLButtonElement, index: number) => {
    if (reduced) return;
    const image = button.querySelector("img")!;
    try {
      const canvas = document.createElement("canvas"); canvas.width = canvas.height = 24;
      const ctx = canvas.getContext("2d")!; ctx.drawImage(image, 0, 0, 24, 24);
      const data = ctx.getImageData(0, 0, 24, 24).data;
      let r = 0, g = 0, b = 0; for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; }
      gsap.to(root.current, { backgroundColor: `rgb(${Math.round(r / 576 * .35 + 150)},${Math.round(g / 576 * .35 + 150)},${Math.round(b / 576 * .35 + 150)})`, duration: .8 });
    } catch { /* A neutral background remains usable if an image has not decoded. */ }
    button.style.zIndex = "8";
    gsap.timeline().to(image, { scale: 1.14, rotation: index % 2 ? 3 : -3, duration: .34 }).to(image, { scale: 1, rotation: 0, duration: .56, ease: "power3.out" });
    root.current?.querySelectorAll<HTMLButtonElement>(".scatter-card").forEach((other, i) => { if (other === button) return; const a = button.getBoundingClientRect(), b = other.getBoundingClientRect(); if (Math.abs(a.x - b.x) < a.width * 1.4 && Math.abs(a.y - b.y) < a.height * 1.4) gsap.timeline().to(other.querySelector("img"), { x: i % 2 ? 22 : -22, rotation: i % 2 ? 3 : -3, duration: .34 }).to(other.querySelector("img"), { x: 0, rotation: 0, duration: .56 }); });
  };
  return <section ref={root} className="scatter-gallery"><div className="scatter-heading"><h2 data-focus>Make space. Stay curious.</h2><p>Small moments, shared perspectives,<br/>and life around the work.</p></div>{slots.map(([x, y], i) => <button key={i} className="scatter-card" aria-label={`Explore studio moment ${i + 1}`} onClick={e => interact(e.currentTarget, i)} style={{ left: `${x}%`, top: `${y}%`, "--scatter-rotation": `${(i % 5 - 2) * 2}deg` } as CSSProperties}><img src={`/media/${photos[i]}.jpg`} alt="A moment from creative life, stock photography" loading="lazy"/></button>)}<Shutters dark/></section>;
}

export function AboutExperience({ stories }: { stories: ReactNode }) {
  const root = useRef<HTMLDivElement>(null); useIntro(root);
  return <div ref={root} className="about-experience"><AboutCurtain/><AboutIntroduction/><ValuesSection/><ProcessSequence dark/><FounderSection/><TeamSequence/><FitSection/><RecognitionSequence/><ClientCollection/>{stories}<ScatterGallery/></div>;
}
