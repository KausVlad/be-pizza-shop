import { EnumRole } from '@prisma/client';
import { IsEmail, IsEnum } from 'class-validator';

export class NewRoleForUserDto {
  @IsEmail()
  email: string;

  @IsEnum(EnumRole)
  role: EnumRole;
}
