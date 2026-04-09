import { Hero } from "@/components/hero/hero";
import { Features } from "@/components/hero/features";
import { CodeShowcase } from "@/components/hero/code-showcase";
import { Comparison } from "@/components/hero/comparison";
import { Footer } from "@/components/ui/footer";
import Link from "next/link";

function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
          Ready to get started?
        </h2>
        <p className="text-lg text-text-secondary mb-8">
          Install GenUIKit and have type-safe LLM rendering in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/docs/getting-started"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
          >
            Read the Docs
          </Link>
          <Link
            href="/playground"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-border hover:border-primary/50 text-text-primary font-medium transition-all hover:bg-surface-light"
          >
            Try the Playground
          </Link>
        </div>
        <div className="inline-flex items-center gap-3 bg-surface-light/80 border border-border rounded-lg px-4 py-3">
          <span className="text-text-secondary text-sm select-none">$</span>
          <code className="text-sm font-mono text-text-primary">
            npm install @genuikit/core @genuikit/react zod
          </code>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <CodeShowcase />
      <Comparison />
      <CTASection />
      <Footer />
    </>
  );
}
