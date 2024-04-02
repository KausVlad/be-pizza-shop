import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class NewDrinkDto {
  @IsString()
  @IsNotEmpty()
  drinkName: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  drinkSize: string[];

  @IsArray()
  @IsNumber({ allowNaN: false }, { each: true })
  @IsNotEmpty({ each: true })
  drinkPrice: number[];
}
