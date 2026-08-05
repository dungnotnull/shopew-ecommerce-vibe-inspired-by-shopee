import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShieldCheck, Store, MessageCircle, Package } from 'lucide-react';
import { ShopProfile, ProductSPU } from '../types/catalog';
import CatalogService from '../services/catalog-service';
import { ProductCard } from '../components/catalog/ProductCard';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { ShopeePagination } from '../components/common/ShopeePagination';
import { Voucher, voucherService } from '../services/voucher-service';
import { VoucherCarousel } from '../components/vouchers/VoucherCarousel';

export const ShopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [products, setProducts] = useState<ProductSPU[]>([]);
  const [shopVouchers, setShopVouchers] = useState<Voucher[]>([]);
  const [savedVoucherIds, setSavedVoucherIds] = useState<number[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchShopProducts = async (pageNum: number) => {
    const searchRes = await CatalogService.searchProducts({ page: pageNum, limit: 20 });
    setProducts(searchRes.data || []);
    setTotalPages(searchRes.totalPages || Math.ceil((searchRes.total || 0) / 20) || 1);
    setPage(pageNum);
  };

  useEffect(() => {
    const fetchShopData = async () => {
      setLoading(true);
      const shopId = id ? Number(id) : 1;
      const profile = await CatalogService.getShopById(shopId);
      await fetchShopProducts(1);
      setShop(profile);

      // Nạp danh sách Voucher của Shop này
      const vouchers = await voucherService.getPublicShopVouchers(shopId);
      setShopVouchers(vouchers);

      // Nạp mảng ID voucher đã lưu trong Ví của User
      try {
        const wallet = await voucherService.getWalletVouchers();
        setSavedVoucherIds(wallet.map((v) => v.id));
      } catch {
        // Ignore
      }

      setLoading(false);
    };

    fetchShopData();
  }, [id]);

  if (loading || !shop) {
    return (
      <CustomerLayout>
        <div className="min-h-[50vh] flex items-center justify-center text-gray-500 text-sm">
          Đang tải thông tin Shop...
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Banner & Header Shop Profile */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="h-36 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${shop.bannerUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200'})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="p-6 relative -mt-16 flex flex-col md:flex-row items-center justify-between gap-6 z-10">
            {/* Avatar & Details */}
            <div className="flex items-center gap-4 text-white md:text-gray-900">
              <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md bg-white">
                <img src={shop.avatarUrl} alt={shop.name} className="w-full h-full object-cover" />
              </div>
              <div className="bg-black/60 md:bg-transparent p-3 md:p-0 rounded-lg backdrop-blur-xs md:backdrop-blur-none">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{shop.name}</h1>
                  {shop.isMall && (
                    <span className="bg-[#d0011b] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">Mall</span>
                  )}
                  {shop.isPreferred && (
                    <span className="bg-[#ee4d2d] text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> Yêu thích
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-200 md:text-gray-500 mt-1">{shop.description}</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-6 text-xs text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 w-full md:w-auto justify-around">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 font-bold text-gray-900 text-sm">
                  <Package className="w-4 h-4 text-[#ee4d2d]" />
                  <span>{shop.totalProducts}</span>
                </div>
                <span className="text-gray-400">Sản phẩm</span>
              </div>

              <div className="text-center border-x border-gray-200 px-6">
                <div className="flex items-center justify-center gap-1 font-bold text-amber-500 text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{shop.rating}</span>
                </div>
                <span className="text-gray-400">Đánh giá</span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 font-bold text-gray-900 text-sm">
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  <span>{shop.responseRate}%</span>
                </div>
                <span className="text-gray-400">Tỷ lệ phản hồi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hàng Ngang Thẻ Voucher Của Shop (Carousel) */}
        {shopVouchers.length > 0 && (
          <VoucherCarousel
            vouchers={shopVouchers}
            title={`MÃ GIẢM GIÁ CỦA ${shop.name}`}
            subtitle="Lưu voucher để áp dụng khi thanh toán sản phẩm của shop"
            savedVoucherIds={savedVoucherIds}
            onVoucherSaved={async () => {
              try {
                const wallet = await voucherService.getWalletVouchers();
                setSavedVoucherIds(wallet.map((v) => v.id));
              } catch {
                // Ignore
              }
            }}
          />
        )}

        {/* Danh Sách Sản Phẩm Của Shop */}
        <div id="shop-products-section" className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-[#ee4d2d]" />
              <h2 className="font-bold text-gray-800 uppercase text-sm">TẤT CẢ SẢN PHẨM CỦA SHOP</h2>
            </div>
            <span className="text-xs text-gray-500">
              Tối đa 20 sản phẩm/trang • Trang {page} / {totalPages}
            </span>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            <ShopeePagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => {
                fetchShopProducts(newPage);
                const el = document.getElementById('shop-products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};
