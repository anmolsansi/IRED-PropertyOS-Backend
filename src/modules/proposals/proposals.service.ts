import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class ProposalsService {
  private readonly logger = new Logger(ProposalsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async create(data: {
    clientId: string;
    requirementId?: string;
    unitIds: string[];
    notes?: string;
  }, userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: data.clientId },
    });
    if (!client) throw new NotFoundException('Client not found');

    const units = await this.prisma.unit.findMany({
      where: { id: { in: data.unitIds } },
      include: {
        building: true,
        floor: true,
        propertyType: true,
        furnishingStatus: true,
      },
    });

    const proposal = {
      id: `prop-${Date.now()}`,
      client,
      units,
      notes: data.notes,
      createdBy: userId,
      createdAt: new Date(),
    };

    this.logger.log(`Proposal created for client ${client.name} with ${units.length} units`);
    return proposal;
  }

  async generatePdf(proposalData: {
    client: any;
    units: any[];
    notes?: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(24).font('Helvetica-Bold').text('IRED PropertyOS', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica').text('Commercial Property Proposal', { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('Client Information');
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(11);
      doc.text(`Name: ${proposalData.client.name}`);
      if (proposalData.client.company) doc.text(`Company: ${proposalData.client.company}`);
      if (proposalData.client.email) doc.text(`Email: ${proposalData.client.email}`);
      if (proposalData.client.mobileNumber) doc.text(`Mobile: ${proposalData.client.mobileNumber}`);
      doc.moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('Property Details');
      doc.moveDown(0.3);

      for (const unit of proposalData.units) {
        doc.font('Helvetica-Bold').fontSize(11);
        doc.text(`${unit.building?.name || 'N/A'} — Unit ${unit.unitNumber}`);
        doc.font('Helvetica').fontSize(10);
        doc.text(`  Code: ${unit.unitCode}`);
        if (unit.floor) doc.text(`  Floor: ${unit.floor.floorName || unit.floor.floorNumber}`);
        if (unit.propertyType) doc.text(`  Type: ${unit.propertyType.name}`);
        if (unit.carpetArea) doc.text(`  Carpet Area: ${unit.carpetArea} sq ft`);
        if (unit.monthlyRent) doc.text(`  Monthly Rent: ₹${unit.monthlyRent.toLocaleString('en-IN')}`);
        if (unit.furnishingStatus) doc.text(`  Furnishing: ${unit.furnishingStatus.name}`);
        if (unit.securityDeposit) doc.text(`  Security Deposit: ₹${unit.securityDeposit.toLocaleString('en-IN')}`);
        doc.moveDown(0.5);
      }

      if (proposalData.notes) {
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica-Bold').text('Notes');
        doc.font('Helvetica').fontSize(11).text(proposalData.notes);
      }

      doc.moveDown(2);
      doc.fontSize(10).font('Helvetica')
        .text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, { align: 'right' });
      doc.text('IRED PropertyOS — Commercial Real Estate Operations Platform', { align: 'right' });

      doc.end();
    });
  }

  async generateAndStorePdf(proposalData: {
    client: any;
    units: any[];
    notes?: string;
  }): Promise<{ buffer: Buffer; fileName: string }> {
    const buffer = await this.generatePdf(proposalData);
    const fileName = `proposal-${proposalData.client.id}-${Date.now()}.pdf`;
    return { buffer, fileName };
  }
}
