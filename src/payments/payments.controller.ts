import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CheckoutSessionResponseDto } from './dto/checkout-session-response.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { WebhookResponseDto } from './dto/webhook-response.dto';
import { PaymentsService } from './payments.service';
import { RawBodyRequest } from './types/raw-body-request.type';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout-sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: CheckoutSessionResponseDto })
  @ApiBadRequestResponse({ description: 'Booking cannot be paid in its current status.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiNotFoundResponse({ description: 'Booking not found.' })
  createCheckoutSession(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponseDto> {
    return this.paymentsService.createCheckoutSession(userId, dto.bookingId);
  }

  @Post('webhook')
  @SkipThrottle()
  @ApiOkResponse({ type: WebhookResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid Stripe webhook signature.' })
  handleWebhook(
    @Headers('stripe-signature') signature: string | undefined,
    @Req() request: RawBodyRequest,
  ): Promise<WebhookResponseDto> {
    return this.paymentsService.handleWebhook(signature, request.rawBody);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: PaymentResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Payment belongs to another user.' })
  @ApiNotFoundResponse({ description: 'Payment not found.' })
  getPayment(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id', new ParseUUIDPipe()) paymentId: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.getPayment(userId, role, paymentId);
  }
}
