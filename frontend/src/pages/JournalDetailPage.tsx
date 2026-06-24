import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api/client";
import { PaperCard } from "../components/PaperCard";
import { Badge, Button, Card, ChartCard, EmptyState, Field, Input, LoadingSpinner, Pagination } from "../components/ui";
import type { ApiResponse, Journal, PaginatedResponse, Paper, TrendPoint } from "../types";

export function JournalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["journal-papers", id, appliedSearch, page],
    queryFn: async () => (await api.get<ApiResponse<PaginatedResponse<Paper> & { journal: Journal }>>(`/journals/${id}/papers`, { params: { q: appliedSearch, page, limit: 10 } })).data.data,
    placeholderData: (previous) => previous,
    enabled: !!id
  });
  const trends = useQuery({
    queryKey: ["journal-trends", id],
    queryFn: async () => (await api.get<ApiResponse<{ series: TrendPoint[] }>>(`/journals/${id}/trends`)).data.data.series,
    enabled: !!id
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data) return <EmptyState title="Journal not found" />;
  return (
    <div className="space-y-5">
      <Button variant="secondary" onClick={() => navigate("/journals")}><ArrowLeft className="h-4 w-4" /> Back to journals</Button>
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-navy">{data.journal.name}</h1>
            <p className="mt-2 text-sm text-slate-500">{data.journal.publisher || "Publisher not available"}</p>
          </div>
          <Badge>{data.total} papers</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{data.journal.topics?.map((topic) => <Badge key={topic} className="bg-slate-100 text-slate-600">{topic}</Badge>)}</div>
      </Card>
      {!!trends.data?.length && (
        <ChartCard title="Journal publication trend">
          <ResponsiveContainer>
            <BarChart data={trends.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1d7ed0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
      <Field label="Search papers in this journal">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input className="pl-9" placeholder="Paper title or keyword" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <Button onClick={() => { setAppliedSearch(search); setPage(1); }}><Search className="h-4 w-4" /> Search</Button>
        </div>
      </Field>
      {!data.items.length && <EmptyState title="No papers found" description="Try another title or keyword." />}
      <div className="grid gap-4">{data.items.map((paper) => <PaperCard key={paper._id} paper={paper} />)}</div>
      {data.pages > 1 && <Pagination page={data.page} pages={data.pages} onPageChange={setPage} />}
    </div>
  );
}
