import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { ConfigModule } from 'src/config/config.module';
import { PrismaClientModule } from 'src/prisma-client/prisma-client.module';
 
@Module({
  imports: [
    ConfigModule,
    PrismaClientModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
})

export class AuthModule {}
