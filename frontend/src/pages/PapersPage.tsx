import { useMutation, useQuery } from "@tanstack/react-query";
import { RotateCcw, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../api/client";
import { PaperCard } from "../components/PaperCard";
import { Button, Card, EmptyState, Field, Input, Pagination, Select, SkeletonCard } from "../components/ui";
import type { ApiResponse, PaginatedResponse, Paper } from "../types";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1990 + 1 }, (_, index) => String(currentYear - index));

export function PapersPage() {
  const defaultParams = { q: "", yearFrom: "", yearTo: "", journal: "", author: "", topic: "", citationMin: "", citationMax: "", source: "semantic_scholar", sort: "newest", fetchExternal: true };
  const [draft, setDraft] = useState(defaultParams);
  const [applied, setApplied] = useState(defaultParams);
  const [page, setPage] = useState(1);
  const [saveOptions, setSaveOptions] = useState({ collection: "General", tags: "saved", note: "" });
  const requestParams = Object.fromEntries(Object.entries({ ...applied, page, limit: 10 }).filter(([, value]) => value !== ""));
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["papers", applied, page],
    queryFn: async () => (await api.get<ApiResponse<PaginatedResponse<Paper>>>("/papers/search", { params: requestParams })).data.data,
    placeholderData: (previous) => previous
  });
  const bookmark = useMutation({
    mutationFn: (paperId: string) => api.post("/bookmarks", {
      paperId,
      collection: saveOptions.collection,
      note: saveOptions.note,
      tags: saveOptions.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    }),
    onSuccess: () => toast.success("Paper bookmarked")
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Paper Search</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">Search real Semantic Scholar metadata and open source papers from the detail page.</p>
        </div>
        {data && <p className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">{data.total} results{isFetching ? " · updating" : ""}</p>}
      </div>
      <Card className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.7fr_0.7fr]">
          <Field label="Keyword, title, or topic" hint="Example: machine learning, cybersecurity, data mining">
            <Input placeholder="Example: machine learning" value={draft.q} onChange={(e) => setDraft({ ...draft, q: e.target.value })} />
          </Field>
          <Field label="Year from">
            <Select value={draft.yearFrom} onChange={(e) => setDraft({ ...draft, yearFrom: e.target.value })}>
              <option value="">Any year</option>
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </Select>
          </Field>
          <Field label="Year to">
            <Select value={draft.yearTo} onChange={(e) => setDraft({ ...draft, yearTo: e.target.value })}>
              <option value="">Any year</option>
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </Select>
          </Field>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          <Field label="Journal">
            <Input placeholder="Journal name" value={draft.journal} onChange={(e) => setDraft({ ...draft, journal: e.target.value })} />
          </Field>
          <Field label="Author">
            <Input placeholder="Author name" value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} />
          </Field>
          <Field label="Topic">
            <Input placeholder="Topic or field" value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} />
          </Field>
          <Field label="Source">
            <Select value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })}>
              <option value="semantic_scholar">Semantic Scholar</option>
              <option value="openalex">OpenAlex</option>
              <option value="crossref">Crossref</option>
              <option value="all">All sources</option>
            </Select>
          </Field>
        </div>
        <div className="grid gap-4 lg:grid-cols-[0.7fr_0.7fr_1fr_auto_auto] lg:items-end">
          <Field label="Min citations">
            <Input placeholder="0" type="number" min="0" value={draft.citationMin} onChange={(e) => setDraft({ ...draft, citationMin: e.target.value })} />
          </Field>
          <Field label="Max citations">
            <Input placeholder="Any" type="number" min="0" value={draft.citationMax} onChange={(e) => setDraft({ ...draft, citationMax: e.target.value })} />
          </Field>
          <Field label="Sort">
            <Select value={draft.sort} onChange={(e) => setDraft({ ...draft, sort: e.target.value })}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="most_cited">Most cited</option>
              <option value="least_cited">Least cited</option>
              <option value="relevance">Relevance</option>
            </Select>
          </Field>
          <Button onClick={() => { setApplied(draft); setPage(1); }}><Search className="h-4 w-4" /> Search</Button>
          <Button variant="secondary" onClick={() => { setDraft(defaultParams); setApplied(defaultParams); setPage(1); }}><RotateCcw className="h-4 w-4" /> Reset</Button>
        </div>
      </Card>
      <Card className="grid gap-4 lg:grid-cols-[0.8fr_0.8fr_1.4fr]">
        <Field label="Bookmark collection">
          <Input placeholder="General" value={saveOptions.collection} onChange={(e) => setSaveOptions({ ...saveOptions, collection: e.target.value })} />
        </Field>
        <Field label="Bookmark tags" hint="Separate with commas.">
          <Input placeholder="saved, thesis" value={saveOptions.tags} onChange={(e) => setSaveOptions({ ...saveOptions, tags: e.target.value })} />
        </Field>
        <Field label="Bookmark note">
          <Input placeholder="Optional note for saved papers" value={saveOptions.note} onChange={(e) => setSaveOptions({ ...saveOptions, note: e.target.value })} />
        </Field>
      </Card>
      {isLoading && <div className="grid gap-4"><SkeletonCard /><SkeletonCard /></div>}
      {isError && <EmptyState title="Search failed" description="The API may be offline or an external provider rate-limited the request." />}
      {!isLoading && data?.items.length === 0 && <EmptyState title="No papers found" description="Try a broader keyword or enable external fetch." />}
      <div className="grid gap-4">{data?.items.map((paper) => <PaperCard key={paper._id} paper={paper} onBookmark={(item) => bookmark.mutate(item._id)} />)}</div>
      {data && data.pages > 1 && <Pagination page={data.page} pages={data.pages} onPageChange={setPage} />}
    </div>
  );
}
