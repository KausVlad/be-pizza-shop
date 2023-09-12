import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class SignInDto {
  @IsEmail()
  @ValidateIf((object, value) => value !== undefined)
  email: string;

  @IsPhoneNumber('UA')
  @ValidateIf((object, value) => value !== undefined)
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;
}
