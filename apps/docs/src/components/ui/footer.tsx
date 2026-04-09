import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-light/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              GenUIKit
            </span>
            <span className="text-sm text-text-secondary">
              &middot; MIT License
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/docs"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Docs
            </Link>
            <a
              href="https://github.com/mohammadashrafian/genuikit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/org/genuikit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              npm
            </a>
          </nav>

          <p className="text-sm text-text-secondary">
            Built by{" "}
            <a
              href="https://github.com/mohammadashrafian"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-primary hover:text-primary-light transition-colors"
            >
              Mohammad Ashrafian
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
