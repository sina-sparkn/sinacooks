import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration.js';
import { envValidationSchema } from './config/validation.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { CmsModule } from './cms/cms.module.js';
import { RecipesModule } from './recipes/recipes.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { TagsModule } from './tags/tags.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { FavoritesModule } from './favorites/favorites.module.js';
import { WebhooksModule } from './webhooks/webhooks.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    PrismaModule,
    CmsModule,
    RecipesModule,
    CategoriesModule,
    TagsModule,
    UsersModule,
    AuthModule,
    FavoritesModule,
    WebhooksModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
