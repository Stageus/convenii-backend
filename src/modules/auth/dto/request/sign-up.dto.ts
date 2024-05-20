import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @ApiProperty({
    description: '회원가입 이메일',
    default: 'juneh2633@gmail.com',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: '회원가입 비밀번호',
    default: 'asdf1234',
  })
  password: string;

  @IsString()
  @ApiProperty({
    description: '회원가입 닉네임',
    default: 'asdf',
  })
  nickname: string;
}
