import { HttpException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from '../dto/signUp.dto';
import * as argon2 from 'argon2';
import { SignInDto } from '../dto/signIn.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { User } from '@prisma/client';
import { IActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

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

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        passwordHash: hashedPassword,
      },
    });

    return this.generateTokens(user);
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

    const { accessToken, refreshToken } = await this.generateTokens(user);

    return { accessToken, refreshToken };
  }

  private async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<IActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessExpiresIn,
        { email: user.email, role: user.role },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshExpiresIn),
    ]);

    return { accessToken, refreshToken };
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        secret: this.jwtConfiguration.secret,
        expiresIn: expiresIn,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      },
    );
  }
}
