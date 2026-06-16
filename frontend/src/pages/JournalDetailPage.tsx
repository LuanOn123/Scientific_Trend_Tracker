import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { PaperCard } from "../components/PaperCard";
import { Badge, Button, Card, EmptyState, Field, Input, LoadingSpinner } from "../components/ui";
import type { ApiResponse, Journal, Paper } from "../types";

export function JournalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["journal-papers", id],
    queryFn: async () => (await api.get<ApiResponse<{ journal: Journal; items: Paper[] }>>(`/journals/${id}/papers`)).data.data,
    enabled: !!id
  });
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data?.items || [];
    return (data?.items || []).filter((paper) => paper.title.toLowerCase().includes(q) || paper.keywords?.some((keyword) => keyword.toLowerCase().includes(q)));
  }, [data?.items, search]);

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
          <Badge>{data.items.length} papers</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{data.journal.topics?.map((topic) => <Badge key={topic} className="bg-slate-100 text-slate-600">{topic}</Badge>)}</div>
      </Card>
      <Field label="Search papers in this journal">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input className="pl-9" placeholder="Paper title or keyword" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </Field>
      {!filtered.length && <EmptyState title="No papers found" description="Try another title or keyword." />}
      <div className="grid gap-4">{filtered.map((paper) => <PaperCard key={paper._id} paper={paper} />)}</div>
    </div>
  );
}
