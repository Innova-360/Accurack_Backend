import { IsNumber, IsString } from "class-validator";

export class CreateProductDto {
    @IsString()
    public name: string

    @IsString()
    public category: string

    @IsNumber()
    public stock: number  

    @IsNumber()
    public price: number

    @IsString()
    public PLU: string

    @IsString()
    public SKU: string

    @IsString()
    public description: string
}
