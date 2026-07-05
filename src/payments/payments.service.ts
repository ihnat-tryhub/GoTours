import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BookingStatus, PaymentStatus, Prisma, UserRole } from '@prisma/client';
import Stripe from 'stripe';

import { PrismaService } from '../prisma/prisma.service';
import { CheckoutSessionResponseDto } from './dto/checkout-session-response.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { WebhookResponseDto } from './dto/webhook-response.dto';

const paymentResponseSelect = {
  id: true,
  bookingId: true,
  provider: true,
  stripeCheckoutSessionId: true,
  stripePaymentIntentId: true,
  amount: true,
  currency: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PaymentSelect;

type PaymentResponseRecord = Prisma.PaymentGetPayload<{ select: typeof paymentResponseSelect }>;

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'));
  }

  async createCheckoutSession(
    userId: string,
    bookingId: string,
  ): Promise<CheckoutSessionResponseDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: {
        tour: {
          select: {
            title: true,
            summary: true,
          },
        },
        payment: {
          select: paymentResponseSelect,
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    if (booking.status === BookingStatus.PAID) {
      throw new BadRequestException('Booking is already paid.');
    }

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.REFUNDED) {
      throw new BadRequestException('Booking cannot be paid in its current status.');
    }

    const payment =
      booking.payment ??
      (await this.prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.price,
          currency: 'eur',
          status: PaymentStatus.PENDING,
        },
        select: paymentResponseSelect,
      }));

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: this.configService.getOrThrow<string>('STRIPE_CHECKOUT_SUCCESS_URL'),
      cancel_url: this.configService.getOrThrow<string>('STRIPE_CHECKOUT_CANCEL_URL'),
      client_reference_id: booking.id,
      metadata: {
        bookingId: booking.id,
        paymentId: payment.id,
        userId,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: payment.currency,
            unit_amount: this.toMinorCurrencyUnit(payment.amount),
            product_data: {
              name: booking.tour.title,
              description: booking.tour.summary,
            },
          },
        },
      ],
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        stripeCheckoutSessionId: session.id,
        status: PaymentStatus.PENDING,
      },
    });

    if (!session.url) {
      throw new BadRequestException('Stripe did not return a checkout URL.');
    }

    return {
      checkoutSessionId: session.id,
      checkoutUrl: session.url,
      paymentId: payment.id,
      bookingId: booking.id,
    };
  }

  async getPayment(
    currentUserId: string,
    currentUserRole: UserRole,
    paymentId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        ...paymentResponseSelect,
        booking: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    if (currentUserRole !== UserRole.ADMIN && payment.booking.userId !== currentUserId) {
      throw new ForbiddenException('You do not have permission to access this payment.');
    }

    return this.toPaymentResponse(payment);
  }

  async handleWebhook(
    signature: string | undefined,
    rawBody: Buffer | undefined,
  ): Promise<WebhookResponseDto> {
    if (!signature || !rawBody) {
      throw new BadRequestException('Missing Stripe webhook signature or raw body.');
    }

    const event = this.constructWebhookEvent(rawBody, signature);
    const existingEvent = await this.prisma.paymentEvent.findUnique({
      where: { stripeEventId: event.id },
    });

    if (existingEvent?.processedAt) {
      return { received: true };
    }

    await this.prisma.paymentEvent.upsert({
      where: { stripeEventId: event.id },
      update: {
        type: event.type,
        payload: this.toJsonPayload(event),
      },
      create: {
        stripeEventId: event.id,
        type: event.type,
        payload: this.toJsonPayload(event),
      },
    });

    await this.processWebhookEvent(event);

    await this.prisma.paymentEvent.update({
      where: { stripeEventId: event.id },
      data: { processedAt: new Date() },
    });

    return { received: true };
  }

  private constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET'),
      );
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature.');
    }
  }

  private async processWebhookEvent(event: Stripe.Event): Promise<void> {
    if (event.type === 'checkout.session.completed') {
      await this.handleCheckoutSessionCompleted(event.data.object);
      return;
    }

    if (event.type === 'checkout.session.expired') {
      await this.handleCheckoutSessionExpired(event.data.object);
      return;
    }

    if (event.type === 'payment_intent.payment_failed') {
      await this.handlePaymentIntentFailed(event.data.object);
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    if (session.payment_status !== 'paid') {
      return;
    }

    const bookingId = session.metadata?.bookingId;
    const paymentId = session.metadata?.paymentId;

    if (!bookingId || !paymentId) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: {
          id: paymentId,
          bookingId,
        },
      });

      if (!payment || payment.status === PaymentStatus.SUCCEEDED) {
        return;
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCEEDED,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: this.getStripeId(session.payment_intent),
        },
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.PAID },
      });
    });
  }

  private async handleCheckoutSessionExpired(session: Stripe.Checkout.Session): Promise<void> {
    const paymentId = session.metadata?.paymentId;

    if (!paymentId) {
      return;
    }

    await this.prisma.payment.updateMany({
      where: {
        id: paymentId,
        status: PaymentStatus.PENDING,
      },
      data: { status: PaymentStatus.FAILED },
    });
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.prisma.payment.updateMany({
      where: {
        stripePaymentIntentId: paymentIntent.id,
        status: PaymentStatus.PENDING,
      },
      data: { status: PaymentStatus.FAILED },
    });
  }

  private toMinorCurrencyUnit(amount: Prisma.Decimal | number): number {
    return Math.round(Number(amount) * 100);
  }

  private getStripeId(value: string | Stripe.PaymentIntent | null): string | null {
    if (!value) {
      return null;
    }

    return typeof value === 'string' ? value : value.id;
  }

  private toJsonPayload(event: Stripe.Event): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(event)) as Prisma.InputJsonValue;
  }

  private toPaymentResponse(payment: PaymentResponseRecord): PaymentResponseDto {
    return {
      ...payment,
      amount: Number(payment.amount),
    };
  }
}
