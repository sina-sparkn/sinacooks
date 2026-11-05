import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';
import { CmsService } from '../cms/cms.service.js';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly webhookSecret: string;

  constructor(
    private readonly cmsService: CmsService,
    private readonly config: ConfigService,
  ) {
    this.webhookSecret = this.config.get<string>('cms.webhookSecret', '');
  }

  @Post('cms')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle CMS webhook events to invalidate recipe cache',
  })
  async handleCmsWebhook(@Headers('x-webhook-secret') secretHeader?: string) {
    if (!this.webhookSecret) {
      // If no secret is configured, clear cache directly
      await this.cmsService.clearCache();
      return { received: true, cacheCleared: true };
    }

    if (!secretHeader) {
      throw new UnauthorizedException('Missing x-webhook-secret header');
    }

    const expectedBuffer = Buffer.from(this.webhookSecret);
    const providedBuffer = Buffer.from(secretHeader);

    if (
      expectedBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      throw new UnauthorizedException('Invalid webhook secret');
    }

    await this.cmsService.clearCache();
    return { received: true, cacheCleared: true };
  }
}
