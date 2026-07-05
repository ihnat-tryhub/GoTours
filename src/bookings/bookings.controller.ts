import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { BookingResponseDto } from './dto/booking-response.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListBookingsResponseDto } from './dto/list-bookings-response.dto';
import { ListMyBookingsQueryDto } from './dto/list-my-bookings-query.dto';

@ApiTags('bookings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiCreatedResponse({ type: BookingResponseDto })
  @ApiBadRequestResponse({ description: 'Selected start date is not available.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiNotFoundResponse({ description: 'Tour not found.' })
  @ApiConflictResponse({ description: 'Duplicate booking for the same tour and start date.' })
  createBooking(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.createBooking(userId, dto);
  }

  @Get('me')
  @ApiOkResponse({ type: ListBookingsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  listMyBookings(
    @CurrentUser('id') userId: string,
    @Query() query: ListMyBookingsQueryDto,
  ): Promise<ListBookingsResponseDto> {
    return this.bookingsService.listMyBookings(userId, query);
  }
}
