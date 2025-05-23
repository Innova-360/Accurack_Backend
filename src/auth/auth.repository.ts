import {
  AdminGetUserCommand, AuthFlowType, ConfirmForgotPasswordCommand, ConfirmForgotPasswordCommandOutput, ConfirmSignUpCommand,
  ForgotPasswordCommand, InitiateAuthCommand, InitiateAuthCommandOutput, InvalidPasswordException, NotAuthorizedException,
  SignUpCommandOutput, UsernameExistsException, UserNotConfirmedException, ConfirmSignUpCommandOutput, SignUpCommand,
  ResendConfirmationCodeCommand, ResendConfirmationCodeCommandOutput, RevokeTokenCommand, RevokeTokenCommandOutput,
  AdminUpdateUserAttributesCommand,
  UpdateUserAttributesCommandOutput,
  UpdateUserAttributesCommand,
  ChangePasswordCommandOutput,
  ChangePasswordCommand,
  AdminDeleteUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoConfig } from 'src/config/cognito';
import { SignUpDto } from './dto/signup.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfirmCodeDto } from './dto';
import { PrismaClientService } from 'src/prisma-client/prisma-client.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';

@Injectable()
export class AuthRepository {
  constructor(private cognitoConfig: CognitoConfig,
    private readonly prismaClient: PrismaClientService,
  ) { }


  private async deleteCognitoUser(email: string): Promise<void> {
    const deleteUserCommand = new AdminDeleteUserCommand({
      Username: email,
      UserPoolId: this.cognitoConfig.getAuthConfiguration().userPoolId
    });

    try {
      await this.cognitoConfig.send(deleteUserCommand);
      console.log("Deleted user from Cognito due to failed store creation");
    } catch (err) {
      console.error("Failed to delete Cognito user after store failure:", err);
    }
  }


  async createUser(signUpDto: SignUpDto): Promise<SignUpCommandOutput> {
    const { email, password, firstName, lastName } = signUpDto;

    const signUpCommand = new SignUpCommand({
      ClientId: this.cognitoConfig.getAuthConfiguration().clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "given_name", Value: firstName },
        { Name: "family_name", Value: lastName }
      ]
    });

    try {
      const response = await this.cognitoConfig.send(signUpCommand);

      if (response?.UserSub && typeof response.UserSub === "string") {
        const userSub = response.UserSub;

        console.log("password", password)
        try {
          // Step 1: Create user in DB
          await this.prismaClient.user.create({
            data: {
              id: userSub,            // Use Cognito sub
              email,
              password,               // Store hashed password (ideally)
              updatedAt: new Date()
            }
          });

          // Step 2: Create store
          await this.prismaClient.store.create({
            data: {
              adminId: userSub,
              name: `New Store by ${firstName} ${lastName}`,
            }
          });

        } catch (prismaError) {
          console.error("Error creating user or store:", prismaError);

          // Rollback Cognito user
          await this.deleteCognitoUser(email);

          throw new Error("User/store creation failed. Sign up aborted.");
        }

      } else {
        throw new Error("Invalid UserSub returned from Cognito");
      }

      return response;

    } catch (error) {
      console.error("Signup error:", error);

      if (error instanceof UsernameExistsException) {
        throw new Error("Email already exists");
      }

      if (error instanceof InvalidPasswordException) {
        throw new Error("Invalid password");
      }

      throw new Error(error?.message || "An error occurred during sign up");
    }
  }




  async authenticate(email: string, password: string): Promise<InitiateAuthCommandOutput> {
    const initiateAuthCommand = new InitiateAuthCommand({
      ClientId: this.cognitoConfig.getAuthConfiguration().clientId,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    })
    try {
      return await this.cognitoConfig.send(initiateAuthCommand)
    } catch (error) {
      console.log(error);
      if (error instanceof NotAuthorizedException || error instanceof UserNotConfirmedException) {
        throw Error(error.message)
      }
    }
  }

  async logout(refreshToken: string): Promise<RevokeTokenCommandOutput> {
    if (!refreshToken) {
      throw new Error("User is not logged In!")
    }

    const revokeTokenCommand = new RevokeTokenCommand({
      ClientId: this.cognitoConfig.getAuthConfiguration().clientId,
      Token: refreshToken
    })

    try {
      return await this.cognitoConfig.send(revokeTokenCommand)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async confirmCode(confirmCodeDto: ConfirmCodeDto): Promise<ConfirmSignUpCommandOutput> {
    const { email, code } = confirmCodeDto
    const confirmUserCommand = new ConfirmSignUpCommand({
      ClientId: this.cognitoConfig.getAuthConfiguration().clientId,
      Username: email,
      ConfirmationCode: code
    })
    try {
      return await this.cognitoConfig.send(confirmUserCommand)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async forgotPassword(email: string): Promise<ConfirmForgotPasswordCommandOutput> {
    const forgotPasswordCommand = new ForgotPasswordCommand({
      ClientId: this.cognitoConfig.getAuthConfiguration().clientId,
      Username: email,
    })

    try {
      return await this.cognitoConfig.send(forgotPasswordCommand)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async newPassword(email: string, code: string, newPassword: string): Promise<ConfirmForgotPasswordCommandOutput> {
    const confirmForgotPasswordCommand = new ConfirmForgotPasswordCommand({
      ClientId: this.cognitoConfig.getAuthConfiguration().clientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword
    })

    try {
      return await this.cognitoConfig.send(confirmForgotPasswordCommand)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async resendConfirmationCode(email: string): Promise<ResendConfirmationCodeCommandOutput> {
    const getUserCommand = new AdminGetUserCommand({
      UserPoolId: this.cognitoConfig.getAuthConfiguration().userPoolId,
      Username: email
    })

    try {
      const getUserResponse = await this.cognitoConfig.send(getUserCommand)

      if (!getUserResponse.UserStatus) {
        throw new Error("No User Status Found")
      }

      if (getUserResponse.UserStatus === "CONFIRMED") {
        throw new Error("User Already Activated")
      }

      const resendCodeCommand = new ResendConfirmationCodeCommand({
        ClientId: this.cognitoConfig.getAuthConfiguration().clientId,
        Username: email
      })

      return await this.cognitoConfig.send(resendCodeCommand)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async modifyUserDetails(user: UpdateUserDto): Promise<UpdateUserAttributesCommandOutput> {
    const { accessToken, firstName, lastName } = user
    const updateUserCommand = new UpdateUserAttributesCommand({
      AccessToken: accessToken,
      UserAttributes: [
        {
          Name: "given_name",
          Value: firstName
        },
        {
          Name: "family_name",
          Value: lastName
        }
      ]
    })

    try {
      return await this.cognitoConfig.send(updateUserCommand)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto): Promise<ChangePasswordCommandOutput> {
    const { accessToken, oldPassword, newPassword } = changePasswordDto
    const changePasswordCommand = new ChangePasswordCommand({
      AccessToken: accessToken,
      PreviousPassword: oldPassword,
      ProposedPassword: newPassword
    })

    try {
      return await this.cognitoConfig.send(changePasswordCommand)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  /**
   * This is for Testing only untill Ubaid comes back with Google OAuth Account
   * @param code 
   * @returns 
   */

  async OAuthLogin(code: string) {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: "1k3d3jjopoqom6fthrtu69aiit",
      // client_secret: "19i61i434fiqk95kqaavgeu5stli1qhp64eadmaorv03jbvoncmb",
      redirect_uri: 'http://localhost:3000',
      code,
    });

    try {
      const response = await fetch(
        `https://us-east-18pkkwpx0s.auth.us-east-1.amazoncognito.com/oauth2/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );

      const data = await response.json();

      return { AuthenticationResult: { AccessToken: data?.access_token, IdToken: data?.id_token, RefreshToken: data?.refresh_token, ExpiresIn: data?.expiresIn } }

    } catch (error) {
      console.log(error);
    }
  }
}
