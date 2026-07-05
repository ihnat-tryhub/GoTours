import { ApiProperty } from '@nestjs/swagger';

export class CheckoutSessionResponseDto {
  @ApiProperty({ example: 'cs_test_a1b2c3' })
  checkoutSessionId: string;

  @ApiProperty({ example: 'https://checkout.stripe.com/c/pay/cs_test_a1b2c3' })
  checkoutUrl: string;

  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  paymentId: string;

  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  bookingId: string;
}
