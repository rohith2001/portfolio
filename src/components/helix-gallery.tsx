"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { Action, RouteLink, ScrollTrigger, gsap, useRuntime } from "./runtime";
import { projects } from "@/lib/content";
import { projectMedia } from "@/lib/experience";
import { ProjectArt } from "./project-art";

const galleryProjects = projects.slice(0, 9);
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const v = clamp(n); return v * v * (3 - 2 * v); };

export function HelixGallery() {
  const root = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const { ready, reduced, navigate } = useRuntime();

  useLayoutEffect(() => {
    if (!ready || reduced) return;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${innerHeight * 4.8}`, pin: true, scrub: .65, invalidateOnRefresh: true, onUpdate: self => { root.current?.classList.toggle("is-grid", self.progress > .93); } } });
      timeline.to(progress, { current: 1, duration: 1, ease: "none" }, 0)
        .fromTo(".helix-heading h2:first-child", { xPercent: -48 }, { xPercent: 0, duration: .32, ease: "none" }, 0)
        .fromTo(".helix-heading h2:last-child", { xPercent: 48 }, { xPercent: 0, duration: .32, ease: "none" }, 0)
        .to(".helix-heading", { opacity: 0, duration: .15 }, .53)
        .fromTo(".helix-grid", { autoAlpha: 0 }, { autoAlpha: 1, duration: .05 }, .94)
        .to(".helix-stage", { opacity: 0, duration: .05 }, .94);
    }, root);
    return () => context.revert();
  }, [ready, reduced]);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let cleanup = () => {};
    const mount = host.current;
    if (!mount) return;
    void import("three").then(async THREE => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2", { alpha: true, antialias: true });
      if (!gl) { root.current?.classList.add("no-webgl"); return; }
      const renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.appendChild(canvas);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, .1, 80); camera.position.z = 12;
      const meshes: import("three").Mesh<import("three").PlaneGeometry, import("three").MeshBasicMaterial>[] = [];
      const textures: import("three").Texture[] = [];
      const guides: import("three").Line[] = [];
      const pointer = new THREE.Vector2(5, 5), raycaster = new THREE.Raycaster();
      let visible = false, hovered = -1, previous = -2, lastProgress = -1, lastWidth = -1;
      let targets: { left: number; top: number; width: number; height: number }[] = [];
      const hovers = new Array(9).fill(0);
      const resize = () => {
        const rect = mount.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        renderer.setSize(rect.width, rect.height); camera.aspect = rect.width / rect.height; camera.updateProjectionMatrix();
        targets = [...root.current!.querySelectorAll<HTMLElement>(".helix-grid a")].map(el => { const r = el.getBoundingClientRect(); return { left: r.left - rect.left, top: r.top - rect.top, width: r.width, height: r.height }; });
        lastWidth = -1;
      };
      const observer = new ResizeObserver(resize); observer.observe(mount);
      const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { rootMargin: "400px" }); intersection.observe(mount);
      for (let i = 0; i < 9; i++) {
        const surface = document.createElement("canvas"); surface.width = 768; surface.height = 512;
        const ctx = surface.getContext("2d")!;
        ctx.fillStyle = ["#b6b5a6", "#5d302c", "#737b65", "#354554"][i % 4]; ctx.fillRect(0, 0, 768, 512);
        const texture = new THREE.CanvasTexture(surface); texture.colorSpace = THREE.SRGBColorSpace; textures.push(texture);
        const draw = (photo?: HTMLImageElement) => {
          if (cancelled) return;
          if (photo) { const scale = Math.max(768 / photo.width, 512 / photo.height); ctx.drawImage(photo, (768 - photo.width * scale) / 2, (512 - photo.height * scale) / 2, photo.width * scale, photo.height * scale); }
          const shade = ctx.createLinearGradient(0, 0, 0, 512); shade.addColorStop(0, "#0002"); shade.addColorStop(.45, "#0000"); shade.addColorStop(1, "#000a"); ctx.fillStyle = shade; ctx.fillRect(0, 0, 768, 512);
          ctx.fillStyle = "#fff"; ctx.font = '20px "Familjen Grotesk Variable",sans-serif'; ctx.fillText(galleryProjects[i].name.toUpperCase(), 35, 48);
          ctx.font = '65px "Familjen Grotesk Variable",sans-serif';
          const words = galleryProjects[i].line.split(" "); const midpoint = Math.ceil(words.length / 2);
          ctx.fillText(words.slice(0, midpoint).join(" "), 35, 390); ctx.fillText(words.slice(midpoint).join(" "), 35, 460);
          texture.needsUpdate = true; lastProgress = -1;
        };
        draw();
        const photo = new Image(); photo.onload = () => draw(photo); photo.src = `/media/${projectMedia[i]}.jpg`;
        const geometry = new THREE.PlaneGeometry(1, 1, 24, 6);
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material); mesh.frustumCulled = false; mesh.userData.index = i; meshes.push(mesh); scene.add(mesh);
      }
      for (let i = 0; i < 2; i++) {
        const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(180 * 3), 3));
        const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x757575, transparent: true, opacity: .45 })); line.frustumCulled = false; guides.push(line); scene.add(line);
      }
      const move = (event: PointerEvent) => { const rect = mount.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1); };
      const leave = () => { pointer.set(5, 5); hovered = -1; };
      const click = () => { if (hovered >= 0 && progress.current < .94) navigate(`/work/${galleryProjects[hovered].slug}`); };
      mount.addEventListener("pointermove", move); mount.addEventListener("pointerleave", leave); mount.addEventListener("click", click);
      const tick = (time: number) => {
        // React removes the route DOM before passive effect cleanup runs. A
        // shared ticker can still fire in that interval; never divide by a
        // detached (zero-sized) canvas container while flattening the cards.
        if (!visible || document.hidden || !mount.isConnected || mount.clientWidth < 1 || mount.clientHeight < 1) return;
        const p = progress.current, flatten = smooth((p - .73) / .22);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(meshes, false)[0]; hovered = hit ? hit.object.userData.index as number : -1;
        mount.style.cursor = hovered >= 0 ? "pointer" : "auto";
        let settling = false;
        hovers.forEach((value, i) => { const target = hovered === i ? 1 : 0; if (Math.abs(target - value) > .001) settling = true; hovers[i] += (target - value) * .12; });
        if (Math.abs(p - lastProgress) < .00001 && previous === hovered && !settling && lastWidth === mount.clientWidth && flatten < .01) return;
        lastProgress = p; previous = hovered; lastWidth = mount.clientWidth;
        const worldH = 2 * Math.tan(42 * Math.PI / 360) * 12, worldW = worldH * camera.aspect;
        const mobile = camera.aspect < .75;
        const radius = mobile ? 4 : 8;
        const rotation = (p - .3) * 5;
        const entrance = (1 - smooth(p / .22)) * -4;
        for (let i = 0; i < meshes.length; i++) {
          const mesh = meshes[i], positions = mesh.geometry.attributes.position, uv = mesh.geometry.attributes.uv;
          const target = targets[i];
          const angle = (i - 4) * .285 + rotation;
          const hover = hovers[i];
          for (let j = 0; j < positions.count; j++) {
            const u = uv.getX(j), v = uv.getY(j), a = angle + (u - .5) * .26 * (1 + hover * .08);
            const x = Math.sin(a) * radius;
            const y = -2 + a * (mobile ? 1.2 : 1.8) + (v - .5) * (mobile ? .9 : 1.35) * (1 + hover * .12) + entrance + p * 1.5;
            const z = (Math.cos(a) - 1) * radius + hover * .25;
            const tx = target ? ((target.left + u * target.width) / mount.clientWidth - .5) * worldW : x;
            const ty = target ? (.5 - (target.top + (1 - v) * target.height) / mount.clientHeight) * worldH : y;
            const ripple = Math.sin(u * 10 + time * 2 + i) * .07 * Math.sin(flatten * Math.PI);
            positions.setXYZ(j, x + (tx - x) * flatten, y + (ty - y) * flatten, z * (1 - flatten) + ripple);
          }
          positions.needsUpdate = true; mesh.geometry.computeBoundingSphere();
        }
        guides.forEach((line, index) => {
          const positions = line.geometry.attributes.position;
          for (let j = 0; j < 180; j++) { const a = -3.8 + j / 179 * 7.6 + rotation; positions.setXYZ(j, Math.sin(a) * radius, -2 + a * (mobile ? 1.2 : 1.8) + entrance + p * 1.5 + (index ? 2.3 : -1.5), (Math.cos(a) - 1) * radius); }
          positions.needsUpdate = true; (line.material as import("three").LineBasicMaterial).opacity = .35 * (1 - flatten);
        });
        renderer.render(scene, camera);
      };
      resize(); renderer.compile(scene, camera); gsap.ticker.add(tick);
      const lost = (event: Event) => { event.preventDefault(); visible = false; root.current?.classList.add("no-webgl"); };
      canvas.addEventListener("webglcontextlost", lost);
      cleanup = () => {
        gsap.ticker.remove(tick); observer.disconnect(); intersection.disconnect();
        mount.removeEventListener("pointermove", move); mount.removeEventListener("pointerleave", leave); mount.removeEventListener("click", click); canvas.removeEventListener("webglcontextlost", lost);
        meshes.forEach(mesh => { mesh.geometry.dispose(); mesh.material.dispose(); }); guides.forEach(line => { line.geometry.dispose(); (line.material as import("three").Material).dispose(); }); textures.forEach(texture => texture.dispose()); renderer.dispose(); canvas.remove();
      };
    }).catch(() => { if (!cancelled) root.current?.classList.add("no-webgl"); });
    return () => { cancelled = true; cleanup(); };
  }, [reduced, navigate]);

  return <section ref={root} className="helix-gallery" aria-label="Design explorations">
    <div className="helix-heading"><h2>IDEAS IN</h2><p>Exploring new perspectives.<br/>An ongoing creative practice.</p><h2>MOTION</h2></div>
    <div ref={host} className="helix-stage" aria-hidden="true"/>
    <div className="helix-grid">{galleryProjects.map((project, i) => <RouteLink href={`/work/${project.slug}`} key={project.slug} label={`Explore ${project.name}`}><ProjectArt index={i} compact/></RouteLink>)}</div>
    <p className="helix-description">Concepts, visual studies, and small discoveries from a curious creative practice.</p>
    <div className="helix-action"><Action href="/work">Explore the collection</Action></div>
  </section>;
}
