import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { AWS_REGION, USER_POOL_CLIENT_ID, USER_POOL_ID } from "./config.constants";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CognitoConfig extends CognitoIdentityProviderClient {
    private userPoolId: string
    private clientId: string
    private region: string

    constructor(private configService: ConfigService) {
        super({ region: configService.get<string>(AWS_REGION) ?? "us-east-1" })
        this.userPoolId = this.configService.get<string>(USER_POOL_ID)
        this.clientId = this.configService.get<string>(USER_POOL_CLIENT_ID)
        this.region = this.configService.get<string>(AWS_REGION)
    }

    getAuthConfiguration() {
        return {
            userPoolId: this.userPoolId,
            clientId: this.clientId,
            region: this.region,
            authority: `https://cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}`
        }
    }
}