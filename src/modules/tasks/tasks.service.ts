import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    assignedTo?: string;
    status?: string;
  }) {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
      ...(filters.status && { status: filters.status as any }),
    };

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'asc' },
        include: {
          assignee: true,
          client: true,
          building: true,
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(data: any, userId: string) {
    return this.prisma.task.create({
      data: { ...data, createdBy: userId },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.task.update({ where: { id }, data });
  }
}
