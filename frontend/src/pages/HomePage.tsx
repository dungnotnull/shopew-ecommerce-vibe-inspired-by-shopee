import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Flame, ChevronRight } from 'lucide-react';
import { formatVND } from '../utils/format-currency';

// Trang Chủ Shopew (Customer Storefront)
export const HomePage: React.FC = () => {
  // Mock dữ liệu Sản phẩm gợi ý phù hợp chuẩn SPU & SKU
  const mockProducts = [
    {
      id: 101,
      name: 'iPhone 15 Pro Max 256GB - Hàng Chính Hãng VN/A',
      price: 29990000,
      originalPrice: 34990000,
      discountPercentage: 14,
      isMall: true,
      isPreferred: false,
      soldCount: 5420,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500'
    },
    {
      id: 102,
      name: 'Kẹp Tóc 15 Chi Tiết Kèm Hộp Đựng Dễ Thương HelloKitty',
      price: 19000,
      originalPrice: 25000,
      discountPercentage: 24,
      isMall: false,
      isPreferred: true,
      soldCount: 18500,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500'
    },
    {
      id: 103,
      name: 'Tai Nghe Bluetooth Không Dây Âm Thanh Bass Trầm Ấm',
      price: 299000,
      originalPrice: 599000,
      discountPercentage: 50,
      isMall: true,
      isPreferred: false,
      soldCount: 3200,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
    },
    {
      id: 104,
      name: 'Áo Phông Nam Oversize chất liệu Cotton 100% Co Giãn 4 Chiều',
      price: 149000,
      originalPrice: 220000,
      discountPercentage: 32,
      isMall: false,
      isPreferred: true,
      soldCount: 8900,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500'
    }
  ];

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
            <p className="text-white/90 text-sm max-w-md">Miễn Phí Vận Chuyển 0Đ - Voucher Giảm 50% - Đổi Trả Dễ Dàng Trong 7 Ngày</p>
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
          {mockProducts.slice(0, 4).map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="group block border border-gray-100 rounded-md p-2 hover:shadow-md transition-shadow bg-white">
              <div className="relative aspect-square overflow-hidden rounded mb-2 bg-gray-100">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <span className="absolute top-1 right-1 bg-yellow-400 text-red-600 font-bold text-[10px] px-1.5 py-0.5 rounded">
                  -{p.discountPercentage}%
                </span>
              </div>
              <h4 className="text-xs text-gray-800 font-medium line-clamp-2 mb-1.5 group-hover:text-[#ee4d2d]">{p.name}</h4>
              <div className="text-sm font-bold text-[#ee4d2d]">{formatVND(p.price)}</div>
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {mockProducts.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="bg-white rounded-md overflow-hidden border border-gray-100 hover:border-[#ee4d2d] hover:shadow-lg transition-all group flex flex-col justify-between">
              <div>
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  {/* Badge Shopee Mall / Yêu thích */}
                  <div className="absolute top-1 left-1 flex flex-col gap-1">
                    {p.isMall && (
                      <span className="bg-[#d0011b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">Shopee Mall</span>
                    )}
                    {p.isPreferred && (
                      <span className="bg-[#ee4d2d] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Yêu thích
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-2.5">
                  <h3 className="text-xs text-gray-800 line-clamp-2 mb-2 group-hover:text-[#ee4d2d]">{p.name}</h3>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-sm font-bold text-[#ee4d2d]">{formatVND(p.price)}</span>
                    <span className="text-[10px] text-gray-400 line-through">{formatVND(p.originalPrice)}</span>
                  </div>
                </div>
              </div>
              <div className="px-2.5 pb-2.5 text-[11px] text-gray-500 flex items-center justify-between border-t border-gray-50 pt-2 mt-1">
                <span>★ {p.rating}</span>
                <span>Đã bán {(p.soldCount / 1000).toFixed(1)}k</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
