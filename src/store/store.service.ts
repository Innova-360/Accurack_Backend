import { Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreRepository } from './store.repository';

@Injectable()
export class StoreService {

  constructor(private storeRepository: StoreRepository) { }

  async create(createStoreDto: CreateStoreDto) {
    return await this.storeRepository.create(createStoreDto);
  }

  async findAll() {
    return await this.storeRepository.findAll();
  }

  async findOne(id: string) {
    return await this.storeRepository.findOne(id);
  }

  async update(id: string, updateStoreDto: UpdateStoreDto) {
    return await this.storeRepository.update(id, updateStoreDto);
  }

  async remove(id: string) {
    return await this.storeRepository.remove(id);
  }
}
