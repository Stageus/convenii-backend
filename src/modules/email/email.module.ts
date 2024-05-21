import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { RedisModule } from 'src/common/redis/redis.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mailConfig from './config/mail.config';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [
    RedisModule,
    PrismaModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule.forFeature(mailConfig)],
      useFactory: (configService: ConfigService) => ({
        transport: configService.get('transport'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
