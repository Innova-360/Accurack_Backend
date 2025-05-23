import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { passportJwtSecret } from "jwks-rsa";
import { CognitoConfig } from "src/config/cognito";

var Strategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt 


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt"){
    constructor(private cognitoConfig: CognitoConfig){
        super({
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 10,
                jwksUri: `${cognitoConfig.getAuthConfiguration().authority}/.well-known/jwks.json`
            }),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            issuer: cognitoConfig.getAuthConfiguration().authority,
            algorithms: ['RS256']
        })
    }

    async validate(payload: any){
        return {
            userSub: payload.sub,
            email: payload.email
        }
    }
}