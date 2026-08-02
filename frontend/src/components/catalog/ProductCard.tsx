import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Star } from 'lucide-react';
import { ProductSPU } from '../../types/catalog';
import { formatVND } from '../../utils/format-currency';
import CatalogService from '../../services/catalog-service';

interface ProductCardProps {
  product: ProductSPU;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isLiked, setIsLiked] = useState<boolean>(!!product.isLiked);
  const [likeCount, setLikeCount] = useState<number>(product.likeCount || 0);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount(prev => prev + (newLiked ? 1 : -1));

    try {
      await CatalogService.toggleLikeProduct(product.id);
    } catch {
      // Revert if API fails
      setIsLiked(!newLiked);
      setLikeCount(prev => prev + (newLiked ? -1 : 1));
    }
  };

  const getProductCardImage = () => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch {
        // Ignore
      }
    }
    if (product.thumbnailUrl) {
      return product.thumbnailUrl;
    }
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';
  };

  const imageSrc = getProductCardImage();

  return (
    <Link
      to={`/products/${product.id}`}
      className="bg-white rounded-md overflow-hidden border border-gray-100 hover:border-[#ee4d2d] hover:shadow-lg transition-all group flex flex-col justify-between relative"
    >
      <div>
        {/* Aspect ratio 1:1 image container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges: Mall & Yêu thích */}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
            {product.isMall && (
              <span className="bg-[#d0011b] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-xs uppercase tracking-wider shadow-xs">
                Shopee Mall
              </span>
            )}
            {product.isPreferred && (
              <span className="bg-[#ee4d2d] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs flex items-center gap-0.5 shadow-xs">
                <ShieldCheck className="w-2.5 h-2.5" /> Yêu thích
              </span>
            )}
          </div>

          {/* Discount Percentage Badge */}
          {!!product.discountPercentage && product.discountPercentage > 0 && (
            <div className="absolute top-0 right-0 bg-yellow-400/95 text-[#ee4d2d] font-black text-[10px] px-1.5 py-1 text-center rounded-bl-sm leading-tight">
              <span>-{product.discountPercentage}%</span>
              <span className="block text-[8px] uppercase text-gray-800 font-bold">GIẢM</span>
            </div>
          )}

          {/* Wishlist Like Button */}
          <button
            onClick={handleToggleLike}
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-xs hover:bg-white text-gray-400 hover:text-red-500 transition-all shadow-xs z-10"
            title={isLiked ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-2.5">
          <h3 className="text-xs text-gray-800 font-medium line-clamp-2 mb-2 group-hover:text-[#ee4d2d] leading-relaxed">
            {product.name}
          </h3>

          <div className="flex items-baseline justify-between gap-1 flex-wrap">
            <div className="text-sm font-bold text-[#ee4d2d]">
              {formatVND(product.priceMin)}
            </div>
            {product.priceMax > product.priceMin && (
              <span className="text-[10px] text-gray-400">
                - {formatVND(product.priceMax)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Meta info */}
      <div className="px-2.5 pb-2 text-[11px] text-gray-500 flex items-center justify-between border-t border-gray-50 pt-2 mt-1">
        <div className="flex items-center gap-1 text-amber-500 font-semibold text-[10px]">
          <Star className="w-3 h-3 fill-amber-400" />
          <span>{product.rating}</span>
        </div>
        <span className="text-[10px]">Đã bán {(product.soldCount > 1000 ? (product.soldCount / 1000).toFixed(1) + 'k' : product.soldCount)}</span>
        <span className="text-[9px] text-gray-400">({likeCount} ♥)</span>
      </div>
    </Link>
  );
};
