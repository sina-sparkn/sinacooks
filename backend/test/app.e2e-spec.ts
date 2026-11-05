import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { CmsService } from '../src/cms/cms.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import argon2 from 'argon2';

describe('Recipe Site API (E2E)', () => {
  let app: INestApplication;

  const mockRecipes = [
    {
      id: 'rec_1',
      slug: 'blueberry-pancakes',
      title: 'Blueberry Pancakes',
      description: 'Fluffy breakfast',
      cover: null,
      totalTimeMinutes: 25,
      servings: 4,
      difficulty: 'easy',
      categories: [{ id: 'cat_1', name: 'Breakfast', slug: 'breakfast' }],
      tags: [{ id: 'tag_1', name: 'quick', slug: 'quick' }],
    },
  ];

  const inMemoryUsers: any[] = [];
  const inMemoryFavorites: any[] = [];

  const mockCmsService = {
    getRecipes: async () => ({
      items: mockRecipes,
      meta: { page: 1, pageSize: 12, pageCount: 1, total: 1 },
    }),
    getRecipeBySlug: async (slug: string) => {
      if (slug === 'blueberry-pancakes') {
        return {
          ...mockRecipes[0],
          gallery: [],
          prepTimeMinutes: 10,
          cookTimeMinutes: 15,
          ingredients: [],
          steps: [],
          nutrition: null,
          notes: null,
          sourceUrl: null,
          featured: true,
          publishedAt: '2026-11-05T00:00:00Z',
        };
      }
      return null;
    },
    getCategories: async () => [
      { id: 'cat_1', name: 'Breakfast', slug: 'breakfast' },
    ],
    getTags: async () => [{ id: 'tag_1', name: 'quick', slug: 'quick' }],
    getRecipesByIds: async () => mockRecipes,
    clearCache: async () => {},
  };

  const mockPrismaService = {
    $connect: async () => {},
    $disconnect: async () => {},
    $queryRaw: async () => 1,
    user: {
      findUnique: async ({ where }: any) => {
        if (where.email) {
          return inMemoryUsers.find((u) => u.email === where.email) || null;
        }
        if (where.id) {
          return inMemoryUsers.find((u) => u.id === where.id) || null;
        }
        return null;
      },
      create: async ({ data }: any) => {
        const user = {
          id: `u_${Date.now()}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryUsers.push(user);
        return user;
      },
    },
    favorite: {
      findMany: async ({ where }: any) => {
        return inMemoryFavorites.filter((f) => f.userId === where.userId);
      },
      upsert: async ({ create, where }: any) => {
        const existing = inMemoryFavorites.find(
          (f) =>
            f.userId === where.userId_recipeId.userId &&
            f.recipeId === where.userId_recipeId.recipeId,
        );
        if (!existing) {
          inMemoryFavorites.push({
            id: `fav_${Date.now()}`,
            ...create,
            createdAt: new Date(),
          });
        }
        return {};
      },
      deleteMany: async ({ where }: any) => {
        const idx = inMemoryFavorites.findIndex(
          (f) => f.userId === where.userId && f.recipeId === where.recipeId,
        );
        if (idx !== -1) inMemoryFavorites.splice(idx, 1);
        return { count: 1 };
      },
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CmsService)
      .useValue(mockCmsService)
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Public Recipe Endpoints', () => {
    it('GET /api/recipes returns 200 with paginated recipes', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/recipes')
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].slug).toBe('blueberry-pancakes');
    });

    it('GET /api/recipes/:slug returns recipe details', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/recipes/blueberry-pancakes')
        .expect(200);

      expect(res.body.title).toBe('Blueberry Pancakes');
    });

    it('GET /api/categories returns categories list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/categories')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].slug).toBe('breakfast');
    });

    it('GET /api/tags returns tags list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/tags')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].slug).toBe('quick');
    });
  });

  describe('Auth Flow & Protected Routes', () => {
    let authCookie = '';

    it('POST /api/auth/register fails on invalid password length', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'valid@example.com',
          password: '123', // too short
          displayName: 'Test',
        })
        .expect(400);
    });

    it('POST /api/auth/register creates user and sets auth cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'chef@example.com',
          password: 'SuperSecretPassword123!',
          displayName: 'Chef Mario',
        })
        .expect(201);

      expect(res.body.email).toBe('chef@example.com');
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.includes('recipe_token='))).toBe(
        true,
      );

      authCookie = cookies
        .find((c: string) => c.includes('recipe_token='))
        .split(';')[0];
    });

    it('GET /api/auth/me without auth cookie returns 401', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });

    it('GET /api/auth/me with auth cookie returns authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', [authCookie])
        .expect(200);

      expect(res.body.email).toBe('chef@example.com');
      expect(res.body.displayName).toBe('Chef Mario');
    });

    it('PUT /api/favorites/:recipeId adds favorite', async () => {
      await request(app.getHttpServer())
        .put('/api/favorites/rec_1')
        .set('Cookie', [authCookie])
        .expect(200);
    });

    it('GET /api/favorites returns list of favorites', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/favorites')
        .set('Cookie', [authCookie])
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });

    it('DELETE /api/favorites/:recipeId removes favorite', async () => {
      await request(app.getHttpServer())
        .delete('/api/favorites/rec_1')
        .set('Cookie', [authCookie])
        .expect(200);
    });
  });

  describe('Webhooks', () => {
    it('POST /api/webhooks/cms with correct secret clears cache', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/webhooks/cms')
        .set('x-webhook-secret', 'development_webhook_secret')
        .expect(200);

      expect(res.body.cacheCleared).toBe(true);
    });

    it('POST /api/webhooks/cms with wrong secret returns 401', async () => {
      await request(app.getHttpServer())
        .post('/api/webhooks/cms')
        .set('x-webhook-secret', 'wrong_secret')
        .expect(401);
    });
  });
});
