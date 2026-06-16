import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { api } from "../api/client";
import { PaperCard } from "../components/PaperCard";
import { EmptyState, LoadingSpinner } from "../components/ui";
import type { ApiResponse, Bookmark } from "../types";

export function BookmarksPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["bookmarks"], queryFn: async () => (await api.get<ApiResponse<{ items: Bookmark[] }>>("/bookmarks")).data.data.items });
  const remove = useMutation({ mutationFn: (id: string) => api.delete(`/bookmarks/${id}`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookmarks"] }) });
  if (isLoading) return <LoadingSpinner />;
  if (!data?.length) return <EmptyState title="No bookmarks" description="Save papers from search or detail pages." />;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-navy">Bookmarks</h1>
      {data.map((bookmark) => (
        <PaperCard
          key={bookmark._id}
          paper={bookmark.paperId}
          actions={
            <button
              className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={remove.isPending}
              onClick={() => remove.mutate(bookmark._id)}
              type="button"
            >
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          }
        />
      ))}
    </div>
  );
}
