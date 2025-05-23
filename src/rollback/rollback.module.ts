import { Module } from '@nestjs/common';
import { RollbackService } from './rollback.service';
import { RollbackController } from './rollback.controller';
import { RollbackRepository } from './rollback.repository';
import { PrismaClientModule } from 'src/prisma-client/prisma-client.module';

@Module({
  imports: [PrismaClientModule],
  controllers: [RollbackController],
  providers: [RollbackService, RollbackRepository],
})
export class RollbackModule {}
