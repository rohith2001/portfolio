"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { email, services } from "@/lib/content";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, SplitText);
export { gsap, ScrollTrigger, SplitText };
type RuntimeValue = { ready: boolean; reduced: boolean; contact: () => void; navigate: (href: string) => void };
const Runtime = createContext<RuntimeValue>({ ready: false, reduced: false, contact: () => {}, navigate: () => {} });
export const useRuntime = () => useContext(Runtime);

export function Roll({ children }: { children: string }) {
  return <span className="roll" aria-hidden="true">{[0, 1].map(layer => <span key={layer} className="roll-layer">{Array.from(children).map((c, i) => <span key={i} style={{ transitionDelay: `${i * 9}ms` }}>{c === " " ? "\u00a0" : c}</span>)}</span>)}</span>;
}

export function RouteLink({ href, children, className = "", label }: { href: string; children: ReactNode; className?: string; label?: string }) {
  const { navigate } = useRuntime();
  const click = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault(); navigate(href);
  };
  return <Link href={href} onClick={click} className={className} aria-label={label}>{children}</Link>;
}

export function Action({ children, href, onClick, className = "" }: { children: string; href?: string; onClick?: () => void; className?: string }) {
  const content = <><Roll>{children}</Roll><span className="action-arrow" aria-hidden="true">→</span></>;
  if (href?.startsWith("/")) return <RouteLink href={href} className={`action ${className}`} label={children}>{content}</RouteLink>;
  if (href) return <a href={href} className={`action ${className}`} aria-label={children}>{content}</a>;
  return <button type="button" onClick={onClick} className={`action ${className}`} aria-label={children}>{content}</button>;
}

export function ExperienceBadge() {
  return <div className="experience-badge"><div><svg viewBox="0 0 40 26" aria-hidden="true"><ellipse cx="20" cy="13" rx="17" ry="10"/><ellipse cx="20" cy="13" rx="8" ry="10"/><path d="M3 13h34M20 3v20"/></svg><span>EST. 2018</span></div><span>8+ YEARS EXPLORING<br/>DIGITAL POSSIBILITIES.</span></div>;
}

function Inquiry({ close }: { close: () => void }) {
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setFields(Object.fromEntries([...d.entries()].map(([key, value]) => [key, String(value)])));
    setDraft(`Hello Rahul,\n\n${d.get("message")}\n\nName: ${d.get("name")}\nEmail: ${d.get("email")}\nCompany: ${d.get("company") || "Independent"}\nService: ${d.get("service")}\nBudget: ${d.get("budget")}\n`);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(draft); setCopied(true); } catch { setCopied(false); }
  };
  return <div className="inquiry-inner"><button className="close-round" aria-label="Close contact form" onClick={close}>×</button>
    <h2 id="inquiry-title">Let’s make something matter.</h2><p>Share a little about your idea.<br/>Every good project starts with a conversation.</p>
    {draft ? <div className="draft-result" role="status"><h3>Your brief is ready.</h3><p>Open your email app to review and send your inquiry.</p><textarea aria-label="Your inquiry draft" value={draft} readOnly/><Action href={`mailto:${email}?subject=${encodeURIComponent("A new project — Rahul Portofolio")}&body=${encodeURIComponent(draft)}`}>Open email draft</Action><Action onClick={copy}>{copied ? "Copied to clipboard" : "Copy your brief"}</Action><button className="text-link" onClick={() => setDraft("")}>Edit inquiry</button></div> :
    <form onSubmit={submit} className="inquiry-form">
      <input name="name" defaultValue={fields.name} autoComplete="name" aria-label="Full name" placeholder="Full name" required maxLength={100}/>
      <input name="email" defaultValue={fields.email} autoComplete="email" type="email" aria-label="Email address" placeholder="Email address" required maxLength={200}/>
      <input name="company" defaultValue={fields.company} autoComplete="organization" aria-label="Company or website" placeholder="Company / website name" maxLength={200}/>
      <select name="service" aria-label="Select a service" defaultValue={fields.service || ""} required><option value="" disabled>Select a service</option>{services.map(s => <option key={s.title}>{s.title}</option>)}</select>
      <textarea name="message" defaultValue={fields.message} aria-label="Project details" placeholder="Tell me about your goals, timeline, and what you have in mind…" required minLength={10} maxLength={4000}/>
      <select name="budget" aria-label="Estimated budget" defaultValue={fields.budget || ""} required><option value="" disabled>Select your estimated budget</option>{["Under $5,000", "$5,000–$10,000", "$10,000–$25,000", "$25,000+", "Let’s work it out"].map(b => <option key={b}>{b}</option>)}</select>
      <button className="action" type="submit" aria-label="Prepare inquiry"><Roll>Prepare inquiry</Roll><span aria-hidden="true">→</span></button>
    </form>}
    <div className="inquiry-bottom"><div className="or"><span>OR</span></div><a className="booking" href={`mailto:${email}?subject=Let%E2%80%99s%20find%20a%20time%20to%20talk`}>↗<span>Arrange a conversation</span></a><p>Prefer email? <a href={`mailto:${email}`}>{email}</a></p></div>
  </div>;
}

export default function MotionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [menu, setMenu] = useState(false);
  const [inquiry, setInquiry] = useState(false);
  const [sound, setSound] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useRef<Lenis | null>(null);
  const loader = useRef<HTMLDivElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const transitioning = useRef(false);
  const initialPath = useRef(pathname);
  const close = useCallback(() => { setMenu(false); setInquiry(false); }, []);
  const contact = useCallback(() => { setMenu(false); setInquiry(true); }, []);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update(); media.addEventListener("change", update);
    const instance = new Lenis({ duration: 1.15, smoothWheel: !media.matches, syncTouch: false, anchors: true });
    lenis.current = instance;
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    const progress = { value: 0 };
    const tl = gsap.timeline({ onComplete: () => setReady(true) });
    tl.to(progress, { value: 100, duration: media.matches ? 0 : 1.05, ease: "power2.inOut", onUpdate: () => { const n = loader.current?.querySelector(".load-number"); if (n) n.textContent = String(Math.round(progress.value)).padStart(3, "0"); } })
      .to(".load-cross", { rotation: 180, scale: 0.5, duration: 0.35 }, 0)
      .to(loader.current, { clipPath: "inset(0 0 100% 0)", duration: media.matches ? 0 : 0.65, ease: "power3.inOut" });
    return () => { tl.kill(); media.removeEventListener("change", update); gsap.ticker.remove(tick); instance.destroy(); lenis.current = null; };
  }, []);

  useEffect(() => {
    if (pathname === initialPath.current && !transitioning.current) return;
    initialPath.current = pathname;
    lenis.current?.scrollTo(0, { immediate: true, force: true });
    const tween = gsap.to(curtain.current, { y: 0, yPercent: -100, duration: reduced ? 0 : 0.65, delay: 0.12, ease: "power3.inOut", onComplete: () => { transitioning.current = false; ScrollTrigger.refresh(); document.getElementById("main-content")?.focus({ preventScroll: true }); } });
    return () => { tween.kill(); };
  }, [pathname, reduced]);

  const navigate = useCallback((href: string) => {
    close();
    if (href === pathname) { lenis.current?.scrollTo(0); return; }
    if (transitioning.current) return;
    transitioning.current = true;
    gsap.fromTo(curtain.current, { y: 0, yPercent: 100 }, { y: 0, yPercent: 0, duration: reduced ? 0 : 0.45, ease: "power3.inOut", onComplete: () => router.push(href, { scroll: false }) });
  }, [close, pathname, reduced, router]);

  useEffect(() => {
    const active = inquiry ? panel.current : menu ? menuPanel.current : null;
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    lenis.current?.stop();
    const main = document.getElementById("main-content");
    if (main) main.inert = true;
    const tl = gsap.fromTo(active, { x: inquiry || innerWidth >= 768 ? 60 : 0, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: reduced ? 0 : 0.55, ease: "power3.out" });
    const selectors = 'a[href],button,input,select,textarea,[tabindex="0"]';
    const focusable = () => [...active.querySelectorAll<HTMLElement>(selectors)].filter(e => e.getClientRects().length > 0);
    const timer = setTimeout(() => focusable()[0]?.focus({ preventScroll: true }), 100);
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const list = focusable(); const first = list[0]; const last = list.at(-1);
        if (e.shiftKey && (document.activeElement === first || !active.contains(document.activeElement))) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => { tl.kill(); clearTimeout(timer); document.removeEventListener("keydown", keyboard); if (main) main.inert = false; lenis.current?.start(); previous?.focus({ preventScroll: true }); };
  }, [menu, inquiry, close, reduced]);

  useEffect(() => {
    if (reduced || !matchMedia("(pointer:fine)").matches) return;
    const x = gsap.quickTo(cursor.current, "x", { duration: 0.18, ease: "power3.out" });
    const y = gsap.quickTo(cursor.current, "y", { duration: 0.18, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      x(e.clientX); y(e.clientY);
      const target = e.target as Element;
      cursor.current?.classList.toggle("is-link", !!target.closest("a,button"));
      cursor.current?.classList.toggle("is-project", !!target.closest(".project-art"));
      if (cursor.current) cursor.current.style.opacity = "1";
    };
    const leave = () => { if (cursor.current) cursor.current.style.opacity = "0"; };
    window.addEventListener("pointermove", move); document.addEventListener("pointerleave", leave);
    return () => { x.tween.kill(); y.tween.kill(); window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); };
  }, [reduced]);

  useEffect(() => () => { void audio.current?.close(); }, []);
  const toggleSound = async () => {
    try {
      if (!audio.current) {
        const ctx = new AudioContext(); audio.current = ctx;
        const volume = ctx.createGain(); volume.gain.value = 0.018; volume.connect(ctx.destination);
        [110, 164.81, 220.2].forEach(f => { const oscillator = ctx.createOscillator(); oscillator.type = "sine"; oscillator.frequency.value = f; oscillator.connect(volume); oscillator.start(); });
      }
      if (sound) await audio.current.suspend(); else await audio.current.resume();
      setSound(!sound);
    } catch { setSound(false); }
  };

  return <Runtime.Provider value={{ ready, reduced, contact, navigate }}>
    <a href="#main-content" className="skip-link">Skip to content</a>
    {!ready && <div ref={loader} className="loader" aria-hidden="true"><div className="load-cross c1">+</div><div className="load-cross c2">+</div><div className="load-cross c3">+</div><div className="load-cross c4">+</div><span className="load-mantra">IMAGINE · MAKE · MATTER</span><span className="load-number">000</span></div>}
    <div ref={curtain} className="route-curtain" aria-hidden="true"><span>IMAGINE · MAKE · MATTER</span></div>
    <header className="site-header">
      <RouteLink href="/" className="wordmark" label="Rahul Portofolio home"><span className="brand-symbol" aria-hidden="true">✳</span><span>RAHUL<span className="brand-sub">PORTOFOLIO</span></span></RouteLink>
      <div className="header-controls"><button className="sound-button" aria-label={sound ? "Disable sound" : "Enable sound"} aria-pressed={sound} onClick={toggleSound}><span aria-hidden="true">{sound ? "♬" : "♩"}</span>{!sound && <i/>}</button><button className="talk-button" onClick={contact} aria-label="Let’s talk"><Roll>Let’s talk</Roll></button><button className="menu-button" onClick={() => { setInquiry(false); setMenu(!menu); }} aria-expanded={menu} aria-controls="site-menu" aria-label={menu ? "Close menu" : "Open menu"}><span className="menu-word"><Roll>{menu ? "Close" : "Menu"}</Roll></span><span className={`menu-icon ${menu ? "open" : ""}`} aria-hidden="true"><i/><i/></span></button></div>
    </header>
    {menu && <div className="overlay-layer"><button tabIndex={-1} className="scrim" onClick={close} aria-label="Dismiss menu"/><div ref={menuPanel} id="site-menu" role="dialog" aria-modal="true" aria-label="Navigation" className="menu-panel" data-lenis-prevent><button className="panel-close" aria-label="Close navigation" onClick={close}>×</button><nav>{["Work", "Services", "About", "Contact"].map(item => <RouteLink key={item} href={`/${item.toLowerCase()}`} label={item}><Roll>{item}</Roll><span className="nav-arrow">↗</span></RouteLink>)}</nav><RouteLink className="story-link" href="/story">✦ The story behind the work</RouteLink><div className="menu-contact"><span className="eyebrow">Business enquiry</span><a href={`mailto:${email}`}>{email}</a><ExperienceBadge/></div></div></div>}
    {inquiry && <div className="overlay-layer inquiry-layer"><button tabIndex={-1} className="scrim" onClick={close} aria-label="Dismiss contact form"/><div ref={panel} className="inquiry-panel" role="dialog" aria-modal="true" aria-labelledby="inquiry-title" data-lenis-prevent><Inquiry close={close}/></div></div>}
    {children}
    <div ref={cursor} className="custom-cursor" aria-hidden="true"><span>↗</span></div>
  </Runtime.Provider>;
}
