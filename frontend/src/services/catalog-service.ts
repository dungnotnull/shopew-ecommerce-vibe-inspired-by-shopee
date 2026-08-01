import { apiClient } from './api-client';
import { Category, ProductSPU, SearchParams, SearchResult, ShopProfile } from '../types/catalog';

export interface HomeBanner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  sortOrder: number;
}

export interface FlashSaleItem {
  id: number;
  name: string;
  priceMin: number;
  priceMax: number;
  promotionalPrice?: number;
  discountPercentage: number;
  soldCount: number;
  stock: number;
  thumbnailUrl: string | null;
}

// Mock Categories Tree Fallback
const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Thời Trang Nam',
    parentId: null,
    children: [
      { id: 11, name: 'Áo Thun Nam', parentId: 1, children: [] },
      { id: 12, name: 'Áo Sơ Mi Nam', parentId: 1, children: [] },
      { id: 13, name: 'Quần Jean Nam', parentId: 1, children: [] },
    ],
  },
  {
    id: 2,
    name: 'Điện Thoại & Phụ Kiện',
    parentId: null,
    children: [
      { id: 21, name: 'Điện Thoại Di Động', parentId: 2, children: [] },
      { id: 22, name: 'Tai Nghe Bluetooth', parentId: 2, children: [] },
      { id: 23, name: 'Ốp Lưng & Phụ Kiện', parentId: 2, children: [] },
    ],
  },
  {
    id: 3,
    name: 'Thời Trang Nữ',
    parentId: null,
    children: [
      { id: 31, name: 'Đầm & Váy', parentId: 3, children: [] },
      { id: 32, name: 'Kẹp Tóc & Trang Sức', parentId: 3, children: [] },
    ],
  },
  {
    id: 4,
    name: 'Nhà Cửa & Đời Sống',
    parentId: null,
    children: [
      { id: 41, name: 'Dụng Cụ Bếp', parentId: 4, children: [] },
      { id: 42, name: 'Trang Trí Phòng', parentId: 4, children: [] },
    ],
  },
];

// Mock Products List Fallback
const mockProducts: ProductSPU[] = [
  {
    id: 101,
    name: 'iPhone 15 Pro Max 256GB - Hàng Chính Hãng VN/A',
    description: 'Chíp A17 Pro siêu mạnh mẽ, Khung Vỏ Titanium siêu nhẹ bền bỉ, Camera 48MP Zoom 5x ấn tượng.',
    categoryId: 21,
    priceMin: 29990000,
    priceMax: 34990000,
    discountPercentage: 14,
    isMall: true,
    isPreferred: false,
    soldCount: 5420,
    rating: 4.9,
    likeCount: 1420,
    isLiked: false,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    ],
    attributes: {
      'Thương hiệu': 'Apple',
      'Dung lượng': '256GB',
      'Xuất xứ': 'Mỹ',
      'Bảo hành': '12 Tháng Chính Hãng',
    },
    variantGroups: [
      { name: 'Màu sắc', options: ['Titan Tự Nhiên', 'Titan Xanh', 'Titan Đen'] },
      { name: 'Dung lượng', options: ['256GB', '512GB'] },
    ],
    skus: [
      { id: 1001, tierIndex: [0, 0], price: 29990000, originalPrice: 34990000, stock: 45, thumbnailUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500' },
      { id: 1002, tierIndex: [0, 1], price: 34990000, originalPrice: 38990000, stock: 20, thumbnailUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500' },
      { id: 1003, tierIndex: [1, 0], price: 29990000, originalPrice: 34990000, stock: 15, thumbnailUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500' },
      { id: 1004, tierIndex: [2, 0], price: 29990000, originalPrice: 34990000, stock: 30, thumbnailUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500' },
    ],
    shopId: 1,
    shopName: 'Apple Flagship Store',
  },
  {
    id: 102,
    name: 'Kẹp Tóc 15 Chi Tiết Kèm Hộp Đựng Dễ Thương HelloKitty',
    description: 'Bộ kẹp tóc nhiều chi tiết sắc màu rực rỡ kèm hộp xinh xắn thích hợp cho bé gái và bạn nữ dễ thương.',
    categoryId: 32,
    priceMin: 19000,
    priceMax: 60000,
    discountPercentage: 24,
    isMall: false,
    isPreferred: true,
    soldCount: 18500,
    rating: 4.8,
    likeCount: 890,
    isLiked: true,
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    ],
    attributes: {
      'Chất liệu': 'Nhựa cao cấp + Hợp kim',
      'Xuất xứ': 'Trung Quốc',
    },
    variantGroups: [
      { name: 'Mẫu', options: ['Set 15 Kẹp Kitty', 'Set 19 Kẹp Lợn Hồng', 'Kẹp 13ct HelloKitty Đỏ'] },
    ],
    skus: [
      { id: 1005, tierIndex: [0], price: 19000, originalPrice: 25000, stock: 150, thumbnailUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500' },
      { id: 1006, tierIndex: [1], price: 35000, originalPrice: 45000, stock: 80, thumbnailUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500' },
      { id: 1007, tierIndex: [2], price: 60000, originalPrice: 75000, stock: 25, thumbnailUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500' },
    ],
    shopId: 2,
    shopName: 'Xưởng Phụ Kiện Giá Sỉ',
  },
  {
    id: 103,
    name: 'Tai Nghe Bluetooth Không Dây Âm Thanh Bass Trầm Ấm TWS Pro 5',
    description: 'Tai nghe Bluetooth TWS chống ồn chủ động, thời lượng pin 24 giờ liên tục kèm hộp sạc nhanh.',
    categoryId: 22,
    priceMin: 299000,
    priceMax: 299000,
    discountPercentage: 50,
    isMall: true,
    isPreferred: false,
    soldCount: 3200,
    rating: 4.7,
    likeCount: 310,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    ],
    attributes: {
      'Kết nối': 'Bluetooth 5.3',
      'Thời lượng pin': '24 Giờ',
    },
    variantGroups: [], // Default SKU
    skus: [
      { id: 1008, tierIndex: [], price: 299000, originalPrice: 599000, stock: 200 },
    ],
    shopId: 3,
    shopName: 'Shopee Official Store',
  },
  {
    id: 104,
    name: 'Áo Phông Nam Oversize chất liệu Cotton 100% Co Giãn 4 Chiều',
    description: 'Áo thun nam phong cách streetwear trẻ trung năng động, thấm hút mồ hôi cực tốt.',
    categoryId: 11,
    priceMin: 149000,
    priceMax: 179000,
    discountPercentage: 32,
    isMall: false,
    isPreferred: true,
    soldCount: 8900,
    rating: 4.9,
    likeCount: 2400,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
    ],
    attributes: {
      'Chất liệu': '100% Cotton',
      'Kiểu cổ': 'Cổ Tròn',
    },
    variantGroups: [
      { name: 'Màu sắc', options: ['Đen', 'Trắng'] },
      { name: 'Size', options: ['M', 'L', 'XL'] },
    ],
    skus: [
      { id: 1009, tierIndex: [0, 0], price: 149000, originalPrice: 220000, stock: 99 },
      { id: 1010, tierIndex: [0, 1], price: 159000, originalPrice: 230000, stock: 50 },
      { id: 1011, tierIndex: [1, 0], price: 149000, originalPrice: 220000, stock: 75 },
    ],
    shopId: 4,
    shopName: 'Coolmate Fashion',
  },
];

const mockBanners: HomeBanner[] = [
  {
    id: 1,
    title: 'Siêu Sale Thời Trang 8.8',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
    linkUrl: '/search',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 2,
    title: 'Thương Hiệu Chính Hãng Shopee Mall',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
    linkUrl: '/search?isMall=true',
    isActive: true,
    sortOrder: 2,
  },
];

export const CatalogService = {
  // 1. Lấy danh sách Banners Trang Chủ: GET /api/v1/home/banners
  async getHomeBanners(): Promise<HomeBanner[]> {
    try {
      const response = await apiClient.get('/v1/home/banners');
      return response.data.data || response.data;
    } catch {
      return mockBanners;
    }
  },

  // 2. Lấy danh sách Flash Sale Trang Chủ: GET /api/v1/home/flash-sale
  async getFlashSale(): Promise<FlashSaleItem[]> {
    try {
      const response = await apiClient.get('/v1/home/flash-sale');
      const resData = response.data;
      let items: FlashSaleItem[] = [];
      if (Array.isArray(resData)) items = resData;
      else if (Array.isArray(resData?.data) && Array.isArray(resData.data)) items = resData.data;
      else if (Array.isArray(resData?.data?.data)) items = resData.data.data;

      if (items && items.length > 0) return items;

      // Fallback hiển thị sản phẩm Flash Sale nếu DB chưa có sản phẩm giảm giá
      return mockProducts.map(p => ({
        id: p.id,
        name: p.name,
        priceMin: p.priceMin,
        priceMax: p.priceMax,
        promotionalPrice: p.promotionalPrice,
        discountPercentage: p.discountPercentage || 20,
        soldCount: p.soldCount || 45,
        stock: 100,
        thumbnailUrl: p.images?.[0] || '',
      }));
    } catch {
      return mockProducts.map(p => ({
        id: p.id,
        name: p.name,
        priceMin: p.priceMin,
        priceMax: p.priceMax,
        promotionalPrice: p.promotionalPrice,
        discountPercentage: p.discountPercentage || 20,
        soldCount: p.soldCount || 45,
        stock: 100,
        thumbnailUrl: p.images?.[0] || '',
      }));
    }
  },

  // 3. Lấy sản phẩm Gợi ý hôm nay / All Products: GET /api/v1/home/daily-discover
  async getDailyDiscover(page = 1, limit = 20): Promise<SearchResult> {
    try {
      const response = await apiClient.get('/v1/home/daily-discover', { params: { page, limit } });
      return response.data;
    } catch {
      return {
        data: mockProducts,
        total: mockProducts.length,
        facets: { brands: [], locations: [], dynamicAttributes: [] },
      };
    }
  },

  // 4. Lấy cây danh mục sản phẩm: GET /api/v1/categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get('/v1/categories');
      return response.data.data || response.data;
    } catch {
      return mockCategories;
    }
  },

  // Tạo mới Danh mục sản phẩm (Role Seller / Admin)
  async createCategory(data: { name: string; parentId?: number | null; attributes?: any }): Promise<Category> {
    try {
      const response = await apiClient.post('/v1/categories', data);
      return response.data.data || response.data;
    } catch {
      const newCat: Category = {
        id: Date.now(),
        name: data.name,
        parentId: data.parentId || null,
        children: [],
      };
      return newCat;
    }
  },

  // Cập nhật Danh mục sản phẩm (Role Admin)
  async updateCategory(id: number, data: { name?: string; parentId?: number | null; attributes?: any }): Promise<Category> {
    try {
      const response = await apiClient.put(`/v1/categories/${id}`, data);
      return response.data.data || response.data;
    } catch {
      return { id, name: data.name || 'Danh Mục', parentId: data.parentId || null, children: [] };
    }
  },

  // Xóa Danh mục sản phẩm (Role Admin)
  async deleteCategory(id: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/v1/categories/${id}`);
    return response.data;
  },

  // 5. Tìm kiếm sản phẩm nâng cao
  async searchProducts(params: SearchParams): Promise<SearchResult> {
    try {
      const response = await apiClient.get('/v1/products/search', { params });
      return response.data;
    } catch {
      let filtered = [...mockProducts];

      if (params.q) {
        const query = params.q.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
      }
      if (params.category_id) {
        filtered = filtered.filter(p => p.categoryId === Number(params.category_id));
      }
      if (params.isMall) {
        filtered = filtered.filter(p => p.isMall);
      }
      if (params.isPreferred) {
        filtered = filtered.filter(p => p.isPreferred);
      }
      if (params.price_min) {
        filtered = filtered.filter(p => p.priceMin >= Number(params.price_min));
      }
      if (params.price_max) {
        filtered = filtered.filter(p => p.priceMax <= Number(params.price_max));
      }
      if (params.rating) {
        filtered = filtered.filter(p => p.rating >= Number(params.rating));
      }

      if (params.sort === 'sold') {
        filtered.sort((a, b) => b.soldCount - a.soldCount);
      } else if (params.sort === 'price') {
        if (params.order === 'desc') {
          filtered.sort((a, b) => b.priceMin - a.priceMin);
        } else {
          filtered.sort((a, b) => a.priceMin - b.priceMin);
        }
      }

      return {
        data: filtered,
        total: filtered.length,
        facets: {
          brands: ['Apple', 'Coolmate', 'TWS', 'HelloKitty'],
          locations: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
          dynamicAttributes: [
            { name: 'Thương hiệu', values: ['Apple', 'Coolmate'] },
            { name: 'Chất liệu', values: ['Cotton', 'Nhựa cao cấp'] },
          ],
        },
        categoryBreadcrumbs: [
          { id: 1, name: 'Trang chủ' },
          { id: 2, name: 'Kết quả tìm kiếm' },
        ],
      };
    }
  },

  // 6. Lấy chi tiết SPU và các SKU phân loại: GET /api/v1/products/:id
  async getProductById(id: number): Promise<ProductSPU | null> {
    try {
      const response = await apiClient.get(`/v1/products/${id}`);
      const data = response.data.data || response.data;
      if (data) {
        // Chuẩn hóa tên Shop từ relation shop { id, name }
        if (data.shop && data.shop.name && !data.shopName) {
          data.shopName = data.shop.name;
        }
        // Chuẩn hóa variantGroups nếu backend trả về options dưới dạng mảng object { value }
        if (data.variantGroups && Array.isArray(data.variantGroups)) {
          data.variantGroups = data.variantGroups.map((vg: any) => ({
            name: vg.name,
            options: (vg.options || []).map((opt: any) =>
              typeof opt === 'object' && opt !== null ? opt.value : opt
            ),
          }));
        }
        // Chuẩn hóa tierIndex nếu backend lưu dạng JSON String
        if (data.skus && Array.isArray(data.skus)) {
          data.skus = data.skus.map((sku: any) => ({
            ...sku,
            tierIndex: typeof sku.tierIndex === 'string' ? JSON.parse(sku.tierIndex) : sku.tierIndex || [],
          }));
        }
      }
      return data;
    } catch {
      const found = mockProducts.find(p => p.id === Number(id));
      return found || mockProducts[0];
    }
  },

  // 7. Lấy danh sách sản phẩm của Seller hiện tại: GET /api/seller/products
  async getSellerProducts(): Promise<ProductSPU[]> {
    try {
      const response = await apiClient.get('/seller/products');
      const resData = response.data;
      let rawList: any[] = [];
      if (Array.isArray(resData)) rawList = resData;
      else if (Array.isArray(resData?.data) && Array.isArray(resData.data)) rawList = resData.data;
      else if (Array.isArray(resData?.data?.data)) rawList = resData.data.data;

      return rawList.map((p: any) => ({
        ...p,
        name: p.name || 'Sản phẩm',
        variantGroups: (p.variantGroups || []).map((vg: any) => ({
          name: vg.name,
          options: (vg.options || []).map((opt: any) =>
            typeof opt === 'object' && opt !== null ? (opt.value !== undefined ? opt.value : opt) : opt
          ),
        })),
        skus: (p.skus || []).map((sku: any) => ({
          ...sku,
          tierIndex: typeof sku.tierIndex === 'string' ? JSON.parse(sku.tierIndex) : (sku.tierIndex || []),
        })),
      }));
    } catch {
      return mockProducts;
    }
  },

  // Seller Cập nhật sản phẩm SPU & SKUs: PUT /api/seller/products/:id
  async updateSellerProduct(id: number, data: Partial<ProductSPU>): Promise<ProductSPU> {
    try {
      const response = await apiClient.put(`/seller/products/${id}`, data);
      return response.data.data || response.data;
    } catch {
      return { id, ...data } as ProductSPU;
    }
  },

  // Seller Xóa sản phẩm SPU: DELETE /api/seller/products/:id
  async deleteSellerProduct(id: number): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete(`/seller/products/${id}`);
      return response.data.data || response.data;
    } catch {
      return { success: true };
    }
  },

  // Yêu thích sản phẩm (Wishlist toggle)
  async toggleLikeProduct(productId: number): Promise<{ liked: boolean }> {
    try {
      const response = await apiClient.post(`/v1/products/${productId}/like`);
      return response.data.data || response.data;
    } catch {
      const p = mockProducts.find(item => item.id === productId);
      if (p) {
        p.isLiked = !p.isLiked;
        p.likeCount += p.isLiked ? 1 : -1;
        return { liked: p.isLiked };
      }
      return { liked: true };
    }
  },

  // Lấy thông tin Shop Profile
  async getShopById(shopId: number): Promise<ShopProfile | null> {
    try {
      const response = await apiClient.get(`/v1/shops/${shopId}`);
      return response.data.data || response.data;
    } catch {
      return {
        id: shopId,
        name: 'Shopew Official Flagship Store',
        description: 'Cửa hàng phân phối chính hãng các mặt hàng công nghệ, thời trang và đời sống hàng đầu Shopew.',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        bannerUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200',
        isMall: true,
        isPreferred: true,
        rating: 4.9,
        totalProducts: 124,
        responseRate: 99,
        joinedDate: '3 năm trước',
      };
    }
  },

  // Seller tạo SPU & SKUs mới: POST /api/seller/products
  async createSellerProduct(data: Partial<ProductSPU>): Promise<ProductSPU> {
    const response = await apiClient.post('/seller/products', data);
    return response.data.data || response.data;
  },
};

export default CatalogService;
