import { ApiProperty } from '@nestjs/swagger';
import { PaymentProvider, PaymentStatus } from '@prisma/client';

export class PaymentResponseDto {
  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  id: string;

  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  bookingId: string;

  @ApiProperty({ enum: PaymentProvider, example: PaymentProvider.STRIPE })
  provider: PaymentProvider;

  @ApiProperty({ example: 'cs_test_a1b2c3', nullable: true })
  stripeCheckoutSessionId: string | null;

  @ApiProperty({ example: 'pi_test_a1b2c3', nullable: true })
  stripePaymentIntentId: string | null;

  @ApiProperty({ example: 349 })
  amount: number;

  @ApiProperty({ example: 'eur' })
  currency: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ApiProperty({ example: '2026-07-03T17:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-03T17:30:00.000Z' })
  updatedAt: Date;
}
