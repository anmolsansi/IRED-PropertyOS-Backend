import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  LoginSchema,
  VerifyEmailOtpSchema,
  ResendEmailOtpSchema,
  RefreshTokenSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  SendMobileRecoveryOtpSchema,
  VerifyMobileRecoveryOtpSchema,
  LoginDto,
  VerifyEmailOtpDto,
  ResendEmailOtpDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SendMobileRecoveryOtpDto,
  VerifyMobileRecoveryOtpDto,
} from './dto/auth.schema';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('verify-email-otp')
  @ApiOperation({ summary: 'Verify email OTP and get tokens' })
  @UsePipes(new ZodValidationPipe(VerifyEmailOtpSchema))
  async verifyEmailOtp(@Body() dto: VerifyEmailOtpDto) {
    return this.authService.verifyEmailOtp(dto.userId, dto.otp);
  }

  @Post('resend-email-otp')
  @ApiOperation({ summary: 'Resend email OTP' })
  @UsePipes(new ZodValidationPipe(ResendEmailOtpSchema))
  async resendEmailOtp(@Body() dto: ResendEmailOtpDto) {
    return this.authService.resendEmailOtp(dto.userId);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  @UsePipes(new ZodValidationPipe(RefreshTokenSchema))
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout and revoke all refresh tokens' })
  async logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset OTP' })
  @UsePipes(new ZodValidationPipe(ForgotPasswordSchema))
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with OTP' })
  @UsePipes(new ZodValidationPipe(ResetPasswordSchema))
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.userId, dto.otp, dto.newPassword);
  }

  @Post('send-mobile-recovery-otp')
  @ApiOperation({ summary: 'Send OTP to mobile for recovery' })
  @UsePipes(new ZodValidationPipe(SendMobileRecoveryOtpSchema))
  async sendMobileRecoveryOtp(@Body() dto: SendMobileRecoveryOtpDto) {
    return this.authService.sendMobileRecoveryOtp(dto.mobileNumber);
  }

  @Post('verify-mobile-recovery-otp')
  @ApiOperation({ summary: 'Verify mobile recovery OTP' })
  @UsePipes(new ZodValidationPipe(VerifyMobileRecoveryOtpSchema))
  async verifyMobileRecoveryOtp(@Body() dto: VerifyMobileRecoveryOtpDto) {
    return this.authService.verifyMobileRecoveryOtp(
      dto.mobileNumber,
      dto.otp,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}
