import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { CreateEmployeeDto } from './create-payroll.dto copy';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
    // @IsString()
    // id: string
}
