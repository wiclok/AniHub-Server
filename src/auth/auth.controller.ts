import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { authCookieOptions } from './cookie.config';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // ─────────── GOOGLE ───────────

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    if (!req.user) {
      throw new BadRequestException('Usuario de Google no encontrado');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { token } = await this.auth.handleGoogleLogin(req.user as any);

    res.cookie('jwt', token, authCookieOptions());

    return res.redirect(`${process.env.APP_URL}/home`);
  }

  // ─────────── AUTH NORMAL ───────────

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    return this.auth.register(dto.name, dto.email, dto.password);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { token, user } = await this.auth.login(dto.email, dto.password);

    res.cookie('jwt', token, authCookieOptions());

    return {
      message: 'Login exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  // ─────────── EMAIL ───────────

  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Res() res: express.Response,
  ) {
    if (!token) throw new BadRequestException('Token no proporcionado');

    const { jwt } = await this.auth.verifyEmail(token);

    res.cookie('jwt', jwt, authCookieOptions());

    return res.redirect(`${process.env.APP_URL}/home`);
  }

  // ─────────── LOGOUT ───────────

  @Post('logout')
  logout(@Res({ passthrough: true }) res: express.Response) {
    res.clearCookie('jwt', authCookieOptions());
    return { message: 'Logout exitoso' };
  }
}
