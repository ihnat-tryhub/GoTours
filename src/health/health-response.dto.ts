import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status: 'ok';

  @ApiProperty({ example: 'up' })
  database: 'up';

  @ApiProperty({ example: '2026-07-03T15:30:00.000Z' })
  timestamp: string;
}
