import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  productSize: string[];

  @IsOptional()
  @IsArray()
  @IsNumber({ allowNaN: false }, { each: true })
  @IsNotEmpty({ each: true })
  productPrice: number[];

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  productDescription: string;

  // @IsEnum(EnumProductGroup)
  // productGroup: EnumProductGroup;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productSubGroup: string;
}
