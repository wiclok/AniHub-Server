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
import * as express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private prisma: PrismaService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    interface GoogleUser {
      id: string;
      email: string;
      name: string;
      picture: string;
      // add other properties as needed
    }
    const user = req.user as GoogleUser;

    const { token } = await this.auth.handleGoogleLogin(user);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${process.env.APP_URL}/home`);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword)
      throw new BadRequestException('Las contraseñas no coinciden');

    const response = await this.auth.register(
      dto.name,
      dto.email,
      dto.password,
    );

    return { message: response.message };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { token, user } = await this.auth.login(dto.email, dto.password);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false, // ✅ true solo en producción
      sameSite: 'lax', // 'lax' para desarrollo
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    const newUser = {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    return { message: 'Login exitoso', newUser };
  }

  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    if (!token) throw new BadRequestException('Token no proporcionado');

    const { jwt } = await this.auth.verifyEmail(token);

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('jwt', jwt, {
      httpOnly: true,
      secure: isProd, // true en producción
      sameSite: isProd ? 'none' : 'lax', // lax en desarrollo
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${process.env.APP_URL}/home`);
  }

  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    if (!email) throw new BadRequestException('El email es requerido');
    return this.auth.resendVerification(email);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: express.Response) {
    const isProd = process.env.NODE_ENV === 'production';

    res.clearCookie('jwt', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    });

    return { message: 'Logout exitoso' };
  }
}
