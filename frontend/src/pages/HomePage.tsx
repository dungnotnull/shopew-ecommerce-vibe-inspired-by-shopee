import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Flame, ChevronRight } from 'lucide-react';
import { CategoryBar } from '../components/catalog/CategoryBar';
import { ProductCard } from '../components/catalog/ProductCard';
import { Category, ProductSPU } from '../types/catalog';
import CatalogService from '../services/catalog-service';
import { formatVND } from '../utils/format-currency';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductSPU[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [catData, searchRes] = await Promise.all([
          CatalogService.getCategories(),
          CatalogService.searchProducts({}),
        ]);
        setCategories(catData);
        setProducts(searchRes.data);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Block Banner Trang Chủ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Banner Chính bên trái */}
        <div className="md:col-span-2 relative rounded-lg overflow-hidden bg-gradient-to-r from-[#ee4d2d] to-orange-500 text-white p-8 flex flex-col justify-between shadow-sm min-h-[240px]">
          <div>
            <span className="inline-block bg-yellow-400 text-gray-900 font-bold text-xs px-2.5 py-1 rounded-full uppercase mb-3">
              Siêu Sale Hàng Tháng
            </span>
            <h1 className="text-3xl font-extrabold mb-2 leading-tight">Shopew Bao La Deal 8.8</h1>
            <p className="text-white/90 text-sm max-w-md">
              Miễn Phí Vận Chuyển 0Đ - Voucher Giảm 50% - Đổi Trả Dễ Dàng Trong 7 Ngày
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 bg-white text-[#ee4d2d] font-bold text-sm px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors w-fit shadow"
          >
            Mua Ngay <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 2 Banner phụ bên phải */}
        <div className="flex flex-col gap-3">
          <div className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white p-4 rounded-lg flex flex-col justify-between shadow-sm">
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded w-fit">Shopee Mall</span>
            <h3 className="font-bold text-lg">Thương Hiệu Chính Hãng</h3>
            <p className="text-xs text-white/80">Hoàn tiền 111% nếu hàng giả</p>
          </div>
          <div className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-lg flex flex-col justify-between shadow-sm">
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded w-fit">Xu Hướng</span>
            <h3 className="font-bold text-lg">Top Sản Phẩm Bán Chạy</h3>
            <p className="text-xs text-white/80">Cập nhật mỗi ngày</p>
          </div>
        </div>
      </div>

      {/* Thanh Danh Mục Sản Phẩm (Category Tree Bar) */}
      <CategoryBar categories={categories} />

      {/* Widget Flash Sale */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[#ee4d2d] font-black text-xl tracking-tight">
              <Zap className="w-6 h-6 fill-[#ee4d2d]" />
              <span>FLASH SALE</span>
            </div>
            {/* Đếm ngược thời gian */}
            <div className="flex items-center gap-1 text-xs font-bold text-white">
              <span className="bg-gray-900 px-2 py-1 rounded">02</span>:
              <span className="bg-gray-900 px-2 py-1 rounded">45</span>:
              <span className="bg-gray-900 px-2 py-1 rounded">12</span>
            </div>
          </div>
          <Link to="/search" className="text-xs text-[#ee4d2d] font-medium hover:underline flex items-center">
            Xem Tất Cả <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Danh sách Flash Sale Item */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {products.slice(0, 4).map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="group block border border-gray-100 rounded-md p-2 hover:shadow-md transition-shadow bg-white">
              <div className="relative aspect-square overflow-hidden rounded mb-2 bg-gray-100">
                <img src={p.images?.[0] || ''} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                {!!p.discountPercentage && (
                  <span className="absolute top-1 right-1 bg-yellow-400 text-red-600 font-bold text-[10px] px-1.5 py-0.5 rounded">
                    -{p.discountPercentage}%
                  </span>
                )}
              </div>
              <h4 className="text-xs text-gray-800 font-medium line-clamp-2 mb-1.5 group-hover:text-[#ee4d2d]">{p.name}</h4>
              <div className="text-sm font-bold text-[#ee4d2d]">{formatVND(p.priceMin)}</div>
              <div className="mt-2 w-full bg-orange-100 rounded-full h-3 overflow-hidden relative">
                <div className="bg-[#ee4d2d] h-full rounded-full" style={{ width: '65%' }}></div>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white uppercase">
                  Đã Bán 65%
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Danh Sách Sản Phẩm Gợi Ý (Product Feed) */}
      <div>
        <div className="flex items-center gap-2 mb-4 bg-white p-3 rounded-lg shadow-sm border-b-2 border-[#ee4d2d]">
          <Flame className="w-5 h-5 text-[#ee4d2d]" />
          <h2 className="font-bold text-gray-800 uppercase text-sm">GỢI Ý HÔM NAY</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Đang tải sản phẩm gợi ý...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
