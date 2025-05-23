import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from './product.repository';
import { parseHtml } from './helper';
import * as crypto from 'crypto';
import * as XLSX from 'xlsx';
import * as Cheerio from 'cheerio';
import { PdfReader } from 'pdfreader';

@Injectable()
export class ProductService {
  constructor(private productRepository: ProductRepository) {

  }
  async create(userSub: string, createProductDto: CreateProductDto) {
    return await this.productRepository.create(userSub, createProductDto);
  }

  async addInventory(userSub: string, file: Express.Multer.File, fileHash: string) {
    const parsedData: any = this.parseExcel(file);
    return await this.productRepository.uploadInventorySheet(userSub, parsedData, file, fileHash);
  }

  // async removeInventory(userSub: string, file: Express.Multer.File, fileHash: string) {
  //   const htmlContent = file.buffer.toString();
  //   console.log('Raw file content:', file.buffer.toString());
  //   const parsedData = parseHtml(htmlContent);
  //   console.log('parsed html content:',);
  //   return await this.productRepository.uploadSalesSheet(userSub, parsedData, file, fileHash);
  // }



  /**
   * Parses HTML table data into an array of product DTOs
   */
  // private parseHtmlTable(html: string): CreateProductDto[] {
  //   const products: CreateProductDto[] = [];

  //   // Load HTML into DOM parser (using cheerio for example)
  //   const $ = Cheerio.load(html);

  //   // Find the table rows (skip header if needed)
  //   $('table tbody tr').each((i, row) => {
  //     const columns = $(row).find('td');

  //     // Skip rows that don't have enough columns
  //     if (columns.length < 6) return;

  //     // console.log("columns ",columns)
  //     const product: CreateProductDto = {
  //       PLU: $(columns[0]).text(),
  //       description: $(columns[1]).text(),
  //       price: parseFloat($(columns[2]).text()),
  //       // Assuming these are your column mappings:
  //       name: $(columns[1]).text(), // Often same as description
  //       stock: parseInt($(columns[4]).text()), // Items column
  //       category: '', // You might need to extract this differently
  //       SKU: $(columns[0]).text() // Often same as PLU
  //     };

  //     products.push(product);
  //   });

  //   return products;
  // }


  private parseHtmlTable(html: string): CreateProductDto[] {
    const products: CreateProductDto[] = [];
    const $ = Cheerio.load(html);

    const columnMap: Record<string, number> = {};

    // Step 1: Extract headers and build a column map
    $('table thead tr th').each((i, el) => {
      const header = $(el).text().trim().toLowerCase();

      if (header.includes('plu')) columnMap.PLU = i;
      if (header.includes('sku')) columnMap.SKU = i;
      if (header.includes('name')) columnMap.name = i;
      if (header.includes('description')) columnMap.description = i;
      if (header.includes('price')) columnMap.price = i;
      if (header.includes('stock') || header.includes('items') || header.includes('qty')) columnMap.stock = i;
      if (header.includes('category')) columnMap.category = i;
    });

    // Step 2: Loop through table rows and use column map
    $('table tbody tr').each((i, row) => {
      const columns = $(row).find('td');

      const get = (key: keyof CreateProductDto) =>
        columnMap[key] !== undefined ? $(columns[columnMap[key]]).text().trim() : '';

      const product: CreateProductDto = {
        PLU: get('PLU'),
        SKU: get('SKU') || get('PLU'), // fallback
        name: get('name') || get('description'),
        description: get('description') || get('name'),
        category: get('category'),
        price: parseFloat(get('price')) || 0,
        stock: parseInt(get('stock')) || 0,
      };

      products.push(product);
    });

    return products;
  }


  // private parsePdfBuffer(buffer: Buffer): Promise<CreateProductDto[]> {
  //   return new Promise((resolve, reject) => {
  //     const rows: { [y: number]: string[] } = {};

  //     new PdfReader().parseBuffer(buffer, (err, item) => {
  //       if (err) return reject(err);

  //       if (!item) {
  //         // End of PDF - process all accumulated rows
  //         const sortedLines = Object.keys(rows)
  //           .sort((a, b) => parseFloat(a) - parseFloat(b))
  //           .map(y => rows[+y].join(" ").trim());

  //         const result: CreateProductDto[] = sortedLines.map((line, index) => {
  //           const parts = line.split(/\s{2,}|\t+|\s{1,}/); // flexible splitter for spaced-out PDF tables

  //           if (parts.length < 7) {
  //             console.warn(`Skipping line ${index + 1}: not enough fields`, parts);
  //             return null;
  //           }

  //           const [
  //             name,
  //             category,
  //             stockStr,
  //             priceStr,
  //             PLU,
  //             SKU,
  //             ...descParts
  //           ] = parts;

  //           return {
  //             name: name,
  //             category: category,
  //             stock: Number(stockStr),
  //             price: Number(priceStr),
  //             PLU: PLU,
  //             SKU: SKU,
  //             description: descParts.join(" "),
  //           };
  //         }).filter(item => item !== null); // Remove skipped lines

  //         resolve(result);
  //         return;
  //       }

  //       // if (item.text) {
  //       //   const y = Math.floor(item.y * 10); // normalize y to group rows
  //       //   (rows[y] = rows[y] || []).push(item.text);
  //       // }
  //     });
  //   });
  // }


  async removeInventory(userSub: string, file: Express.Multer.File, fileHash: string) {
    const htmlContent = file.buffer.toString();
    // console.log('Raw file content:', htmlContent);

    // Parse the HTML content
    const parsedData = this.parseHtmlTable(htmlContent);
    console.log('Parsed data:', parsedData);

    // const parsedData = await this.parsePdfBuffer(file.buffer)
    // console.log('Extracted Text:', parsedData);



    if (!parsedData || parsedData.length === 0) {
      throw new Error('No valid data could be parsed from the HTML file');
    }

    return await this.productRepository.uploadSalesSheet(userSub, parsedData, file, fileHash);
  }



  async checkInventoryFileStatus(file: Express.Multer.File, username: string) {
    const dataToHash = Buffer.concat([
      file.buffer,
      Buffer.from(username) // or Buffer.from(userId)
    ]);
    const fileHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    const existingFile = await this.productRepository.checkInventoryFileHash(fileHash);

    if (existingFile) {
      throw new Error('This file has already been uploaded.');
    }
    return fileHash
  }

  async checkSalesFileStatus(file: Express.Multer.File, username: string) {

    const dataToHash = Buffer.concat([
      file.buffer,
      Buffer.from(username) // or Buffer.from(userId)
    ]);
    const fileHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    const existingFile = await this.productRepository.checkSalesFileHash(fileHash);

    if (existingFile) {
      throw new Error('This file has already been uploaded.');
    }
    return fileHash
  }

  private parseExcel(file: Express.Multer.File): Record<string, any>[] {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  }

  async findAll(userSub: string) {
    return await this.productRepository.findAll(userSub);
  }

  async getSuggestions(userSub: string) {
    return await this.productRepository.getSuggestions(userSub);
  }

  async productsOverview() {
    return await this.productRepository.productsOverview();
  }

  async findOne(id: string) {
    return await this.productRepository.findOne(id);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    return this.productRepository.update(id, updateProductDto);
  }

  async remove(id: string) {
    return await this.productRepository.remove(id);
  }


  async getTotalPrice(userSub: string) {
    return await this.productRepository.getTotalPrice(userSub);
  }
}
