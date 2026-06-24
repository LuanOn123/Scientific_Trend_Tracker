import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../api/client";
import { Button, Card, LoadingSpinner, Pagination } from "../components/ui";
import type { ApiResponse, PaginatedResponse, User } from "../types";

interface Source { _id: string; name: string; baseUrl: string; status: string; isEnabled: boolean; apiKeyRequired: boolean; }
interface Log { _id: string; sourceName: string; status: string; message: string; totalFetched: number; startedAt: string; }
interface Job { _id: string; type: string; status: string; attempts: number; error?: string; createdAt: string; completedAt?: string; }

export function AdminPage() {
  const queryClient = useQueryClient();
  const [usersPage, setUsersPage] = useState(1);
  const [logsPage, setLogsPage] = useState(1);
  const [jobsPage, setJobsPage] = useState(1);

  const users = useQuery({
    queryKey: ["admin-users", usersPage],
    queryFn: async () => (await api.get<ApiResponse<PaginatedResponse<User>>>("/admin/users", { params: { page: usersPage, limit: 8 } })).data.data,
    placeholderData: (previous) => previous
  });
  const sources = useQuery({
    queryKey: ["admin-sources"],
    queryFn: async () => (await api.get<ApiResponse<{ items: Source[] }>>("/admin/data-sources")).data.data.items
  });
  const logs = useQuery({
    queryKey: ["admin-logs", logsPage],
    queryFn: async () => (await api.get<ApiResponse<PaginatedResponse<Log>>>("/admin/sync/logs", { params: { page: logsPage, limit: 8 } })).data.data,
    placeholderData: (previous) => previous
  });
  const jobs = useQuery({
    queryKey: ["admin-jobs", jobsPage],
    queryFn: async () => (await api.get<ApiResponse<PaginatedResponse<Job>>>("/admin/jobs", { params: { page: jobsPage, limit: 8 } })).data.data,
    placeholderData: (previous) => previous,
    refetchInterval: 5000
  });
  const sync = useMutation({
    mutationFn: () => api.post("/admin/sync/run"),
    onSuccess: () => {
      toast.success("Sync job queued");
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    }
  });

  if (users.isLoading || sources.isLoading || logs.isLoading || jobs.isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Admin Dashboard</h1>
        <Button onClick={() => sync.mutate()} disabled={sync.isPending}><Play className="h-4 w-4" /> Manual sync</Button>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold text-navy">Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody>{users.data?.items.map((user) => <tr key={user.id} className="border-t"><td className="py-3">{user.name}</td><td>{user.email}</td><td className="capitalize">{user.role}</td><td>{user.isActive === false ? "Inactive" : "Active"}</td></tr>)}</tbody>
          </table>
        </div>
        {users.data && users.data.pages > 1 && <div className="mt-4"><Pagination page={users.data.page} pages={users.data.pages} onPageChange={setUsersPage} /></div>}
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-navy">API data sources</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {sources.data?.map((source) => <div key={source._id} className="rounded-lg border border-slate-200 p-3"><p className="font-semibold">{source.name}</p><p className="truncate text-xs text-slate-500">{source.baseUrl}</p><p className="mt-2 text-sm">{source.status} - {source.isEnabled ? "enabled" : "disabled"}</p></div>)}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-navy">Ingestion jobs</h2>
        <div className="space-y-2">
          {jobs.data?.items.map((job) => <div key={job._id} className="rounded-md bg-slate-50 p-3 text-sm"><span className="font-semibold">{job.status}</span> - {job.type} - attempt {job.attempts} - {job.error || new Date(job.createdAt).toLocaleString()}</div>)}
        </div>
        {jobs.data && jobs.data.pages > 1 && <div className="mt-4"><Pagination page={jobs.data.page} pages={jobs.data.pages} onPageChange={setJobsPage} /></div>}
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-navy">Sync logs</h2>
        <div className="space-y-2">
          {logs.data?.items.map((log) => <div key={log._id} className="rounded-md bg-slate-50 p-3 text-sm"><span className="font-semibold">{log.status}</span> - {log.message} - {log.totalFetched} fetched - {new Date(log.startedAt).toLocaleString()}</div>)}
        </div>
        {logs.data && logs.data.pages > 1 && <div className="mt-4"><Pagination page={logs.data.page} pages={logs.data.pages} onPageChange={setLogsPage} /></div>}
      </Card>
    </div>
  );
}
