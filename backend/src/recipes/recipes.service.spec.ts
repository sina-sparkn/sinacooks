import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecipesService } from './recipes.service.js';

describe('RecipesService', () => {
  let service: RecipesService;
  let mockCmsService: any;

  beforeEach(() => {
    mockCmsService = {
      getRecipes: vi.fn(),
      getRecipeBySlug: vi.fn(),
    };
    service = new RecipesService(mockCmsService);
  });

  it('delegates findAll to CmsService.getRecipes', async () => {
    mockCmsService.getRecipes.mockResolvedValue({
      items: [{ id: '1', title: 'Pancakes' }],
      meta: { page: 1, pageSize: 12, pageCount: 1, total: 1 },
    });

    const result = await service.findAll({ page: 1, pageSize: 12, q: 'pan' });
    expect(mockCmsService.getRecipes).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'pan' }),
    );
    expect(result.items).toHaveLength(1);
  });

  it('delegates findOne to CmsService.getRecipeBySlug', async () => {
    mockCmsService.getRecipeBySlug.mockResolvedValue({
      id: '1',
      slug: 'pancakes',
      title: 'Pancakes',
    });

    const result = await service.findOne('pancakes');
    expect(mockCmsService.getRecipeBySlug).toHaveBeenCalledWith('pancakes');
    expect(result.slug).toBe('pancakes');
  });
});
