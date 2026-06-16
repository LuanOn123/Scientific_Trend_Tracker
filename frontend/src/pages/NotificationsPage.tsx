import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck } from "lucide-react";
import { api } from "../api/client";
import { Button, Card, EmptyState, LoadingSpinner } from "../components/ui";
import type { ApiResponse, NotificationItem } from "../types";

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["notifications"], queryFn: async () => (await api.get<ApiResponse<{ items: NotificationItem[] }>>("/notifications")).data.data.items });
  const readAll = useMutation({ mutationFn: () => api.patch("/notifications/read-all"), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }) });
  const readOne = useMutation({ mutationFn: (id: string) => api.patch(`/notifications/${id}/read`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }) });
  if (isLoading) return <LoadingSpinner />;
  if (!data?.length) return <EmptyState title="No notifications" />;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-navy">Notifications</h1><Button onClick={() => readAll.mutate()}><CheckCheck className="h-4 w-4" /> Read all</Button></div>
      {data.map((item) => <Card key={item._id} className={item.isRead ? "opacity-70" : ""}><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold text-navy">{item.title}</p><p className="mt-1 text-sm text-slate-600">{item.message}</p><p className="mt-1 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p></div>{!item.isRead && <Button onClick={() => readOne.mutate(item._id)}>Mark read</Button>}</div></Card>)}
    </div>
  );
}
