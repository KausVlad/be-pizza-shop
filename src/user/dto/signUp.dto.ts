import { EnumSex } from '@prisma/client';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber('UA')
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(EnumSex)
  sex: EnumSex;

  @IsDate()
  birthDate: Date;

  @IsString()
  @MinLength(6)
  password: string;
}
