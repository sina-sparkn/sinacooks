import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator.js';
import { RecipeSummaryDto } from '../cms/cms.types.js';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: "Get current user's favorite recipes" })
  @ApiOkResponse({ description: 'List of favorite recipe summaries' })
  async getFavorites(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RecipeSummaryDto[]> {
    return this.favoritesService.getFavorites(user.id);
  }

  @Get('ids')
  @ApiOperation({ summary: 'Get list of recipe IDs favorited by current user' })
  @ApiOkResponse({ description: 'Array of recipe documentIds' })
  async getFavoriteIds(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string[]> {
    return this.favoritesService.getFavoriteIds(user.id);
  }

  @Put(':recipeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a recipe to favorites (idempotent)' })
  @ApiOkResponse({ description: 'Favorite added' })
  async addFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('recipeId') recipeId: string,
  ) {
    return this.favoritesService.addFavorite(user.id, recipeId);
  }

  @Delete(':recipeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a recipe from favorites (idempotent)' })
  @ApiOkResponse({ description: 'Favorite removed' })
  async removeFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('recipeId') recipeId: string,
  ) {
    return this.favoritesService.removeFavorite(user.id, recipeId);
  }
}
