import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../shared/decorators/roles.decorator';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboard() {
    const [
      totalProperties,
      availableProperties,
      pendingApprovals,
      totalWorkers,
    ] = await Promise.all([
      this.prisma.building.count({ where: { deletedAt: null } }),
      this.prisma.building.count({
        where: {
          deletedAt: null,
          availabilityStatus: { name: 'Available' },
        },
      }),
      this.prisma.changeRequest.count({
        where: { status: 'pending' },
      }),
      this.prisma.user.count({
        where: { role: Role.WORKER, status: 'active' },
      }),
    ]);

    return {
      totalProperties,
      availableProperties,
      pendingApprovals,
      totalWorkers,
      availabilityRate:
        totalProperties > 0
          ? ((availableProperties / totalProperties) * 100).toFixed(1)
          : 0,
    };
  }

  async getWorkerDashboard(userId: string) {
    const assignments = await this.prisma.workerGeographicAssignment.findMany({
      where: { userId, active: true },
    });

    const stateIds = assignments
      .filter((a) => a.stateId)
      .map((a) => a.stateId!);
    const cityIds = assignments.filter((a) => a.cityId).map((a) => a.cityId!);

    const geographicFilter = {
      OR: [
        { stateId: { in: stateIds } },
        { cityId: { in: cityIds } },
      ],
    };

    const [assignedProperties, pendingMyChanges] = await Promise.all([
      this.prisma.building.count({
        where: {
          deletedAt: null,
          ...geographicFilter,
        },
      }),
      this.prisma.changeRequest.count({
        where: {
          requestedBy: userId,
          status: 'pending',
        },
      }),
    ]);

    return {
      assignedProperties,
      pendingMyChanges,
    };
  }

  async getActivity(limit = 20) {
    return this.prisma.auditEvent.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }
}
