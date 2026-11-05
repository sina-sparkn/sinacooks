import {
  BadGatewayException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import qs from 'qs';
import {
  CategoryDto,
  RecipeDto,
  RecipeSummaryDto,
  TagDto,
} from './cms.types.js';
import {
  mapCategory,
  mapRecipe,
  mapRecipeSummary,
  mapTag,
} from './cms.mapper.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';

export interface QueryRecipesFilterParams {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  tag?: string | string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  maxTime?: number;
  featured?: boolean;
}

@Injectable()
export class CmsService {
  private readonly logger = new Logger(CmsService.name);
  private readonly strapiUrl: string;
  private readonly publicUrl: string;
  private readonly apiToken: string;

  constructor(
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.strapiUrl = this.config.get<string>(
      'cms.strapiUrl',
      'http://localhost:1337',
    );
    this.publicUrl = this.config.get<string>(
      'cms.strapiPublicUrl',
      'http://localhost:1337',
    );
    this.apiToken = this.config.get<string>('cms.strapiApiToken', '');
  }

  private async fetchStrapi<T>(
    path: string,
    queryParams?: Record<string, any>,
  ): Promise<T> {
    const queryString = queryParams
      ? qs.stringify(queryParams, {
          encodeValuesOnly: true,
          arrayFormat: 'indices',
        })
      : '';
    const fullUrl = `${this.strapiUrl}/api${path}${queryString ? `?${queryString}` : ''}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Strapi HTTP error [${response.status}] ${path}: ${errorText}`,
        );
        if (response.status === 404) {
          throw new NotFoundException('Resource not found in CMS');
        }
        throw new BadGatewayException('Failed to communicate with content CMS');
      }

      return (await response.json()) as T;
    } catch (err: any) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadGatewayException
      ) {
        throw err;
      }
      this.logger.error(
        `Strapi request failed to ${fullUrl}: ${err.message}`,
        err.stack,
      );
      throw new BadGatewayException('CMS service currently unavailable');
    }
  }

  async getRecipes(
    params: QueryRecipesFilterParams,
  ): Promise<PaginatedResult<RecipeSummaryDto>> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 12;

    const cacheKey = `recipes:${JSON.stringify(params)}`;
    const cached =
      await this.cacheManager.get<PaginatedResult<RecipeSummaryDto>>(cacheKey);
    if (cached) {
      return cached;
    }

    const filters: Record<string, any> = {};

    if (params.q) {
      filters.$or = [
        { title: { $containsi: params.q } },
        { description: { $containsi: params.q } },
      ];
    }

    if (params.category) {
      filters.categories = { slug: { $eq: params.category } };
    }

    if (params.tag) {
      const tags = Array.isArray(params.tag) ? params.tag : [params.tag];
      filters.tags = { slug: { $in: tags } };
    }

    if (params.difficulty) {
      filters.difficulty = { $eq: params.difficulty };
    }

    if (params.maxTime) {
      filters.totalTimeMinutes = { $lte: params.maxTime };
    }

    if (typeof params.featured === 'boolean') {
      filters.featured = { $eq: params.featured };
    }

    const strapiQuery = {
      fields: [
        'title',
        'slug',
        'description',
        'totalTimeMinutes',
        'difficulty',
        'servings',
      ],
      populate: {
        cover: true,
        categories: true,
        tags: true,
      },
      filters,
      sort: 'publishedAt:desc',
      pagination: {
        page,
        pageSize,
      },
    };

    const res = await this.fetchStrapi<any>('/recipes', strapiQuery);

    const items = Array.isArray(res.data)
      ? res.data.map((item: any) => mapRecipeSummary(item, this.publicUrl))
      : [];

    const meta = res.meta?.pagination || {
      page,
      pageSize,
      pageCount: Math.ceil(
        (res.meta?.pagination?.total || items.length) / pageSize,
      ),
      total: items.length,
    };

    const result: PaginatedResult<RecipeSummaryDto> = {
      items,
      meta: {
        page: meta.page,
        pageSize: meta.pageSize,
        pageCount: meta.pageCount,
        total: meta.total,
      },
    };

    await this.cacheManager.set(cacheKey, result);
    return result;
  }

  async getRecipeBySlug(slug: string): Promise<RecipeDto> {
    const cacheKey = `recipe:slug:${slug}`;
    const cached = await this.cacheManager.get<RecipeDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const strapiQuery = {
      filters: { slug: { $eq: slug } },
      populate: {
        cover: true,
        gallery: true,
        ingredients: { populate: { ingredient: true } },
        steps: { populate: { image: true } },
        nutrition: true,
        categories: true,
        tags: true,
      },
    };

    const res = await this.fetchStrapi<any>('/recipes', strapiQuery);

    const entry =
      Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
    if (!entry) {
      throw new NotFoundException(`Recipe with slug "${slug}" not found`);
    }

    const mapped = mapRecipe(entry, this.publicUrl);
    await this.cacheManager.set(cacheKey, mapped);
    return mapped;
  }

  async getRecipesByIds(documentIds: string[]): Promise<RecipeSummaryDto[]> {
    if (!documentIds.length) {
      return [];
    }

    const strapiQuery = {
      fields: [
        'title',
        'slug',
        'description',
        'totalTimeMinutes',
        'difficulty',
        'servings',
      ],
      filters: {
        documentId: { $in: documentIds },
      },
      populate: {
        cover: true,
        categories: true,
        tags: true,
      },
    };

    const res = await this.fetchStrapi<any>('/recipes', strapiQuery);
    return Array.isArray(res.data)
      ? res.data.map((item: any) => mapRecipeSummary(item, this.publicUrl))
      : [];
  }

  async getCategories(): Promise<CategoryDto[]> {
    const cacheKey = 'categories:all';
    const cached = await this.cacheManager.get<CategoryDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const strapiQuery = {
      populate: { image: true },
      sort: 'name:asc',
    };

    const res = await this.fetchStrapi<any>('/categories', strapiQuery);
    const items = Array.isArray(res.data)
      ? res.data.map((cat: any) => mapCategory(cat, this.publicUrl))
      : [];

    await this.cacheManager.set(cacheKey, items);
    return items;
  }

  async getTags(): Promise<TagDto[]> {
    const cacheKey = 'tags:all';
    const cached = await this.cacheManager.get<TagDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const strapiQuery = {
      sort: 'name:asc',
    };

    const res = await this.fetchStrapi<any>('/tags', strapiQuery);
    const items = Array.isArray(res.data) ? res.data.map(mapTag) : [];

    await this.cacheManager.set(cacheKey, items);
    return items;
  }

  async clearCache(): Promise<void> {
    await this.cacheManager.clear();
    this.logger.log('CmsService in-memory cache cleared');
  }
}
