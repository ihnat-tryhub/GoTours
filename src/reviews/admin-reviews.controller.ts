import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ListAdminReviewsQueryDto } from './dto/list-admin-reviews-query.dto';
import { ListReviewsResponseDto } from './dto/list-reviews-response.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('admin reviews')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOkResponse({ type: ListReviewsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin role is required.' })
  listReviews(@Query() query: ListAdminReviewsQueryDto): Promise<ListReviewsResponseDto> {
    return this.reviewsService.listReviews(query);
  }

  @Patch(':id/moderate')
  @ApiOkResponse({ type: ReviewResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin role is required.' })
  @ApiNotFoundResponse({ description: 'Review not found.' })
  moderateReview(
    @Param('id', new ParseUUIDPipe()) reviewId: string,
    @Body() dto: ModerateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.moderateReview(reviewId, dto);
  }
}
