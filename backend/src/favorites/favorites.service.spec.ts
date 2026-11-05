import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FavoritesService } from './favorites.service.js';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let mockPrisma: any;
  let mockCms: any;

  beforeEach(() => {
    mockPrisma = {
      favorite: {
        findMany: vi.fn(),
        upsert: vi.fn(),
        deleteMany: vi.fn(),
      },
    };
    mockCms = {
      getRecipesByIds: vi.fn(),
    };
    service = new FavoritesService(mockPrisma, mockCms);
  });

  it('returns empty array when user has no favorites', async () => {
    mockPrisma.favorite.findMany.mockResolvedValue([]);
    const res = await service.getFavorites('u1');
    expect(res).toEqual([]);
    expect(mockCms.getRecipesByIds).not.toHaveBeenCalled();
  });

  it('fetches recipe summaries by ids when favorites exist', async () => {
    mockPrisma.favorite.findMany.mockResolvedValue([
      { recipeId: 'rec_1' },
      { recipeId: 'rec_2' },
    ]);
    mockCms.getRecipesByIds.mockResolvedValue([
      { id: 'rec_1', title: 'Recipe 1' },
      { id: 'rec_2', title: 'Recipe 2' },
    ]);

    const res = await service.getFavorites('u1');
    expect(mockCms.getRecipesByIds).toHaveBeenCalledWith(['rec_1', 'rec_2']);
    expect(res).toHaveLength(2);
  });

  it('adds a favorite idempotently', async () => {
    mockPrisma.favorite.upsert.mockResolvedValue({});
    const res = await service.addFavorite('u1', 'rec_1');
    expect(res.success).toBe(true);
    expect(mockPrisma.favorite.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_recipeId: { userId: 'u1', recipeId: 'rec_1' } },
      }),
    );
  });

  it('removes a favorite idempotently', async () => {
    mockPrisma.favorite.deleteMany.mockResolvedValue({ count: 1 });
    const res = await service.removeFavorite('u1', 'rec_1');
    expect(res.success).toBe(true);
    expect(mockPrisma.favorite.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'u1', recipeId: 'rec_1' },
    });
  });
});
