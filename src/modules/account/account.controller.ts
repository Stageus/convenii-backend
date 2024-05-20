import {
  Controller,
  Get,
  HttpCode,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { ApiBearerAuth } from '@nestjs/swagger';

import { RankGuard } from 'src/common/guard/auth.guard';
import { Rank } from 'src/common/decorator/rank.decorator';
import { UserWithStatus } from './dto/response/user-data.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('/')
  @ApiBearerAuth()
  @Rank(1)
  @UseGuards(RankGuard)
  @HttpCode(200)
  async findUserData(@Req() req: any): Promise<UserWithStatus> {
    return {
      data: req.user,
      authStatus: 'true',
    };
  }
}
