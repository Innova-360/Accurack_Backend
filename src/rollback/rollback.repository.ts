import { Injectable } from '@nestjs/common';
import { PrismaClientService } from 'src/prisma-client/prisma-client.service';

@Injectable()
export class RollbackRepository {

  constructor(private prismaClient: PrismaClientService) { }

  async getInventoryFiles(userSub: string) {
    // Find the file upload record
    return await this.prismaClient.fileUploadInventory.findMany({
      where: { Store: { adminId: userSub } },
    });
  }

  async getSaleFiles(userSub: string) {
    // Find the file upload record
    return await this.prismaClient.fileUploadSales.findMany({
      where: { Store: { adminId: userSub } },
    });
  }

  async rollbackInventory(fileId: string, userSub: string) {

    console.log(fileId, userSub);
    // Find the file upload record
    const fileUpload = await this.prismaClient.fileUploadInventory.findUnique({
      where: { id: fileId },
      include: { inventory: true }, // Get related inventory items
    });

    if (!fileUpload) {
      throw new Error("File not found in upload history");
    }

    // Find the store related to the file upload
    const store = await this.prismaClient.store.findFirst({
      where: { adminId: userSub },
    });

    if (!store) {
      throw new Error("You are not authorized to rollback this file");
    }

    // Delete the inventory associated with the file
    await this.prismaClient.inventory.deleteMany({
      where: {
        id: { in: fileUpload.inventory.map(item => item.id) },
      },
    });

    // Optionally, delete the file record itself if no longer needed
    await this.prismaClient.fileUploadInventory.delete({
      where: { id: fileId },
    });

    return fileUpload.fileName;

  }

  async rollbackSales(fileId: string, userSub: string) {
    // Find the file upload record
    try {

      const fileUpload = await this.prismaClient.fileUploadSales.findUnique({
        where: { id: fileId },
        include: { Sale: true }, // Get related inventory items
      });

      if (!fileUpload) {
        throw new Error("File not found in upload history");
      }

      // Find the store related to the file upload
      const store = await this.prismaClient.store.findFirst({
        where: { adminId: userSub },
      });

      if (!store) {
        throw new Error("You are not authorized to rollback this file");
      }

      // Delete the inventory associated with the file
      await this.prismaClient.sale.deleteMany({
        where: {
          id: { in: fileUpload.Sale.map(item => item.id) },
        },
      });

      // Optionally, delete the file record itself if no longer needed
      await this.prismaClient.fileUploadSales.delete({
        where: { id: fileId },
      });

      return fileUpload.fileName
    } catch (error) {
      console.log(error);
      throw new Error("Error finding file upload record: " + error.message);
    }
  }
}
