import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Flame, ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';
import { CategoryBar } from '../components/catalog/CategoryBar';
import { ProductCard } from '../components/catalog/ProductCard';
import { Category, ProductSPU } from '../types/catalog';
import CatalogService, { HomeBanner, FlashSaleItem } from '../services/catalog-service';
import { formatVND } from '../utils/format-currency';

export const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSaleItem[]>([]);
  const [dailyProducts, setDailyProducts] = useState<ProductSPU[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Đếm ngược thời gian Flash Sale
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [bannerRes, catRes, flashRes, dailyRes] = await Promise.all([
          CatalogService.getHomeBanners(),
          CatalogService.getCategories(),
          CatalogService.getFlashSale(),
          CatalogService.getDailyDiscover(1, 20),
        ]);

        setBanners(bannerRes);
        setCategories(catRes);
        setFlashSales(flashRes);
        setDailyProducts(dailyRes.data || []);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const formatTwoDigits = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="space-y-6 font-['Roboto',sans-serif]">
      {/* SECTION 1: HERO BANNERS KHUYẾN MÃI (GET /api/v1/home/banners) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Banner Chính Bên Trái */}
        <div className="md:col-span-2 relative rounded-xl overflow-hidden bg-gradient-to-r from-[#ee4d2d] via-orange-500 to-amber-500 text-white p-8 flex flex-col justify-between shadow-md min-h-[250px]">
          <div className="z-10">
            <span className="inline-flex items-center gap-1 bg-yellow-400 text-gray-900 font-extrabold text-xs px-3 py-1 rounded-full uppercase mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> Siêu Sale 8.8 Sắp Xuất Hiện
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 leading-tight drop-shadow-xs">
              Shopew Bao La Deal Đỉnh
            </h1>
            <p className="text-white/95 text-xs sm:text-sm max-w-md font-medium">
              Voucher Giảm 50% - Miễn Phí Vận Chuyển 0Đ - Đổi Trả Dễ Dàng Trong 7 Ngày
            </p>
          </div>
          <div className="z-10 pt-4">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-white text-[#ee4d2d] font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full hover:bg-gray-100 transition-all shadow-md w-fit cursor-pointer"
            >
              Săn Deal Ngay <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {banners[0] && (
            <img
              src={banners[0].imageUrl}
              alt={banners[0].title}
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
            />
          )}
        </div>

        {/* 2 Banner Phụ Bên Phải */}
        <div className="flex flex-col gap-3">
          <div className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white p-4 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">
            <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded w-fit uppercase tracking-wider">
              Shopee Mall
            </span>
            <div className="z-10">
              <h3 className="font-extrabold text-base">Thương Hiệu Chính Hãng</h3>
              <p className="text-xs text-white/80">Hoàn tiền 111% nếu phát hiện hàng giả</p>
            </div>
          </div>

          <div className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">
            <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded w-fit uppercase tracking-wider">
              Xu Hướng Bán Chạy
            </span>
            <div className="z-10">
              <h3 className="font-extrabold text-base">Top 100 Sản Phẩm Hot</h3>
              <p className="text-xs text-white/80">Cập nhật theo thời gian thực</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CATEGORY GRID BAR (GET /api/v1/categories) */}
      <CategoryBar categories={categories} />

      {/* SECTION 3: FLASH SALE SÔI ĐỘNG (GET /api/v1/home/flash-sale) */}
      <div className="bg-white rounded-xl shadow-xs p-4 sm:p-5 border border-gray-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[#ee4d2d] font-black text-xl tracking-tight italic">
              <Zap className="w-6 h-6 fill-[#ee4d2d]" />
              <span>FLASH SALE</span>
            </div>
            {/* Countdown Timer HH:MM:SS */}
            <div className="flex items-center gap-1 text-xs font-bold text-white">
              <span className="bg-gray-900 px-2 py-1 rounded-md">{formatTwoDigits(timeLeft.hours)}</span>:
              <span className="bg-gray-900 px-2 py-1 rounded-md">{formatTwoDigits(timeLeft.minutes)}</span>:
              <span className="bg-gray-900 px-2 py-1 rounded-md">{formatTwoDigits(timeLeft.seconds)}</span>
            </div>
          </div>
          <Link to="/search" className="text-xs text-[#ee4d2d] font-bold hover:underline flex items-center gap-0.5">
            Xem Tất Cả <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid Item Flash Sale */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {flashSales.slice(0, 5).map((fs) => {
            const soldPercent = Math.min(100, Math.round((fs.soldCount / (fs.soldCount + fs.stock)) * 100)) || 45;

            return (
              <Link
                key={fs.id}
                to={`/products/${fs.id}`}
                className="group block border border-gray-100 rounded-lg p-2.5 hover:shadow-md transition-all bg-white hover:-translate-y-0.5"
              >
                <div className="relative aspect-square overflow-hidden rounded-md mb-2 bg-gray-50">
                  <img
                    src={fs.thumbnailUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                    alt={fs.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {!!fs.discountPercentage && (
                    <span className="absolute top-1 right-1 bg-yellow-400 text-red-600 font-black text-[10px] px-1.5 py-0.5 rounded shadow-xs">
                      -{fs.discountPercentage}%
                    </span>
                  )}
                </div>
                <h4 className="text-xs text-gray-800 font-medium line-clamp-2 mb-1.5 group-hover:text-[#ee4d2d] h-8">
                  {fs.name}
                </h4>
                <div className="text-sm font-bold text-[#ee4d2d] mb-2">{formatVND(fs.priceMin)}</div>

                {/* Sold Progress Bar */}
                <div className="w-full bg-orange-100 rounded-full h-3.5 overflow-hidden relative border border-orange-200">
                  <div className="bg-[#ee4d2d] h-full rounded-full transition-all" style={{ width: `${soldPercent}%` }}></div>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-white uppercase tracking-wider drop-shadow-xs">
                    ĐÃ BÁN {fs.soldCount || 12}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: ALL PRODUCTS FEED / DAILY DISCOVER (GET /api/v1/home/daily-discover) */}
      <div>
        <div className="flex items-center justify-between mb-4 bg-white p-3.5 rounded-xl shadow-xs border-b-2 border-[#ee4d2d]">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#ee4d2d] fill-[#ee4d2d]" />
            <h2 className="font-extrabold text-gray-900 uppercase text-sm tracking-wide">GỢI Ý HÔM NAY</h2>
          </div>
          <span className="text-xs text-gray-500">Tất cả sản phẩm dành riêng cho bạn</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-gray-300 animate-bounce" />
            <span>Đang tải danh sách sản phẩm gợi ý...</span>
          </div>
        ) : dailyProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-xl border border-gray-100">
            Chưa có sản phẩm gợi ý nào.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {dailyProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
