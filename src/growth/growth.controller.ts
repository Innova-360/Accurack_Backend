import { Controller, Get } from '@nestjs/common';
import { GrowthService } from './growth.service';

@Controller('growth')
export class GrowthController {
  constructor(private readonly growthService: GrowthService) {}

  @Get('customer')
  async customerGrowth() {
    return await this.growthService.customerGrowth();
  }

  @Get('product')
  async productGrowth() {
    return await this.growthService.productGrowth();
  }

  @Get('visitors')
  async visitorsGrowth() {
    return await this.growthService.visitorsGrowth();
  }

}
