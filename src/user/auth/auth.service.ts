import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from '../dto/signUp.dto';
import * as argon2 from 'argon2';
import { SignInDto } from '../dto/signIn.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signUp({ password, ...userData }: SignUpDto) {
    const uniqueUserCheck = await this.prisma.user.count({
      where: {
        OR: [{ email: userData.email }, { phone: userData.phone }],
      },
    });

    if (uniqueUserCheck) {
      throw new HttpException('User already exists', 409);
    }

    const hashedPassword = await argon2.hash(password);

    const user = this.prisma.user.create({
      data: {
        ...userData,
        passwordHash: hashedPassword,
      },
    });

    return user;
  }
  async signIn(signInDto: SignInDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: signInDto.email }, { phone: signInDto.phone }],
      },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      signInDto.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', 401);
    }

    return user;
  }
}
