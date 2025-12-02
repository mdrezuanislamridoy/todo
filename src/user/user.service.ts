import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/createUser.dot';
import bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createUser(userData: CreateUserDto) {
    const isUser = await this.prisma.user.findFirst({
      where: {
        email: userData.email,
      },
    });
    if (isUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPass = await bcrypt.hash(userData.password, 10);

    await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPass,
      },
    });

    return {
      message: 'User created successfully',
    };
  }

  async login(userData: LoginDto, res) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: userData.email,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    const isMatched = await bcrypt.compare(userData.password, user.password);
    if (!isMatched) {
      throw new Error("Password didn't matched");
    }

    const { password, ...result } = user;

    const token = this.generateToken(user);

    res.cookie('token', token.accessToken, {
      httpOnly: true,
    });
    res.cookie('refresh-token', token.refreshToken, {
      httpOnly: true,
    });
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
