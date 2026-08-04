import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async getUserAddresses(userId: number) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async createAddress(userId: number, data: any) {
    // If this is set to default, or it's the user's first address
    const existingCount = await this.prisma.address.count({ where: { userId } });
    const isDefault = data.isDefault || existingCount === 0;

    return this.prisma.$transaction(async (tx) => {
      if (isDefault && existingCount > 0) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false }
        });
      }

      return tx.address.create({
        data: {
          userId,
          receiverName: data.receiverName,
          receiverPhone: data.receiverPhone,
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          isDefault
        }
      });
    });
  }

  async updateAddress(userId: number, addressId: number, data: any) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId }
    });

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    return this.prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId, id: { not: addressId } },
          data: { isDefault: false }
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: {
          receiverName: data.receiverName,
          receiverPhone: data.receiverPhone,
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          isDefault: data.isDefault !== undefined ? data.isDefault : undefined
        }
      });
    });
  }

  async deleteAddress(userId: number, addressId: number) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId }
    });

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.address.delete({
      where: { id: addressId }
    });

    // If deleted address was default, set the latest remaining address as default
    if (address.isDefault) {
      const remaining = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      if (remaining) {
        await this.prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true }
        });
      }
    }

    return { success: true };
  }
}
