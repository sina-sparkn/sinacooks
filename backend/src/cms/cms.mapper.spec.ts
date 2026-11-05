import { describe, expect, it } from 'vitest';
import {
  mapCategory,
  mapMedia,
  mapRecipe,
  mapRecipeSummary,
  mapTag,
} from './cms.mapper.js';

describe('CMS Mappers', () => {
  const baseUrl = 'http://localhost:1337';

  describe('mapMedia', () => {
    it('returns null for empty or null media', () => {
      expect(mapMedia(null, baseUrl)).toBeNull();
      expect(mapMedia(undefined, baseUrl)).toBeNull();
    });

    it('converts relative url to absolute url', () => {
      const raw = {
        url: '/uploads/image.jpg',
        alternativeText: 'A tasty dish',
        width: 800,
        height: 600,
      };

      const mapped = mapMedia(raw, baseUrl);
      expect(mapped).toEqual({
        url: 'http://localhost:1337/uploads/image.jpg',
        alt: 'A tasty dish',
        width: 800,
        height: 600,
        formats: undefined,
      });
    });

    it('preserves existing absolute URLs and maps formats', () => {
      const raw = {
        url: 'https://cdn.example.com/cover.jpg',
        formats: {
          thumbnail: { url: '/uploads/thumb.jpg', width: 150, height: 150 },
        },
      };

      const mapped = mapMedia(raw, baseUrl);
      expect(mapped?.url).toBe('https://cdn.example.com/cover.jpg');
      expect(mapped?.formats?.thumbnail?.url).toBe(
        'http://localhost:1337/uploads/thumb.jpg',
      );
    });
  });

  describe('mapRecipeSummary', () => {
    it('maps raw Strapi recipe into RecipeSummaryDto', () => {
      const raw = {
        documentId: 'rec_123',
        slug: 'blueberry-pancakes',
        title: 'Blueberry Pancakes',
        description: 'Fluffy morning treat',
        prepTimeMinutes: 10,
        cookTimeMinutes: 15,
        servings: 4,
        difficulty: 'easy',
        categories: [
          { documentId: 'cat_1', name: 'Breakfast', slug: 'breakfast' },
        ],
        tags: [{ documentId: 'tag_1', name: 'quick', slug: 'quick' }],
        cover: { url: '/uploads/pancakes.jpg' },
      };

      const result = mapRecipeSummary(raw, baseUrl);

      expect(result.id).toBe('rec_123');
      expect(result.slug).toBe('blueberry-pancakes');
      expect(result.title).toBe('Blueberry Pancakes');
      expect(result.totalTimeMinutes).toBe(25);
      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].slug).toBe('breakfast');
      expect(result.cover?.url).toBe(
        'http://localhost:1337/uploads/pancakes.jpg',
      );
    });
  });

  describe('mapRecipe', () => {
    it('maps full recipe detail including ingredients and steps', () => {
      const raw = {
        documentId: 'rec_123',
        slug: 'pancakes',
        title: 'Pancakes',
        prepTimeMinutes: 5,
        cookTimeMinutes: 10,
        servings: 2,
        ingredients: [
          {
            quantity: 1,
            unit: 'cup',
            ingredient: { name: 'Flour' },
            note: 'sifted',
            group: 'Dry',
          },
        ],
        steps: [{ instruction: 'Mix flour and milk.', timerMinutes: 2 }],
        nutrition: { calories: 250 },
        publishedAt: '2026-11-05T00:00:00.000Z',
      };

      const result = mapRecipe(raw, baseUrl);
      expect(result.id).toBe('rec_123');
      expect(result.ingredients[0]).toEqual({
        quantity: 1,
        unit: 'cup',
        name: 'Flour',
        note: 'sifted',
        group: 'Dry',
      });
      expect(result.steps[0].instruction).toBe('Mix flour and milk.');
      expect(result.nutrition?.calories).toBe(250);
    });
  });

  describe('mapCategory & mapTag', () => {
    it('maps category properly', () => {
      const raw = {
        documentId: 'c1',
        name: 'Lunch',
        slug: 'lunch',
        description: 'Midday meals',
      };
      const cat = mapCategory(raw, baseUrl);
      expect(cat.id).toBe('c1');
      expect(cat.name).toBe('Lunch');
    });

    it('maps tag properly', () => {
      const raw = { documentId: 't1', name: 'vegan', slug: 'vegan' };
      const tag = mapTag(raw);
      expect(tag.id).toBe('t1');
      expect(tag.name).toBe('vegan');
    });
  });
});
