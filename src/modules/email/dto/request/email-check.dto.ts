import { IsEmail, IsString } from 'class-validator';

export class EmailCheckDto {
  @IsEmail()
  email: string;

  @IsString()
  verificationCode: string;
}
