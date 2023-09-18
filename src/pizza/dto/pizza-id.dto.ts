import { IsInt, Max } from 'class-validator';

export class PizzaIdDto {
  @IsInt()
  @Max(2147483647)
  id: number;
}
