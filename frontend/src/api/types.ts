export interface MediaFormat {
  url: string;
  width: number;
  height: number;
}

export interface Media {
  url: string;
  alt: string | null;
  width: number;
  height: number;
  formats?: {
    thumbnail?: MediaFormat;
    small?: MediaFormat;
    medium?: MediaFormat;
    large?: MediaFormat;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: Media | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface IngredientLine {
  quantity: number | null;
  unit: string | null;
  name: string;
  note: string | null;
  group: string | null;
}

export interface Step {
  instruction: string;
  image: Media | null;
  timerMinutes: number | null;
}

export interface Nutrition {
  calories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  fiberGrams?: number;
}

export interface RecipeSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover: Media | null;
  totalTimeMinutes: number | null;
  servings: number;
  difficulty: "easy" | "medium" | "hard" | null;
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
}

export interface Recipe extends RecipeSummary {
  gallery: Media[];
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  ingredients: IngredientLine[];
  steps: Step[];
  nutrition: Nutrition | null;
  notes: any[] | null; // Strapi Blocks JSON
  sourceUrl: string | null;
  featured: boolean;
  publishedAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface QueryRecipesParams {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  tag?: string[];
  difficulty?: "easy" | "medium" | "hard";
  maxTime?: number;
  featured?: boolean;
}
