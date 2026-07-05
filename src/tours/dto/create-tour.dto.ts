import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TourDifficulty } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTourDto {
  @ApiProperty({ example: 'Black Forest Weekend' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title: string;

  @ApiProperty({
    example: 'A relaxed hiking weekend through forest trails, viewpoints, and small villages.',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(300)
  summary: string;

  @ApiProperty({ example: 'Explore the Black Forest with a small group and local guide support.' })
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description: string;

  @ApiProperty({ example: 349, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 3, minimum: 1, maximum: 60 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  duration: number;

  @ApiProperty({ example: 12, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  maxGroupSize: number;

  @ApiProperty({ enum: TourDifficulty, example: TourDifficulty.EASY })
  @IsEnum(TourDifficulty)
  difficulty: TourDifficulty;

  @ApiPropertyOptional({ example: 'black-forest-cover.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageCover?: string;

  @ApiPropertyOptional({ example: ['black-forest-1.jpg', 'black-forest-2.jpg'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  images?: string[];

  @ApiPropertyOptional({ example: ['2026-08-14T09:00:00.000Z'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(24)
  @IsISO8601({}, { each: true })
  startDates?: string[];
}
