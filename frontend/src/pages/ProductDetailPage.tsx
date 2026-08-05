import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Heart, Star, ShoppingCart, Store, Check, AlertCircle, Eye, Flame, CheckCircle2 } from 'lucide-react';
import { ProductSPU, SKU } from '../types/catalog';
import { formatVND } from '../utils/format-currency';
import CatalogService from '../services/catalog-service';
import { orderService } from '../services/order-service';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { ProductCard } from '../components/catalog/ProductCard';
import { ShopeePagination } from '../components/common/ShopeePagination';
import { useCartStore } from '../store/useCartStore';

export const ProductDetailPage: React.FC = () => {
  const { fetchCartCount } = useCartStore();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductSPU | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Variant Index Selection State (Array of option indices chosen for each VariantGroup)
  const [selectedTiers, setSelectedTiers] = useState<number[]>([]);
  const [activeSku, setActiveSku] = useState<SKU | null>(null);
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState<number>(1);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [cartSuccessMsg, setCartSuccessMsg] = useState<string>('');

  const handleAddToCart = async (redirectCart = false) => {
    if (!product || addingToCart) return;
    const targetSku = activeSku || product.skus?.[0];
    if (!targetSku) {
      alert('Sản phẩm tạm thời hết hàng hoặc chưa chọn phân loại.');
      return;
    }

    setAddingToCart(true);
    setCartSuccessMsg('');
    try {
      await orderService.addToCart({
        variantId: targetSku.id,
        quantity: quantity,
      });

      // Cập nhật lại số lượng badge trên Header ngay lập tức
      fetchCartCount();

      if (redirectCart) {
        navigate('/cart');
      } else {
        setCartSuccessMsg('Đã thêm sản phẩm vào Giỏ hàng!');
        setTimeout(() => setCartSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể thêm vào giỏ hàng. Vui lòng đăng nhập.';
      alert(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setAddingToCart(false);
    }
  };

  // State cho danh sách Sản phẩm Gợi ý (20 sản phẩm/trang)
  const [relatedProducts, setRelatedProducts] = useState<ProductSPU[]>([]);
  const [relatedPage, setRelatedPage] = useState<number>(1);
  const [relatedTotalPages, setRelatedTotalPages] = useState<number>(1);
  const [relatedLoading, setRelatedLoading] = useState<boolean>(false);

  const fetchRelatedProducts = async (pageNum: number) => {
    setRelatedLoading(true);
    try {
      const res = await CatalogService.getDailyDiscover(pageNum, 20);
      setRelatedProducts(res.data || []);
      const totalP = res.totalPages || Math.ceil((res.total || 0) / 20) || 1;
      setRelatedTotalPages(totalP);
      setRelatedPage(pageNum);
    } catch {
      setRelatedProducts([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const fetchDetail = async () => {
      setLoading(true);
      if (!id) return;
      const data = await CatalogService.getProductById(Number(id));
      if (data) {
        // Chuẩn hóa danh sách ảnh của SPU
        let parsedImages: string[] = [];
        if (Array.isArray(data.images)) {
          parsedImages = data.images;
        } else if (typeof data.images === 'string') {
          try {
            parsedImages = JSON.parse(data.images);
          } catch {
            parsedImages = [];
          }
        }

        // Nếu SPU chưa có mảng images, thu thập ảnh từ các SKU con
        if (parsedImages.length === 0 && data.skus && data.skus.length > 0) {
          const skuImages = data.skus.map(s => s.thumbnailUrl).filter(Boolean) as string[];
          if (skuImages.length > 0) {
            parsedImages = skuImages;
          }
        }

        data.images = parsedImages;
        setProduct(data);
        setIsLiked(!!data.isLiked);
        setLikeCount(data.likeCount || 0);

        const initialImage = parsedImages[0] || data.skus?.[0]?.thumbnailUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
        setSelectedImage(initialImage);

        // Khởi tạo mặc định chọn option đầu tiên cho mỗi Variant Group (nếu có)
        if (data.variantGroups && data.variantGroups.length > 0) {
          const initialTiers = data.variantGroups.map(() => 0);
          setSelectedTiers(initialTiers);
          findMatchingSku(data.skus, initialTiers, initialImage);
        } else {
          // Default SKU fallback khi không có variant groups
          setSelectedTiers([]);
          setActiveSku(data.skus[0] || null);
        }
      }
      setLoading(false);
    };

    fetchDetail();
    fetchRelatedProducts(1);
  }, [id]);

  // Tìm SKU khớp chính xác với mảng tierIndex được chọn
  const findMatchingSku = (skus: SKU[], tiers: number[], fallbackImg?: string) => {
    const match = skus.find(sku => {
      if (!sku.tierIndex || sku.tierIndex.length !== tiers.length) return false;
      return sku.tierIndex.every((val, idx) => val === tiers[idx]);
    });
    setActiveSku(match || null);
    if (match?.thumbnailUrl) {
      setSelectedImage(match.thumbnailUrl);
    } else if (fallbackImg) {
      setSelectedImage(fallbackImg);
    }
  };

  const handleSelectOption = (groupIndex: number, optionIndex: number) => {
    const newTiers = [...selectedTiers];
    newTiers[groupIndex] = optionIndex;
    setSelectedTiers(newTiers);

    if (product) {
      findMatchingSku(product.skus, newTiers);
    }
  };

  const handleToggleLike = async () => {
    if (!product) return;
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount(prev => prev + (newLiked ? 1 : -1));

    try {
      await CatalogService.toggleLikeProduct(product.id);
    } catch {
      setIsLiked(!newLiked);
      setLikeCount(prev => prev + (newLiked ? -1 : 1));
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="min-h-[60vh] flex items-center justify-center text-gray-500 font-medium text-sm">
          Đang tải chi tiết sản phẩm Shopew...
        </div>
      </CustomerLayout>
    );
  }

  if (!product) {
    return (
      <CustomerLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-bold text-gray-800">Không tìm thấy sản phẩm!</h2>
          <Link to="/" className="text-sm text-[#ee4d2d] underline">Trở về Trang chủ</Link>
        </div>
      </CustomerLayout>
    );
  }

  // Xác định Giá hiển thị: nếu đã chọn được SKU cụ thể -> lấy giá SKU, ngược lại lấy giá min-max của SPU
  const displayPrice = activeSku ? activeSku.price : product.priceMin;
  const displayOriginalPrice = activeSku?.originalPrice || (product.priceMax ? product.priceMax : undefined);
  const displayStock = activeSku ? activeSku.stock : (product.skus.reduce((acc, curr) => acc + curr.stock, 0));

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-[#ee4d2d]">Trang chủ</Link>
          <span>/</span>
          <Link to="/search" className="hover:text-[#ee4d2d]">Sản phẩm</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-md">{product.name}</span>
        </div>

        {/* Khối chính Chi Tiết Sản Phẩm */}
        <div className="bg-white rounded-lg shadow-sm p-6 grid grid-cols-1 md:grid-cols-12 gap-8 border border-gray-100">
          {/* Cột trái: Gallery Hình Ảnh */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isMall && (
                  <span className="bg-[#d0011b] text-white font-extrabold text-[10px] px-2 py-0.5 rounded-xs uppercase tracking-wider shadow">
                    Shopee Mall
                  </span>
                )}
                {product.isPreferred && (
                  <span className="bg-[#ee4d2d] text-white font-bold text-[10px] px-2 py-0.5 rounded-xs flex items-center gap-0.5 shadow">
                    <ShieldCheck className="w-3 h-3" /> Yêu thích
                  </span>
                )}
              </div>
            </div>

            {/* Sub-images thumbnail carousel */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded border-2 overflow-hidden flex-shrink-0 transition-all ${
                      selectedImage === img ? 'border-[#ee4d2d]' : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cột phải: Thông tin SPU, 2-Tier SKUs Selector, Buttons */}
          <div className="md:col-span-7 space-y-5">
            {/* Tên sản phẩm */}
            <h1 className="text-xl font-bold text-gray-900 leading-snug">
              {product.name}
            </h1>

            {/* Metrics: Đánh giá, Lượt bán, Lượt yêu thích, Lượt xem */}
            <div className="flex flex-wrap items-center gap-4 text-xs divide-x divide-gray-200 pt-1">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <span className="underline">{product.rating}</span>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>

              <div className="pl-4 text-gray-600">
                <span className="font-bold text-gray-900">{product.soldCount}</span> Đã bán
              </div>

              <div className="pl-4">
                <button
                  onClick={handleToggleLike}
                  className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors font-medium cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{likeCount} Đã thích</span>
                </button>
              </div>

              <div className="pl-4 text-gray-500 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-gray-400" />
                <span>{product.viewCount || 0} Lượt xem</span>
              </div>
            </div>

            {/* Khối Giá Tiền VND & Discount/Promotion */}
            <div className="bg-gray-50 p-4 rounded-lg flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[#ee4d2d]">
                {formatVND(displayPrice)}
              </span>

              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {formatVND(displayOriginalPrice)}
                </span>
              )}

              {!!product.promotionalPrice && product.promotionalPrice > 0 && product.promotionalPrice < displayPrice && (
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-xs uppercase shadow-xs">
                  Khuyến mãi đặc biệt: {formatVND(product.promotionalPrice)}
                </span>
              )}

              {((activeSku && activeSku.discountPercentage && activeSku.discountPercentage > 0) || (product.discountPercentage && product.discountPercentage > 0)) && (
                <span className="bg-[#ee4d2d] text-white text-xs font-bold px-2 py-0.5 rounded-xs uppercase">
                  -{activeSku?.discountPercentage || product.discountPercentage}% GIẢM
                </span>
              )}

              {activeSku?.skuCode && (
                <span className="ml-auto text-[11px] font-mono text-gray-400 bg-gray-200/60 px-2 py-0.5 rounded">
                  SKU: {activeSku.skuCode}
                </span>
              )}
            </div>

            {/* Cấu trúc Biến thể 2 tầng (SPU & SKU Variants Selector) */}
            {product.variantGroups && product.variantGroups.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                {product.variantGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs text-gray-500 w-24 font-medium">{group.name}</span>
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((option, optIdx) => {
                        const isSelected = selectedTiers[groupIdx] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(groupIdx, optIdx)}
                            className={`px-3 py-1.5 rounded text-xs font-medium border transition-all flex items-center gap-1 ${
                              isSelected
                                ? 'border-[#ee4d2d] text-[#ee4d2d] bg-orange-50/50 ring-1 ring-[#ee4d2d]'
                                : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-[#ee4d2d]" />}
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Số Lượng & Kho Hàng */}
            <div className="flex items-center gap-4 pt-3">
              <span className="text-xs text-gray-500 w-24 font-medium">Số lượng</span>
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-1 text-xs font-bold text-gray-800 border-x border-gray-300">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(displayStock, q + 1))}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-gray-400">
                {displayStock} sản phẩm có sẵn
              </span>
            </div>

            {/* Thông Báo Thành Công */}
            {cartSuccessMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{cartSuccessMsg}</span>
              </div>
            )}

            {/* Nút Action: Thêm vào Giỏ / Mua Ngay */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                disabled={displayStock === 0 || addingToCart}
                onClick={() => handleAddToCart(false)}
                className="flex-1 border border-[#ee4d2d] text-[#ee4d2d] bg-orange-50 hover:bg-orange-100 font-bold text-sm py-3 px-6 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                {addingToCart ? 'Đang thêm...' : 'Thêm Vào Giỏ Hàng'}
              </button>

              <button
                type="button"
                disabled={displayStock === 0 || addingToCart}
                onClick={() => handleAddToCart(true)}
                className="flex-1 bg-[#ee4d2d] hover:bg-orange-600 text-white font-bold text-sm py-3 px-6 rounded shadow-md transition-colors text-center disabled:opacity-50 cursor-pointer"
              >
                Mua Ngay
              </button>
            </div>
          </div>
        </div>

        {/* Thông tin Hồ Sơ Shop người bán */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"
                alt="Shop Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base">{product.shopName || 'Shopew Official Store'}</h3>
                {product.isMall && (
                  <span className="bg-[#d0011b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Mall</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Online 5 phút trước</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/shops/${product.shopId || 1}`}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-xs px-4 py-2 rounded flex items-center gap-1.5"
            >
              <Store className="w-4 h-4 text-[#ee4d2d]" />
              Xem Shop
            </Link>
          </div>
        </div>

        {/* Mô tả sản phẩm */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 uppercase bg-gray-50 p-3 rounded mb-4">
            MÔ TẢ SẢN PHẨM
          </h3>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description || 'Sản phẩm chính hãng chất lượng cao phân phối chính thức trên Shopew.'}
          </p>
        </div>

        {/* Section 20 Sản phẩm Gợi ý (Có Thể Bạn Cũng Thích) khi xem chi tiết */}
        <div id="related-products-section" className="space-y-4 pt-4">
          <div className="bg-white p-3.5 rounded-xl shadow-xs border-b-2 border-[#ee4d2d] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#ee4d2d] fill-[#ee4d2d]" />
              <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">CÓ THỂ BẠN CŨNG THÍCH</h3>
            </div>
            <span className="text-xs text-gray-500">
              Tối đa 20 sản phẩm/trang • Trang {relatedPage} / {relatedTotalPages}
            </span>
          </div>

          {relatedLoading ? (
            <div className="p-8 text-center text-xs text-gray-400">Đang tải sản phẩm gợi ý...</div>
          ) : relatedProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 bg-white rounded-lg border border-gray-100">Chưa có sản phẩm gợi ý.</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              <ShopeePagination
                currentPage={relatedPage}
                totalPages={relatedTotalPages}
                onPageChange={(newPage) => {
                  fetchRelatedProducts(newPage);
                  const el = document.getElementById('related-products-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};
