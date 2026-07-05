import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TourDifficulty } from '@prisma/client';

export class TourResponseDto {
  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  id: string;

  @ApiProperty({ example: 'Black Forest Weekend' })
  title: string;

  @ApiProperty({ example: 'black-forest-weekend' })
  slug: string;

  @ApiProperty({
    example: 'A relaxed hiking weekend through forest trails, viewpoints, and small villages.',
  })
  summary: string;

  @ApiProperty({ example: 'Explore the Black Forest with a small group and local guide support.' })
  description: string;

  @ApiProperty({ example: 349 })
  price: number;

  @ApiProperty({ example: 3 })
  duration: number;

  @ApiProperty({ example: 12 })
  maxGroupSize: number;

  @ApiProperty({ enum: TourDifficulty, example: TourDifficulty.EASY })
  difficulty: TourDifficulty;

  @ApiProperty({ example: 4.7 })
  ratingsAverage: number;

  @ApiProperty({ example: 18 })
  ratingsQuantity: number;

  @ApiPropertyOptional({ example: 'black-forest-cover.jpg', nullable: true })
  imageCover: string | null;

  @ApiProperty({ example: ['black-forest-1.jpg', 'black-forest-2.jpg'] })
  images: string[];

  @ApiProperty({ example: ['2026-08-14T09:00:00.000Z'] })
  startDates: Date[];

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-07-03T17:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-03T17:30:00.000Z' })
  updatedAt: Date;
}
