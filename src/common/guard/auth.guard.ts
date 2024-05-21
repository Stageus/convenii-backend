// src/auth/guards/rank.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenExpiredError } from 'jsonwebtoken';
import { TokenService } from 'src/modules/auth/token.service';

@Injectable()
export class RankGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRankIdx = this.reflector.get<number>(
      'rankIdx',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const bearerToken = request.headers.authorization;

    if (!bearerToken && requiredRankIdx !== 0) {
      throw new UnauthorizedException('No token');
    }

    const payload = bearerToken
      ? this.tokenService.verifyToken(bearerToken)
      : this.tokenService.noLoginToken();

    if (payload.rankIdx === -1 && requiredRankIdx > 0) {
      throw new UnauthorizedException('token expired');
    } else if (payload.rankIdx < requiredRankIdx) {
      throw new UnauthorizedException('No permission');
    }
    request.user = payload;
    return true;
  }
}
