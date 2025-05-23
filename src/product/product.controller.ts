import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Controller,
  UploadedFile,
  HttpException,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import * as multer from 'multer';
import { Inventory, Prisma } from '@prisma/client';
import { ProductService } from './product.service';
import { CognitoGuard } from 'src/guards/cognito.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Response } from '../common/interfaces/response.interface';

@Controller('product')
@UseGuards(CognitoGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post('create')
  async create(@Request() req, @Body() createProductDto: CreateProductDto): Promise<Response<Inventory>> {
    try {
      const result = await this.productService.create(req.user.userSub, createProductDto);
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Post('addInventoryFile')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
    fileFilter: (_req, file, cb) => {
      if (!file.originalname.match(/\.xlsx$/)) {
        return cb(new BadRequestException('Only .xlsx files are allowed'), false);
      }
      cb(null, true);
    },
  }))
  async addInventoryFile(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');

    try {
      const fileHash = await this.productService.checkInventoryFileStatus(file, req.user.userSub);
      const response = await this.productService.addInventory(req.user.userSub, file, fileHash);
      return { status: 200, data: "Inventory has been added to system successfully" };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Post('removeInventoryFile')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
    fileFilter: (_req, file, cb) => {
      if (!file.originalname.match(/\.html$/)) {
        return cb(new BadRequestException('Only .html files are allowed'), false);
      }
      cb(null, true);
    },
  }))
  async removeInventoryFile(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');

    try {
      const fileHash = await this.productService.checkSalesFileStatus(file, req.user.userSub);
      const response = await this.productService.removeInventory(req.user.userSub, file, fileHash);
      return { status: 200, data: "Inventory has been removed from system successfully" };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Get('getProducts')
  async findAll(@Request() req): Promise<Response<any>> {
    try {
      // console.log("req.user.userSub", req.user.userSub);
      const result = await this.productService.findAll(req.user.userSub);
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Get('getSuggestions') 
  async getSuggestions(@Request() req): Promise<Response<{ plu: string; name: string, description: string, suggestedQty: number, currentStock: number, salesCount: number }[]>> {
    try {
      const result = await this.productService.getSuggestions(req.user.userSub);
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Get('getProductsOverview')
  async productsOverview() {
    try {
      const result = await this.productService.productsOverview();
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Get('getProducts/:id')
  async findOne(@Param('id') id: string): Promise<Response<Inventory>> {
    try {
      const result = await this.productService.findOne(id);
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<Response<Inventory>> {
    try {
      const result = await this.productService.update(id, updateProductDto);
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Response<Inventory>> {
    try {
      console.log("id", id)
      const result = await this.productService.remove(id);
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }


  @Get('getProductsTotalPrice')
  async getProductsTotalPrice(@Request() req): Promise<Response<any>> {
    try {
      // console.log("req.user.userSub", req.user.userSub);
      const result = await this.productService.getTotalPrice(req.user.userSub);
      console.log(result)
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }
}
