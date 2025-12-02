import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(userData: LoginDto, res) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: userData.email,
      },
    });
    console.log(user);

    if (!user) {
      throw new Error('User not found');
    }
    const isMatched = await bcrypt.compare(
      userData.password,
      user.password as string,
    );

    console.log(isMatched);

    if (!isMatched) {
      throw new Error("Password didn't matched");
    }

    const { password, ...result } = user;

    const token = this.generateToken(user);

    console.log(token);

    return {
      message: 'User login successful',
      result,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    };
  }

  async profile(req) {
    const { id } = req.user;
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...result } = user;

    return { user: result };
  }

  async refresh(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_REFRESH || 'refresh_secret',
    });

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not available');
    }

    const accessToken = this.generateAccessToken(user);
    return { accessToken };
  }

  private generateToken(user: User) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  private generateAccessToken(user: User) {
    return this.jwtService.sign(
      { id: user.id },
      {
        secret: (process.env.JWT_SECRET as string) || 'jsjlaiajf',
        expiresIn: '1h',
      },
    );
  }

  private generateRefreshToken(user: User) {
    return this.jwtService.sign(
      { id: user.id },
      {
        secret: (process.env.JWT_REFRESH as string) || 'refresh_jldalkf',
        expiresIn: '7d',
      },
    );
  }
}
