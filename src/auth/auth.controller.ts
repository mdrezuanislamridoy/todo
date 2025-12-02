import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt.auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() data: LoginDto, @Res({ passthrough: true }) res) {
    return this.authService.login(data, res);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile() {
    console.log('User');
  }
}
