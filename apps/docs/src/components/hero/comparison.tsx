"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";

type Support = "full" | "partial" | "none";

interface ComparisonRow {
  feature: string;
  genuikit: Support;
  copilotkit: Support;
  vercelai: Support;
  manual: Support;
}

const comparisonData: ComparisonRow[] = [
  { feature: "Type-safe validation", genuikit: "full", copilotkit: "partial", vercelai: "partial", manual: "none" },
  { feature: "Auto-correction loop", genuikit: "full", copilotkit: "none", vercelai: "none", manual: "none" },
  { feature: "No vendor lock-in", genuikit: "full", copilotkit: "none", vercelai: "partial", manual: "full" },
  { feature: "Token efficiency", genuikit: "full", copilotkit: "none", vercelai: "partial", manual: "partial" },
  { feature: "Small bundle size", genuikit: "full", copilotkit: "partial", vercelai: "partial", manual: "full" },
  { feature: "Framework agnostic", genuikit: "full", copilotkit: "none", vercelai: "none", manual: "full" },
  { feature: "Streaming support", genuikit: "full", copilotkit: "full", vercelai: "full", manual: "none" },
  { feature: "Built-in security", genuikit: "full", copilotkit: "partial", vercelai: "none", manual: "none" },
];

function StatusIcon({ status }: { status: Support }) {
  if (status === "full") {
    return (
        <div className="flex justify-center group-hover:scale-110 transition-transform duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400 blur-md opacity-40 rounded-full" />
            <svg className="relative w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>
    );
  }
  if (status === "partial") {
    return (
        <div className="flex justify-center">
          <svg className="w-6 h-6 text-amber-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </div>
    );
  }
  return (
      <div className="flex justify-center">
        <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
  );
}

const advantages = [
  {
    title: "Zero Vendor Lock-in",
    description: "No middleware servers, no hidden costs. Bring your own API key and use any LLM provider. Switch providers without changing a line of UI code.",
    accent: "rgba(139, 92, 246, 0.15)", // Primary purple
    icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
    ),
  },
  {
    title: "30% Cheaper & Faster",
    description: "Wire format compresses tool definitions and LLM output, reducing token count by 30%. Lower cost per request and faster time-to-first-byte.",
    accent: "rgba(217, 70, 239, 0.15)", // Accent pink
    icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
    ),
  },
  {
    title: "Hallucination-Safe",
    description: "Never shows broken UI. Every LLM output is validated against Zod schemas. On failure, auto-corrects with a retry prompt or falls back gracefully.",
    accent: "rgba(16, 185, 129, 0.15)", // Emerald green
    icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    ),
  },
];

function AdvantageCard({ advantage }: { advantage: typeof advantages[0] }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
      <motion.div
          onMouseMove={handleMouseMove}
          className="group relative rounded-3xl border border-white/5 bg-white/[0.02] p-8 overflow-hidden backdrop-blur-sm"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Dynamic Mouse Highlight */}
        <motion.div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
            style={{
              background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              ${advantage.accent},
              transparent 80%
            )
          `,
            }}
        />

        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
            {advantage.icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
            {advantage.title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed font-light">
            {advantage.description}
          </p>
        </div>
      </motion.div>
  );
}

export function Comparison() {
  return (
      <section className="relative pb-32 bg-surface overflow-hidden">
        {/* Atmospheric Backgrounds */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why{" "}
              <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              GenUIKit
            </span>
              ?
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              See how GenUIKit compares to other approaches for rendering LLM
              output as UI.
            </p>
          </motion.div>

          {/* Matrix Comparison Table */}
          <motion.div
              className="mb-32 overflow-x-auto custom-scrollbar pb-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="min-w-[800px] rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden p-1 shadow-2xl">
              <table className="w-full border-collapse">
                {/* Highlight the GenUIKit column permanently using colgroup */}
                <colgroup>
                  <col className="w-1/4" />
                  <col className="w-[18%] bg-primary/5 border-x border-primary/20" />
                  <col className="w-[18%]" />
                  <col className="w-[18%]" />
                  <col className="w-[18%]" />
                </colgroup>

                <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-6 px-6 text-sm uppercase tracking-widest font-bold text-text-secondary">
                    Capability
                  </th>
                  <th className="py-6 px-6 text-center relative overflow-hidden">
                    {/* Top glowing edge for GenUIKit column */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-light to-transparent opacity-50" />
                    <span className="text-base font-black bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent tracking-wide">
                      GenUIKit
                    </span>
                  </th>
                  <th className="py-6 px-6 text-center text-sm font-medium text-white/60 tracking-wide">
                    CopilotKit
                  </th>
                  <th className="py-6 px-6 text-center text-sm font-medium text-white/60 tracking-wide">
                    Vercel AI SDK
                  </th>
                  <th className="py-6 px-6 text-center text-sm font-medium text-white/60 tracking-wide">
                    Manual
                  </th>
                </tr>
                </thead>

                {/* Apply group-hover dimming to tbody so hovering one row dims the others */}
                <tbody className="group/tbody">
                {comparisonData.map((row, i) => (
                    <tr
                        key={row.feature}
                        className="border-b border-white/5 transition-colors duration-300 hover:bg-white/[0.04] group/row hover:!opacity-100 group-hover/tbody:opacity-50"
                    >
                      <td className="py-5 px-6 text-sm font-medium text-white/90 tracking-wide group-hover/row:text-white transition-colors">
                        {row.feature}
                      </td>
                      <td className="py-5 px-6">
                        <StatusIcon status={row.genuikit} />
                      </td>
                      <td className="py-5 px-6">
                        <StatusIcon status={row.copilotkit} />
                      </td>
                      <td className="py-5 px-6">
                        <StatusIcon status={row.vercelai} />
                      </td>
                      <td className="py-5 px-6">
                        <StatusIcon status={row.manual} />
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-center gap-8 mt-8 text-xs font-medium uppercase tracking-widest text-text-secondary">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> Full support
            </span>
              <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Partial
            </span>
              <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/20" /> None
            </span>
            </div>
          </motion.div>

          {/* Key Advantages Grid */}
          <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ staggerChildren: 0.15 }}
          >
            {advantages.map((advantage, i) => (
                <motion.div
                    key={advantage.title}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <AdvantageCard advantage={advantage} />
                </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
  );
}
