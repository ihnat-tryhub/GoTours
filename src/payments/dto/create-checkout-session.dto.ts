import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  @IsUUID()
  bookingId: string;
}
