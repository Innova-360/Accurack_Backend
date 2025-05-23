import { IsString } from "class-validator";

export class CreateStoreDto {
    @IsString()
    public name: string
}
