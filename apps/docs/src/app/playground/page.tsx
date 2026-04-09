import type { Metadata } from "next";
import { PlaygroundEditor } from "@/components/playground/playground-editor";

export const metadata: Metadata = {
  title: "Interactive Playground — GenUIKit",
  description:
    "Try GenUIKit live. Edit the LLM output JSON and see components render in real time.",
};

export default function PlaygroundPage() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            Interactive Playground
          </h1>
          <p className="mt-2 text-text-secondary text-lg">
            Try GenUIKit live. Edit the LLM output JSON and see components
            render in real time.
          </p>
        </div>
        <PlaygroundEditor />
      </div>
    </main>
  );
}
