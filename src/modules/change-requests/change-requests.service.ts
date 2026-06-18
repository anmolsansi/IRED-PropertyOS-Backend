import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChangeRequestsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    entityType?: string;
    cityId?: string;
  }) {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.status && { status: filters.status as any }),
      ...(filters.entityType && { entityType: filters.entityType as any }),
    };

    const [data, total] = await Promise.all([
      this.prisma.changeRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestedAt: 'desc' },
        include: {
          requestedByUser: true,
          reviewedByUser: true,
          changeItems: true,
        },
      }),
      this.prisma.changeRequest.count({ where }),
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
    return this.prisma.changeRequest.findUnique({
      where: { id },
      include: {
        requestedByUser: true,
        reviewedByUser: true,
        changeItems: {
          orderBy: { fieldName: 'asc' },
        },
      },
    });
  }

  async withdraw(id: string, userId: string) {
    const request = await this.prisma.changeRequest.findUnique({
      where: { id },
    });

    if (!request || request.requestedBy !== userId) {
      return { error: 'Not authorized to withdraw this request' };
    }

    if (request.status !== 'pending') {
      return { error: 'Can only withdraw pending requests' };
    }

    return this.prisma.changeRequest.update({
      where: { id },
      data: { status: 'withdrawn' },
    });
  }

  async approveItems(
    id: string,
    items: { changeItemId: string; finalValue: string; comment?: string }[],
    adminId: string,
  ) {
    // TODO: Implement field-level approval logic
    // For each approved item:
    // 1. Update change item status to 'approved'
    // 2. Set final_value_json
    // 3. Update master data field
    // 4. Create version snapshot
    // 5. Create audit event

    return this.prisma.changeRequest.update({
      where: { id },
      data: {
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });
  }

  async rejectItems(
    id: string,
    items: { changeItemId: string; comment: string }[],
    adminId: string,
  ) {
    // TODO: Implement field-level rejection logic

    return this.prisma.changeRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });
  }

  async resolveConflict(
    id: string,
    changeItemId: string,
    finalValue: string,
    adminId: string,
  ) {
    // TODO: Implement conflict resolution logic

    return this.prisma.changeRequest.update({
      where: { id },
      data: {
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });
  }
}
