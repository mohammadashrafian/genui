"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setHasScrolled(currentScrollY > 10);
    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      setIsVisible(false);
      setIsOpen(false);
    } else {
      setIsVisible(true);
    }
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        hasScrolled
          ? "bg-surface/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              GenUIKit
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/docs"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/playground"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Playground
            </Link>
            <a
              href="https://github.com/mohammadashrafian/genuikit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </a>
            <Link
              href="/docs/getting-started"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pb-4 space-y-2">
            <Link
              href="/docs"
              className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Docs
            </Link>
            <Link
              href="/playground"
              className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Playground
            </Link>
            <a
              href="https://github.com/mohammadashrafian/genuikit"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
              onClick={() => setIsOpen(false)}
            >
              GitHub
            </a>
            <Link
              href="/docs/getting-started"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
