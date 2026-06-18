import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('verify-email-otp')
  @ApiOperation({ summary: 'Verify email OTP' })
  async verifyEmailOtp(@Body() body: { userId: string; otp: string }) {
    return this.authService.verifyEmailOtp(body.userId, body.otp);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  async logout(@Body() body: { userId: string }) {
    return this.authService.logout(body.userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Body() body: { userId: string }) {
    return this.authService.getMe(body.userId);
  }
}
