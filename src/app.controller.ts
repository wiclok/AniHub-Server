import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MailerService } from './mailer/mailer.service';

@Controller()
export class AppController {
  constructor(private mailer: MailerService) {}
}
