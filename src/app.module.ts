import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MailerModule } from './mailer/mailer.module';
import { AnimeModule } from './anime/anime.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, MailerModule, AnimeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
