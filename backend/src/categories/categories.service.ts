import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getCategoryTree() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true, // Only 2 levels: parent and children
      },
    });
  }

  async getCategoryById(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
      }
    });
  }

  async createCategory(data: any) {
    if (data.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) {
        throw new BadRequestException('Danh mục cha không tồn tại.');
      }
      if (parent.parentId !== null) {
        throw new BadRequestException('Hệ thống chỉ hỗ trợ tối đa 2 cấp danh mục (Cha - Con).');
      }
    }

    return this.prisma.category.create({
      data: {
        name: data.name,
        parentId: data.parentId,
        imageUrl: data.imageUrl,
        attributes: data.attributes,
      },
    });
  }

  async updateCategory(id: number, data: any) {
    if (data.parentId) {
      // Fetch the category being updated to check its children
      const currentCategory = await this.prisma.category.findUnique({
        where: { id },
        include: { children: true },
      });

      if (!currentCategory) {
        throw new BadRequestException('Danh mục không tồn tại.');
      }

      if (currentCategory.parentId !== data.parentId) {
        if (currentCategory.children.length > 0) {
          throw new BadRequestException('Không thể chuyển danh mục đang có danh mục con vào một danh mục khác. (Vượt quá 2 cấp)');
        }

        const parent = await this.prisma.category.findUnique({
          where: { id: data.parentId },
        });
        if (!parent) {
          throw new BadRequestException('Danh mục cha không tồn tại.');
        }
        if (parent.parentId !== null) {
          throw new BadRequestException('Hệ thống chỉ hỗ trợ tối đa 2 cấp danh mục (Cha - Con).');
        }
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        parentId: data.parentId,
        imageUrl: data.imageUrl,
        attributes: data.attributes,
      },
    });
  }

  async deleteCategory(id: number) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
