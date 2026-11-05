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

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: Media | null;
}

export interface TagDto {
  id: string;
  name: string;
  slug: string;
}

export interface IngredientLineDto {
  quantity: number | null;
  unit: string | null;
  name: string;
  note: string | null;
  group: string | null;
}

export interface StepDto {
  instruction: string;
  image: Media | null;
  timerMinutes: number | null;
}

export interface NutritionDto {
  calories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  fiberGrams?: number;
}

export interface RecipeSummaryDto {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover: Media | null;
  totalTimeMinutes: number | null;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
}

export interface RecipeDto extends RecipeSummaryDto {
  gallery: Media[];
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  ingredients: IngredientLineDto[];
  steps: StepDto[];
  nutrition: NutritionDto | null;
  notes: unknown[] | null;
  sourceUrl: string | null;
  featured: boolean;
  publishedAt: string;
}
