import { Controller, Get, HttpException, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Response } from '../common/interfaces/response.interface';
import { CognitoGuard } from 'src/guards/cognito.guard';

@UseGuards(CognitoGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('channels')
  async getAllChannels(): Promise<Response<any>> {
    try {
      const result = await this.dashboardService.getAllChannels();
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Get('topSelling')
  async getTopSellingProducts(): Promise<Response<any>> {
    try {
      const result = await this.dashboardService.getTopSellingProducts();
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Get('totalSales')
  async getTotalSales(): Promise<Response<any>> {
    try {
      const result = await this.dashboardService.getTotalSales();
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }
}
