import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count();
    const totalShops = await this.prisma.shop.count();
    const totalProducts = await this.prisma.product.count();
    
    // Total GMV or disputes would normally come from orders, but Phase 4 isn't done.
    // Leaving them as 0 for now.
    return {
      totalUsers,
      totalShops,
      totalProducts,
      totalGMV: 0,
      activeDisputes: 0
    };
  }

  async getUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, fullName: true, role: true, isActive: true, createdAt: true }
      }),
      this.prisma.user.count()
    ]);
    return { data: users, total, page, limit };
  }

  async getShops(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [shops, total] = await Promise.all([
      this.prisma.shop.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, fullName: true } } }
      }),
      this.prisma.shop.count()
    ]);
    return { data: shops, total, page, limit };
  }

  async getProducts(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { shop: { select: { name: true } }, category: { select: { name: true } } }
      }),
      this.prisma.product.count()
    ]);
    return { data: products, total, page, limit };
  }

  // --- Banners Management ---
  async getBanners(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [banners, total] = await Promise.all([
      this.prisma.banner.findMany({
        skip,
        take: limit,
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.banner.count()
    ]);
    return { data: banners, total, page, limit };
  }

  async createBanner(data: any) {
    return this.prisma.banner.create({
      data
    });
  }

  async updateBanner(id: number, data: any) {
    return this.prisma.banner.update({
      where: { id },
      data
    });
  }

  async deleteBanner(id: number) {
    return this.prisma.banner.delete({
      where: { id }
    });
  }
}
