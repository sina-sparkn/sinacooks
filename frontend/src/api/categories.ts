import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client.js";
import type { Category } from "./types.js";

export async function fetchCategories(): Promise<Category[]> {
  return apiClient<Category[]>("categories");
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
}
