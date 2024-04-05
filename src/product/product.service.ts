import { EnumProductGroup } from '@prisma/client';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductIdDto } from './dto/product-id.dto';
import { NewProductDto } from './dto/new-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getProducts() {
    return this.prisma.product.findMany();
  }

  async getProduct({ id }: ProductIdDto) {
    const product = await this.findProductById(id);

    return product;
  }

  async addProduct(data: NewProductDto, file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException('File not found');
    }

    await this.existingProductName(data.productName);

    const productSubGroup = await this.existingProductSubGroup(
      data.productSubGroup,
    );

    const { public_id: productPhoto } =
      await this.cloudinaryService.uploadImage(file.buffer, {
        folder: 'productPhoto',
      });

    const product = await this.prisma.product.create({
      data: {
        productName: data.productName,
        productSize: data.productSize,
        productPrice: data.productPrice,
        productDescription: data.productDescription,
        productGroup: productSubGroup.group,
        productSubGroup: productSubGroup.subGroup,
        productPhoto,
      },
    });

    return product;
  }

  async updateProduct({ id }: ProductIdDto, updateData: UpdateProductDto) {
    await this.findProductById(id);

    if (updateData.productName) {
      await this.existingProductName(updateData.productName);
    }

    let productGroup: EnumProductGroup;

    if (updateData.productSubGroup) {
      const dbProductGroup = await this.existingProductSubGroup(
        updateData.productSubGroup,
      );
      productGroup = dbProductGroup.group;
    }

    const data: NewProductDto & { productGroup?: EnumProductGroup } = {
      ...updateData,
    };

    if (productGroup !== undefined) {
      data.productGroup = productGroup;
    }

    const product = await this.prisma.product.update({
      where: {
        id,
      },
      data,
    });

    return product;
  }

  async updateProductPhoto({ id }: ProductIdDto, file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException('File not found');
    }

    await this.findProductById(id);

    const { public_id: productPhoto } =
      await this.cloudinaryService.uploadImage(file.buffer, {
        folder: 'productPhoto',
      });

    const product = await this.prisma.product.update({
      where: {
        id,
      },
      data: {
        productPhoto,
      },
    });

    return product;
  }

  async deleteProduct({ id }: ProductIdDto) {
    await this.findProductById(id);

    return this.prisma.product.delete({
      where: {
        id,
      },
    });
  }

  private async findProductById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  private async existingProductSubGroup(subGroup: string) {
    const productSubGroup = await this.prisma.productSubGroup.findUnique({
      where: {
        subGroup,
      },
    });

    if (!productSubGroup) {
      throw new NotFoundException(`subGroup with name ${subGroup} not found`);
    }

    return productSubGroup;
  }

  private async existingProductName(productName: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        productName,
      },
    });

    if (product) {
      throw new ConflictException(
        `Product with name ${productName} already exists`,
      );
    }
  }
}
