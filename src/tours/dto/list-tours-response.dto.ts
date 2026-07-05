import { ApiProperty } from '@nestjs/swagger';

import { TourResponseDto } from './tour-response.dto';

class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 12 })
  limit: number;

  @ApiProperty({ example: 24 })
  total: number;

  @ApiProperty({ example: 2 })
  totalPages: number;
}

export class ListToursResponseDto {
  @ApiProperty({ type: [TourResponseDto] })
  data: TourResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
