import { IsString } from 'class-validator';

export class PizzaNameDto {
  @IsString()
  pizzaName: string;
}
