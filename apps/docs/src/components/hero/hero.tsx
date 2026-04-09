"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";

const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-0 bg-surface" />
  ),
});

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export function Hero() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      "npm install @genuikit/core @genuikit/react zod"
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <HeroScene />

        <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-surface/50 via-surface/30 to-surface" />
        <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-surface/70 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full pointer-events-none">
          <motion.div
              className="max-w-3xl"
              initial="hidden"
              animate="visible"
              variants={stagger}
          >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-light/50 text-xs text-text-secondary mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Open Source &middot; MIT Licensed
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6"
          >
            Type-Safe Bridge Between{" "}
            <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              LLM Outputs
            </span>{" "}
            and Your{" "}
            <span className="bg-gradient-to-r from-accent to-primary-light bg-clip-text text-transparent">
              React Components
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-lg sm:text-xl text-text-secondary leading-relaxed mb-8 max-w-2xl"
          >
            Register components with Zod schemas. Feed in raw LLM JSON. Get
            validated, rendered React — or a correction prompt to fix the AI.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mb-8 pointer-events-auto"
          >
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Get Started
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/playground"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border hover:border-primary/50 text-text-primary font-medium transition-all hover:bg-surface-light"
            >
              <svg
                className="mr-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Playground
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="flex items-center gap-3 bg-surface-light/80 backdrop-blur-sm border border-border rounded-lg px-4 py-3 max-w-xl">
              <span className="text-text-secondary text-sm select-none">$</span>
              <code className="text-sm font-mono text-text-primary flex-1 select-all">
                npm install @genuikit/core @genuikit/react zod
              </code>
              <button
                onClick={handleCopy}
                className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded"
                aria-label="Copy to clipboard"
              >
                {copied ? (
                  <svg
                    className="w-4 h-4 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
