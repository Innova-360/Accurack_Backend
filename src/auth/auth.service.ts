import { ConfirmCodeDto } from './dto';
import { LoginDto } from './dto/login.dto';
import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { AuthRepository } from './auth.repository';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';

@Injectable()
export class AuthService {
  constructor(private authRespository: AuthRepository) { }

  async signUp(signUpDto: SignUpDto) {
    return await this.authRespository.createUser(signUpDto)
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto
    const { AuthenticationResult: { AccessToken, IdToken, RefreshToken, ExpiresIn } } =
      await this.authRespository.authenticate(email, password)

    return {
      idToken: IdToken,
      expiresIn: ExpiresIn,
      accessToken: AccessToken,
      refreshToken: RefreshToken,
    }
  }

  async OAuthLogin(code: string) {
    const { AuthenticationResult: { AccessToken, IdToken, RefreshToken, ExpiresIn } } =
      await this.authRespository.OAuthLogin(code)

    return {
      idToken: IdToken,
      expiresIn: ExpiresIn,
      accessToken: AccessToken,
      refreshToken: RefreshToken,
    }
  }
  async logout(refreshToken: string) {
    const { $metadata: { httpStatusCode } } = await this.authRespository.logout(refreshToken)
    return httpStatusCode == 200
  }

  async confirmUser(confirmCodeDto: ConfirmCodeDto) {
    const { $metadata: { httpStatusCode } } = await this.authRespository.confirmCode(confirmCodeDto)
    return httpStatusCode == 200
  }

  async forgotPassword(email: string) {
    const { $metadata: { httpStatusCode } } = await this.authRespository.forgotPassword(email)
    return httpStatusCode === 200
  }

  async newPassword(email: string, code: string, newPassword: string) {
    const { $metadata: { httpStatusCode } } = await this.authRespository.newPassword(email, code, newPassword)
    return httpStatusCode === 200
  }

  async resendConfirmationCode(email: string) {
    const { $metadata: { httpStatusCode } } = await this.authRespository.resendConfirmationCode(email)
    return httpStatusCode === 200
  }

  async updateUser(user: UpdateUserDto) {
    const { $metadata: { httpStatusCode } } = await this.authRespository.modifyUserDetails(user)
    return httpStatusCode === 200
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const { $metadata: { httpStatusCode } } = await this.authRespository.changePassword(changePasswordDto)
    return httpStatusCode === 200
  }
}
