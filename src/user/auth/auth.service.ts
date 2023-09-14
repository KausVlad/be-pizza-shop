import { RefreshTokenDto } from 'src/user/auth/dto/refresh-token.dto';
import {
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/signUp.dto';
import * as argon2 from 'argon2';
import { SignInDto } from './dto/signIn.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { User } from '@prisma/client';
import { IActiveUserData } from '../interfaces/active-user-data.interface';
import { randomUUID } from 'crypto';
import { IRefreshTokenId } from '../interfaces/refresh-token-id.interface';
import {
  RefreshTokenIdsStorage,
  invalidatedRefreshTokenError,
} from './refresh-token-ids.storage';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
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

    return this.generateTokens(user);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const user = await this.rotateRefreshToken(refreshTokenDto);

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof invalidatedRefreshTokenError) {
        throw new UnauthorizedException('Access denied');
      }
      throw new UnauthorizedException(error);
    }
  }

  async signOut(refreshTokenDto: RefreshTokenDto) {
    try {
      await this.rotateRefreshToken(refreshTokenDto);
    } catch (error) {
      return error;
    }
  }

  private async rotateRefreshToken(refreshTokenDto: RefreshTokenDto) {
    const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
      Pick<IActiveUserData, 'sub'> & IRefreshTokenId
    >(refreshTokenDto.refreshToken, {
      secret: this.jwtConfiguration.secret,
      audience: this.jwtConfiguration.audience,
      issuer: this.jwtConfiguration.issuer,
    });

    const user = await this.prisma.user.findFirstOrThrow({
      where: {
        id: sub,
      },
    });

    const isValid = await this.refreshTokenIdsStorage.validate(
      user.id,
      refreshTokenId,
    );

    if (isValid) {
      await this.refreshTokenIdsStorage.invalidate(user.id);
    } else {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }

  private async generateTokens(user: User) {
    const refreshTokenId = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<IActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessExpiresIn,
        { email: user.email, role: user.role },
      ),
      this.signToken<IRefreshTokenId>(
        user.id,
        this.jwtConfiguration.refreshExpiresIn,
        {
          refreshTokenId,
        },
      ),
    ]);

    await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);
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
