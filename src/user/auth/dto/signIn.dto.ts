import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class SignInDto {
  @IsEmail()
  @ValidateIf((signInDto: SignInDto) => !Boolean(signInDto.phone))
  email: string;

  @IsPhoneNumber('UA')
  @ValidateIf((signInDto: SignInDto) => !Boolean(signInDto.email))
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;
}
