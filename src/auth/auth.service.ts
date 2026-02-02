import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { MailerService } from '../mailer/mailer.service';

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailer: MailerService,
  ) {}

  async handleGoogleLogin(googleUser: GoogleUser) {
    const { email, name, picture } = googleUser;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          verified: true,
          avatar: picture,
          password: null,
          terms: true,
        },
      });
    }

    const token = this.jwt.sign({ sub: user.id, email: user.email });

    return { user, token };
  }

  async register(name: string, email: string, password: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { name }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email)
        throw new BadRequestException('El correo ya está registrado');

      if (existingUser.name === name)
        throw new BadRequestException('El nombre de usuario ya está en uso');
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { name, email, password: hashed },
    });

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await this.prisma.verificationToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const verificationLink = `${process.env.API_URL}/auth/verify-email?token=${token}`;
    await this.mailer.sendEmailVerification(email, verificationLink);

    return {
      message: 'Usuario creado. Revisa tu correo para verificar tu cuenta.',
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new BadRequestException('El usuario no existe');
    if (!user.verified)
      throw new BadRequestException(
        'Tu correo aún no ha sido verificado. Por favor, revisa tu bandeja de entrada.',
      );

    if (!user.password) throw new BadRequestException('Credenciales inválidas');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new BadRequestException('Credenciales inválidas');

    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return { user, token };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new BadRequestException('El usuario no existe');
    if (user.verified)
      throw new BadRequestException('Esta cuenta ya está verificada.');

    await this.prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    });

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await this.prisma.verificationToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const verificationLink = `${process.env.API_URL}/auth/verify-email?token=${token}`;
    await this.mailer.sendEmailVerification(email, verificationLink);

    return {
      message:
        '📧 Se ha reenviado el correo de verificación. Revisa tu bandeja de entrada.',
    };
  }

  async verifyEmail(token: string) {
    const verification = await this.prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification)
      throw new BadRequestException('Token inválido o expirado');

    if (verification.expiresAt < new Date()) {
      await this.prisma.verificationToken.delete({ where: { token } });
      throw new BadRequestException(
        'El token ha expirado. Solicita uno nuevo.',
      );
    }

    await this.prisma.user.update({
      where: { id: verification.userId },
      data: { verified: true },
    });

    await this.prisma.verificationToken.delete({ where: { token } });

    const jwt = this.jwt.sign({
      sub: verification.user.id,
      email: verification.user.email,
    });

    return {
      user: verification.user,
      jwt,
      message: 'Correo verificado correctamente. Bienvenido 🎉',
    };
  }
}
