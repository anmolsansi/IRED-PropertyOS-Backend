import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FloorsService {
  constructor(private prisma: PrismaService) {}

  async findByBuilding(buildingId: string) {
    return this.prisma.floor.findMany({
      where: { buildingId, deletedAt: null },
      orderBy: { floorNumber: 'asc' },
      include: {
        availabilityStatus: true,
        units: {
          where: { deletedAt: null },
          orderBy: { unitNumber: 'asc' },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.floor.findUnique({
      where: { id },
      include: {
        building: true,
        availabilityStatus: true,
        units: {
          where: { deletedAt: null },
          orderBy: { unitNumber: 'asc' },
        },
      },
    });
  }

  async create(buildingId: string, data: any, userId: string) {
    return this.prisma.floor.create({
      data: {
        ...data,
        buildingId,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async update(id: string, data: any, userId: string, isAdmin: boolean) {
    if (isAdmin) {
      return this.prisma.floor.update({
        where: { id },
        data: { ...data, updatedBy: userId },
      });
    }
    return { message: 'Change request created', entityId: id };
  }

  async softDelete(id: string) {
    return this.prisma.floor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.floor.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
