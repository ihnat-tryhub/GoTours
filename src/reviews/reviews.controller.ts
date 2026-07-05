import { Body, Controller, Delete, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DeleteReviewResponseDto } from './dto/delete-review-response.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Patch(':id')
  @ApiOkResponse({ type: ReviewResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Users can only update their own reviews.' })
  @ApiNotFoundResponse({ description: 'Review not found.' })
  updateOwnReview(
    @CurrentUser('id') userId: string,
    @Param('id', new ParseUUIDPipe()) reviewId: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.updateOwnReview(userId, reviewId, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: DeleteReviewResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Users can only delete their own reviews.' })
  @ApiNotFoundResponse({ description: 'Review not found.' })
  deleteOwnReview(
    @CurrentUser('id') userId: string,
    @Param('id', new ParseUUIDPipe()) reviewId: string,
  ): Promise<DeleteReviewResponseDto> {
    return this.reviewsService.deleteOwnReview(userId, reviewId);
  }
}
