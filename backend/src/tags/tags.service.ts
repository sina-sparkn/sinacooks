import { Injectable } from '@nestjs/common';
import { CmsService } from '../cms/cms.service.js';
import { TagDto } from '../cms/cms.types.js';

@Injectable()
export class TagsService {
  constructor(private readonly cmsService: CmsService) {}

  async findAll(): Promise<TagDto[]> {
    return this.cmsService.getTags();
  }
}
