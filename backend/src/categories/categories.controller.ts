import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { CategoryDto } from '../cms/cms.types.js';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all recipe categories' })
  @ApiOkResponse({ description: 'List of all categories' })
  async getCategories(): Promise<CategoryDto[]> {
    return this.categoriesService.findAll();
  }
}
