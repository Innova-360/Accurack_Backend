import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {

    @IsNotEmpty()
    @IsString()
    readonly newPassword : string;
    
    @IsNotEmpty()
    @IsString()
    readonly oldPassword : string;

    @IsNotEmpty()
    readonly accessToken : string;
}
