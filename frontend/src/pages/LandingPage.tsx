import { ArrowRight, BarChart3, BookOpenCheck, Database, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Card } from "../components/ui";

const features = [
  ["Metadata search", "Semantic Scholar metadata integration", Search],
  ["Trend analytics", "Yearly growth, keyword momentum, emerging topics", BarChart3],
  ["Admin controls", "API sources, sync logs, user status, scheduled jobs", Database]
] as const;

export function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(29,126,208,0.32),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.18),transparent_28%)]" />
        <div className="relative mx-auto grid min-h-[88vh] max-w-7xl content-center gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-blue-100">
              <Sparkles className="h-4 w-4" /> Semantic Scholar powered
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">Scientific Journal Publication Trend Tracking System</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">Explore real scholarly metadata, compare keyword trends by year, and move from search to source papers with a cleaner research workflow.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login"><Button className="h-11 px-5"><ArrowRight className="h-4 w-4" /> Open dashboard</Button></Link>
              <Link to="/register"><Button className="h-11 px-5" variant="secondary">Create account</Button></Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-sm text-blue-100">
              <div className="rounded-md border border-white/10 bg-white/10 p-3"><strong className="block text-xl text-white">API</strong>Real metadata</div>
              <div className="rounded-md border border-white/10 bg-white/10 p-3"><strong className="block text-xl text-white">Charts</strong>Yearly trends</div>
              <div className="rounded-md border border-white/10 bg-white/10 p-3"><strong className="block text-xl text-white">Saved</strong>Bookmarks</div>
            </div>
          </div>
          <div className="self-center rounded-lg border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between rounded-md bg-white p-4 text-navy">
              <div><p className="text-sm font-semibold text-slate-500">Trend snapshot</p><p className="text-2xl font-bold">Machine learning</p></div>
              <BookOpenCheck className="h-9 w-9 text-ocean" />
            </div>
            <div className="grid gap-4">
            {features.map(([title, text, Icon]) => (
              <Card key={String(title)} className="border-white/10 bg-white/10 text-white shadow-none">
                <Icon className="h-7 w-7 text-blue-200" />
                <h2 className="mt-3 text-xl font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-blue-100">{text}</p>
              </Card>
            ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
