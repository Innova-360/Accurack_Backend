import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    // @IsString()
    // id: string
}
