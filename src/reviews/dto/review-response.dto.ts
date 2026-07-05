import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';

class ReviewUserSummaryDto {
  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  id: string;

  @ApiProperty({ example: 'Mila' })
  firstName: string;

  @ApiProperty({ example: 'Schneider' })
  lastName: string;
}

class ReviewTourSummaryDto {
  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  id: string;

  @ApiProperty({ example: 'Black Forest Weekend' })
  title: string;

  @ApiProperty({ example: 'black-forest-weekend' })
  slug: string;
}

export class ReviewResponseDto {
  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  id: string;

  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  userId: string;

  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  tourId: string;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({ example: 'Great route, well organized, and a very friendly guide.' })
  text: string;

  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.PUBLISHED })
  status: ReviewStatus;

  @ApiProperty({ example: '2026-07-03T17:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-03T17:30:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: ReviewUserSummaryDto })
  user: ReviewUserSummaryDto;

  @ApiProperty({ type: ReviewTourSummaryDto })
  tour: ReviewTourSummaryDto;
}
