import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class NewProductDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  productSize: string[];

  @IsArray()
  @IsNumber({ allowNaN: false }, { each: true })
  @IsNotEmpty({ each: true })
  productPrice: number[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productDescription: string;

  // @IsEnum(EnumProductGroup)
  // productGroup: EnumProductGroup;

  @IsString()
  @IsNotEmpty()
  productSubGroup: string;
}
