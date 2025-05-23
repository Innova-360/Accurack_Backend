import { Injectable } from '@nestjs/common';
import { PrismaClientService } from 'src/prisma-client/prisma-client.service';
import { CreateEmployeeDto } from './dto/create-payroll.dto copy';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class PayrollRepository {

    constructor(private prismaClient: PrismaClientService) { }

    async createEmployee(userSub: string, employeeDTO: CreateEmployeeDto) {
        return await this.prismaClient.employee.create({ data: { ...employeeDTO, Store: { connect: { adminId: userSub } } } })
    }

    async getEmployees(userSub: string) {
        try {
            return await this.prismaClient.employee.findMany({ where: { Store: { adminId: userSub } }, orderBy: { id: 'asc' } })
        } catch (error) {
            console.log(error);
        }
    }

    async getEmployee(id: string) {
        try {
            return await this.prismaClient.employee.findFirst({ where: { id } })
        } catch (error) {
            console.log(error);
        }
    }

    async removeEmployee(id: string) {
        try {
            return await this.prismaClient.employee.delete({ where: { id } })
        } catch (error) {
            console.log(error);
        }
    }

    async updateEmployee(id: string, updateEmployeeDTO: UpdateEmployeeDto) {
        try {
            return await this.prismaClient.employee.update({
                where: { id },
                data: { ...updateEmployeeDTO }
            })
        } catch (error) {
            console.log(error);
        }
    }
}
