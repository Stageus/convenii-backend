import { Type } from 'class-transformer';

import { IsInt } from 'class-validator';

export class GetProductsPagebleDto {
  account: any;
  @IsInt()
  @Type(() => Number)
  limit: number;
  offset: number;
  keyword: number;
  categoryFilter: number[];
  eventFilter: number[];
}
