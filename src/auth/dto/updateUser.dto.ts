import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class UpdateUserDto {

    @IsNotEmpty()
    @IsString()
    readonly firstName : string;
    
    @IsNotEmpty()
    @IsString()
    readonly lastName : string;

    @IsNotEmpty()
    readonly accessToken : string;
}
