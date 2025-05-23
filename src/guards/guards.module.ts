import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './passport.strategy';
import { ConfigModule } from 'src/config/config.module';

@Module({
    imports: [PassportModule.register({defaultStrategy: "jwt"}), ConfigModule],
    providers: [JwtStrategy]
})
export class GuardsModule {}
