import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client.js";
import type { Tag } from "./types.js";

export async function fetchTags(): Promise<Tag[]> {
  return apiClient<Tag[]>("tags");
}

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });
}
