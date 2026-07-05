import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma, ReviewStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { DeleteReviewResponseDto } from './dto/delete-review-response.dto';
import { ListAdminReviewsQueryDto } from './dto/list-admin-reviews-query.dto';
import { ListReviewsResponseDto } from './dto/list-reviews-response.dto';
import { ListTourReviewsQueryDto } from './dto/list-tour-reviews-query.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

const reviewResponseInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  tour: {
    select: {
      id: true,
      title: true,
      slug: true,
    },
  },
} satisfies Prisma.ReviewInclude;

type ReviewResponseRecord = Prisma.ReviewGetPayload<{ include: typeof reviewResponseInclude }>;

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async listTourReviews(
    tourId: string,
    query: ListTourReviewsQueryDto,
  ): Promise<ListReviewsResponseDto> {
    await this.findActiveTourOrThrow(tourId);

    return this.listReviews({
      page: query.page,
      limit: query.limit,
      tourId,
      status: ReviewStatus.PUBLISHED,
    });
  }

  async listReviews(query: ListAdminReviewsQueryDto): Promise<ListReviewsResponseDto> {
    const page = query.page;
    const limit = query.limit;
    const where = this.buildReviewsWhere(query);

    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        include: reviewResponseInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews.map((review) => this.toReviewResponse(review)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createReview(
    userId: string,
    tourId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    await this.findActiveTourOrThrow(tourId);
    await this.ensureUserCanReviewTour(userId, tourId);

    try {
      const review = await this.prisma.review.create({
        data: {
          userId,
          tourId,
          rating: dto.rating,
          text: dto.text.trim(),
        },
        include: reviewResponseInclude,
      });

      await this.updateTourRatingAggregation(tourId);
      return this.toReviewResponse(review);
    } catch (error) {
      this.handleReviewWriteError(error);
    }
  }

  async updateOwnReview(
    userId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const existingReview = await this.findReviewOrThrow(reviewId);
    this.ensureReviewOwner(existingReview.userId, userId);

    const data: Prisma.ReviewUpdateInput = {};

    if (dto.rating !== undefined) {
      data.rating = dto.rating;
    }

    if (dto.text !== undefined) {
      data.text = dto.text.trim();
    }

    if (!Object.keys(data).length) {
      return this.toReviewResponse(existingReview);
    }

    const review = await this.prisma.review.update({
      where: { id: reviewId },
      data,
      include: reviewResponseInclude,
    });

    await this.updateTourRatingAggregation(review.tourId);
    return this.toReviewResponse(review);
  }

  async deleteOwnReview(userId: string, reviewId: string): Promise<DeleteReviewResponseDto> {
    const existingReview = await this.findReviewOrThrow(reviewId);
    this.ensureReviewOwner(existingReview.userId, userId);

    await this.prisma.review.delete({ where: { id: reviewId } });
    await this.updateTourRatingAggregation(existingReview.tourId);

    return { success: true };
  }

  async moderateReview(reviewId: string, dto: ModerateReviewDto): Promise<ReviewResponseDto> {
    const existingReview = await this.findReviewOrThrow(reviewId);

    const review = await this.prisma.review.update({
      where: { id: reviewId },
      data: { status: dto.status },
      include: reviewResponseInclude,
    });

    await this.updateTourRatingAggregation(existingReview.tourId);
    return this.toReviewResponse(review);
  }

  private buildReviewsWhere(query: ListAdminReviewsQueryDto): Prisma.ReviewWhereInput {
    const where: Prisma.ReviewWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.tourId) {
      where.tourId = query.tourId;
    }

    return where;
  }

  private async findActiveTourOrThrow(tourId: string): Promise<void> {
    const tour = await this.prisma.tour.findFirst({
      where: { id: tourId, isActive: true },
      select: { id: true },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found.');
    }
  }

  private async findReviewOrThrow(reviewId: string): Promise<ReviewResponseRecord> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: reviewResponseInclude,
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    return review;
  }

  private async ensureUserCanReviewTour(userId: string, tourId: string): Promise<void> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        userId,
        tourId,
        status: {
          in: [BookingStatus.PENDING_PAYMENT, BookingStatus.PAID],
        },
      },
      select: { id: true },
    });

    if (!booking) {
      throw new BadRequestException('You can review only tours you have booked.');
    }
  }

  private ensureReviewOwner(reviewUserId: string, currentUserId: string): void {
    if (reviewUserId !== currentUserId) {
      throw new ForbiddenException('You can only modify your own reviews.');
    }
  }

  private async updateTourRatingAggregation(tourId: string): Promise<void> {
    const stats = await this.prisma.review.aggregate({
      where: {
        tourId,
        status: ReviewStatus.PUBLISHED,
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const ratingsAverage = stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0;
    const ratingsQuantity = stats._count.rating;

    await this.prisma.tour.update({
      where: { id: tourId },
      data: {
        ratingsAverage,
        ratingsQuantity,
      },
    });
  }

  private handleReviewWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('You have already reviewed this tour.');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Review not found.');
      }
    }

    throw error;
  }

  private toReviewResponse(review: ReviewResponseRecord): ReviewResponseDto {
    return review;
  }
}
