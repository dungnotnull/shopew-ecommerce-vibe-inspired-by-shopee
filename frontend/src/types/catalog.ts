// Types cho Category Tree
export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  attributes?: Record<string, string>;
  children?: Category[];
  iconUrl?: string;
}

// Types cho SPU & SKU Architecture
export interface VariantGroup {
  name: string;
  options: string[];
}

export interface SKU {
  id: number;
  tierIndex: number[]; // e.g. [0, 1] -> VariantGroup 0 option 0, VariantGroup 1 option 1
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  isDiscount?: boolean;
  stock: number;
  thumbnailUrl?: string;
  skuCode?: string;
}

export interface ProductSPU {
  id: number;
  name: string;
  description?: string;
  categoryId?: number;
  priceMin: number;
  priceMax: number;
  promotionalPrice?: number;
  discountPercentage?: number;
  isMall: boolean;
  isPreferred: boolean;
  soldCount: number;
  rating: number;
  likeCount: number;
  viewCount?: number;
  isLiked?: boolean;
  images?: string[];
  attributes?: Record<string, string>;
  variantGroups: VariantGroup[];
  skus: SKU[];
  shopId?: number;
  shopName?: string;
  createdAt?: string;
}

// Types cho Shop Profile
export interface ShopProfile {
  id: number;
  name: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  isMall: boolean;
  isPreferred: boolean;
  rating: number;
  totalProducts: number;
  responseRate?: number;
  joinedDate?: string;
}

// Search Query Parameters & Facets (Phase 3 format)
export interface SearchParams {
  q?: string;
  category_id?: number;
  price_min?: number;
  price_max?: number;
  rating?: number;
  isMall?: boolean;
  isPreferred?: boolean;
  sort?: 'relevance' | 'sold' | 'newest' | 'price';
  order?: 'asc' | 'desc';
  attributes?: Record<string, string>;
  page?: number;
  limit?: number;
}

export interface SearchFacets {
  brands?: string[];
  locations?: string[];
  dynamicAttributes?: {
    name: string;
    values: string[];
  }[];
}

export interface SearchResult {
  data: ProductSPU[];
  facets?: SearchFacets;
  categoryBreadcrumbs?: { id: number; name: string }[];
  total: number;
}
