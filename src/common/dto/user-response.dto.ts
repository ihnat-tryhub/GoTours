import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: '3f7f8a7e-49df-48af-a69c-9b8f9a9e4f25' })
  id: string;

  @ApiProperty({ example: 'mila@example.com' })
  email: string;

  @ApiProperty({ example: 'Mila' })
  firstName: string;

  @ApiProperty({ example: 'Schneider' })
  lastName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-07-03T17:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-03T17:30:00.000Z' })
  updatedAt: Date;
}
