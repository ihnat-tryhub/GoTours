import { ApiProperty } from '@nestjs/swagger';

export class DeleteReviewResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
}
