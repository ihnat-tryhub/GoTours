import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { BookingResponseDto } from './dto/booking-response.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto';
import { ListBookingsResponseDto } from './dto/list-bookings-response.dto';
import { ListMyBookingsQueryDto } from './dto/list-my-bookings-query.dto';

const bookingResponseInclude = {
  tour: {
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      imageCover: true,
      duration: true,
      difficulty: true,
    },
  },
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
} satisfies Prisma.BookingInclude;

type BookingResponseRecord = Prisma.BookingGetPayload<{ include: typeof bookingResponseInclude }>;

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(userId: string, dto: CreateBookingDto): Promise<BookingResponseDto> {
    const startDate = new Date(dto.startDate);
    const tour = await this.prisma.tour.findFirst({
      where: { id: dto.tourId, isActive: true },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found.');
    }

    if (!this.isAvailableStartDate(tour.startDates, startDate)) {
      throw new BadRequestException('Selected start date is not available for this tour.');
    }

    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        userId,
        tourId: dto.tourId,
        startDate,
      },
      select: { id: true },
    });

    if (existingBooking) {
      throw new ConflictException('You already have a booking for this tour and start date.');
    }

    try {
      const booking = await this.prisma.booking.create({
        data: {
          userId,
          tourId: dto.tourId,
          startDate,
          price: tour.price,
          status: BookingStatus.PENDING_PAYMENT,
        },
        include: bookingResponseInclude,
      });

      return this.toBookingResponse(booking);
    } catch (error) {
      this.handleBookingWriteError(error);
    }
  }

  async listMyBookings(
    userId: string,
    query: ListMyBookingsQueryDto,
  ): Promise<ListBookingsResponseDto> {
    return this.listBookings({
      ...query,
      userId,
    });
  }

  async listBookings(query: ListBookingsQueryDto): Promise<ListBookingsResponseDto> {
    const page = query.page;
    const limit = query.limit;
    const where = this.buildBookingsWhere(query);

    const [bookings, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        include: bookingResponseInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings.map((booking) => this.toBookingResponse(booking)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBookingForAdmin(bookingId: string): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: bookingResponseInclude,
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    return this.toBookingResponse(booking);
  }

  private buildBookingsWhere(query: ListBookingsQueryDto): Prisma.BookingWhereInput {
    const where: Prisma.BookingWhereInput = {};

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

  private isAvailableStartDate(availableStartDates: Date[], requestedStartDate: Date): boolean {
    if (!availableStartDates.length) {
      return true;
    }

    return availableStartDates.some(
      (availableStartDate) => availableStartDate.getTime() === requestedStartDate.getTime(),
    );
  }

  private handleBookingWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('You already have a booking for this tour and start date.');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Booking not found.');
      }
    }

    throw error;
  }

  private toBookingResponse(booking: BookingResponseRecord): BookingResponseDto {
    return {
      ...booking,
      price: Number(booking.price),
      tour: {
        ...booking.tour,
        price: Number(booking.tour.price),
      },
    };
  }
}
