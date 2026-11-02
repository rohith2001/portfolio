import type { Metadata, Viewport } from "next";
import MotionProvider from "@/components/runtime";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Rahul Portofolio — Independent creative practice", template: "%s — Rahul Portofolio" },
  description: "Thoughtful design, expressive technology, and digital experiences with a human touch. The independent creative practice of Rahul.",
  icons: { icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%230b0b0b'/%3E%3Ctext x='32' y='48' text-anchor='middle' font-size='48' fill='%23ddd'%3E✳%3C/text%3E%3C/svg%3E" },
};
export const viewport: Viewport = { themeColor: "#0b0b0b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><MotionProvider><main id="main-content" tabIndex={-1}>{children}</main></MotionProvider></body></html>;
}
