import { Controller, Get, Query } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/all')
  async findProductList(@Query() pagerbleDto: any) {
    const user: any = '1';
    // const productList: any;
  }
}
