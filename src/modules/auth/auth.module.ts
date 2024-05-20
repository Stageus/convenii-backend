import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
// import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';

import jwtConfig from './config/jwt.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      // Dynamic Module
      imports: [ConfigModule.forFeature(jwtConfig)],
      useFactory: (configService: ConfigService) => configService.get('jwt'),
      inject: [ConfigService],
    }),
    PrismaModule,
  ],
  providers: [AuthService, TokenService],
  controllers: [AuthController],
  exports: [TokenService],
})
export class AuthModule {}
