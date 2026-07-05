import { Body, Controller, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateTourDto } from './dto/create-tour.dto';
import { TourResponseDto } from './dto/tour-response.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { ToursService } from './tours.service';

@ApiTags('admin tours')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/tours')
export class AdminToursController {
  constructor(private readonly toursService: ToursService) {}

  @Post()
  @ApiCreatedResponse({ type: TourResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid tour data.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin role is required.' })
  @ApiConflictResponse({ description: 'Tour slug already exists.' })
  createTour(@Body() dto: CreateTourDto): Promise<TourResponseDto> {
    return this.toursService.createTour(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: TourResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid tour data.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin role is required.' })
  @ApiNotFoundResponse({ description: 'Tour not found.' })
  @ApiConflictResponse({ description: 'Tour slug already exists.' })
  updateTour(
    @Param('id', new ParseUUIDPipe()) tourId: string,
    @Body() dto: UpdateTourDto,
  ): Promise<TourResponseDto> {
    return this.toursService.updateTour(tourId, dto);
  }

  @Patch(':id/deactivate')
  @ApiOkResponse({ type: TourResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin role is required.' })
  @ApiNotFoundResponse({ description: 'Tour not found.' })
  deactivateTour(@Param('id', new ParseUUIDPipe()) tourId: string): Promise<TourResponseDto> {
    return this.toursService.deactivateTour(tourId);
  }
}
