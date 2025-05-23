import { IsEmail, IsNotEmpty } from "class-validator";
import { LoginDto } from "./login.dto";

export class ResetPasswordDTO extends LoginDto {
    @IsNotEmpty()
    readonly code: string
}
