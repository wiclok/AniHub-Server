import { Controller } from '@nestjs/common';
import { MailerService } from './mailer/mailer.service';

@Controller()
export class AppController {
  constructor(private mailer: MailerService) {}
}
