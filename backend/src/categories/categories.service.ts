import { Injectable } from '@nestjs/common';
import { CmsService } from '../cms/cms.service.js';
import { CategoryDto } from '../cms/cms.types.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly cmsService: CmsService) {}

  async findAll(): Promise<CategoryDto[]> {
    return this.cmsService.getCategories();
  }
}
