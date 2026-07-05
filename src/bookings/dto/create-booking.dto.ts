import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  @IsUUID()
  tourId: string;

  @ApiProperty({ example: '2026-08-14T09:00:00.000Z' })
  @IsISO8601()
  startDate: string;
}
