import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { AccountModule } from './modules/account/account.module';
import { AuthService } from './modules/auth/auth.service';
import { AuthModule } from './modules/auth/auth.module';
import { ProductController } from './modules/product/product.controller';
import { ProductService } from './modules/product/product.service';
import { BookmarkService } from './modules/bookmark/bookmark.service';
import { ReviewService } from './modules/review/review.service';
import { RedisService } from './modules/redis/redis.service';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(jwtConfig),
    AccountModule,
    AuthModule,
    PrismaModule,
  ],
  providers: [
    AuthService,
    ProductService,
    BookmarkService,
    ReviewService,
    RedisService,
  ],
  controllers: [ProductController],
})
export class AppModule {}
