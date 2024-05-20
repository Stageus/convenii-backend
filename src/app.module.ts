import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { BookmarkModule } from './modules/bookmark/bookmark.module';

import { EventModule } from './common/event/event.module';

@Module({
  imports: [AuthModule, ProductModule, BookmarkModule, EventModule],
  providers: [],
  controllers: [],
})
export class AppModule {}
