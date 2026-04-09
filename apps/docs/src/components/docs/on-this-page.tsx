"use client";

import { useState, useEffect } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function OnThisPage({ headings }: { headings: TOCItem[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block fixed right-8 top-24 w-56">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
        On this page
      </h4>
      <ul className="space-y-1.5 border-l border-border">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block text-xs leading-relaxed transition-colors pl-3 -ml-px border-l ${
                activeId === h.id
                  ? "border-primary text-primary-light"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              } ${h.level === 3 ? "pl-6" : ""}`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
