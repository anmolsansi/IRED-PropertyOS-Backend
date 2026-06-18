import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.media.findUnique({
      where: { id },
      include: {
        building: true,
        floor: true,
        unit: true,
        documentCategory: true,
      },
    });
  }

  async findByBuilding(buildingId: string) {
    return this.prisma.media.findMany({
      where: { buildingId, deletedAt: null },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async create(data: any, userId: string) {
    return this.prisma.media.create({
      data: {
        ...data,
        uploadedBy: userId,
        uploadedAt: new Date(),
      },
    });
  }

  async completeUpload(id: string) {
    return this.prisma.media.update({
      where: { id },
      data: { uploadStatus: 'completed' },
    });
  }

  async softDelete(id: string) {
    return this.prisma.media.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.media.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
