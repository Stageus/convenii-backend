import { Injectable } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Payload } from './model/payload.model';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  verifyToken(bearerToken: string): Payload {
    try {
      const token = bearerToken.split(' ')[1];
      const payload = this.jwtService.verify<Payload>(token);

      return payload;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        return {
          idx: 1,
          createdAt: null,
          email: null,
          nickname: null,
          rankIdx: -1,
        };
      } else {
        throw err;
      }
    }
  }

  noLoginToken(): Payload {
    return {
      idx: 1,
      createdAt: null,
      email: null,
      nickname: null,
      rankIdx: 0,
    };
  }
}
