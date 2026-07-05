import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Tour } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { ListToursQueryDto } from './dto/list-tours-query.dto';
import { ListToursResponseDto } from './dto/list-tours-response.dto';
import { TourResponseDto } from './dto/tour-response.dto';
import { UpdateTourDto } from './dto/update-tour.dto';

@Injectable()
export class ToursService {
  constructor(private readonly prisma: PrismaService) {}

  async listTours(query: ListToursQueryDto): Promise<ListToursResponseDto> {
    this.validatePriceRange(query);

    const page = query.page;
    const limit = query.limit;
    const where = this.buildPublicToursWhere(query);
    const orderBy = {
      [query.sortBy]: query.sortOrder,
    } satisfies Prisma.TourOrderByWithRelationInput;

    const [tours, total] = await this.prisma.$transaction([
      this.prisma.tour.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.tour.count({ where }),
    ]);

    return {
      data: tours.map((tour) => this.toTourResponse(tour)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTourBySlug(slug: string): Promise<TourResponseDto> {
    const tour = await this.prisma.tour.findFirst({
      where: { slug, isActive: true },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found.');
    }

    return this.toTourResponse(tour);
  }

  async createTour(dto: CreateTourDto): Promise<TourResponseDto> {
    const slug = await this.createUniqueSlug(dto.title);

    try {
      const tour = await this.prisma.tour.create({
        data: {
          title: dto.title.trim(),
          slug,
          summary: dto.summary.trim(),
          description: dto.description.trim(),
          price: dto.price,
          duration: dto.duration,
          maxGroupSize: dto.maxGroupSize,
          difficulty: dto.difficulty,
          imageCover: this.trimOptionalString(dto.imageCover),
          images: this.trimStringArray(dto.images),
          startDates: this.toDateArray(dto.startDates),
        },
      });

      return this.toTourResponse(tour);
    } catch (error) {
      this.handleTourWriteError(error);
    }
  }

  async updateTour(tourId: string, dto: UpdateTourDto): Promise<TourResponseDto> {
    await this.findTourOrThrow(tourId);

    const data: Prisma.TourUpdateInput = {};

    if (dto.title !== undefined) {
      data.title = dto.title.trim();
      data.slug = await this.createUniqueSlug(dto.title, tourId);
    }

    if (dto.summary !== undefined) {
      data.summary = dto.summary.trim();
    }

    if (dto.description !== undefined) {
      data.description = dto.description.trim();
    }

    if (dto.price !== undefined) {
      data.price = dto.price;
    }

    if (dto.duration !== undefined) {
      data.duration = dto.duration;
    }

    if (dto.maxGroupSize !== undefined) {
      data.maxGroupSize = dto.maxGroupSize;
    }

    if (dto.difficulty !== undefined) {
      data.difficulty = dto.difficulty;
    }

    if (dto.imageCover !== undefined) {
      data.imageCover = this.trimOptionalString(dto.imageCover);
    }

    if (dto.images !== undefined) {
      data.images = this.trimStringArray(dto.images);
    }

    if (dto.startDates !== undefined) {
      data.startDates = this.toDateArray(dto.startDates);
    }

    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }

    if (!Object.keys(data).length) {
      return this.findTourOrThrow(tourId);
    }

    try {
      const tour = await this.prisma.tour.update({
        where: { id: tourId },
        data,
      });

      return this.toTourResponse(tour);
    } catch (error) {
      this.handleTourWriteError(error);
    }
  }

  async deactivateTour(tourId: string): Promise<TourResponseDto> {
    await this.findTourOrThrow(tourId);

    const tour = await this.prisma.tour.update({
      where: { id: tourId },
      data: { isActive: false },
    });

    return this.toTourResponse(tour);
  }

  private buildPublicToursWhere(query: ListToursQueryDto): Prisma.TourWhereInput {
    const where: Prisma.TourWhereInput = { isActive: true };

    if (query.difficulty) {
      where.difficulty = query.difficulty;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {
        gte: query.minPrice,
        lte: query.maxPrice,
      };
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private validatePriceRange(query: ListToursQueryDto): void {
    if (
      query.minPrice !== undefined &&
      query.maxPrice !== undefined &&
      query.minPrice > query.maxPrice
    ) {
      throw new BadRequestException('minPrice must be less than or equal to maxPrice.');
    }
  }

  private async findTourOrThrow(tourId: string): Promise<TourResponseDto> {
    const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });

    if (!tour) {
      throw new NotFoundException('Tour not found.');
    }

    return this.toTourResponse(tour);
  }

  private async createUniqueSlug(title: string, excludeTourId?: string): Promise<string> {
    const baseSlug = this.slugify(title);
    let slug = baseSlug;
    let suffix = 2;

    while (await this.slugExists(slug, excludeTourId)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  private async slugExists(slug: string, excludeTourId?: string): Promise<boolean> {
    const existingTour = await this.prisma.tour.findFirst({
      where: {
        slug,
        ...(excludeTourId ? { id: { not: excludeTourId } } : {}),
      },
      select: { id: true },
    });

    return Boolean(existingTour);
  }

  private slugify(value: string): string {
    const slug = value
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug || 'tour';
  }

  private trimOptionalString(value?: string | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed || null;
  }

  private trimStringArray(values?: string[]): string[] {
    return values?.map((value) => value.trim()).filter(Boolean) ?? [];
  }

  private toDateArray(values?: string[]): Date[] {
    return values?.map((value) => new Date(value)) ?? [];
  }

  private handleTourWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Tour slug already exists.');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Tour not found.');
      }
    }

    throw error;
  }

  private toTourResponse(tour: Tour): TourResponseDto {
    return {
      ...tour,
      price: Number(tour.price),
      ratingsAverage: Number(tour.ratingsAverage),
    };
  }
}
