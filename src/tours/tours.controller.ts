import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ListToursQueryDto } from './dto/list-tours-query.dto';
import { ListToursResponseDto } from './dto/list-tours-response.dto';
import { TourResponseDto } from './dto/tour-response.dto';
import { ToursService } from './tours.service';

@ApiTags('tours')
@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  @ApiOkResponse({ type: ListToursResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid filter, sorting, or pagination parameters.' })
  listTours(@Query() query: ListToursQueryDto): Promise<ListToursResponseDto> {
    return this.toursService.listTours(query);
  }

  @Get(':slug')
  @ApiOkResponse({ type: TourResponseDto })
  @ApiNotFoundResponse({ description: 'Tour not found.' })
  getTourBySlug(@Param('slug') slug: string): Promise<TourResponseDto> {
    return this.toursService.getTourBySlug(slug);
  }
}
