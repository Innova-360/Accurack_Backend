import { IsString } from "class-validator"
import { Department, EmployeeType } from "@prisma/client";

export class CreateEmployeeDto {
    @IsString()
    public name: string

    @IsString()
    public gender: string

    @IsString()
    public email: string

    @IsString()
    public contact: string

    @IsString()
    public address: string

    @IsString()
    public type: EmployeeType

    @IsString()
    public department: Department
}