import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client.js";
import type { RecipeSummary } from "./types.js";

export async function fetchFavorites(): Promise<RecipeSummary[]> {
  return apiClient<RecipeSummary[]>("favorites");
}

export function useFavorites(enabled: boolean = true) {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
    enabled,
  });
}

export async function fetchFavoriteIds(): Promise<string[]> {
  return apiClient<string[]>("favorites/ids");
}

export function useFavoriteIds(enabled: boolean = true) {
  return useQuery({
    queryKey: ["favorite-ids"],
    queryFn: fetchFavoriteIds,
    enabled,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipeId,
      isFavorited,
    }: {
      recipeId: string;
      isFavorited: boolean;
    }) => {
      if (isFavorited) {
        await apiClient(`favorites/${recipeId}`, { method: "DELETE" });
      } else {
        await apiClient(`favorites/${recipeId}`, { method: "PUT" });
      }
      return { recipeId, isFavorited: !isFavorited };
    },
    onMutate: async ({ recipeId, isFavorited }) => {
      await queryClient.cancelQueries({ queryKey: ["favorite-ids"] });
      const previousIds =
        queryClient.getQueryData<string[]>(["favorite-ids"]) || [];

      queryClient.setQueryData<string[]>(["favorite-ids"], (old = []) => {
        if (isFavorited) {
          return old.filter((id) => id !== recipeId);
        } else {
          return [...old, recipeId];
        }
      });

      return { previousIds };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousIds) {
        queryClient.setQueryData(["favorite-ids"], context.previousIds);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-ids"] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
