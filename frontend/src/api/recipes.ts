import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client.js";
import type {
  PaginatedResult,
  QueryRecipesParams,
  Recipe,
  RecipeSummary,
} from "./types.js";

export async function fetchRecipes(
  params: QueryRecipesParams = {},
): Promise<PaginatedResult<RecipeSummary>> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.q) searchParams.set("q", params.q);
  if (params.category) searchParams.set("category", params.category);
  if (params.difficulty) searchParams.set("difficulty", params.difficulty);
  if (params.maxTime) searchParams.set("maxTime", String(params.maxTime));
  if (typeof params.featured === "boolean")
    searchParams.set("featured", String(params.featured));

  if (params.tag && params.tag.length > 0) {
    for (const t of params.tag) {
      searchParams.append("tag", t);
    }
  }

  const query = searchParams.toString();
  return apiClient<PaginatedResult<RecipeSummary>>(
    `recipes${query ? `?${query}` : ""}`,
  );
}

export function useRecipes(params: QueryRecipesParams = {}) {
  return useQuery({
    queryKey: ["recipes", params],
    queryFn: () => fetchRecipes(params),
  });
}

export async function fetchRecipeBySlug(slug: string): Promise<Recipe> {
  return apiClient<Recipe>(`recipes/${encodeURIComponent(slug)}`);
}

export function useRecipe(slug: string | undefined) {
  return useQuery({
    queryKey: ["recipe", slug],
    queryFn: () => fetchRecipeBySlug(slug!),
    enabled: Boolean(slug),
  });
}
