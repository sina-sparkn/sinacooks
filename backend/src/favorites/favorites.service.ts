import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CmsService } from '../cms/cms.service.js';
import { RecipeSummaryDto } from '../cms/cms.types.js';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cmsService: CmsService,
  ) {}

  async getFavorites(userId: string): Promise<RecipeSummaryDto[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { recipeId: true },
    });

    const recipeIds = favorites.map((f) => f.recipeId);
    if (recipeIds.length === 0) {
      return [];
    }

    return this.cmsService.getRecipesByIds(recipeIds);
  }

  async getFavoriteIds(userId: string): Promise<string[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      select: { recipeId: true },
    });
    return favorites.map((f) => f.recipeId);
  }

  async addFavorite(
    userId: string,
    recipeId: string,
  ): Promise<{ success: boolean }> {
    await this.prisma.favorite.upsert({
      where: {
        userId_recipeId: { userId, recipeId },
      },
      create: {
        userId,
        recipeId,
      },
      update: {},
    });

    return { success: true };
  }

  async removeFavorite(
    userId: string,
    recipeId: string,
  ): Promise<{ success: boolean }> {
    await this.prisma.favorite.deleteMany({
      where: {
        userId,
        recipeId,
      },
    });

    return { success: true };
  }
}
