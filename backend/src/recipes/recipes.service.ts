import { Injectable } from '@nestjs/common';
import { CmsService } from '../cms/cms.service.js';
import { QueryRecipesDto } from './dto/query-recipes.dto.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';
import { RecipeDto, RecipeSummaryDto } from '../cms/cms.types.js';

@Injectable()
export class RecipesService {
  constructor(private readonly cmsService: CmsService) {}

  async findAll(
    query: QueryRecipesDto,
  ): Promise<PaginatedResult<RecipeSummaryDto>> {
    return this.cmsService.getRecipes({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      category: query.category,
      tag: query.tag,
      difficulty: query.difficulty,
      maxTime: query.maxTime,
      featured: query.featured,
    });
  }

  async findOne(slug: string): Promise<RecipeDto> {
    return this.cmsService.getRecipeBySlug(slug);
  }
}
