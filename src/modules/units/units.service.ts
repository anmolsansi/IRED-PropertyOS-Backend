import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    buildingId?: string;
    floorId?: string;
    availabilityStatusId?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, search, ...filters } = query;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(filters.buildingId && { buildingId: filters.buildingId }),
      ...(filters.floorId && { floorId: filters.floorId }),
      ...(filters.availabilityStatusId && {
        availabilityStatusId: filters.availabilityStatusId,
      }),
      ...(search && {
        OR: [
          { unitNumber: { contains: search, mode: 'insensitive' as const } },
          { unitCode: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.unit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          building: true,
          floor: true,
          propertyType: true,
          furnishingStatus: true,
          availabilityStatus: true,
        },
      }),
      this.prisma.unit.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.unit.findUnique({
      where: { id },
      include: {
        building: true,
        floor: true,
        propertyType: true,
        furnishingStatus: true,
        availabilityStatus: true,
        assignedWorker: true,
        contacts: {
          where: { deletedAt: null },
        },
        media: {
          where: { deletedAt: null },
        },
      },
    });
  }

  async create(data: any, userId: string) {
    return this.prisma.unit.create({
      data: {
        ...data,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async update(id: string, data: any, userId: string, isAdmin: boolean) {
    if (isAdmin) {
      return this.prisma.unit.update({
        where: { id },
        data: { ...data, updatedBy: userId },
      });
    }
    return { message: 'Change request created', entityId: id };
  }

  async softDelete(id: string) {
    return this.prisma.unit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.unit.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
