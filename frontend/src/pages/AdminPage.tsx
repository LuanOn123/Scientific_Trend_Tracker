import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api/client";
import { Button, Card, LoadingSpinner } from "../components/ui";
import type { ApiResponse, User } from "../types";

interface Source { _id: string; name: string; baseUrl: string; status: string; isEnabled: boolean; apiKeyRequired: boolean; }
interface Log { _id: string; sourceName: string; status: string; message: string; totalFetched: number; startedAt: string; }

export function AdminPage() {
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ["admin-users"], queryFn: async () => (await api.get<ApiResponse<{ items: User[] }>>("/admin/users")).data.data.items });
  const sources = useQuery({ queryKey: ["admin-sources"], queryFn: async () => (await api.get<ApiResponse<{ items: Source[] }>>("/admin/data-sources")).data.data.items });
  const logs = useQuery({ queryKey: ["admin-logs"], queryFn: async () => (await api.get<ApiResponse<{ items: Log[] }>>("/admin/sync/logs")).data.data.items });
  const sync = useMutation({ mutationFn: () => api.post("/admin/sync/run"), onSuccess: () => { toast.success("Sync completed"); queryClient.invalidateQueries({ queryKey: ["admin-logs"] }); } });
  if (users.isLoading || sources.isLoading || logs.isLoading) return <LoadingSpinner />;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-navy">Admin Dashboard</h1><Button onClick={() => sync.mutate()} disabled={sync.isPending}><Play className="h-4 w-4" /> Manual sync</Button></div>
      <Card><h2 className="mb-3 font-semibold text-navy">Users</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><tbody>{users.data?.map((user) => <tr key={user.id} className="border-t"><td className="py-3">{user.name}</td><td>{user.email}</td><td className="capitalize">{user.role}</td><td>{user.isActive === false ? "Inactive" : "Active"}</td></tr>)}</tbody></table></div></Card>
      <Card><h2 className="mb-3 font-semibold text-navy">API data sources</h2><div className="grid gap-3 md:grid-cols-3">{sources.data?.map((source) => <div key={source._id} className="rounded-lg border border-slate-200 p-3"><p className="font-semibold">{source.name}</p><p className="truncate text-xs text-slate-500">{source.baseUrl}</p><p className="mt-2 text-sm">{source.status} · {source.isEnabled ? "enabled" : "disabled"}</p></div>)}</div></Card>
      <Card><h2 className="mb-3 font-semibold text-navy">Sync logs</h2><div className="space-y-2">{logs.data?.map((log) => <div key={log._id} className="rounded-md bg-slate-50 p-3 text-sm"><span className="font-semibold">{log.status}</span> · {log.message} · {log.totalFetched} fetched · {new Date(log.startedAt).toLocaleString()}</div>)}</div></Card>
    </div>
  );
}
