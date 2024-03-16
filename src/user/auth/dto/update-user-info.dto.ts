import { EnumSex } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserInfoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsDate()
  @IsNotEmpty()
  birthDate: Date;

  @IsOptional()
  @IsEnum(EnumSex)
  sex: EnumSex;
}
