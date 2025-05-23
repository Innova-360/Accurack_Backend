import { Injectable } from '@nestjs/common';
import { RollbackRepository } from './rollback.repository';

@Injectable()
export class RollbackService {
  constructor(private readonly rollbackRepository: RollbackRepository) {}
  
  async getInventoryFiles(userSub: string) {
    return await this.rollbackRepository.getInventoryFiles(userSub);
  }
  
  async getSaleFiles(userSub: string) {
    return await this.rollbackRepository.getSaleFiles(userSub);
  }

  async rollbackInventory(fileId: string, userSub: string) {
    return await this.rollbackRepository.rollbackInventory(fileId, userSub);
  }
  
  async rollbackSale(fileId: string, userSub: string) {
    return await this.rollbackRepository.rollbackSales(fileId, userSub);
  }
}
