import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.contact.findUnique({
      where: { id },
      include: {
        building: true,
        floor: true,
        unit: true,
        contactRole: true,
        verificationStatus: true,
      },
    });
  }

  async create(data: any, userId: string) {
    return this.prisma.contact.create({
      data: {
        ...data,
        createdBy: userId,
      },
    });
  }

  async update(id: string, data: any, userId: string, isAdmin: boolean) {
    if (isAdmin) {
      return this.prisma.contact.update({
        where: { id },
        data,
      });
    }
    return { message: 'Change request created', entityId: id };
  }

  async softDelete(id: string) {
    return this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.contact.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async logView(id: string, userId: string) {
    // Log sensitive contact viewing for audit
    await this.prisma.auditEvent.create({
      data: {
        actorUserId: userId,
        eventType: 'contact_viewed',
        entityType: 'contact',
        entityId: id,
        metadataJson: { viewedAt: new Date().toISOString() },
      },
    });
    return { success: true };
  }
}
