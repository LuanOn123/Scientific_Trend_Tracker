import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api } from "../api/client";
import { Badge, Card, EmptyState, Field, Input, LoadingSpinner } from "../components/ui";
import type { ApiResponse, Journal } from "../types";

export function JournalsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["journals"], queryFn: async () => (await api.get<ApiResponse<{ items: Journal[] }>>("/journals")).data.data.items });
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data || [];
    return (data || []).filter((journal) => journal.name.toLowerCase().includes(q) || journal.topics?.some((topic) => topic.toLowerCase().includes(q)));
  }, [data, search]);

  if (isLoading) return <LoadingSpinner />;
  if (!data?.length) return <EmptyState title="No journals yet" />;
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Journals</h1>
          <p className="mt-1 text-sm text-slate-500">Search and open a journal to view its Semantic Scholar papers.</p>
        </div>
        <div className="w-full lg:max-w-md">
          <Field label="Search journals">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Journal name or topic" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
          </Field>
        </div>
      </div>
      {!filtered.length && <EmptyState title="No matching journals" description="Try another journal name or topic." />}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((journal) => (
          
            <Card className="h-full transition hover:border-blue-200 hover:shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-navy">{journal.name}</h2>
                <Badge>{journal.paperCount} papers</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600">{journal.publisher || "Publisher not available"}</p>
              <div className="mt-4 flex flex-wrap gap-2">{journal.topics?.slice(0, 4).map((topic) => <Badge key={topic} className="bg-slate-100 text-slate-600">{topic}</Badge>)}</div>
            </Card>
         
        ))}
      </div>
    </div>
  );
}
