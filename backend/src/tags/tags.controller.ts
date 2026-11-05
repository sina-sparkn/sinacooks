import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TagsService } from './tags.service.js';
import { TagDto } from '../cms/cms.types.js';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all recipe tags' })
  @ApiOkResponse({ description: 'List of all tags' })
  async getTags(): Promise<TagDto[]> {
    return this.tagsService.findAll();
  }
}
