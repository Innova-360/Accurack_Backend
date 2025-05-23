import { IsNumber, IsString } from 'class-validator';

export class Product {
  @IsString()
  PLU: string;

  @IsString()
  SKU: string;

  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  description: string;

  @IsNumber()
  stock: number;

  @IsNumber()
  cost: number;

  @IsNumber()
  salePrice: number;
}
