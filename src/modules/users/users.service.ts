import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // TODO: Implement with pagination and geographic filtering
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        mobileNumber: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        mobileNumber: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
