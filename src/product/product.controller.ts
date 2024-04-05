import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from 'src/user/auth/decorators/auth.decorator';
import { EnumAuthType } from 'src/user/auth/enums/auth-type.enum';
import { ProductService } from './product.service';
import { ProductIdDto } from './dto/product-id.dto';
import { Roles } from 'src/user/authorization/decorators/roles.decorator';
import { EnumRole } from '@prisma/client';
import { NewProductDto } from './dto/new-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Auth(EnumAuthType.None)
  @Get('all')
  getProducts() {
    return this.productService.getProducts();
  }

  @Auth(EnumAuthType.None)
  @Get(':/id')
  getProduct(@Param() param: ProductIdDto) {
    return this.productService.getProduct(param);
  }

  @Auth(EnumAuthType.Bearer)
  @Roles(EnumRole.ADMIN, EnumRole.MANAGER)
  @Post('add')
  addProduct(@Body() body: NewProductDto) {
    return this.productService.addProduct(body);
  }

  @Auth(EnumAuthType.Bearer)
  @Roles(EnumRole.ADMIN, EnumRole.MANAGER)
  @Patch('/:id')
  updateProduct(@Param() param: ProductIdDto, @Body() body: UpdateProductDto) {
    console.log(param);
    return this.productService.updateProduct(param, body);
  }

  @Auth(EnumAuthType.Bearer)
  @Roles(EnumRole.ADMIN, EnumRole.MANAGER)
  @Delete('/:id')
  deleteProduct(@Param() param: ProductIdDto) {
    return this.productService.deleteProduct(param);
  }
}
