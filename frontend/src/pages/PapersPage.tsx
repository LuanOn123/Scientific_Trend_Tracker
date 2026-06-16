import { useMutation, useQuery } from "@tanstack/react-query";
import { RotateCcw, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../api/client";
import { PaperCard } from "../components/PaperCard";
import { Button, Card, EmptyState, Field, Input, Select, SkeletonCard } from "../components/ui";
import type { ApiResponse, Paper } from "../types";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1990 + 1 }, (_, index) => String(currentYear - index));

export function PapersPage() {
  const defaultParams = { q: "", yearFrom: "", yearTo: "", journal: "", source: "semantic_scholar", fetchExternal: true };
  const [params, setParams] = useState(defaultParams);
  const requestParams = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== ""));
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["papers", params],
    queryFn: async () => (await api.get<ApiResponse<{ items: Paper[]; total: number }>>("/papers/search", { params: requestParams })).data.data
  });
  const bookmark = useMutation({
    mutationFn: (paperId: string) => api.post("/bookmarks", { paperId, tags: ["saved"] }),
    onSuccess: () => toast.success("Paper bookmarked")
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Paper Search</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">Search real Semantic Scholar metadata and open source papers from the detail page.</p>
        </div>
        {data && <p className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">{data.total} results</p>}
      </div>
      <Card className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.7fr_0.7fr]">
          <Field label="Keyword, title, or topic" hint="Example: machine learning, cybersecurity, data mining">
            <Input placeholder="Example: machine learning" value={params.q} onChange={(e) => setParams({ ...params, q: e.target.value })} />
          </Field>
          <Field label="Year from">
            <Select value={params.yearFrom} onChange={(e) => setParams({ ...params, yearFrom: e.target.value })}>
              <option value="">Any year</option>
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </Select>
          </Field>
          <Field label="Year to">
            <Select value={params.yearTo} onChange={(e) => setParams({ ...params, yearTo: e.target.value })}>
              <option value="">Any year</option>
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </Select>
          </Field>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr_auto_auto] lg:items-end">
          <Field label="Journal">
            <Input placeholder="Journal name" value={params.journal} onChange={(e) => setParams({ ...params, journal: e.target.value })} />
          </Field>
          
          <Button onClick={() => refetch()}><Search className="h-4 w-4" /> Search</Button>
          <Button variant="secondary" onClick={() => setParams(defaultParams)}><RotateCcw className="h-4 w-4" /> Reset</Button>
        </div>
      </Card>
      {isLoading && <div className="grid gap-4"><SkeletonCard /><SkeletonCard /></div>}
      {isError && <EmptyState title="Search failed" description="The API may be offline or an external provider rate-limited the request." />}
      {!isLoading && data?.items.length === 0 && <EmptyState title="No papers found" description="Try a broader keyword or enable external fetch." />}
      <div className="grid gap-4">{data?.items.map((paper) => <PaperCard key={paper._id} paper={paper} onBookmark={(item) => bookmark.mutate(item._id)} />)}</div>
    </div>
  );
}
