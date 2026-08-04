import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Flame, ChevronRight, ShoppingBag, ChevronLeft } from 'lucide-react';
import { CatalogService, HomeBanner, FlashSaleItem } from '../services/catalog-service';
import { Category, ProductSPU } from '../types/catalog';
import { CategoryBar } from '../components/catalog/CategoryBar';
import { ProductCard } from '../components/catalog/ProductCard';
import { formatVND } from '../utils/format-currency';

// Inline Hero Banner Carousel Component
const HeroBannerCarousel: React.FC<{ banners: HomeBanner[] }> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full h-48 sm:h-64 md:h-80 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-md">
        Shopew Siêu Sale Đại Hội 8.8
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden rounded-2xl shadow-md group bg-gray-900">
      {banners.map((banner, idx) => (
        <a
          key={banner.id}
          href={banner.linkUrl || '#'}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 sm:p-6">
            <h3 className="text-white font-bold text-base sm:text-xl drop-shadow-md">{banner.title}</h3>
          </div>
        </a>
      ))}

      {/* Slide Navigation Buttons */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
              idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSaleItem[]>([]);
  const [dailyProducts, setDailyProducts] = useState<ProductSPU[]>([]);
  const [dailyPage, setDailyPage] = useState<number>(1);
  const [dailyTotalPages, setDailyTotalPages] = useState<number>(1);
  const [dailyLoading, setDailyLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Countdown timer cho Flash Sale (Đếm ngược 04 giờ : 12 phút : 45 giây)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 12, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Lấy dữ liệu Daily Discover theo số trang (Tối đa 20 sản phẩm/trang theo backend)
  const fetchDailyProducts = async (page: number) => {
    setDailyLoading(true);
    try {
      const discoverRes = await CatalogService.getDailyDiscover(page, 20);
      setDailyProducts(discoverRes.data || []);
      const totalPages = discoverRes.totalPages || Math.ceil((discoverRes.total || 0) / 20) || 1;
      setDailyTotalPages(totalPages);
      setDailyPage(page);
    } catch {
      setDailyProducts([]);
    } finally {
      setDailyLoading(false);
    }
  };

  // Call 4 API Backend song song nạp trang chủ:
  // 1. GET /api/v1/home/banners
  // 2. GET /api/v1/categories
  // 3. GET /api/v1/home/flash-sale
  // 4. GET /api/v1/home/daily-discover (limit = 20)
  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [bannerRes, catRes, flashRes, discoverRes] = await Promise.all([
          CatalogService.getHomeBanners(),
          CatalogService.getCategories(),
          CatalogService.getFlashSale(),
          CatalogService.getDailyDiscover(1, 20),
        ]);

        setBanners(bannerRes);
        setCategories(catRes);
        setFlashSales(flashRes);
        setDailyProducts(discoverRes.data || []);
        const totalPages = discoverRes.totalPages || Math.ceil((discoverRes.total || 0) / 20) || 1;
        setDailyTotalPages(totalPages);
        setDailyPage(1);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Chuyển trang Gợi Ý Hôm Nay
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > dailyTotalPages || newPage === dailyPage) return;
    fetchDailyProducts(newPage);
    // Cuộn nhẹ lên tiêu đề Gợi Ý Hôm Nay
    const element = document.getElementById('daily-discover-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatTwoDigits = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-6 font-['Roboto',sans-serif]">
      {/* SECTION 1: HERO BANNERS (GET /api/v1/home/banners) */}
      <div className="space-y-4">
        <HeroBannerCarousel banners={banners} />

        {/* Sub Banners Widget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-4 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">
            <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded w-fit uppercase tracking-wider">
              Khuyến Mãi Đặc Biệt
            </span>
            <div className="z-10 mt-2">
              <h3 className="font-extrabold text-base">Voucher Độc Quyền 50K</h3>
              <p className="text-xs text-white/80">Áp dụng cho đơn hàng đầu tiên</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">
            <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded w-fit uppercase tracking-wider">
              Giao Hàng Miễn Phí
            </span>
            <div className="z-10 mt-2">
              <h3 className="font-extrabold text-base">Freeship Extra Xtra</h3>
              <p className="text-xs text-white/80">Cho tất cả đơn hàng từ 0đ</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">
            <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded w-fit uppercase tracking-wider">
              Shopee Mall
            </span>
            <div className="z-10 mt-2">
              <h3 className="font-extrabold text-base">100% Hàng Chính Hãng</h3>
              <p className="text-xs text-white/80">Hoàn tiền 111% nếu phát hiện giả</p>
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
        {flashSales.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">Đang cập nhật danh sách Flash Sale...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {flashSales.slice(0, 6).map((fs) => {
              const displayPrice = fs.promotionalPrice || fs.priceMin;
              const soldPercent = fs.stock > 0
                ? Math.min(100, Math.round((fs.soldCount / (fs.soldCount + fs.stock)) * 100))
                : 85;

              return (
                <Link
                  key={fs.id}
                  to={`/products/${fs.id}`}
                  className="group block border border-gray-100 rounded-lg p-2.5 hover:shadow-md transition-all bg-white hover:-translate-y-0.5"
                >
                  <div className="relative aspect-square overflow-hidden rounded-md mb-2 bg-gray-50">
                    <img
                      src={
                        (Array.isArray((fs as any).images) && (fs as any).images.length > 0)
                          ? (fs as any).images[0]
                          : (fs.thumbnailUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400')
                      }
                      alt={fs.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {!!fs.discountPercentage && fs.discountPercentage > 0 && (
                      <span className="absolute top-1 right-1 bg-yellow-400 text-red-600 font-black text-[10px] px-1.5 py-0.5 rounded shadow-xs">
                        -{fs.discountPercentage}%
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs text-gray-800 font-medium line-clamp-2 mb-1.5 group-hover:text-[#ee4d2d] h-8">
                    {fs.name}
                  </h4>
                  <div className="text-sm font-bold text-[#ee4d2d] mb-2">{formatVND(displayPrice)}</div>

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
        )}
      </div>

      {/* SECTION 4: ALL PRODUCTS FEED / DAILY DISCOVER (GET /api/v1/home/daily-discover - 20 sản phẩm/trang theo backend) */}
      <div id="daily-discover-section">
        <div className="flex items-center justify-between mb-4 bg-white p-3.5 rounded-xl shadow-xs border-b-2 border-[#ee4d2d]">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#ee4d2d] fill-[#ee4d2d]" />
            <h2 className="font-extrabold text-gray-900 uppercase text-sm tracking-wide">GỢI Ý HÔM NAY</h2>
          </div>
          <span className="text-xs text-gray-500">
            Tối đa 20 sản phẩm/trang • Trang {dailyPage} / {dailyTotalPages}
          </span>
        </div>

        {loading || dailyLoading ? (
          <div className="p-12 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-gray-300 animate-bounce" />
            <span>Đang tải danh sách sản phẩm gợi ý...</span>
          </div>
        ) : dailyProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-xl border border-gray-100">
            Chưa có sản phẩm gợi ý nào.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {dailyProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Thanh Phân Trang 10 Sản Phẩm / Trang */}
            {dailyTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => handlePageChange(dailyPage - 1)}
                  disabled={dailyPage <= 1}
                  className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-[#ee4d2d] hover:border-[#ee4d2d] disabled:opacity-40 disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition cursor-pointer disabled:cursor-not-allowed bg-white"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: dailyTotalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 rounded-lg font-bold text-xs transition cursor-pointer ${
                      pageNum === dailyPage
                        ? 'bg-[#ee4d2d] text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-[#ee4d2d] hover:text-[#ee4d2d]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(dailyPage + 1)}
                  disabled={dailyPage >= dailyTotalPages}
                  className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-[#ee4d2d] hover:border-[#ee4d2d] disabled:opacity-40 disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition cursor-pointer disabled:cursor-not-allowed bg-white"
                  title="Trang sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
