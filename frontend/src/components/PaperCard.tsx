import { Bookmark, ExternalLink, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Paper } from "../types";
import { Badge, Button, Card } from "./ui";

export function PaperCard({ paper, onBookmark, actions }: { paper: Paper; onBookmark?: (paper: Paper) => void; actions?: ReactNode }) {
  return (
    <Card className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to={`/papers/${paper._id}`} className="text-lg font-semibold text-navy hover:text-ocean">{paper.title}</Link>
          <p className="mt-1 text-sm text-slate-500">{paper.journal} · {paper.publicationYear || "n.d."} · {paper.citationCount} citations</p>
        </div>
        {onBookmark && <Button variant="dark" onClick={() => onBookmark(paper)}><Bookmark className="h-4 w-4" /> Save</Button>}
      </div>
      <p className="line-clamp-3 text-sm leading-6 text-slate-600">{paper.abstract || "No abstract available."}</p>
      <div className="flex flex-wrap gap-2">{paper.keywords?.slice(0, 5).map((keyword) => <Badge key={keyword}>{keyword}</Badge>)}</div>
      <div className="flex flex-wrap gap-3">
        <Link to={`/papers/${paper._id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-ocean"><FileText className="h-4 w-4" /> View detail</Link>
        {paper.sourceUrl && <a href={paper.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-ocean"><ExternalLink className="h-4 w-4" /> Source</a>}
        {actions}
      </div>
    </Card>
  );
}
