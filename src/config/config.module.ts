import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { GlobalConfig } from './env';
import { CognitoConfig } from './cognito';

@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ".env"
        })
    ],
    providers: [CognitoConfig],
    exports: [CognitoConfig]
})
export class ConfigModule { }
