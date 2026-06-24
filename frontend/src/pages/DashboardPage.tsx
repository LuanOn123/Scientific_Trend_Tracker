import { useQuery } from "@tanstack/react-query";
import { BarChart3, BookOpen, Library, Tags } from "lucide-react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api/client";
import { ChartCard, EmptyState, LoadingSpinner, StatCard } from "../components/ui";
import type { ApiResponse, DashboardData, Recommendation } from "../types";

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get<ApiResponse<DashboardData>>("/dashboard/summary")).data.data
  });
  const recommendations = useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => (await api.get<ApiResponse<{ items: Recommendation[] }>>("/recommendations", { params: { limit: 5 } })).data.data.items
  });
  if (isLoading) return <LoadingSpinner />;
  if (isError || !data) return <EmptyState title="Dashboard unavailable" description="Check backend connection and Semantic Scholar data." />;
  const colors = ["#1d7ed0", "#0f2747", "#4f9fe5", "#8bbce8", "#64748b"];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total papers" value={data.totals.totalPapers} icon={<BookOpen />} />
        <StatCard label="Journals" value={data.totals.totalJournals} icon={<Library />} />
        <StatCard label="Keywords" value={data.totals.totalKeywords} icon={<Tags />} />
        <StatCard label="Topics" value={data.totals.totalTopics} icon={<BarChart3 />} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Papers by year">
          <ResponsiveContainer><LineChart data={data.papersByYear}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="count" stroke="#1d7ed0" strokeWidth={3} /></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Top keywords">
          <ResponsiveContainer><BarChart data={data.topKeywords}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="paperCount" fill="#1d7ed0" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <ChartCard title="Top journals">
          <ResponsiveContainer><PieChart><Pie data={data.topJournals} dataKey="paperCount" nameKey="name" outerRadius={95}>{data.topJournals.map((item, index) => <Cell key={item._id} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </ChartCard>
        <section>
          <h2 className="mb-4 text-lg font-semibold text-navy">Emerging topics</h2>
          <div className="grid gap-3 sm:grid-cols-2">{data.emerging.topics.slice(0, 6).map((topic) => <div className="rounded-lg border border-slate-200 bg-white p-4" key={topic._id}><p className="font-semibold text-navy">{topic.name}</p><p className="mt-1 text-sm text-slate-500">{topic.paperCount} papers · {topic.trendScore}% growth</p></div>)}</div>
        </section>
      </div>
      {!!recommendations.data?.length && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-navy">Recommended papers</h2>
          <div className="grid gap-3">
            {recommendations.data.map((item) => (
              <Link key={item._id} to={`/papers/${item.paperId._id}`} className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-md">
                <p className="font-semibold text-navy">{item.paperId.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.paperId.journal} - {item.paperId.publicationYear || "n.d."} - score {item.score}</p>
                <p className="mt-2 text-xs font-medium text-ocean">{item.reasons.join(" - ")}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
