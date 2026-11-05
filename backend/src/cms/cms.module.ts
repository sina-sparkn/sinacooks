import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CmsService } from './cms.service.js';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get<number>('cms.cacheTtlSeconds', 60) * 1000,
      }),
    }),
  ],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}
