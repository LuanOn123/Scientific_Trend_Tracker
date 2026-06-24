import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, FileText, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Badge, Button, Card, EmptyState, Field, Input, LoadingSpinner, Pagination, Select } from "../components/ui";
import type { ApiResponse, Bookmark, PaginatedResponse } from "../types";

interface BookmarkResponse extends PaginatedResponse<Bookmark> {
  collections: string[];
}

export function BookmarksPage() {
  const queryClient = useQueryClient();
  const [collection, setCollection] = useState("all");
  const [page, setPage] = useState(1);
  const [drafts, setDrafts] = useState<Record<string, { collection: string; tags: string; note: string }>>({});
  const { data, isLoading } = useQuery({
    queryKey: ["bookmarks", collection, page],
    queryFn: async () => (await api.get<ApiResponse<BookmarkResponse>>("/bookmarks", { params: { collection, page, limit: 8 } })).data.data,
    placeholderData: (previous) => previous
  });
  const bookmarks = useMemo(() => data?.items || [], [data?.items]);
  const remove = useMutation({ mutationFn: (id: string) => api.delete(`/bookmarks/${id}`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookmarks"] }) });
  const update = useMutation({
    mutationFn: ({ id, values }: { id: string; values: { collection: string; tags: string; note: string } }) => api.patch(`/bookmarks/${id}`, {
      collection: values.collection,
      note: values.note,
      tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    }),
    onSuccess: () => {
      setDrafts({});
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    }
  });
  const valuesFor = (bookmark: Bookmark) => drafts[bookmark._id] || { collection: bookmark.collection || "General", tags: bookmark.tags?.join(", ") || "", note: bookmark.note || "" };
  const setValuesFor = (bookmark: Bookmark, values: { collection: string; tags: string; note: string }) => setDrafts((current) => ({ ...current, [bookmark._id]: values }));
  if (isLoading) return <LoadingSpinner />;
  if (!bookmarks.length && collection === "all") return <EmptyState title="No bookmarks" description="Save papers from search or detail pages." />;
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Bookmarks</h1>
          <p className="mt-1 text-sm text-slate-500">Organize saved papers by collection, tags, and personal notes.</p>
        </div>
        <div className="w-full md:max-w-xs">
          <Field label="Collection">
            <Select value={collection} onChange={(event) => { setCollection(event.target.value); setPage(1); }}>
              <option value="all">All collections</option>
              {(data?.collections || []).map((item) => <option key={item} value={item}>{item}</option>)}
            </Select>
          </Field>
        </div>
      </div>
      {!bookmarks.length && <EmptyState title="No bookmarks in this collection" description="Choose another collection or save a paper here." />}
      {bookmarks.map((bookmark) => {
        const values = valuesFor(bookmark);
        return (
          <Card key={bookmark._id} className="space-y-4">
            <div className="space-y-3">
              <div>
                <Link to={`/papers/${bookmark.paperId._id}`} className="text-lg font-semibold text-navy hover:text-ocean">{bookmark.paperId.title}</Link>
                <p className="mt-1 text-sm text-slate-500">{bookmark.paperId.journal} - {bookmark.paperId.publicationYear || "n.d."} - {bookmark.paperId.citationCount} citations</p>
              </div>
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">{bookmark.paperId.abstract || "No abstract available."}</p>
              <div className="flex flex-wrap gap-3">
                <Link to={`/papers/${bookmark.paperId._id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-ocean"><FileText className="h-4 w-4" /> View detail</Link>
                {bookmark.paperId.sourceUrl && <a href={bookmark.paperId.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-ocean"><ExternalLink className="h-4 w-4" /> Source</a>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{bookmark.collection || "General"}</Badge>
              {bookmark.tags?.map((tag) => <Badge key={tag} className="bg-slate-100 text-slate-600">{tag}</Badge>)}
            </div>
            {bookmark.note && <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-slate-700">{bookmark.note}</p>}
            <div className="grid gap-4 lg:grid-cols-[0.8fr_0.8fr_1.2fr_auto_auto] lg:items-end">
              <Field label="Collection">
                <Input value={values.collection} onChange={(event) => setValuesFor(bookmark, { ...values, collection: event.target.value })} />
              </Field>
              <Field label="Tags">
                <Input value={values.tags} onChange={(event) => setValuesFor(bookmark, { ...values, tags: event.target.value })} />
              </Field>
              <Field label="Note">
                <Input value={values.note} onChange={(event) => setValuesFor(bookmark, { ...values, note: event.target.value })} />
              </Field>
              <Button disabled={update.isPending} onClick={() => update.mutate({ id: bookmark._id, values })}><Save className="h-4 w-4" /> Save</Button>
              <Button variant="secondary" disabled={remove.isPending} onClick={() => remove.mutate(bookmark._id)}><Trash2 className="h-4 w-4" /> Remove</Button>
            </div>
          </Card>
        );
      })}
      {data && data.pages > 1 && <Pagination page={data.page} pages={data.pages} onPageChange={setPage} />}
    </div>
  );
}
