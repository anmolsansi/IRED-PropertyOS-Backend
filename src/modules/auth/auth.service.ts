import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login(email: string, password: string) {
    // TODO: Implement login logic
    return { message: 'Not implemented' };
  }

  async verifyEmailOtp(userId: string, otp: string) {
    // TODO: Implement OTP verification
    return { message: 'Not implemented' };
  }

  async refreshToken(refreshToken: string) {
    // TODO: Implement refresh token rotation
    return { message: 'Not implemented' };
  }

  async logout(userId: string) {
    // TODO: Implement logout
    return { message: 'Not implemented' };
  }

  async getMe(userId: string) {
    // TODO: Implement get current user
    return { message: 'Not implemented' };
  }
}
