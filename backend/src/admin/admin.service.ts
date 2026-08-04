import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

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
        select: { id: true, email: true, fullName: true, phone: true, role: true, isActive: true, createdAt: true }
      }),
      this.prisma.user.count()
    ]);
    return { data: users, total, page, limit };
  }

  async createUser(data: any) {
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.createUser({
      ...data,
      password: hashedPassword,
      role: data.role || 'CUSTOMER',
    });

    const { password, ...result } = user;
    return result;
  }

  async getUserDetail(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        shop: true,
      }
    });
  }

  async updateUser(id: number, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      }
    });
  }

  async updateUserStatus(id: number, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, isActive: true }
    });
  }

  async deleteUser(id: number) {
    // 1. Kiểm tra xem user có tồn tại không
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        shop: {
          include: {
            products: {
              select: { id: true },
              take: 1
            }
          }
        }
      }
    });

    if (!user) {
      throw new BadRequestException('Xóa thất bại: Người dùng không tồn tại trên hệ thống.');
    }

    // 2. Kiểm tra xem user có phải là Seller và có sản phẩm public không
    if (user.shop && user.shop.products.length > 0) {
      throw new BadRequestException('Xóa thất bại: Không thể xóa user là chủ Shop đang có sản phẩm hiển thị trên hệ thống.');
    }

    // 3. Thực hiện soft delete (khóa tài khoản)
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    return { success: true, message: 'Xóa (vô hiệu hóa) người dùng thành công.' };
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
