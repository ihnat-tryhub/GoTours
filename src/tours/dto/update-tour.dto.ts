import { ApiPropertyOptional } from '@nestjs/swagger';
import { TourDifficulty } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
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

export class UpdateTourDto {
  @ApiPropertyOptional({ example: 'Black Forest Weekend' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({
    example: 'A relaxed hiking weekend through forest trails, viewpoints, and small villages.',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(300)
  summary?: string;

  @ApiPropertyOptional({
    example: 'Explore the Black Forest with a small group and local guide support.',
  })
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ example: 349, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 3, minimum: 1, maximum: 60 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  duration?: number;

  @ApiPropertyOptional({ example: 12, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  maxGroupSize?: number;

  @ApiPropertyOptional({ enum: TourDifficulty, example: TourDifficulty.EASY })
  @IsOptional()
  @IsEnum(TourDifficulty)
  difficulty?: TourDifficulty;

  @ApiPropertyOptional({ example: 'black-forest-cover.jpg', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageCover?: string | null;

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

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
