import { Module } from '@nestjs/common';
import { PrismaClientModule } from 'src/prisma-client/prisma-client.module';
import { ProductController } from './product.controller';
import { ProductRepository } from './product.repository';
import { ProductService } from './product.service';

@Module({
  imports: [PrismaClientModule],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
})
export class ProductModule { }
