import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { cookieExtractor } from './cookie-extractor';

interface IUser {
  id: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }
  async validate(payload: IUser) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User is unauthorized');
    }
    return payload;
  }
}
