import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { SignInDto } from './dto/request/auth.dto';
import { compareSync, hashSync } from 'bcrypt';
import { SignUpDto } from './dto/request/sign-up.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<string> {
    const account = await this.prisma.account.findFirst({
      where: { email: signInDto.email, deletedAt: null },
    });

    if (!account) {
      throw new UnauthorizedException('login fail');
    }

    const passwordMatch = compareSync(signInDto.pw, account.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('login fail');
    }

    return await this.jwtService.signAsync({
      idx: account.idx,
      createdAt: account.createdAt,
      email: account.email,
      nickname: account.nickname,
      rankIdx: account.rankIdx,
    });
  }

  async signUp(signUpDto: SignUpDto): Promise<string> {
    const accountCheck = await this.prisma.account.findFirst({
      where: { email: signUpDto.email, deletedAt: null },
    });
    // const verifiedEmail = await accountCheck;
    // const hashedPw = hashSync(signUpDto.password, 1);
    return 'asdf';
  }
}
