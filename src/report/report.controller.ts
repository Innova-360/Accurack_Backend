import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { RevenueDto } from './entities/revenue.entity';
import { ReportService } from './report.service';
import { CognitoGuard } from 'src/guards/cognito.guard';

@Controller('report')
@UseGuards(CognitoGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // Endpoint for Profit and Loss
  @Get('profitLoss')
  async getProfitLoss(
    @Request() req,
    @Query('period') period: string, // month, quarter, or year
    @Query('month') month: string,
  ): Promise<any> {
    console.log("month", month)
    return this.reportService.getProfitLossByStore(req.user.userSub, period, month);
  }

  // Endpoint for Revenue (Already created)
  @Get('revenue')
  async getRevenue(
    @Request() req,
    @Query('period') period: string, // month, quarter, or year
  ): Promise<any> {
    return this.reportService.getRevenueByStore(req.user.userSub, period);
  }
}
