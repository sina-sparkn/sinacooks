import {
  CategoryDto,
  IngredientLineDto,
  Media,
  MediaFormat,
  NutritionDto,
  RecipeDto,
  RecipeSummaryDto,
  StepDto,
  TagDto,
} from './cms.types.js';

function toAbsoluteUrl(
  url: string | undefined | null,
  baseUrl: string,
): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
}

export function mapMedia(raw: any, baseUrl: string): Media | null {
  if (!raw || typeof raw !== 'object') return null;
  const url = toAbsoluteUrl(raw.url, baseUrl);
  if (!url) return null;

  const formats: Record<string, MediaFormat> = {};
  if (raw.formats && typeof raw.formats === 'object') {
    for (const size of ['thumbnail', 'small', 'medium', 'large'] as const) {
      if (raw.formats[size]) {
        formats[size] = {
          url: toAbsoluteUrl(raw.formats[size].url, baseUrl),
          width: raw.formats[size].width,
          height: raw.formats[size].height,
        };
      }
    }
  }

  return {
    url,
    alt: raw.alternativeText || raw.alt || null,
    width: raw.width || 0,
    height: raw.height || 0,
    formats: Object.keys(formats).length > 0 ? formats : undefined,
  };
}

export function mapCategory(raw: any, baseUrl: string): CategoryDto {
  return {
    id: raw.documentId || String(raw.id),
    name: raw.name || '',
    slug: raw.slug || '',
    description: raw.description || null,
    image: raw.image ? mapMedia(raw.image, baseUrl) : null,
  };
}

export function mapTag(raw: any): TagDto {
  return {
    id: raw.documentId || String(raw.id),
    name: raw.name || '',
    slug: raw.slug || '',
  };
}

export function mapIngredientLine(raw: any): IngredientLineDto {
  const ingRelation = raw.ingredient;
  const name =
    typeof ingRelation === 'object' && ingRelation !== null
      ? ingRelation.name || ''
      : typeof raw.name === 'string'
        ? raw.name
        : '';

  return {
    quantity: typeof raw.quantity === 'number' ? raw.quantity : null,
    unit: raw.unit || null,
    name,
    note: raw.note || null,
    group: raw.group || null,
  };
}

export function mapStep(raw: any, baseUrl: string): StepDto {
  return {
    instruction: raw.instruction || '',
    image: raw.image ? mapMedia(raw.image, baseUrl) : null,
    timerMinutes:
      typeof raw.timerMinutes === 'number' ? raw.timerMinutes : null,
  };
}

export function mapNutrition(raw: any): NutritionDto | null {
  if (!raw || typeof raw !== 'object') return null;
  return {
    calories: typeof raw.calories === 'number' ? raw.calories : undefined,
    proteinGrams:
      typeof raw.proteinGrams === 'number' ? raw.proteinGrams : undefined,
    carbsGrams: typeof raw.carbsGrams === 'number' ? raw.carbsGrams : undefined,
    fatGrams: typeof raw.fatGrams === 'number' ? raw.fatGrams : undefined,
    fiberGrams: typeof raw.fiberGrams === 'number' ? raw.fiberGrams : undefined,
  };
}

export function mapRecipeSummary(raw: any, baseUrl: string): RecipeSummaryDto {
  const id = raw.documentId || String(raw.id);
  const categories = Array.isArray(raw.categories)
    ? raw.categories.map((c: any) => ({
        id: c.documentId || String(c.id),
        name: c.name || '',
        slug: c.slug || '',
      }))
    : [];

  const tags = Array.isArray(raw.tags)
    ? raw.tags.map((t: any) => ({
        id: t.documentId || String(t.id),
        name: t.name || '',
        slug: t.slug || '',
      }))
    : [];

  return {
    id,
    slug: raw.slug || '',
    title: raw.title || '',
    description: raw.description || null,
    cover: mapMedia(raw.cover, baseUrl),
    totalTimeMinutes:
      typeof raw.totalTimeMinutes === 'number'
        ? raw.totalTimeMinutes
        : (raw.prepTimeMinutes || 0) + (raw.cookTimeMinutes || 0) || null,
    servings: typeof raw.servings === 'number' ? raw.servings : 1,
    difficulty: raw.difficulty || null,
    categories,
    tags,
  };
}

export function mapRecipe(raw: any, baseUrl: string): RecipeDto {
  const summary = mapRecipeSummary(raw, baseUrl);
  const gallery = Array.isArray(raw.gallery)
    ? raw.gallery
        .map((img: any) => mapMedia(img, baseUrl))
        .filter((m: any): m is Media => m !== null)
    : [];

  const ingredients = Array.isArray(raw.ingredients)
    ? raw.ingredients.map(mapIngredientLine)
    : [];

  const steps = Array.isArray(raw.steps)
    ? raw.steps.map((s: any) => mapStep(s, baseUrl))
    : [];

  return {
    ...summary,
    gallery,
    prepTimeMinutes:
      typeof raw.prepTimeMinutes === 'number' ? raw.prepTimeMinutes : null,
    cookTimeMinutes:
      typeof raw.cookTimeMinutes === 'number' ? raw.cookTimeMinutes : null,
    ingredients,
    steps,
    nutrition: mapNutrition(raw.nutrition),
    notes: Array.isArray(raw.notes) ? raw.notes : null,
    sourceUrl: raw.sourceUrl || null,
    featured: Boolean(raw.featured),
    publishedAt: raw.publishedAt || new Date().toISOString(),
  };
}
