import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from '../dto/signUp.dto';
import { hash } from 'argon2';

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

    const hashedPassword = await hash(password);

    const user = this.prisma.user.create({
      data: {
        ...userData,
        passwordHash: hashedPassword,
      },
    });

    return user;
  }
}
