import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { publicDecrypt } from 'crypto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RedisCacheService } from 'src/common/redis/redis.service';

interface SendEmailDto {
  email: string;
  mode: 'signup' | 'recovery';
}

@Injectable()
export class EmailService {
  constructor(
    private readonly redisCacheService: RedisCacheService,
    private readonly mailerService: MailerService,
    private readonly prismaService: PrismaService,
  ) {}

  async sendVerificationEmail(sendEmailDto: SendEmailDto): Promise<void> {
    const { email, mode } = sendEmailDto;

    if (mode === 'signup') {
      const existEmail = await this.prismaService.account.findFirst({
        where: { email: email, deletedAt: null },
      });
      if (existEmail) {
        throw new UnauthorizedException('already have email');
      }
    }

    const verificationCode = Math.floor(Math.random() * 10 ** 6)
      .toString()
      .padStart(6, '0');

    await this.mailerService.sendMail({
      to: email,
      subject: '이메일 인증',
      html: `인증번호 : ${verificationCode}`,
    });

    await this.redisCacheService.set(
      `emailVerification:${email}`,
      verificationCode,
      'EX',
    );
  }

  async checkVerificationEmail(email: string, code: string): Promise<void> {
    const storedVerificationCode = await this.redisCacheService.get(
      `emailVerification:${email}`,
    );
    if (code !== storedVerificationCode) {
      throw new UnauthorizedException('not match verificationCode');
    }
    await this.redisCacheService.set(
      `verifiedEmails:${email}`,
      'verified',
      'EX',
    );
  }
}
