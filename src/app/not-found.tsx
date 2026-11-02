import Link from "next/link";
export default function NotFound() {
  return <div className="not-found"><span className="eyebrow">404 / An unexplored direction</span><h1>A little<br/>off course.</h1><p>This page isn’t here. A new direction awaits.</p><Link href="/" className="action">Back to the beginning <span>→</span></Link></div>;
}
