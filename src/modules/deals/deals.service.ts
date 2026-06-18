import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    assignedTo?: string;
  }) {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.status && { status: filters.status as any }),
      ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
    };

    const [data, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: true,
          building: true,
          unit: true,
          assignee: true,
        },
      }),
      this.prisma.deal.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    return this.prisma.deal.findUnique({
      where: { id },
      include: {
        client: true,
        building: true,
        unit: true,
        assignee: true,
        commissions: true,
        invoices: true,
      },
    });
  }

  async create(data: any, userId: string) {
    return this.prisma.deal.create({
      data: { ...data, createdBy: userId },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.deal.update({ where: { id }, data });
  }
}
