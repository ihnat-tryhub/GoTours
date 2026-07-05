import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ModerateReviewDto {
  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.HIDDEN })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;
}
