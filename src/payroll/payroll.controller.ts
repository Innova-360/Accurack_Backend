import { Body, Controller, Delete, Get, Param, Patch, Post, Request, HttpException, UseGuards } from '@nestjs/common';
import { Response } from '../common/interfaces/response.interface';
import { CreateEmployeeDto } from './dto/create-payroll.dto copy';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { PayrollService } from './payroll.service';
import { Employee } from '@prisma/client';
import { CognitoGuard } from 'src/guards/cognito.guard';

@UseGuards(CognitoGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) { }

  @Post('createEmployee')
  async create(@Request() req, @Body() createEmployeeDto: CreateEmployeeDto): Promise<Response<Employee>> {
    try {
      const result = await this.payrollService.createEmployee(req.user.userSub, createEmployeeDto);
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Get('employees')
  async getAllEmployees(@Request() req): Promise<Response<Employee[]>> {
    try {
      const result = await this.payrollService.getAllEmployees(req.user.userSub);
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Get('deductions')
  async findAllDeductions(@Request() req): Promise<Response<any>> {
    try {
      const result = await this.payrollService.findAllDeductions();
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Get('payroll')
  async getPayrollList(@Request() req): Promise<Response<any>> {
    try {
      const result = await this.payrollService.getPayrollList();
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Get('employee/:id')
  async findOne(@Request() req, @Param('id') id: string): Promise<Response<Employee>> {
    try {
      const result = await this.payrollService.findOne(id);
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Patch('employee/:id')
  async update(@Request() req, @Param('id') id: string, @Body() updatePayrollDto: UpdatePayrollDto): Promise<Response<Employee>> {
    try {
      const result = await this.payrollService.update(id, updatePayrollDto);
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Delete('employee/:id')
  async remove(@Request() req, @Param('id') id: string): Promise<Response<Employee>> {
    try {
      const result = await this.payrollService.remove(id);
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }
}
