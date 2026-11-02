import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const base = process.env.BASE_URL || "http://localhost:3000";
const localChrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const executablePath = process.env.CHROME_PATH || (existsSync(localChrome) ? localChrome : undefined);
const browser = await chromium.launch({ executablePath, headless: true, args: ["--enable-unsafe-swiftshader"] });
const results = [];
const failures = [];
await mkdir("qa", { recursive: true });
const check = (condition, message) => { if (!condition) failures.push(message); };

try {
  for (const [label, width, height] of [["desktop", 1440, 900], ["tablet", 768, 1024], ["mobile", 390, 844], ["large", 1920, 1080]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: label === "mobile", hasTouch: label === "mobile" });
    const page = await context.newPage();
    const errors = [];
    const network = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", message => { if (message.type() === "error" || /hydration|did not match/i.test(message.text())) errors.push(message.text()); });
    page.on("response", response => { if (response.status() >= 400) network.push(`${response.status()} ${response.url()}`); });
    await page.goto(base, { waitUntil: "networkidle" });
    await page.locator(".loader").waitFor({ state: "detached" });
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `qa/${label}-hero.png` });
    check(await page.locator(".sculpture canvas").count() >= 1, `${label}: missing WebGL canvas`);
    if (label === "desktop") {
      const before = await page.locator(".sculpture-hero canvas").screenshot();
      await page.mouse.move(800, 500); await page.mouse.down(); await page.waitForTimeout(1000);
      const after = await page.locator(".sculpture-hero canvas").screenshot();
      await page.mouse.up();
      check(!before.equals(after), "Hero WebGL interaction rendered no change");
      await page.screenshot({ path: "qa/desktop-hero-interaction.png" });
    }
    const dimensions = await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }));
    check(dimensions.documentWidth <= width + 1, `${label}: horizontal overflow ${dimensions.documentWidth}`);
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `qa/${label}-menu.png` });
    check(await page.getByRole("dialog", { name: "Navigation" }).isVisible(), `${label}: menu unavailable`);
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Let’s talk", exact: true }).click();
    await page.waitForTimeout(650);
    await page.screenshot({ path: `qa/${label}-contact.png` });
    await page.getByLabel("Full name", { exact: true }).fill("QA Visitor");
    await page.getByLabel("Email address", { exact: true }).fill("qa@example.com");
    await page.getByLabel("Select a service", { exact: true }).selectOption("Web Development");
    await page.getByLabel("Project details", { exact: true }).fill("An independent portfolio with thoughtful interactions.");
    await page.getByLabel("Estimated budget", { exact: true }).selectOption("$5,000–$10,000");
    await page.getByRole("button", { name: "Prepare inquiry", exact: true }).click();
    check(await page.getByRole("link", { name: "Open email draft", exact: true }).getAttribute("href").then(h => h?.includes("QA%20Visitor")), `${label}: email draft missing form values`);
    await page.getByRole("button", { name: "Edit inquiry", exact: true }).click();
    check(await page.getByLabel("Full name", { exact: true }).inputValue() === "QA Visitor", `${label}: editing loses inquiry values`);
    await page.getByRole("button", { name: "Close contact form", exact: true }).click();
    await page.getByRole("button", { name: "Enable sound", exact: true }).click();
    check(await page.getByRole("button", { name: "Disable sound", exact: true }).getAttribute("aria-pressed") === "true", `${label}: sound did not enable`);
    await page.getByRole("button", { name: "Disable sound", exact: true }).click();
    const sections = await page.evaluate(() => [...document.querySelectorAll("main section,main footer")].map(el => ({ name: el.className.split(" ")[0], top: Math.round(el.getBoundingClientRect().top + scrollY), height: el.getBoundingClientRect().height })));
    for (const section of sections) {
      await page.evaluate(y => window.scrollTo(0, y), section.top);
      await page.waitForTimeout(1300);
      await page.screenshot({ path: `qa/${label}-${section.name}.png` });
    }
    if (label === "desktop") {
      const pins = await page.evaluate(() => [...document.querySelectorAll(".pin-spacer")].map(el => ({ top: el.getBoundingClientRect().top + scrollY, height: el.getBoundingClientRect().height })));
      for (let i = 0; i < pins.length; i++) for (const progress of [0.25, 0.55, 0.85]) {
        await page.evaluate(y => window.scrollTo(0, y), pins[i].top + (pins[i].height - height) * progress);
        await page.waitForTimeout(1400);
        await page.screenshot({ path: `qa/desktop-pin-${i}-${progress}.png` });
      }
      await page.locator(".client-stories").evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + scrollY + 160));
      await page.waitForTimeout(1200);
      await page.getByRole("tab", { name: /COMMON GROUND/ }).click();
      await page.waitForTimeout(650);
      check(await page.locator("#client-quote").innerText().then(t => t.includes("Sam Rivera")), "Testimonial tab did not change");
      await page.keyboard.press("ArrowDown");
      check(await page.getByRole("tab", { name: /FORM & FIELD/ }).getAttribute("aria-selected") === "true", "Testimonial keyboard navigation failed");
      await page.getByRole("button", { name: "Next testimonial", exact: true }).click();
      check(await page.locator("#client-quote").innerText().then(t => t.includes("Robin Taylor")), "Next testimonial control failed");
      await page.getByRole("button", { name: "Previous testimonial", exact: true }).click();
      check(await page.locator("#client-quote").innerText().then(t => t.includes("Jamie Chen")), "Previous testimonial control failed");
    }
    for (const route of ["Work", "Services", "About", "Contact"]) {
      await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page.getByRole("dialog", { name: "Navigation" }).getByRole("link", { name: route, exact: true }).click();
      await page.waitForURL(`${base}/${route.toLowerCase()}`);
      await page.waitForFunction(() => document.querySelector(".route-curtain").getBoundingClientRect().bottom <= 1);
      await page.waitForTimeout(900);
      await page.screenshot({ path: `qa/${label}-page-${route.toLowerCase()}.png` });
      check(await page.locator("h1").count() === 1, `${label}: ${route} has incorrect heading count`);
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label}: ${route} overflows`);
      if (route === "Contact") {
        await page.locator(".faq summary").first().click();
        check(await page.locator(".faq details").first().getAttribute("open") !== null, `${label}: FAQ does not open`);
      }
    }
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await page.getByRole("link", { name: /The story behind the work/ }).click();
    await page.waitForURL(`${base}/story`);
    await page.waitForFunction(() => document.querySelector(".route-curtain").getBoundingClientRect().bottom <= 1);
    await page.waitForTimeout(900);
    for (const slug of ["orbit-ai", "form-studio", "still-house", "arc-objects", "soft-signal", "field-notes"]) {
      await page.goto(`${base}/work/${slug}`, { waitUntil: "networkidle" });
      await page.locator(".loader").waitFor({ state: "detached" });
      check(await page.locator(".case-visuals .project-art").count() === 3, `${label}: missing case study visuals for ${slug}`);
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label}: case study ${slug} overflows`);
    }
    check(errors.length === 0, `${label}: browser errors: ${errors.join(" | ")}`);
    check(network.length === 0, `${label}: HTTP failures: ${network.join(" | ")}`);
    results.push({ label, dimensions, errors, network, sections: sections.length });
    console.log(`${label}: checked ${sections.length} sections, 5 navigation routes, 6 projects, form, sound, menu; ${errors.length} browser errors`);
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator(".loader").waitFor({ state: "detached" });
  check(await page.locator(".pin-spacer").count() === 0, "Reduced motion still pins sections");
  check(await page.locator(".floating-service").first().isVisible(), "Reduced motion services are hidden");
  await page.screenshot({ path: "qa/reduced-motion.png", fullPage: true });
  await context.close();
} finally {
  await browser.close();
  await writeFile("qa/results.json", JSON.stringify({ results, failures }, null, 2));
}
if (failures.length) { console.error(failures.join("\n")); process.exitCode = 1; }
else console.log("All browser checks passed.");
