import { Controller, Delete, Get, HttpException, Param, Request, UseGuards } from '@nestjs/common';
import { RollbackService } from './rollback.service';
import { CognitoGuard } from 'src/guards/cognito.guard';

@Controller('rollback')
@UseGuards(CognitoGuard)
export class RollbackController {
  constructor(private readonly rollbackService: RollbackService) { }

  @Get('inventoryFiles')
  async getInventoryFiles(@Request() req) {
    try {
      const response = await this.rollbackService.getInventoryFiles(req.user.userSub);
      return { status: 200, data: response };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Get('saleFiles')
  async getSaleFiles(@Request() req) {
    try {
      console.log("salesfiles")
      const response = await this.rollbackService.getSaleFiles(req.user.userSub);
      return { status: 200, data: response };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Delete('inventory/:fileId')
  async rollbackInventory(@Param('fileId') fileId: string, @Request() req) {
    console.log("inventory/:fileId", fileId)
    try {
      const response = await this.rollbackService.rollbackInventory(fileId, req.user.userSub);
      return { status: 200, data: `Successfully rolled back inventory for file: ${response}` };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Delete('sales/:fileId')
  async rollbackSale(@Param('fileId') fileId: string, @Request() req) {
    try {
      const response = await this.rollbackService.rollbackSale(fileId, req.user.userSub);
      return { status: 200, data: `Successfully rolled back sales for file: ${response}` };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }
}
