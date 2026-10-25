"use client";

import { useState } from "react";

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const share = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer");
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${title} ${window.location.href}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button type="button" onClick={share} className="btn">Share on LinkedIn</button>
      <button type="button" onClick={copy} className="btn-ghost">{copied ? "Copied ✓" : "Copy post text"}</button>
    </div>
  );
}
