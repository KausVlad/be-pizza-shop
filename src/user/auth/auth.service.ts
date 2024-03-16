import { RefreshTokenDto } from 'src/user/auth/dto/refresh-token.dto';
import {
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import * as argon2 from 'argon2';
import { SignInDto } from './dto/sign-In.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { User } from '@prisma/client';
import { IActiveUserData } from '../interfaces/active-user-data.interface';
import { randomUUID } from 'crypto';
import { IRefreshTokenId } from '../interfaces/refresh-token-id.interface';
import {
  RefreshTokenIdsStorage,
  invalidatedRefreshTokenError,
} from './refresh-token-ids.storage';
import { NewRoleForUserDto } from './dto/new-role-for-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async getUserInfo({ sub }: IActiveUserData) {
    return this.prisma.user.findUnique({
      where: {
        id: sub,
      },
      select: {
        id: true,
        email: true,
        userName: true,
        phone: true,
        address: true,
        birthDate: true,
        sex: true,
        role: true,
        createdAt: true,
        userPhoto: true,
      },
    });
  }

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

      const { accessToken, refreshToken } = await this.generateTokens(user);

      return { accessToken, refreshToken };
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

  async changeRole(newRoleForUser: NewRoleForUserDto) {
    const uniqueUserCheck = await this.prisma.user.count({
      where: {
        email: newRoleForUser.email,
      },
    });
    if (!uniqueUserCheck) {
      throw new HttpException('User not found', 404);
    }
    const updatedUser = await this.prisma.user.update({
      where: {
        email: newRoleForUser.email,
      },
      data: {
        role: newRoleForUser.role,
      },
    });
    if (updatedUser) {
      return {
        message: `User ${updatedUser.email} role changed to ${updatedUser.role}`,
      };
    }
  }

  async changePassword(
    changePassword: ChangePasswordDto,
    user: IActiveUserData,
  ) {
    const uniqueUserCheck = await this.prisma.user.findFirst({
      where: {
        id: user.sub,
      },
    });

    if (!uniqueUserCheck) {
      throw new HttpException('User not found', 404);
    }

    const isPasswordValid = await argon2.verify(
      uniqueUserCheck.passwordHash,
      changePassword.oldPassword,
    );

    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', 401);
    }

    const hashedPassword = await argon2.hash(changePassword.newPassword);

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.sub,
      },
      data: {
        passwordHash: hashedPassword,
      },
    });

    if (updatedUser) {
      return {
        message: 'Password changed successfully',
      };
    }
  }

  async updateUserInfo(
    { ...updateUserInfo }: UpdateUserInfoDto,
    { sub }: IActiveUserData,
  ) {
    if (Object.values(updateUserInfo).every((value) => !value)) {
      return {
        message: 'No user info to update',
      };
    }

    const uniqueUserCheck = await this.prisma.user.count({
      where: {
        id: sub,
      },
    });

    if (!uniqueUserCheck) {
      throw new HttpException('User not found', 404);
    }

    const updatedUserInfo = await this.prisma.user.update({
      where: {
        id: sub,
      },
      data: {
        ...updateUserInfo,
      },
    });

    if (updatedUserInfo) {
      return {
        message: 'User info updated successfully',
      };
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
        { email: user.email, role: user.role, userName: user.userName },
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
