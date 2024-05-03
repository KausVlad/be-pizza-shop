import { IsInt } from 'class-validator';

export class IngredientsIdDto {
  @IsInt()
  id: number;
}
