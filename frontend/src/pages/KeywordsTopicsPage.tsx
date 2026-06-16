import { useMemo, useState } from "react";
import { useQuery} from "@tanstack/react-query";
import { ArrowDownUp,TrendingUp} from "lucide-react";

import { api } from "../api/client";
import { Badge, Card, LoadingSpinner } from "../components/ui";
import type { ApiResponse, Keyword, Topic } from "../types";

type SortMode = "papers" | "growth";

function RankingControls({ value, onChange }: { value: SortMode; onChange: (value: SortMode) => void }) {
  return (
    <div className="flex rounded-md border border-slate-200 bg-white p-1">
      <button className={`rounded px-3 py-1.5 text-sm font-semibold ${value === "papers" ? "bg-blue-50 text-ocean" : "text-slate-500 hover:text-navy"}`} onClick={() => onChange("papers")} type="button">Most papers</button>
      <button className={`rounded px-3 py-1.5 text-sm font-semibold ${value === "growth" ? "bg-blue-50 text-ocean" : "text-slate-500 hover:text-navy"}`} onClick={() => onChange("growth")} type="button">Highest growth</button>
    </div>
  );
}

export function KeywordsTopicsPage() {
  const [keywordSort, setKeywordSort] = useState<SortMode>("papers");
  const [topicSort, setTopicSort] = useState<SortMode>("papers");
  const keywords = useQuery({ queryKey: ["keywords"], queryFn: async () => (await api.get<ApiResponse<{ items: Keyword[] }>>("/keywords/popular")).data.data.items });
  const topics = useQuery({ queryKey: ["topics"], queryFn: async () => (await api.get<ApiResponse<{ items: Topic[] }>>("/topics/popular")).data.data.items });
  

  const rankedKeywords = useMemo(() => [...(keywords.data || [])].sort((a, b) => keywordSort === "papers" ? b.paperCount - a.paperCount : b.trendScore - a.trendScore), [keywords.data, keywordSort]);
  const rankedTopics = useMemo(() => [...(topics.data || [])].sort((a, b) => topicSort === "papers" ? b.paperCount - a.paperCount : b.trendScore - a.trendScore), [topics.data, topicSort]);

  if (keywords.isLoading || topics.isLoading) return <LoadingSpinner />;
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">Popular keywords</h1>
            <p className="mt-1 text-sm text-slate-500">Ranked by paper count or growth score.</p>
          </div>
          <RankingControls value={keywordSort} onChange={setKeywordSort} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <tr><th className="py-3">Rank</th><th>Keyword</th><th>Papers</th><th>Growth</th></tr>
            </thead>
            <tbody>
              {rankedKeywords.map((item, index) => (
                <tr key={item._id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 font-bold text-ocean">#{index + 1}</td>
                  <td className="font-semibold text-navy">{item.name}</td>
                  <td>{item.paperCount}</td>
                  <td><Badge><TrendingUp className="mr-1 h-3 w-3" /> {item.trendScore}%</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">Popular topics</h1>
            <p className="mt-1 text-sm text-slate-500">Ranked by topic volume or trend momentum.</p>
          </div>
          <RankingControls value={topicSort} onChange={setTopicSort} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <tr><th className="py-3">Rank</th><th>Topic</th><th>Papers</th><th>Growth</th></tr>
            </thead>
            <tbody>
              {rankedTopics.map((item, index) => (
                <tr key={item._id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 font-bold text-ocean">#{index + 1}</td>
                  <td><p className="font-semibold text-navy">{item.name}</p><p className="mt-1 max-w-xs text-xs text-slate-500">{item.description}</p></td>
                  <td>{item.paperCount}</td>
                  <td><Badge><ArrowDownUp className="mr-1 h-3 w-3" /> {item.trendScore}%</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
