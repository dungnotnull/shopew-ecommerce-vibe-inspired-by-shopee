import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput) {
    if (data.role === 'SELLER') {
      return this.prisma.$transaction(async (tx: any) => {
        const user = await tx.user.create({ data });
        await tx.shop.create({
          data: {
            userId: user.id,
            name: `Gian hàng của ${user.fullName}`,
            description: 'Chào mừng đến với gian hàng của tôi!',
          }
        });
        return user;
      });
    }
    return this.prisma.user.create({ data });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
