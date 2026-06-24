import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Badge, Button, Card, EmptyState, Field, Input, LoadingSpinner, Pagination } from "../components/ui";
import type { ApiResponse, Journal, PaginatedResponse } from "../types";

export function JournalsPage() {
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["journals", appliedSearch, page],
    queryFn: async () => (await api.get<ApiResponse<PaginatedResponse<Journal>>>("/journals", { params: { q: appliedSearch, page, limit: 12 } })).data.data,
    placeholderData: (previous) => previous
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data?.items.length && !appliedSearch) return <EmptyState title="No journals yet" />;
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Journals</h1>
          <p className="mt-1 text-sm text-slate-500">Search and open a journal to view papers from all synced metadata sources.</p>
        </div>
        <div className="flex w-full gap-2 lg:max-w-xl lg:items-end">
          <Field label="Search journals">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Journal name or topic" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
          </Field>
          <Button onClick={() => { setAppliedSearch(search); setPage(1); }}><Search className="h-4 w-4" /> Search</Button>
        </div>
      </div>
      {data && <p className="text-sm font-medium text-slate-500">{data.total} journals{isFetching ? " · updating" : ""}</p>}
      {!data?.items.length && <EmptyState title="No matching journals" description="Try another journal name or topic." />}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.items.map((journal) => (
          <Link key={journal._id} to={`/journals/${journal._id}`} className="block">
            <Card className="h-full transition hover:border-blue-200 hover:shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-navy">{journal.name}</h2>
                <Badge>{journal.paperCount} papers</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600">{journal.publisher || "Publisher not available"}</p>
              <div className="mt-4 flex flex-wrap gap-2">{journal.topics?.slice(0, 4).map((topic) => <Badge key={topic} className="bg-slate-100 text-slate-600">{topic}</Badge>)}</div>
            </Card>
          </Link>
        ))}
      </div>
      {data && data.pages > 1 && <Pagination page={data.page} pages={data.pages} onPageChange={setPage} />}
    </div>
  );
}
