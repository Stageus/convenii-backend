import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailDto } from './dto/request/email.dto';
import { NullResponseDto } from './dto/response/null-response.dto';
import { RankGuard } from 'src/common/guard/auth.guard';
import { Rank } from 'src/common/decorator/rank.decorator';
import { EmailCheckDto } from './dto/request/email-check.dto';

@Controller('account/verify-email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('/send')
  async sendEmailSignUp(@Body() emailDto: EmailDto): Promise<NullResponseDto> {
    await this.emailService.sendVerificationEmail({
      email: emailDto.email,
      mode: 'signup',
    });
    return new NullResponseDto();
  }

  @Rank(1)
  @UseGuards(RankGuard)
  @Post('/send/recovery')
  async sendEmailRecovery(@Body() emailDto: EmailDto) {
    await this.emailService.sendVerificationEmail({
      email: emailDto.email,
      mode: 'recovery',
    });
    return new NullResponseDto();
  }

  @Post('/check')
  async checkEmail(@Body() emailCheckDto: EmailCheckDto) {
    await this.emailService.checkVerificationEmail(
      emailCheckDto.email,
      emailCheckDto.verificationCode,
    );
    return new NullResponseDto();
  }
}
