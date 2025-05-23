import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { GrowthModule } from './growth/growth.module';
import { PayrollModule } from './payroll/payroll.module';
import { ProductModule } from './product/product.module';
import { ReportModule } from './report/report.module';
import { StoreModule } from './store/store.module';
import { GuardsModule } from './guards/guards.module';
import { RollbackModule } from './rollback/rollback.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // This makes ConfigModule globally available
      // envFilePath: ['.env'], // Ensure it reads from the .env file
    }),
    AuthModule,
    StoreModule,
    ProductModule,
    ReportModule,
    GuardsModule,
    DashboardModule,
    PayrollModule,
    ConfigModule,
    GrowthModule,
    RollbackModule,
  ],
})
export class AppModule {}
