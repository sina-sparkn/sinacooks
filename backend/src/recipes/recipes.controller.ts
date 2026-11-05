import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RecipesService } from './recipes.service.js';
import { QueryRecipesDto } from './dto/query-recipes.dto.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';
import { RecipeDto, RecipeSummaryDto } from '../cms/cms.types.js';

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get paginated recipe summaries with search and filters',
  })
  @ApiOkResponse({ description: 'Paginated recipe summaries' })
  async getRecipes(
    @Query() query: QueryRecipesDto,
  ): Promise<PaginatedResult<RecipeSummaryDto>> {
    return this.recipesService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get single recipe full detail by slug' })
  @ApiOkResponse({ description: 'Full recipe detail' })
  async getRecipeBySlug(@Param('slug') slug: string): Promise<RecipeDto> {
    return this.recipesService.findOne(slug);
  }
}
