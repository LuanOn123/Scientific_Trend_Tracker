import type { ReactNode } from "react";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export function AuthShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-navy p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(29,126,208,0.45),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.18),transparent_26%),linear-gradient(135deg,#0f2747,#102f55_48%,#f6f8fb_48%)]" />
      <div className="absolute left-10 top-16 h-24 w-24 animate-pulse rounded-full border border-white/15" />
      <div className="absolute bottom-16 right-12 h-32 w-32 animate-pulse rounded-full border border-ocean/25" />
      <div className="relative grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section className="hidden text-white lg:block">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-blue-100 backdrop-blur hover:bg-white/15">
            <ArrowLeft className="h-4 w-4" /> Back to landing
          </Link>
          <div className="mt-10 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-white text-navy shadow-xl">
            <BarChart3 className="h-7 w-7" />
          </div>
          <h1 className="mt-5 max-w-lg text-4xl font-bold leading-tight">{title}</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-blue-100">{subtitle}</p>
        </section>
        <section className="relative">
          <div className="mb-4 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-blue-100 backdrop-blur">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
