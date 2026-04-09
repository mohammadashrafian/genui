import { Sidebar } from '@/components/docs/sidebar';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <main className="lg:ml-[280px]">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-12 lg:px-12">
          {children}
        </div>
      </main>
    </div>
  );
}
