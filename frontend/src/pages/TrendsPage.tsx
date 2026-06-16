import { useQuery } from "@tanstack/react-query";
import { RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api/client";
import { Button, Card, ChartCard, EmptyState, Field, Input, LoadingSpinner, Select } from "../components/ui";
import type { ApiResponse } from "../types";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1990 + 1 }, (_, index) => String(currentYear - index));
const colors = ["#1d7ed0", "#0f2747", "#16a34a", "#9333ea", "#ea580c", "#64748b", "#dc2626", "#0891b2"];
const defaultFilter = { keywords: "", yearFrom: "", yearTo: "" };

interface KeywordTrendMatrix {
  keywords: string[];
  chartData: Array<Record<string, number | string>>;
}

export function TrendsPage() {
  const [draft, setDraft] = useState(defaultFilter);
  const [applied, setApplied] = useState(defaultFilter);

  const requestParams = useMemo(
    () => Object.fromEntries(Object.entries({ ...applied, limit: 6 }).filter(([, value]) => value !== "")),
    [applied]
  );

  const trendQuery = useQuery({
    queryKey: ["keyword-trends-by-year", applied],
    queryFn: async () => (await api.get<ApiResponse<KeywordTrendMatrix>>("/trends/keywords-by-year", { params: requestParams })).data.data
  });

  const keywords = trendQuery.data?.keywords || [];
  const chartData = trendQuery.data?.chartData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Keyword Trends by Year</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">Compare how research keywords change across publication years. Leave keywords empty to show the top tracked keywords.</p>
      </div>

      <Card className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.7fr_0.7fr]">
          <Field label="Keywords" hint="Optional. Separate multiple keywords with commas.">
            <Input placeholder="Example: machine learning, deep learning, computer vision" value={draft.keywords} onChange={(event) => setDraft({ ...draft, keywords: event.target.value })} />
          </Field>
          <Field label="Year from">
            <Select value={draft.yearFrom} onChange={(event) => setDraft({ ...draft, yearFrom: event.target.value })}>
              <option value="">Any year</option>
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </Select>
          </Field>
          <Field label="Year to">
            <Select value={draft.yearTo} onChange={(event) => setDraft({ ...draft, yearTo: event.target.value })}>
              <option value="">Any year</option>
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </Select>
          </Field>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Showing yearly publication counts for {keywords.length ? <span className="font-semibold text-navy">{keywords.length} keyword(s)</span> : "top keywords"}.</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setDraft(defaultFilter); setApplied(defaultFilter); }}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button onClick={() => setApplied(draft)}>
              <Search className="h-4 w-4" /> Apply
            </Button>
          </div>
        </div>
      </Card>

      {trendQuery.isLoading && <LoadingSpinner />}
      {trendQuery.isError && <EmptyState title="Trend unavailable" description="Please check backend connection or try a broader keyword." />}
      {!trendQuery.isLoading && !trendQuery.isError && chartData.length === 0 && <EmptyState title="No keyword trend data" description="Run a Semantic Scholar sync or try different keywords." />}
      {chartData.length > 0 && (
        <ChartCard title="Keyword publication counts by year">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              {keywords.map((keyword, index) => (
                <Line key={keyword} type="monotone" dataKey={keyword} stroke={colors[index % colors.length]} strokeWidth={3} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
