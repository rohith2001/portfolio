"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Action, ExperienceBadge, RouteLink, gsap, ScrollTrigger, SplitText, useRuntime } from "./runtime";
import Sculpture from "./sculpture";
import { WorkExperience, ServicesExperience, AboutExperience, VisionPhase } from "./experience-pages";
import { HelixGallery } from "./helix-gallery";
import { ProjectArt } from "./project-art";
import { email, projects, services, testimonials } from "@/lib/content";

function usePageMotion(root: React.RefObject<HTMLDivElement | null>) {
  const { ready, reduced } = useRuntime();
  useLayoutEffect(() => {
    if (!ready || !root.current || reduced) return;
    const splits: SplitText[] = [];
    const context = gsap.context(() => {
      root.current?.querySelectorAll<HTMLElement>("[data-reveal]").forEach(element => {
        const split = SplitText.create(element, { type: "chars,words", wordsClass: "reveal-word", aria: "auto" }); splits.push(split);
        gsap.from(split.chars, { opacity: 0, filter: "blur(12px)", duration: .8, stagger: { amount: 1.1, from: "random" }, ease: "power2.out", scrollTrigger: { trigger: element, start: "top 88%", once: true }, onComplete: () => gsap.set(split.chars, { clearProps: "filter,willChange" }) });
      });
      root.current?.querySelectorAll<HTMLElement>("[data-rise]").forEach(element => gsap.from(element, { y: 55, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 92%", once: true } }));
      const orbitCards = root.current?.querySelectorAll(".orbit-card");
      if (orbitCards?.length) {
        gsap.from(orbitCards, { scale: 0.5, opacity: 0, duration: 1.4, stagger: 0.06, ease: "power3.out" });
        gsap.to(orbitCards, { y: i => (i % 2 ? 1 : -1) * 180, rotate: i => (i % 2 ? 1 : -1) * 20, ease: "none", scrollTrigger: { trigger: ".page-hero", start: "top top", end: "bottom top", scrub: 1 } });
      }
      const about = root.current?.querySelector(".about-statement");
      if (about) {
        const split = SplitText.create(about, { type: "words", aria: "auto" }); splits.push(split);
        gsap.from(split.words, { opacity: 0.12, stagger: 0.07, scrollTrigger: { trigger: about, start: "top 85%", end: "bottom 40%", scrub: true } });
      }
      const ribbon = root.current?.querySelector(".manifesto-line");
      if (ribbon) gsap.fromTo(ribbon, { xPercent: 4 }, { xPercent: -28, ease: "none", scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "bottom top", scrub: 1 } });
      const cards = root.current?.querySelectorAll(".fact-card");
      if (cards?.length) gsap.from(cards, { rotateX: 38, y: 100, opacity: 0.3, stagger: 0.12, scrollTrigger: { trigger: ".fact-grid", start: "top 95%", end: "top 45%", scrub: 1 } });
    }, root);
    const refresh = () => ScrollTrigger.refresh();
    void document.fonts.ready.then(refresh);
    return () => { context.revert(); splits.forEach(split => split.revert()); };
  }, [ready, reduced, root]);
}

function Hero() {
  const { contact } = useRuntime();
  return <section className="hero hero-statement" aria-label="Introduction"><span className="eyebrow hero-kicker">Rahul Portofolio</span><div className="hero-heading"><h1 data-reveal>Independent thinking. Distinctive digital experiences, shaped through strategy, design, and technology.</h1><div className="hero-actions"><Action onClick={contact}>Tell me about your idea</Action><Action href="/work">Explore selected work</Action></div></div><a className="scroll-cue" href="#about" aria-label="Scroll to introduction">↓</a><div className="interaction-hint">PRESS & HOLD TO RELEASE<br/>EXPLORE <span>ϟ</span> THE SPACE BETWEEN.</div><div className="hero-aside"><ExperienceBadge/><p>Digital products, identities, and experiences shaped with purpose, curiosity, and care.</p></div></section>;
}

function AboutIntro() {
  return <section id="about" className="about-intro"><span className="eyebrow about-label">About</span><h2 className="about-statement">Rahul Portofolio is an independent creative practice shaping distinctive digital experiences through ideas, design, and technology.</h2><div className="about-bottom"><span className="eyebrow">A SMALL PRACTICE.<br/>AN OPEN MIND.<br/>A WORLD OF POSSIBILITIES.</span><div><p>My ambition is to bring a human touch to the digital world, making every experience feel thoughtful, intuitive, and worth remembering.</p><Action href="/about">Meet the mind behind it</Action></div></div></section>;
}

function Facts() {
  return <section className="facts light"><div className="section-title"><h2 data-reveal>A few numbers</h2><p>A small glimpse of the<br/>journey so far.</p></div><div className="fact-grid"><article className="fact-card fact-dark"><span className="eyebrow">Ideas & recognition</span><div className="award-sculpture" aria-hidden="true">✳</div><div className="fact-bottom"><p>Small details.<br/>A lasting impression.</p><strong>30<sup>+</sup></strong></div></article><article className="fact-card fact-center"><span className="eyebrow">Experiences delivered</span><div className="fact-orb">120<sup>+</sup></div><p>Good relationships turn<br/>first projects into next chapters.</p></article><article className="fact-card fact-people"><span className="eyebrow">A collective approach</span><div className="people-art" aria-hidden="true"><i/><i/><i/></div><div className="fact-bottom"><p>Different perspectives.<br/>One shared ambition.</p><strong>12<sup>+</sup></strong></div></article></div><div className="partners"><span className="eyebrow">In good company</span><div>{["northstar", "Common Ground", "form & field", "openhouse", "AFTER HOURS"].map(name => <span key={name}>{name}</span>)}</div></div><div className="cross-rule" aria-hidden="true">+</div></section>;
}

function SelectedWork() {
  const host = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useRuntime();
  useLayoutEffect(() => {
    if (!ready || reduced) return;
    const media = gsap.matchMedia();
    media.add("(min-width: 768px)", () => {
      const track = host.current?.querySelector<HTMLElement>(".work-track");
      if (!track) return;
      const travel = gsap.to(track, { x: () => -(track.scrollWidth - innerWidth), ease: "none", scrollTrigger: { trigger: host.current, start: "top top", end: () => `+=${innerWidth * 3.1}`, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
      track.querySelectorAll(".work-project").forEach((card, i) => gsap.fromTo(card, { y: i === 0 ? 0 : 220 }, { y: -70, ease: "none", scrollTrigger: { trigger: card, containerAnimation: travel, start: "left right", end: "right left", scrub: true } }));
    });
    return () => media.revert();
  }, [ready, reduced]);
  return <section ref={host} id="selected-work" className="selected-work light"><div className="work-track"><div className="work-intro work-panel"><span className="eyebrow">A selection, 2024—2026</span><h2>Selected work<br/>& <em>explorations</em></h2><Action href="/work">Discover every project</Action></div>{projects.slice(0, 3).map((project, i) => <article className={`work-project work-panel project-${i}`} key={project.slug}><RouteLink href={`/work/${project.slug}`} label={`Explore ${project.name}`}><ProjectArt index={i}/></RouteLink><div className="project-caption"><div><h3>{project.name}</h3><p>{project.description}</p></div><Action href={`/work/${project.slug}`}>Explore project</Action></div></article>)}<div className="work-end work-panel"><h3>A collection of purposeful identities, digital places, and fresh perspectives.</h3><Action href="/work">Discover every project</Action></div></div></section>;
}

function ServicesScene() {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const { ready, reduced } = useRuntime();
  useLayoutEffect(() => {
    if (!ready || reduced) return;
    const context = gsap.context(() => {
      const chars = root.current?.querySelectorAll(".service-line > span");
      const cards = root.current?.querySelectorAll(".floating-service");
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${innerHeight * 7.5}`, pin: true, scrub: 1, invalidateOnRefresh: true, onUpdate: self => { progress.current = self.progress; } } });
      tl.to(".service-background", { opacity: 1, duration: 1.25 }).to(".service-type", { color: "#deddd9", duration: 0.4 }, 0.25)
        .to(".service-meta", { color: "#ddd", duration: 0.4 }, 0.25).to({}, { duration: 0.7 });
      if (chars) tl.to(chars, { x: i => Math.sin(i * 9) * innerWidth * 0.75, y: i => 300 + Math.cos(i * 3) * 550, rotation: i => (i % 2 ? 1 : -1) * (45 + i * 6), opacity: 0, stagger: 0.015, duration: 1.6, ease: "power2.in" });
      cards?.forEach((card, i) => { tl.fromTo(card, { autoAlpha: 0, y: 100 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 3.5 + i * 0.65).to(card, { autoAlpha: 0, y: -100, duration: 0.45 }, 4.6 + i * 0.65); });
      tl.to({}, { duration: 0.3 });
    }, root);
    return () => context.revert();
  }, [ready, reduced]);
  return <section ref={root} className="services-scene" aria-label="Services"><div className="service-background"><Sculpture kind="rock" progress={progress}/></div><span className="service-meta service-label eyebrow">Ways we can work together</span><h2 className="service-type" aria-label="AI, Design, Development, Branding">{["A.I.", "DESIGN", "DEVELOPMENT", "BRANDING"].map(line => <span className="service-line" key={line} aria-hidden="true">{Array.from(line).map((char, i) => <span key={i}>{char}</span>)}</span>)}</h2><div className="floating-services">{services.map((service, i) => <article key={service.title} className={`floating-service floating-${i}`}><span className="service-number">0{i + 1} /</span><h3>{service.title}</h3><p>{service.text}</p></article>)}</div><div className="service-meta service-bottom"><span className="eyebrow">✦ Many disciplines. One considered approach.</span><Action href="/services">Explore the possibilities</Action></div></section>;
}

function ClientStories() {
  const [selected, setSelected] = useState(0);
  const quote = useRef<HTMLDivElement>(null);
  const { contact, reduced } = useRuntime();
  useEffect(() => {
    if (reduced) return;
    const tween = gsap.fromTo(quote.current, { opacity: 0, y: 18, filter: "blur(4px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out" });
    return () => { tween.revert(); };
  }, [selected, reduced]);
  const item = testimonials[selected];
  return <section className="client-stories light"><div className="cross-rule" aria-hidden="true">+</div><div className="stories-heading"><h2 data-reveal>Shared <em>stories.</em></h2><p>Good things happen when<br/>people build together.<br/>A few words from collaborators.</p></div><div className="stories-content"><div className="client-tabs" role="tablist" aria-label="Collaborator stories" aria-orientation="vertical">{testimonials.map((t, i) => <button key={t.brand} id={`client-tab-${i}`} role="tab" aria-selected={selected === i} aria-controls="client-quote" tabIndex={selected === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={e => { if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return; e.preventDefault(); const next = e.key === "Home" ? 0 : e.key === "End" ? testimonials.length - 1 : (selected + (e.key === "ArrowDown" ? 1 : -1) + testimonials.length) % testimonials.length; setSelected(next); document.getElementById(`client-tab-${next}`)?.focus(); }}><span>↗</span>{t.brand}</button>)}</div><div ref={quote} id="client-quote" role="tabpanel" aria-labelledby={`client-tab-${selected}`}><blockquote>{item.quote}</blockquote><div className="quote-person"><span className="person-mark" aria-hidden="true">{item.name.split(" ").map(n => n[0]).join("")}</span><div><p>{item.name}</p><span>{item.role}</span></div></div></div></div><div className="stories-action"><div className="quote-controls"><button aria-label="Previous testimonial" onClick={() => setSelected((selected + testimonials.length - 1) % testimonials.length)}>←</button><button aria-label="Next testimonial" onClick={() => setSelected((selected + 1) % testimonials.length)}>→</button></div><Action onClick={contact}>Start our next chapter</Action></div></section>;
}

export function Footer() {
  const { contact } = useRuntime();
  const [time, setTime] = useState("--:--");
  useEffect(() => { const tick = () => setTime(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())); tick(); const interval = setInterval(tick, 30000); return () => clearInterval(interval); }, []);
  return <footer className="footer"><div className="footer-top eyebrow"><span>Let’s make work worth feeling.</span><span>IST → {time}</span></div><div className="footer-main"><h2>Have something<br/><em>good</em> in mind?</h2><div><Action onClick={contact}>Tell me about your idea</Action><Action href={`mailto:${email}?subject=A%20conversation%20with%20Rahul`}>Arrange a conversation</Action></div></div><div className="footer-details"><p>© RAHUL PORTOFOLIO 2026</p><div><span className="eyebrow">Business enquiry</span><a href={`mailto:${email}`}>{email}</a><span>India · Available worldwide</span></div><div><span className="eyebrow">Explore</span><div className="footer-links">{["Work", "Services", "About", "Contact"].map(link => <RouteLink key={link} href={`/${link.toLowerCase()}`}>{link}</RouteLink>)}</div></div></div><div className="footer-word" aria-hidden="true">RAHUL</div><div className="footer-base eyebrow"><span>Independent by design.</span><a href="#main-content">Back to the top ↑</a></div></footer>;
}

export function HomePage() {
  const root = useRef<HTMLDivElement>(null); usePageMotion(root);
  return <div ref={root}><div className="dark-stage"><div className="dark-visual"><Sculpture/></div><Hero/><AboutIntro/><VisionPhase/></div><Facts/><SelectedWork/><ServicesScene/><ClientStories/><HelixGallery/><Footer/></div>;
}

function PageHero({ title, label, light = false, children }: { title: ReactNode; label: string; light?: boolean; children?: ReactNode }) {
  return <section className={`page-hero ${light ? "light" : ""}`}><span className="eyebrow">{label}</span><h1 data-reveal>{title}</h1>{children}<a href="#page-details" className="page-scroll" aria-label="Explore this page">↓</a></section>;
}

export function InnerPage({ slug }: { slug: string }) {
  const root = useRef<HTMLDivElement>(null); usePageMotion(root);
  const { contact } = useRuntime();
  const projectIndex = projects.findIndex(project => `work/${project.slug}` === slug);
  let content: ReactNode;
  if (projectIndex >= 0) {
    const project = projects[projectIndex];
    const next = projects[(projectIndex + 1) % projects.length];
    content = <><div className="case-layout"><aside className="case-sidebar"><Action href="/work">Back to the collection</Action><h1 data-reveal>{project.name}</h1><p>{project.description}</p><dl><dt>Discipline</dt><dd>{project.category}</dd><dt>Year</dt><dd>{project.year}</dd><dt>Approach</dt><dd>Strategy, design & development</dd></dl><Action href={`/work/${next.slug}`}>Next project</Action></aside><div className="case-visuals"><ProjectArt index={projectIndex}/><div className="case-note"><span className="eyebrow">The starting point</span><h2>A clear idea.<br/>A new perspective.</h2><p>{project.description} An exploration of how a strong point of view becomes a cohesive digital experience.</p></div><div className="case-detail-art"><ProjectArt index={(projectIndex + 3) % projects.length}/></div><div className="case-note"><span className="eyebrow">The experience</span><h2>Every detail,<br/>working together.</h2><p>From the first interaction to the smallest response, a consistent visual language creates a natural rhythm and a lasting impression.</p></div><ProjectArt index={projectIndex}/><Action href={`/work/${next.slug}`}>{`Up next: ${next.name}`}</Action></div></div><Footer/></>;
  } else if (slug === "work") {
    content = <><WorkExperience/><Footer/></>;
  } else if (slug === "services") {
    content = <><ServicesExperience/><Footer/></>;
  } else if (slug === "about") {
    content = <><AboutExperience stories={<ClientStories/>}/><Footer/></>;
  } else if (slug === "contact") {
    content = <><PageHero light title={<>Let’s begin<br/><em>something.</em></>} label="Every idea starts somewhere"><div className="contact-orb" aria-hidden="true">✳</div></PageHero><section id="page-details" className="contact-content light"><div><span className="eyebrow">A conversation, a possibility</span><h2 data-reveal>Good work starts<br/>with a hello.</h2><Action onClick={contact}>Tell me about your idea</Action><Action href={`mailto:${email}`}>{email}</Action></div><div><h3>Based in India.<br/>Connected everywhere.</h3><p>Working across time zones with people who care about what they make.</p><h3>A shared ambition?</h3><p>For projects, collaborations, or a thoughtful conversation, my inbox is open.</p></div></section><section className="faq light"><h2>Good <em>questions.</em></h2><div>{[ ["What kind of projects do you take on?", "Brand identities, websites, digital products, and creative development. The common thread is a clear ambition and a willingness to make something thoughtful."], ["Who do you collaborate with?", "Founders, independent teams, and established organizations who value good design and an open, collaborative process."], ["Where do we start?", "Share a little about your idea, goals, and timing. We can arrange a conversation to understand the challenge and find the right next step."], ["Can we work across time zones?", "Absolutely. Clear communication and a considered rhythm make remote collaboration feel close, wherever we are."] ].map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section><Footer/></>;
  } else {
    content = <><PageHero title={<>A name.<br/>A perspective.<br/><em>A possibility.</em></>} label="The story behind the work"><div className="story-orbits" aria-hidden="true"><i/><i/><i/></div></PageHero><section id="page-details" className="story-body"><span className="eyebrow">Rahul Portofolio</span><h2 data-reveal>A personal practice.<br/>An open-ended story.</h2><p>This is a place for the work, the experiments, and the ideas that connect them. A portfolio in the making, shaped by every new collaboration.</p><div className="story-symbol" aria-hidden="true">✳</div><h2 data-reveal>Imagine.<br/><em>Make.</em><br/>Matter.</h2><p>Three simple intentions. Stay open to possibilities. Give ideas a tangible form. Make something that means a little more to the people who experience it.</p></section><Footer/></>;
  }
  return <div ref={root} className={`inner-page page-${slug.split("/")[0]}`}>{content}</div>;
}
