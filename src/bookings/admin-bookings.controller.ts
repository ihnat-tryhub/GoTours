import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BookingsService } from './bookings.service';
import { BookingResponseDto } from './dto/booking-response.dto';
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto';
import { ListBookingsResponseDto } from './dto/list-bookings-response.dto';

@ApiTags('admin bookings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/bookings')
export class AdminBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOkResponse({ type: ListBookingsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin role is required.' })
  listBookings(@Query() query: ListBookingsQueryDto): Promise<ListBookingsResponseDto> {
    return this.bookingsService.listBookings(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: BookingResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin role is required.' })
  @ApiNotFoundResponse({ description: 'Booking not found.' })
  getBooking(@Param('id', new ParseUUIDPipe()) bookingId: string): Promise<BookingResponseDto> {
    return this.bookingsService.getBookingForAdmin(bookingId);
  }
}
