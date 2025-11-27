import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailerService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendEmailVerification(to: string, link: string) {
    try {
      await this.transporter.sendMail({
        from: '"Anihub" <no-reply@anihub.dev',
        to,
        subject: 'Confirma tu correo - AniHub',
        html: `
          <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;padding:20px;background:#f8f8f8;border-radius:8px">
            <h2 style="color:#6c5ce7">Confirma tu correo</h2>
            <p>Gracias por registrarte en <b>AniHub</b>. Haz clic en el botón para verificar tu email:</p>
            <a href="${link}" style="display:inline-block;padding:10px 18px;background:#6c5ce7;color:#fff;border-radius:6px;text-decoration:none">Verificar mi correo</a>
            <p style="margin-top:16px;color:#555">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="font-size:13px;color:#888">${link}</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('❌ Error al enviar el correo:', error);
      throw new InternalServerErrorException('No se pudo enviar el correo')
    }
  }
}
