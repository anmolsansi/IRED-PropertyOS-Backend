import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchProperties(query: {
    stateId?: string;
    cityId?: string;
    localityId?: string;
    propertyTypeId?: string;
    furnishingStatusId?: string;
    availabilityStatusId?: string;
    verificationStatusId?: string;
    minArea?: number;
    maxArea?: number;
    minRent?: number;
    maxRent?: number;
    assignedWorkerId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 20, search, ...filters } = query;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(filters.stateId && { stateId: filters.stateId }),
      ...(filters.cityId && { cityId: filters.cityId }),
      ...(filters.localityId && { localityId: filters.localityId }),
      ...(filters.propertyTypeId && { propertyTypeId: filters.propertyTypeId }),
      ...(filters.furnishingStatusId && {
        furnishingStatusId: filters.furnishingStatusId,
      }),
      ...(filters.availabilityStatusId && {
        availabilityStatusId: filters.availabilityStatusId,
      }),
      ...(filters.verificationStatusId && {
        verificationStatusId: filters.verificationStatusId,
      }),
      ...(filters.minArea && {
        totalBuildingArea: { gte: filters.minArea },
      }),
      ...(filters.maxArea && {
        totalBuildingArea: { lte: filters.maxArea },
      }),
      ...(filters.assignedWorkerId && {
        units: {
          some: { assignedWorkerId: filters.assignedWorkerId },
        },
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
}
