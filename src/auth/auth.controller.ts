import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { ConfirmCodeDto, LogoutDto } from './dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ResetPasswordDTO } from './dto/resetPassword.dto';
import { Response } from '../common/interfaces/response.interface';
import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { ChangePasswordDto } from './dto/changePassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto): Promise<Response<{ message: string }>> {
    try {
      const { $metadata: { httpStatusCode } } = await this.authService.signUp(signUpDto);
      return { status: httpStatusCode, data: { message: 'Sign-up successful. Please confirm your email.' } };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto):
    Promise<Response<{ idToken: string, accessToken: string, refreshToken: string, expiresIn: number }>> {
    try {
      const tokens = await this.authService.login(loginDto);
      return { status: 200, data: tokens };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Post('OAuthLogin')
  async OAuthLogin(@Body('code') code: string):
    Promise<Response<{ idToken: string, accessToken: string, refreshToken: string, expiresIn: number }>> {
    try {
      const tokens = await this.authService.OAuthLogin(code);
      return { status: 200, data: tokens };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Post('logout')
  async logout(@Body() { refreshToken }: LogoutDto): Promise<Response<boolean>> {
    try {
      const result = await this.authService.logout(refreshToken);
      return { status: 200, data: result };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Post('confirmUser')
  async confirmUser(@Body() confirmUserInput: ConfirmCodeDto): Promise<Response<string>> {
    try {
      await this.authService.confirmUser(confirmUserInput);
      return { status: 200, data: "User has been confirmed" };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Post('forgotPassword')
  async forgotPassword(@Body() { email }: { email: string }): Promise<Response<string>> {
    try {
      const result = await this.authService.forgotPassword(email);
      return { status: 200, data: "Confirmation code has been sent" };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Post('resetPassword')
  async resetPassword(@Body() resetPasswordDTO: ResetPasswordDTO): Promise<Response<string>> {
    try {
      const { email, password, code } = resetPasswordDTO;
      const result = await this.authService.newPassword(email, code, password);
      return { status: 200, data: "Password has been reset" };
    } catch (error) {
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Post('resendConfirmationCode')
  async resendConfirmationCode(@Body() { email }: { email: string }): Promise<Response<boolean>> {
    try {
      const result = await this.authService.resendConfirmationCode(email);
      return { status: 200, data: result };
    } catch (error) {
      console.log(error);
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Post('modifyUserDetails')
  async modifyUserDetails(@Body() user: UpdateUserDto): Promise<Response<boolean>> {
    try {
      const result = await this.authService.updateUser(user);
      return { status: 200, data: result };
    } catch (error) {
      console.log(error);
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }

  @Post('changePassword')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto): Promise<Response<boolean>> {
    try {
      const result = await this.authService.changePassword(changePasswordDto);
      return { status: 200, data: result };
    } catch (error) {
      console.log(error);
      throw new HttpException({ status: 400, error: error.message }, 400);
    }
  }
}
