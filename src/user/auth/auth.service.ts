import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from '../dto/signUp.dto';
import { hash } from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signUp(signUpDto: SignUpDto) {
    const hashedPassword = await hash(signUpDto.password);

    const user = this.prisma.user.create({
      data: {
        ...signUpDto,
        passwordHash: hashedPassword,
      },
    });

    return user;
  }

  private async uniqueUserCheck(email: string) {
    const uniqueUserCheck = await this.prisma.user.count({
      where: {
        email,
      },
    });

    if (uniqueUserCheck) {
      throw new HttpException('User already exists', 409);
    }
  }
}
