import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ListReviewsResponseDto } from './dto/list-reviews-response.dto';
import { ListTourReviewsQueryDto } from './dto/list-tour-reviews-query.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('tour reviews')
@Controller('tours/:tourId/reviews')
export class TourReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOkResponse({ type: ListReviewsResponseDto })
  @ApiNotFoundResponse({ description: 'Tour not found.' })
  listTourReviews(
    @Param('tourId', new ParseUUIDPipe()) tourId: string,
    @Query() query: ListTourReviewsQueryDto,
  ): Promise<ListReviewsResponseDto> {
    return this.reviewsService.listTourReviews(tourId, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiCreatedResponse({ type: ReviewResponseDto })
  @ApiBadRequestResponse({ description: 'User has not booked this tour.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiNotFoundResponse({ description: 'Tour not found.' })
  @ApiConflictResponse({ description: 'User has already reviewed this tour.' })
  createReview(
    @CurrentUser('id') userId: string,
    @Param('tourId', new ParseUUIDPipe()) tourId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.createReview(userId, tourId, dto);
  }
}
