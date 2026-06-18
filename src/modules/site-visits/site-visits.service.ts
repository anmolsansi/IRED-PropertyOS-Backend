import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SiteVisitsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    scheduledDate?: string;
    assignedTo?: string;
  }) {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
      ...(filters.scheduledDate && {
        scheduledAt: {
          gte: new Date(filters.scheduledDate),
          lt: new Date(new Date(filters.scheduledDate).getTime() + 86400000),
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.siteVisit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'asc' },
        include: {
          assignee: true,
          client: true,
          building: true,
        },
      }),
      this.prisma.siteVisit.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(data: any, userId: string) {
    return this.prisma.siteVisit.create({
      data: { ...data, createdBy: userId },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.siteVisit.update({ where: { id }, data });
  }
}
