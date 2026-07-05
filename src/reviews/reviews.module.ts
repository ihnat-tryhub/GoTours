import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AdminReviewsController } from './admin-reviews.controller';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TourReviewsController } from './tour-reviews.controller';

@Module({
  imports: [AuthModule],
  controllers: [TourReviewsController, ReviewsController, AdminReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
