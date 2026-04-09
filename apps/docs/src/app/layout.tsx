import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/ui/navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GenUIKit — Type-Safe LLM to React Bridge",
  description:
    "Register components with Zod schemas. Feed in raw LLM JSON. Get validated, rendered React — or a correction prompt to fix the AI. Zero vendor lock-in, type-safe, and hallucination-proof.",
  keywords: [
    "GenUIKit",
    "LLM",
    "React",
    "UI",
    "components",
    "Zod",
    "type-safe",
    "AI",
    "generative UI",
  ],
  openGraph: {
    title: "GenUIKit — Type-Safe LLM to React Bridge",
    description:
      "Register components with Zod schemas. Feed in raw LLM JSON. Get validated, rendered React — or a correction prompt to fix the AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-text-primary font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
