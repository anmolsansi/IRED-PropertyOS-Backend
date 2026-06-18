import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BuildingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    stateId?: string;
    cityId?: string;
    localityId?: string;
    propertyTypeId?: string;
    availabilityStatusId?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, search, ...filters } = query;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(filters.stateId && { stateId: filters.stateId }),
      ...(filters.cityId && { cityId: filters.cityId }),
      ...(filters.localityId && { localityId: filters.localityId }),
      ...(filters.propertyTypeId && { propertyTypeId: filters.propertyTypeId }),
      ...(filters.availabilityStatusId && {
        availabilityStatusId: filters.availabilityStatusId,
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { buildingCode: { contains: search, mode: 'insensitive' as const } },
          { fullAddress: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.building.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          state: true,
          city: true,
          locality: true,
          propertyType: true,
          availabilityStatus: true,
          verificationStatus: true,
        },
      }),
      this.prisma.building.count({ where }),
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
    return this.prisma.building.findUnique({
      where: { id },
      include: {
        state: true,
        city: true,
        zone: true,
        locality: true,
        microMarket: true,
        propertyType: true,
        availabilityStatus: true,
        verificationStatus: true,
        source: true,
        floors: {
          where: { deletedAt: null },
          orderBy: { floorNumber: 'asc' },
        },
        contacts: {
          where: { deletedAt: null },
        },
      },
    });
  }

  async create(data: any, userId: string) {
    // TODO: Implement duplicate detection and validation
    return this.prisma.building.create({
      data: {
        ...data,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async update(id: string, data: any, userId: string, isAdmin: boolean) {
    if (isAdmin) {
      return this.prisma.building.update({
        where: { id },
        data: { ...data, updatedBy: userId },
      });
    }

    // Worker edit creates a Change Request
    // TODO: Implement change request creation
    return { message: 'Change request created', entityId: id };
  }

  async softDelete(id: string) {
    return this.prisma.building.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.building.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
