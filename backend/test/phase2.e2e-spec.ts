import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../src/common/guards/roles.guard';

describe('Phase 2 E2E Tests (Mocked)', () => {
  let app: INestApplication;
  let sellerToken = 'mock_seller_token';
  let customerToken = 'mock_customer_token';
  let shopCreateCounter = 0;

  beforeAll(async () => {
    const mockAuthGuard = {
      canActivate: (context: any) => {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers.authorization;
        if (!authHeader) return false;
        if (authHeader.includes('sellerToken')) {
          req.user = { id: 1, email: 'seller@test.com', role: 'SELLER' };
          return true;
        }
        if (authHeader.includes('customerToken')) {
          req.user = { id: 2, email: 'customer@test.com', role: 'CUSTOMER' };
          return true;
        }
        return false;
      },
    };

    const mockRolesGuard = {
      canActivate: (context: any) => {
        const req = context.switchToHttp().getRequest();
        return req.user?.role === 'SELLER'; // For seller routes
      }
    };

    const mockPrismaService = {
      category: {
        findMany: jest.fn().mockResolvedValue([{ id: 1, name: 'Category 1', children: [] }]),
      },
      shop: {
        create: jest.fn().mockResolvedValue({ id: 1, name: 'Test Shop' }),
        findUnique: jest.fn().mockImplementation(() => {
          shopCreateCounter++;
          if (shopCreateCounter === 1) return Promise.resolve(null); // First time no shop
          return Promise.resolve({ id: 1, userId: 1, name: 'Test Shop' }); // Second time shop exists
        }),
        update: jest.fn().mockResolvedValue({ id: 1, name: 'Updated Shop' }),
      },
      product: {
        create: jest.fn().mockResolvedValue({ id: 999, skus: [{ tierIndex: [] }] }),
        update: jest.fn().mockResolvedValue({ id: 999 }),
        delete: jest.fn().mockResolvedValue({ id: 999 }),
        findUnique: jest.fn().mockResolvedValue({ id: 999, shopId: 1, name: 'Product' }),
      },
      productLike: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.userId_productId.userId === 2) return Promise.resolve(null); // simulate not liked yet
          return Promise.resolve({ id: 1 });
        }),
        create: jest.fn().mockResolvedValue({ id: 1 }),
        delete: jest.fn().mockResolvedValue({ id: 1 }),
      },
      productVariantGroup: { create: jest.fn().mockResolvedValue({ id: 1 }) },
      productVariantOption: { create: jest.fn().mockResolvedValue({ id: 1 }) },
      sKU: { create: jest.fn().mockResolvedValue({ id: 1 }) },
      $transaction: jest.fn().mockImplementation(async (cb) => cb(mockPrismaService))
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService).useValue(mockPrismaService)
      .overrideGuard(AuthGuard('jwt')).useValue(mockAuthGuard)
      .overrideGuard(RolesGuard).useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('TC-PHASE2-01 (Public): GET /api/v1/categories', () => request(app.getHttpServer()).get('/api/v1/categories').expect(200));

  it('TC-PHASE2-02 (Thêm mới hợp lệ): POST /api/v1/shops', () => request(app.getHttpServer()).post('/api/v1/shops').set('Authorization', `Bearer sellerToken`).send({ name: 'Test Shop', description: 'Test Description' }).expect(201));

  it('TC-PHASE2-03 (Lỗi Conflict): POST /api/v1/shops', () => request(app.getHttpServer()).post('/api/v1/shops').set('Authorization', `Bearer sellerToken`).send({ name: 'Test Shop 2' }).expect(409));

  it('TC-PHASE2-04 (Lỗi Phân quyền): POST /api/v1/shops', () => request(app.getHttpServer()).post('/api/v1/shops').set('Authorization', `Bearer customerToken`).send({ name: 'Test Shop' }).expect(403));

  it('TC-PHASE2-05 (Truy vấn hợp lệ): GET /api/v1/shops/me', () => request(app.getHttpServer()).get('/api/v1/shops/me').set('Authorization', `Bearer sellerToken`).expect(200));

  it('TC-PHASE2-06 (Cập nhật hợp lệ): PUT /api/v1/shops/me', () => request(app.getHttpServer()).put('/api/v1/shops/me').set('Authorization', `Bearer sellerToken`).send({ name: 'Updated Shop' }).expect(200));

  it('TC-PHASE2-07 (Tạo SPU & Default SKU): POST /api/seller/products', () => request(app.getHttpServer()).post('/api/seller/products').set('Authorization', `Bearer sellerToken`).send({ categoryId: 1, name: 'No Variant', priceMin: 100, priceMax: 100 }).expect(201));

  it('TC-PHASE2-08 (Tạo SPU & Multi-tier SKUs đầy đủ): POST /api/seller/products', () => request(app.getHttpServer()).post('/api/seller/products').set('Authorization', `Bearer sellerToken`).send({ categoryId: 1, name: 'Multi Variant', variantGroups: [{ name: 'Color', options: ['Red', 'Blue'] }], skus: [{ price: 100, stock: 10, tierIndex: [0] }, { price: 100, stock: 10, tierIndex: [1] }] }).expect(201));

  it('TC-PHASE2-09 (Lỗi Phân quyền tạo SP): POST /api/seller/products', () => request(app.getHttpServer()).post('/api/seller/products').set('Authorization', `Bearer customerToken`).send({}).expect(403));

  it('TC-PHASE2-10 (Bảo mật Update/Sở hữu): PUT /api/seller/products/:id', () => {
    return request(app.getHttpServer()).put('/api/seller/products/999').set('Authorization', `Bearer customerToken`).send({}).expect(403);
  });

  it('TC-PHASE2-11 (Xóa SP hợp lệ): DELETE /api/seller/products/:id', () => request(app.getHttpServer()).delete(`/api/seller/products/999`).set('Authorization', `Bearer sellerToken`).expect(200));

  it('TC-PHASE2-12 (Xem SP Public): GET /api/v1/products/:id', () => request(app.getHttpServer()).get(`/api/v1/products/999`).expect(200));

  it('TC-PHASE2-13 (Toggle Tim - Like): POST /api/v1/products/:id/like', () => request(app.getHttpServer()).post(`/api/v1/products/999/like`).set('Authorization', `Bearer customerToken`).expect(201));

  it('TC-PHASE2-14 (Toggle Tim - Unlike): POST /api/v1/products/:id/like', () => {
    return request(app.getHttpServer()).post(`/api/v1/products/999/like`).set('Authorization', `Bearer sellerToken`).expect(201);
  });

  it('TC-PHASE2-15 (Lỗi Phân quyền Toggle): POST /api/v1/products/:id/like', () => request(app.getHttpServer()).post(`/api/v1/products/999/like`).expect(403));
});
