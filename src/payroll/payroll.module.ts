import { Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { PrismaClientModule } from 'src/prisma-client/prisma-client.module';
import { PayrollRepository } from './payroll.repository';

@Module({
  imports: [PrismaClientModule],
  controllers: [PayrollController],
  providers: [PayrollService, PayrollRepository],
})
export class PayrollModule { }
