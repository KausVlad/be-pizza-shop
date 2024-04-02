import { IsString } from 'class-validator';

export class DrinkNameDto {
  @IsString()
  drinkName: string;
}
