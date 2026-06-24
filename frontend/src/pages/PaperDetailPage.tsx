import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, ExternalLink } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../api/client";
import { Badge, Button, Card, EmptyState, Field, Input, LoadingSpinner } from "../components/ui";
import type { ApiResponse, Paper } from "../types";

export function PaperDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saveOptions, setSaveOptions] = useState({ collection: "General", tags: "detail", note: "" });
  const { data, isLoading } = useQuery({ queryKey: ["paper", id], queryFn: async () => (await api.get<ApiResponse<{ paper: Paper }>>(`/papers/${id}`)).data.data.paper, enabled: !!id });
  const bookmark = useMutation({
    mutationFn: () => api.post("/bookmarks", {
      paperId: id,
      collection: saveOptions.collection,
      note: saveOptions.note,
      tags: saveOptions.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    }),
    onSuccess: () => toast.success("Paper bookmarked")
  });
  if (isLoading) return <LoadingSpinner />;
  if (!data) return <EmptyState title="Paper not found" />;
  return (
    <div className="space-y-4">
      <Button variant="secondary" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>
      <Card className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-navy">{data.title}</h1>
            <p className="mt-2 text-slate-500">{data.journal} · {data.publicationYear || "n.d."} · {data.sourceName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => bookmark.mutate()}><Bookmark className="h-4 w-4" /> Bookmark</Button>
            {data.sourceUrl && (
              <Link to={data.sourceUrl} target="_blank" rel="noreferrer">
                <Button variant="dark"><ExternalLink className="h-4 w-4" /> Read more</Button>
              </Link>
            )}
          </div>
        </div>
        <p className="leading-7 text-slate-700">{data.abstract || "No abstract available."}</p>
        <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[0.8fr_0.8fr_1.4fr]">
          <Field label="Collection">
            <Input placeholder="General" value={saveOptions.collection} onChange={(e) => setSaveOptions({ ...saveOptions, collection: e.target.value })} />
          </Field>
          <Field label="Tags">
            <Input placeholder="detail, thesis" value={saveOptions.tags} onChange={(e) => setSaveOptions({ ...saveOptions, tags: e.target.value })} />
          </Field>
          <Field label="Personal note">
            <Input placeholder="Why this paper matters" value={saveOptions.note} onChange={(e) => setSaveOptions({ ...saveOptions, note: e.target.value })} />
          </Field>
        </div>
        <dl className="grid gap-4 md:grid-cols-2">
          <div><dt className="text-sm font-semibold text-slate-500">Authors</dt><dd>{data.authors?.map((a) => a.name).join(", ") || "Unknown"}</dd></div>
          <div><dt className="text-sm font-semibold text-slate-500">DOI</dt><dd>{data.doi || "N/A"}</dd></div>
          <div><dt className="text-sm font-semibold text-slate-500">Citations</dt><dd>{data.citationCount}</dd></div>
          <div><dt className="text-sm font-semibold text-slate-500">Publication date</dt><dd>{data.publicationDate ? new Date(data.publicationDate).toLocaleDateString() : "N/A"}</dd></div>
        </dl>
        <div className="flex flex-wrap gap-2">{[...(data.keywords || []), ...(data.topics || [])].map((item) => <Badge key={item}>{item}</Badge>)}</div>
      </Card>
    </div>
  );
}
