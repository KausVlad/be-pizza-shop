import { IsInt, Max } from 'class-validator';

export class ProductIdDto {
  @IsInt()
  @Max(2147483647)
  id: number;
}
