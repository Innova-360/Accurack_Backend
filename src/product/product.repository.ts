import { chunk } from 'lodash';
import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClientService } from 'src/prisma-client/prisma-client.service';

@Injectable()
export class ProductRepository {

  constructor(private prismaClient: PrismaClientService) { }

  async create(userSub: string, createProductDto: CreateProductDto) {
    return await this.prismaClient.inventory.create({
      data: {
        ...createProductDto,
        Store: {
          connect: { adminId: userSub }
        }
      },
    });
  }

  async checkInventoryFileHash(fileHash: string) {
    return await this.prismaClient.fileUploadInventory.findUnique({
      where: { fileHash },
    });
  }

  async checkSalesFileHash(fileHash: string) {
    return await this.prismaClient.fileUploadSales.findUnique({
      where: { fileHash },
    });
  }

  async uploadInventorySheet(userSub: string, parsedData: any, file: Express.Multer.File, fileHash: string) {
    const store = await this.prismaClient.store.findFirst({
      where: { adminId: userSub },
    });

    if (!store) {
      throw new Error("Store not found for this user.");
    }

    const batchSize = 500;
    const productChunks = chunk(parsedData, batchSize);

    try {
      // FIRST: Create the fileUpload record OUTSIDE of transaction
      const fileUpload = await this.prismaClient.fileUploadInventory.create({
        data: {
          fileHash,
          storeId: store.id,
          fileName: file.originalname,
        },
      });

      // SECOND: Bulk Insert Inventory WITH fileUploadId
      await this.prismaClient.$transaction(
        productChunks.map((productBatch) => {
          return this.prismaClient.inventory.createMany({
            data: productBatch.map((product) => ({
              name: String(product.name),
              category: product.category,
              stock: product.stock,
              price: product.price,
              sellingPrice: product.sellingPrice,
              PLU: product.PLU,
              storeId: store.id,
              SKU: product.SKU || product.PLU || "",
              fileUploadId: fileUpload.id,
              description: product.description ?? "",
            })),
          });
        })
      );

      return { status: 200, message: "Inventory has been added successfully" };
    } catch (error) {
      console.error("❌ Upload failed!", error);
      throw new Error("Error while adding inventory: " + error.message);
    }
  }

  async uploadSalesSheet(
    userSub: string,
    createProductDtos: CreateProductDto[],
    file: Express.Multer.File,
    fileHash: string
  ) {
    const store = await this.prismaClient.store.findFirst({
      where: { adminId: userSub },
    });

    if (!store) {
      throw new Error("Store not found for this user.");
    }

    // Step 1: Aggregate sales counts by PLU using Map
    const salesByPLU = new Map<string, number>();
    for (const product of createProductDtos) {
      const plu = product.PLU;
      salesByPLU.set(plu, (salesByPLU.get(plu) || 0) + 1);
    }


    // Step 1: Load all relevant inventory before transaction
    const inventoryMap = new Map<string, any>();
    for (const plu of salesByPLU.keys()) {
      const item = await this.prismaClient.inventory.findFirst({
        where: { PLU: plu, storeId: store.id },
      });
      if (item) inventoryMap.set(plu, item);
    }

    try {
      await this.prismaClient.$transaction(async (prisma) => {
        // Step 2: Update inventory
        try {
          for (const plu of salesByPLU.keys()) {
            const quantitySold = salesByPLU.get(plu)!;
            const inventoryItem = inventoryMap.get(plu);

            // console.log("PLU", plu, "quantitySold", quantitySold)

            // const inventoryItem = await prisma.inventory.findFirst({
            //   where: {
            //     PLU: plu,
            //     storeId: store.id,
            //   },
            // });

            // console.log("inventoryItem", inventoryItem, "PLU", plu, "QuantitySold", quantitySold);

            if (!inventoryItem) {
              console.warn(`No inventory found for PLU: ${plu}`);
              continue;
            }

            if (inventoryItem.stock < quantitySold) {
              console.warn(
                `Insufficient stock for PLU: ${plu}. Available: ${inventoryItem.stock}, Required: ${quantitySold}`
              );
              continue;
            }

            const newUpdatedInventory = await prisma.inventory.update({
              where: { id: inventoryItem.id },
              data: { stock: { decrement: quantitySold } }
            });


            // console.log("newUpdatedInventory", newUpdatedInventory)
            // console.log("inventory ", inventoryMap.size);
          }
        } catch (invError) {
          console.error("Inventory update failed:", invError);
          throw new Error("Inventory update failed: " + invError.message);
        }

        // Step 3: Create file record and sales
        try {
          const fileUpload = await prisma.fileUploadSales.create({
            data: {
              fileHash,
              storeId: store.id,
              fileName: file.originalname,
            },
          });

          console.log("createProductDtos", createProductDtos)

          const batchSize = 500;
          for (let i = 0; i < createProductDtos.length; i += batchSize) {
            const batch = createProductDtos.slice(i, i + batchSize);
            await prisma.sale.createMany({
              data: batch.map((product) => ({
                // name: String(product.name),
                name: product.name,
                category: product.category,
                price: product.price,
                storeId: store.id,
                PLU: product.PLU,
                SKU: product.SKU ?? "",
                stock: Math.abs(Number(product.stock)) || 1,
                description: product.description,
                fileUploadSalesId: fileUpload.id,
              })),
            });
          }
        } catch (salesError) {
          console.error("Sales record creation failed:", salesError);
          throw new Error("Sales creation failed: " + salesError.message);
        }
      }, {
        maxWait: 10000,  // Time to wait for the transaction to be acquired
        timeout: 15000,  // Max duration of the entire transaction
      });

      return { success: true, message: "Sales processed successfully" };
    } catch (error) {
      console.error("❌ Upload failed!", error);
      throw new Error("Error while processing sales: " + error.message);
    }
  }


  async findAll(userSub: string) {
    // console.log(process.env.DATABASE_URL);

    // console.log("usersub", userSub)

    const store = await this.prismaClient.store.findFirst({
      where: { adminId: userSub },
    });

    // console.log("store",store);

    if (!store) {
      throw new Error("Store not found for this admin.");
    }

    try {
      // Fetching the remaining stock per PLU, with correct cost price from Inventory and sale price from Sale
      //     const currentInventory = await this.prismaClient.$queryRaw`
      //   SELECT 
      //     inventory."id",
      //     inventory."PLU",
      //     inventory."SKU",
      //     inventory."name",
      //     inventory."category",
      //     inventory."description",
      //     -- Subtract stock sold from stock received
      //     COALESCE(CAST(SUM(inventory."stock") AS INTEGER), 0) - COALESCE(CAST(SUM(sale."stock") AS INTEGER), 0) AS "stock",
      //     inventory."price" AS "cost",          -- Cost price comes from Inventory table
      //     sale."price" AS "salePrice"           -- Sale price comes from Sale table
      //   FROM 
      //     "Inventory" inventory
      //   LEFT JOIN 
      //     "Sale" sale
      //   ON 
      //     inventory."PLU" = sale."PLU" AND inventory."storeId" = sale."storeId"
      //   WHERE 
      //     inventory."storeId" = ${store.id}
      //     GROUP BY 
      //   inventory."id", inventory."PLU", inventory."SKU", inventory."name", inventory."category", inventory."description", inventory."price", sale."price"
      // `;



      const currentInventory = await this.prismaClient.$queryRaw`
  SELECT 
    inventory."id",
    inventory."PLU",
    inventory."SKU",
    inventory."name",
    inventory."category",
    inventory."description",
    inventory."stock",
    inventory."price"  
  FROM 
    "Inventory" inventory
  WHERE 
    inventory."storeId" = ${store.id}
  `;

      // console.log("currentInventory",currentInventory)
      return currentInventory;
    } catch (error) {
      console.log(error)
    }
  }

  //   async getSuggestions(
  //     userSub: string,
  //     daysBack: number = 7,
  //     bufferMultiplier: number = 1.2,
  //     maxCap?: number // Optional cap on suggestion
  //   ) {
  //     // Create a pastDate safely by subtracting days in milliseconds
  //     const pastDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  //     pastDate.setHours(0, 0, 0, 0); // Normalize to midnight

  //     const results = await this.prismaClient.$queryRaw<
  //       { plu: string; suggestedQty: number; name: string; description: string; currentStock: number }[]
  //     >`
  //   SELECT
  //     s."PLU" AS plu,
  //     s.name,
  //     s.description,
  //     CEIL(SUM(s.stock) / (${daysBack}::float / 7) * ${bufferMultiplier}::float)::int AS "suggestedQty",
  //     i.stock AS "currentStock"
  //   FROM "Sale" s
  //   INNER JOIN "Inventory" i 
  //     ON s."PLU" = i."PLU" AND s."storeId" = i."storeId"
  //   WHERE s."soldAt" >= ${pastDate}
  //     AND s."storeId" IN (
  //       SELECT id FROM "Store" WHERE "adminId" = ${userSub}
  //     )
  //   GROUP BY s."PLU", s.name, s.description, i.stock
  //   ORDER BY "suggestedQty" DESC
  // `;



  //     return results;
  //   }

async getSuggestions(
  userSub: string,
  daysBack: number = 7,
  bufferMultiplier: number = 1.2,
  maxCap?: number
) {
  const pastDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  pastDate.setHours(0, 0, 0, 0);

   // If item stock is less than 2 × sales count, the item is included.
   // If stock is equal or greater than 2 × sales count, the item is skipped.

  const results = await this.prismaClient.$queryRaw<
    {
      plu: string;
      suggestedQty: number;
      name: string;
      description: string;
      currentStock: number;
      salesCount: number;
    }[]
  >`
    SELECT
      s."PLU" AS plu,
      s.name,
      s.description,
      COUNT(*) AS "salesCount",
      CEIL(COUNT(*) / (${daysBack}::float / 7) * ${bufferMultiplier}::float)::int AS "suggestedQty",
      i.stock AS "currentStock"
    FROM "Sale" s
    INNER JOIN "Inventory" i 
      ON s."PLU" = i."PLU" AND s."storeId" = i."storeId"
    WHERE s."soldAt" >= ${pastDate}
      AND s."storeId" IN (
        SELECT id FROM "Store" WHERE "adminId" = ${userSub}
      )
    GROUP BY s."PLU", s.name, s.description, i.stock
    HAVING i.stock < COUNT(*) * 2 
    ORDER BY "suggestedQty" DESC
  `;


  return results.map((item) => ({
    ...item,
    currentStock: Number(item.currentStock),
    salesCount: Number(item.salesCount),
    suggestedQty: Number(item.suggestedQty),
  }));
}




  async productsOverview() {

    const response = await this.prismaClient.product.aggregate({
      _count: { id: true },
      _sum: { stock: true },
    })
    const { _count: { id: totalProducts }, _sum: { stock } } = response

    return {
      totalProducts,
      stock,
    }
  }

  async findOne(id: string) {
    try {
      return await this.prismaClient.inventory.findFirst({ where: { id } });
    } catch (error) {
      console.log(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    console.log("update.id", id, "data", updateProductDto)
    try {
      return await this.prismaClient.inventory.update({
        where: { id },
        data: { ...updateProductDto }
      });
    } catch (error) {
      console.log(error);
    }
  }

  async remove(id: string) {
    try {
      console.log("repo", id)
      return await this.prismaClient.inventory.delete({ where: { id } });
    } catch (error) {
      console.log(error);
    }
  }


  async getTotalPrice(userSub: string) {
    const store = await this.prismaClient.store.findFirst({
      where: { adminId: userSub },
    });

    if (!store) {
      throw new Error("Store not found for this admin.");
    }

    try {
      const inventryItems = await this.prismaClient.inventory.findMany({
        where: { storeId: store.id },
        select: { price: true, stock: true }
      })

      // const totalPrice = inventryItems.reduce((total, item)=> total+=item.price)
      const totalPrice = inventryItems.reduce((total, item) => total + (item.price * item.stock), 0);

      return totalPrice;
    } catch (error) {
      console.log(error)
    }
  }
}
