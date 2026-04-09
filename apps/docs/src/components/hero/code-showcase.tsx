"use client";

import { motion } from "framer-motion";
import React from "react";

function CodeBlock({
                       title,
                       language,
                       children,
                   }: {
    title: string;
    language: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/20 hover:shadow-primary/20">
            {/* macOS style terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
                <span className="text-xs text-text-secondary ml-3 font-medium tracking-wide">{title}</span>
                <span className="ml-auto text-xs text-text-secondary/50 uppercase tracking-wider font-bold">
          {language}
        </span>
            </div>
            <div className="p-5 overflow-x-auto custom-scrollbar">
                <pre className="text-[13px] sm:text-sm font-mono leading-relaxed tracking-wide">{children}</pre>
            </div>
        </div>
    );
}

function RegistryCode() {
    return (
        <code>
            <span className="text-primary-light">import</span>
            <span className="text-white">{" { "}</span>
            <span className="text-accent">createRegistry</span>
            <span className="text-white">{" } "}</span>
            <span className="text-primary-light">from</span>
            <span className="text-emerald-400">{` "@genuikit/core"`}</span>
            <span className="text-text-secondary">;</span>
            {"\n"}
            <span className="text-primary-light">import</span>
            <span className="text-white">{" { "}</span>
            <span className="text-accent">z</span>
            <span className="text-white">{" } "}</span>
            <span className="text-primary-light">from</span>
            <span className="text-emerald-400">{` "zod"`}</span>
            <span className="text-text-secondary">;</span>
            {"\n\n"}
            <span className="text-primary-light">const</span>
            <span className="text-white"> registry </span>
            <span className="text-primary-light">= </span>
            <span className="text-accent">createRegistry</span>
            <span className="text-white">()</span>
            <span className="text-text-secondary">;</span>
            {"\n\n"}
            <span className="text-text-secondary/70 italic">{"// Register a chart component"}</span>
            {"\n"}
            <span className="text-white">registry.</span>
            <span className="text-amber-300">register</span>
            <span className="text-white">(</span>
            <span className="text-emerald-400">{`"BarChart"`}</span>
            <span className="text-white">, {"{"}</span>
            {"\n"}
            <span className="text-white">  schema: </span>
            <span className="text-accent">z</span>
            <span className="text-white">.</span>
            <span className="text-amber-300">object</span>
            <span className="text-white">({"{"}</span>
            {"\n"}
            <span className="text-white">    title: </span>
            <span className="text-accent">z</span>
            <span className="text-white">.</span>
            <span className="text-amber-300">string</span>
            <span className="text-white">(),</span>
            {"\n"}
            <span className="text-white">    data: </span>
            <span className="text-accent">z</span>
            <span className="text-white">.</span>
            <span className="text-amber-300">array</span>
            <span className="text-white">(</span>
            <span className="text-accent">z</span>
            <span className="text-white">.</span>
            <span className="text-amber-300">object</span>
            <span className="text-white">({"{"}</span>
            {"\n"}
            <span className="text-white">      label: </span>
            <span className="text-accent">z</span>
            <span className="text-white">.</span>
            <span className="text-amber-300">string</span>
            <span className="text-white">(),</span>
            {"\n"}
            <span className="text-white">      value: </span>
            <span className="text-accent">z</span>
            <span className="text-white">.</span>
            <span className="text-amber-300">number</span>
            <span className="text-white">(),</span>
            {"\n"}
            <span className="text-white">    {"}"})),</span>
            {"\n"}
            <span className="text-white">  {"}"}),</span>
            {"\n"}
            <span className="text-white">  component: </span>
            <span className="text-accent">BarChart</span>
            <span className="text-white">,</span>
            {"\n"}
            <span className="text-white">{"}"})</span>
            <span className="text-text-secondary">;</span>
        </code>
    );
}

function ToolDefinitionCode() {
    return (
        <code>
            <span className="text-text-secondary/70 italic">{"// Auto-generated for the LLM"}</span>
            {"\n"}
            <span className="text-white">{"{"}</span>
            {"\n"}
            <span className="text-primary-light">{`  "tools"`}</span>
            <span className="text-white">: [{"{"}</span>
            {"\n"}
            <span className="text-primary-light">{`    "type"`}</span>
            <span className="text-white">: </span>
            <span className="text-emerald-400">{`"function"`}</span>
            <span className="text-white">,</span>
            {"\n"}
            <span className="text-primary-light">{`    "function"`}</span>
            <span className="text-white">: {"{"}</span>
            {"\n"}
            <span className="text-primary-light">{`      "name"`}</span>
            <span className="text-white">: </span>
            <span className="text-emerald-400">{`"render_BarChart"`}</span>
            <span className="text-white">,</span>
            {"\n"}
            <span className="text-primary-light">{`      "parameters"`}</span>
            <span className="text-white">: {"{"}</span>
            {"\n"}
            <span className="text-primary-light">{`        "type"`}</span>
            <span className="text-white">: </span>
            <span className="text-emerald-400">{`"object"`}</span>
            <span className="text-white">,</span>
            {"\n"}
            <span className="text-primary-light">{`        "properties"`}</span>
            <span className="text-white">: {"{"}</span>
            {"\n"}
            <span className="text-primary-light">{`          "title"`}</span>
            <span className="text-white">{`: { `}</span>
            <span className="text-primary-light">{`"type"`}</span>
            <span className="text-white">: </span>
            <span className="text-emerald-400">{`"string"`}</span>
            <span className="text-white">{` },`}</span>
            {"\n"}
            <span className="text-primary-light">{`          "data"`}</span>
            <span className="text-white">{`: { `}</span>
            <span className="text-primary-light">{`"type"`}</span>
            <span className="text-white">: </span>
            <span className="text-emerald-400">{`"array"`}</span>
            <span className="text-white">{` }`}</span>
            {"\n"}
            <span className="text-white">{`        }`}</span>
            {"\n"}
            <span className="text-white">{`      }`}</span>
            {"\n"}
            <span className="text-white">{`    }`}</span>
            {"\n"}
            <span className="text-white">{`  }]`}</span>
            {"\n"}
            <span className="text-white">{"}"}</span>
        </code>
    );
}

function FlowDiagram() {
    const drawPath = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { delay: 0.5, type: "spring" as const, duration: 1.5, bounce: 0 },
                opacity: { delay: 0.5, duration: 0.2 },
            },
        },
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-12 relative z-10">
            {/* LLM Output */}
            <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-3 bg-surface/80 border border-white/10 backdrop-blur-md rounded-xl px-6 py-4 shadow-xl transition-colors hover:border-primary/50"
            >
                <svg className="w-5 h-5 text-primary-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H6" />
                </svg>
                <span className="text-sm font-semibold text-white tracking-wide whitespace-nowrap">LLM Output</span>
            </motion.div>

            {/* Animated Arrow 1 */}
            <svg className="w-8 h-8 text-accent shrink-0 rotate-90 sm:rotate-0 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <motion.path variants={drawPath} initial="hidden" whileInView="visible" viewport={{ once: true }} strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>

            {/* Zod Validation */}
            <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-3 bg-primary/10 border border-primary/30 backdrop-blur-md rounded-xl px-6 py-4 shadow-[0_0_30px_rgba(139,92,246,0.15)]"
            >
                <svg className="w-5 h-5 text-primary-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span className="text-sm font-semibold text-primary-light tracking-wide whitespace-nowrap">Zod Validation</span>
            </motion.div>

            {/* Animated Arrow 2 */}
            <svg className="w-8 h-8 text-accent shrink-0 rotate-90 sm:rotate-0 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <motion.path variants={drawPath} initial="hidden" whileInView="visible" viewport={{ once: true }} strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>

            {/* Branch Outputs */}
            <div className="flex flex-col gap-5">
                {/* Success path */}
                <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md rounded-xl px-6 py-4 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <svg className="w-5 h-5 text-emerald-400 shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-sm font-semibold text-emerald-400 tracking-wide whitespace-nowrap relative z-10">React Component</span>
                </motion.div>

                {/* Failure path */}
                <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 backdrop-blur-md rounded-xl px-6 py-4 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <svg className="w-5 h-5 text-amber-400 shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                    </svg>
                    <span className="text-sm font-semibold text-amber-400 tracking-wide whitespace-nowrap relative z-10">Correction Prompt</span>
                </motion.div>
            </div>
        </div>
    );
}

export function CodeShowcase() {
    return (
        <section className="relative pb-32 bg-surface overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        See it in{" "}
                        <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              action
            </span>
                    </h2>
                    <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                        Register components with schemas, and GenUIKit handles validation,
                        rendering, and error correction.
                    </p>
                </motion.div>

                {/* Code blocks side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        className="flex flex-col h-full"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1" />
                            <p className="text-xs uppercase tracking-[0.2em] text-text-secondary font-bold">
                                What you write
                            </p>
                            <div className="h-px bg-gradient-to-r from-white/20 via-white/20 to-transparent flex-1" />
                        </div>
                        <div className="flex-1 drop-shadow-[0_30px_30px_rgba(0,0,0,0.5)]">
                            <CodeBlock title="registry.ts" language="TypeScript">
                                <RegistryCode />
                            </CodeBlock>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="flex flex-col h-full"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-white/20 flex-1" />
                            <p className="text-xs uppercase tracking-[0.2em] text-text-secondary font-bold">
                                What the LLM sees
                            </p>
                            <div className="h-px bg-gradient-to-r from-white/20 via-transparent to-transparent flex-1" />
                        </div>
                        <div className="flex-1 drop-shadow-[0_30px_30px_rgba(0,0,0,0.5)]">
                            <CodeBlock title="tool-definitions.json" language="JSON">
                                <ToolDefinitionCode />
                            </CodeBlock>
                        </div>
                    </motion.div>
                </div>

                {/* Flow diagram section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="relative rounded-3xl border border-white/5 bg-white/[0.02] p-8 sm:p-12 backdrop-blur-3xl overflow-hidden shadow-2xl"
                >
                    {/* Subtle grid pattern inside the glass card */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
               <span className="text-xs uppercase tracking-widest text-text-secondary font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Runtime Architecture
              </span>
                        </div>
                        <FlowDiagram />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
