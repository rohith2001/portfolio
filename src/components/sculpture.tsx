"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { gsap, useRuntime } from "./runtime";

export default function Sculpture({ kind = "hero", progress }: { kind?: "hero" | "rock"; progress?: RefObject<number> }) {
  const host = useRef<HTMLDivElement>(null);
  const { reduced } = useRuntime();
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    const mount = host.current;
    if (!mount) return;
    void Promise.all([import("three"), fetch("/media/rahul-mark.json").then(response => response.json())]).then(([THREE, contours]: [typeof import("three"), number[][][]]) => {
      if (disposed) return;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2", { alpha: true, antialias: true });
      if (!context) return;
      const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 768 ? 1.25 : 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      mount.appendChild(canvas); setAvailable(true);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.z = 7.5;
      const group = new THREE.Group(); scene.add(group);
      const ambient = new THREE.AmbientLight(0xc8d2df, kind === "rock" ? 0.8 : 0.38); scene.add(ambient);
      const key = new THREE.DirectionalLight(0xffffff, kind === "rock" ? 2.5 : 4); key.position.set(-3, 5, 3); scene.add(key);
      const rim = new THREE.PointLight(0xff9a3d, kind === "rock" ? 1 : 12, 12); rim.position.set(1, -1, 2); scene.add(rim);
      const fill = new THREE.DirectionalLight(0x7d94b4, 1.8); fill.position.set(4, -1, -1); scene.add(fill);
      const pieces: { mesh: import("three").Mesh; origin: import("three").Vector3; drift: import("three").Vector3 }[] = [];
      const random = (i: number) => { const n = Math.sin(i * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
      const textures: import("three").Texture[] = [];
      if (kind === "hero") {
        const metal = new THREE.MeshPhysicalMaterial({ color: 0x20252b, metalness: .85, roughness: .26, clearcoat: 1, clearcoatRoughness: .15 });
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x8695a5, transparent: true, opacity: .18 });
        const smoothContour = (points: number[][]) => new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x * 1.65, y * 1.65, 0)), true, "centripetal").getPoints(points.length * 2).map(p => new THREE.Vector2(p.x, p.y));
        const shape = new THREE.Shape(smoothContour(contours[0]));
        shape.holes.push(new THREE.Path(smoothContour(contours[1])));
        const full = new THREE.ExtrudeGeometry(shape, { depth: .19, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .012, bevelThickness: .016, curveSegments: 18 });
        full.translate(-.13, 0, -.095);
        const source = full.attributes.position;
        const normals = full.attributes.normal;
        const chunks = Array.from({ length: 12 }, () => ({ positions: [] as number[], normals: [] as number[], center: new THREE.Vector3(), count: 0 }));
        for (let i = 0; i < source.count; i += 3) {
          const cx = (source.getX(i) + source.getX(i + 1) + source.getX(i + 2)) / 3;
          const cy = (source.getY(i) + source.getY(i + 1) + source.getY(i + 2)) / 3;
          const slot = Math.min(11, Math.max(0, Math.floor((cy + 1.7) / 3.4 * 6))) * 2 + (cx > 0 ? 1 : 0);
          const chunk = chunks[Math.min(11, slot)];
          for (let j = i; j < i + 3; j++) { chunk.positions.push(source.getX(j), source.getY(j), source.getZ(j)); chunk.normals.push(normals.getX(j), normals.getY(j), normals.getZ(j)); }
          chunk.center.add(new THREE.Vector3(cx, cy, 0)); chunk.count++;
        }
        full.dispose();
        chunks.forEach((chunk, i) => {
          if (!chunk.count) return;
          const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.Float32BufferAttribute(chunk.positions, 3)); geometry.setAttribute("normal", new THREE.Float32BufferAttribute(chunk.normals, 3));
          const mesh = new THREE.Mesh(geometry, metal); group.add(mesh);
          mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 35), edgeMaterial));
          const drift = chunk.center.divideScalar(chunk.count).normalize().multiplyScalar(3.5);
          drift.z = (random(i + 5) - .4) * 4;
          pieces.push({ mesh, origin: mesh.position.clone(), drift });
        });
        for (let i = 0; i < 48; i++) {
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.008 + random(i) * 0.035, 0.15 + random(i + 70) * 0.65, 0.006), metal);
          mesh.position.set((random(i + 8) - 0.5) * 11, (random(i + 30) - 0.5) * 9, (random(i + 40) - 0.5) * 5);
          mesh.rotation.set(random(i) * 3, random(i + 5) * 3, -0.5); group.add(mesh);
          pieces.push({ mesh, origin: mesh.position.clone(), drift: mesh.position.clone().multiplyScalar(0.7) });
        }
        const points = new Float32Array(140 * 3);
        for (let i = 0; i < points.length; i++) points[i] = (random(i + 250) - 0.5) * 15;
        const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
        scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xe8ab62, size: 0.009, transparent: true, opacity: 0.55 })));
      } else {
        const noise = (x: number, y: number, z: number) => {
          const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
          const smooth = (n: number) => n * n * (3 - 2 * n);
          const fx = smooth(x - ix), fy = smooth(y - iy), fz = smooth(z - iz);
          let value = 0;
          for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) for (let dz = 0; dz < 2; dz++) value += random((ix + dx) * 31 + (iy + dy) * 157 + (iz + dz) * 503) * (dx ? fx : 1 - fx) * (dy ? fy : 1 - fy) * (dz ? fz : 1 - fz);
          return value - 0.5;
        };
        const geometry = new THREE.BoxGeometry(1.95, 1.95, 1.4, 48, 48, 32);
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
          const coarse = noise(x * 3, y * 3, z * 3) * 0.22;
          const fine = noise(x * 18, y * 18, z * 18) * 0.04;
          const amount = 1 + coarse + fine;
          positions.setXYZ(i, x * amount, y * amount, z * amount);
        }
        geometry.computeVertexNormals();
        const surface = document.createElement("canvas"); surface.width = surface.height = 256;
        const brush = surface.getContext("2d");
        if (brush) {
          const pixels = brush.createImageData(256, 256);
          for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
            const n = noise(x / 22, y / 22, 4) * 65 + noise(x / 5, y / 5, 7) * 40 + (random(y * 256 + x) - 0.5) * 65;
            const i = (y * 256 + x) * 4;
            pixels.data[i] = 122 + n; pixels.data[i + 1] = 121 + n; pixels.data[i + 2] = 115 + n; pixels.data[i + 3] = 255;
          }
          brush.putImageData(pixels, 0, 0);
        }
        const texture = new THREE.CanvasTexture(surface); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(2, 2); texture.colorSpace = THREE.SRGBColorSpace; textures.push(texture);
        const rock = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xcac7bf, map: texture, bumpMap: texture, bumpScale: 0.11, roughness: 0.96, metalness: 0.02 }));
        group.add(rock);
        const fog = new THREE.Mesh(new THREE.PlaneGeometry(35, 25), new THREE.ShaderMaterial({
          depthWrite: false,
          uniforms: { time: { value: 0 } },
          vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
          fragmentShader: `varying vec2 vUv;uniform float time;
            void main(){vec2 p=vUv*24.;float t=time*.035;p+=vec2(sin(p.y*.7+t),cos(p.x*.8-t))*2.;float n=sin(p.x+sin(p.y*1.3))*cos(p.y*.8)+.5*sin(p.x*2.1+p.y*1.8)+.25*cos(p.y*4.3-p.x*3.7);float shade=pow(clamp(n*.22+.38,0.,1.),2.)*.20;gl_FragColor=vec4(vec3(.012,.017,.024)+shade*vec3(.62,.72,.82),1.);}`,
        })); fog.position.z = -4; scene.add(fog);
      }
      let visible = true, down = false, blast = 0, px = 0, py = 0, holdStarted = 0;
      const pointer = { x: 0, y: 0 };
      const move = (event: PointerEvent) => { const r = mount.getBoundingClientRect(); pointer.x = ((event.clientX - r.left) / r.width - 0.5) * 2; pointer.y = ((event.clientY - r.top) / r.height - 0.5) * 2; };
      const press = (event: PointerEvent) => { if (!(event.target as Element).closest("a,button,input,textarea,select") && mount.getBoundingClientRect().top <= event.clientY && mount.getBoundingClientRect().bottom > event.clientY) { down = true; holdStarted = performance.now(); } };
      const release = () => { down = false; };
      const resize = () => { const { width, height } = mount.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); };
      const observer = new ResizeObserver(resize); observer.observe(mount); resize();
      const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }); intersection.observe(mount);
      const tick = (time: number) => {
        if (!visible || document.hidden || !mount.isConnected) return;
        const t = reduced ? 0 : time;
        px += ((reduced ? 0 : pointer.x) - px) * .035; py += ((reduced ? 0 : pointer.y) - py) * .035;
        const aboutSection = mount.closest(".dark-stage")?.querySelector(".about-intro");
        const visionSection = mount.closest(".dark-stage")?.querySelector(".vision-phase");
        const aboutTop = aboutSection?.getBoundingClientRect().top ?? innerHeight;
        const visionTop = visionSection?.getBoundingClientRect().top ?? innerHeight * 2;
        const scrollSpread = Math.max(0, Math.min(1, 1 - Math.abs(aboutTop) / innerHeight));
        const charged = down && performance.now() - holdStarted > 500 && !reduced;
        const targetSpread = reduced ? 0 : Math.max(charged ? 1 : 0, scrollSpread * .85);
        blast += (targetSpread - blast) * .055;
        if (kind === "hero") {
          group.rotation.set(.14 + py * .12, Math.sin(t * .24) * .5 + px * .16, Math.sin(t * .1) * .06);
          group.position.set(camera.aspect < .7 ? 0 : .25, visionTop <= 0 ? -.1 : -.15, 0);
          group.scale.setScalar(camera.aspect < .7 ? .63 : 1.08);
          pieces.forEach(({ mesh, origin, drift }, i) => { mesh.position.copy(origin).addScaledVector(drift, blast); mesh.rotation.z = blast * (i % 3 - 1); mesh.rotation.y = blast * (i % 2 ? .6 : -.6); });
          rim.position.x = Math.sin(t * 0.5) * 2.5;
        } else {
          const p = progress?.current || 0;
          group.rotation.set(0.28 + p * 1.2, -0.45 + p * Math.PI * 2.2, -0.15 + p * 0.35);
          const scale = 0.55 + Math.min(p * 2, 1) * 0.75;
          group.scale.setScalar(scale * (camera.aspect < 0.7 ? 0.66 : 1));
          group.position.y = Math.max(0, 0.2 - p) + Math.sin(t * 0.35) * 0.025;
          scene.children.forEach(child => { if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) child.material.uniforms.time.value = t; });
        }
        renderer.render(scene, camera);
      };
      if (kind === "hero") { window.addEventListener("pointermove", move); window.addEventListener("pointerdown", press); window.addEventListener("pointerup", release); window.addEventListener("pointercancel", release); window.addEventListener("blur", release); }
      gsap.ticker.add(tick);
      const lost = (e: Event) => { e.preventDefault(); setAvailable(false); visible = false; };
      canvas.addEventListener("webglcontextlost", lost);
      cleanup = () => {
        gsap.ticker.remove(tick); observer.disconnect(); intersection.disconnect();
        window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", press); window.removeEventListener("pointerup", release); window.removeEventListener("pointercancel", release); window.removeEventListener("blur", release);
        canvas.removeEventListener("webglcontextlost", lost);
        const materials = new Set<import("three").Material>();
        scene.traverse(object => { if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments || object instanceof THREE.Points) { object.geometry.dispose(); const m = object.material; (Array.isArray(m) ? m : [m]).forEach(item => materials.add(item)); } });
        materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); renderer.dispose(); canvas.remove();
      };
    }).catch(() => { if (!disposed) setAvailable(false); });
    return () => { disposed = true; cleanup(); };
  }, [kind, progress, reduced]);
  return <div ref={host} className={`sculpture sculpture-${kind}`} aria-hidden="true">{!available && <div className={`sculpture-fallback ${kind}`}>{kind === "hero" ? <img src="/media/rahul-mark.png" alt=""/> : <><i/><i/><i/></>}</div>}</div>;
}
