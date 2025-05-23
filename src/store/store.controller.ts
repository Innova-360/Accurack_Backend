import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { CognitoGuard } from 'src/guards/cognito.guard';

@UseGuards(CognitoGuard)
@Controller('store')
export class StoreController { 
  constructor(private readonly storeService: StoreService) { }

  @Post('create')
  async create(@Body() createStoreDto: CreateStoreDto) {
    return this.storeService.create(createStoreDto);
  }

  @Get("getStores")
  async findAll() {
    return await this.storeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.storeService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storeService.update(id, updateStoreDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.storeService.remove(id);
  }
}
