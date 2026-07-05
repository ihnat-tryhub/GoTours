import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, TourDifficulty, UserRole } from '@prisma/client';

class BookingTourSummaryDto {
  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  id: string;

  @ApiProperty({ example: 'Black Forest Weekend' })
  title: string;

  @ApiProperty({ example: 'black-forest-weekend' })
  slug: string;

  @ApiProperty({ example: 349 })
  price: number;

  @ApiPropertyOptional({ example: 'black-forest-cover.jpg', nullable: true })
  imageCover: string | null;

  @ApiProperty({ example: 3 })
  duration: number;

  @ApiProperty({ enum: TourDifficulty, example: TourDifficulty.EASY })
  difficulty: TourDifficulty;
}

class BookingUserSummaryDto {
  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  id: string;

  @ApiProperty({ example: 'mila@example.com' })
  email: string;

  @ApiProperty({ example: 'Mila' })
  firstName: string;

  @ApiProperty({ example: 'Schneider' })
  lastName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;
}

export class BookingResponseDto {
  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  id: string;

  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  userId: string;

  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  tourId: string;

  @ApiProperty({ example: '2026-08-14T09:00:00.000Z', nullable: true })
  startDate: Date | null;

  @ApiProperty({ example: 349 })
  price: number;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.PENDING_PAYMENT })
  status: BookingStatus;

  @ApiProperty({ example: '2026-07-03T17:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-03T17:30:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: BookingTourSummaryDto })
  tour: BookingTourSummaryDto;

  @ApiProperty({ type: BookingUserSummaryDto })
  user: BookingUserSummaryDto;
}
