import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LogoutDto { 
    @IsString()
    readonly refreshToken: string
}

export class ConfirmCodeDto {

    @IsNotEmpty()
    @IsEmail({}, { message: "There's an issue with email" })
    readonly email: string

    @IsString()
    readonly code: string
}