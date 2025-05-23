import { Injectable } from "@nestjs/common";
import { PrismaClientService } from "src/prisma-client/prisma-client.service";

@Injectable()
export class ReportRepository {
  constructor(private prismaClient: PrismaClientService) { }

  // Fetch Sales Data (Revenue)
  async getSalesByStore(userSub: string, startDate: Date, endDate: Date) {
    
    // Step 1: Find store IDs belonging to the admin
    const stores = await this.prismaClient.store.findMany({
      where: { adminId: userSub },
      select: { id: true },
    });

    const storeIds = stores.map((store) => store.id);

    // Step 2: Group sales by PLU for those store IDs
    return await this.prismaClient.sale.groupBy({
      by: ['PLU'],
      where: {
        storeId: { in: storeIds },
        soldAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      _sum: {
        price: true,
        stock: true,
      },
    });
  }

  // Fetch Inventory Data (COGS Calculation)
  async getInventoryByStore(userSub: string) {
    return await this.prismaClient.inventory.findMany({
      where: {
        Store: { adminId: userSub },
      },
      select: {
        PLU: true,
        price: true, // This is the cost price of the inventory
        stock: true, // Available stock in the store
      },
    });
  }

  // Fetch Operating Expenses (This can be manually added or fetched from other models)
  // async getOperatingExpenses(userSub: string, startDate: string, endDate: string) {
  //   return await this.prismaClient.employee.aggregate({
  //     _sum: {
  //       salary: true, // Assuming salary is a field in the Employee model
  //     },
  //     where: {
  //       Store: { admin: userSub },
  //       createdAt: {
  //         gte: new Date(startDate),
  //         lte: new Date(endDate),
  //       },
  //     },
  //   });
  // }
}
