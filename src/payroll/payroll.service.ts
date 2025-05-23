import { Injectable } from '@nestjs/common';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { PrismaClientService } from 'src/prisma-client/prisma-client.service';
import { CreateEmployeeDto } from './dto/create-payroll.dto copy';
import { PayrollRepository } from './payroll.repository';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class PayrollService {
  constructor(private payrollRepository: PayrollRepository) { }

  async getAllEmployees(userSub: string) {
    return await this.payrollRepository.getEmployees(userSub)
  }

  async findAllDeductions() {
    return [
      {
        id: 1,
        healthInsurance: "$150",
        garnishments: "$50",
        others: "$30",
        ficaLoans: "$70",
      },
      {
        id: 2,
        healthInsurance: "$180",
        garnishments: "$60",
        others: "$40",
        ficaLoans: "$80",
      },
    ]
  }

  async getPayrollList() {
    return Array.from({ length: 50 }, (_, index) => ({
      id: index + 1,
      fullName: "Suhaib", // Changed to fullName
      overtime: "$100", // New field for overtime
      bonus: "$200", // New field for bonus
      deductions: "$50", // New field for deductions
      netPay: "$1050", // New field for netPay
      contact: "123 456 789",
      email: "suhaib@example.com",
      gender: "Male", // New field for gender
      employeeType: "Full-time", // New field for employee type
      department: "HR", // New field for department
      status:
        index % 3 === 0 ? "Pending" : index % 3 === 1 ? "Completed" : "Cancelled",
    }))
  }

  async createEmployee(userSub: string, createEmployee: CreateEmployeeDto) {
    return await this.payrollRepository.createEmployee(userSub, createEmployee)
  }

  async findOne(id: string) {
    return await this.payrollRepository.getEmployee(id)
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    return await this.payrollRepository.updateEmployee(id, updateEmployeeDto)
  }

  async remove(id: string) {
    return await this.payrollRepository.removeEmployee(id)
  }
}
