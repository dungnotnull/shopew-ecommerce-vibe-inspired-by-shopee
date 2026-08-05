import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import { Voucher } from '../../services/voucher-service';
import { VoucherCard } from './VoucherCard';

interface VoucherCarouselProps {
  vouchers: Voucher[];
  title?: string;
  subtitle?: string;
  savedVoucherIds?: number[];
  onVoucherSaved?: () => void;
}

export const VoucherCarousel: React.FC<VoucherCarouselProps> = ({
  vouchers,
  title = 'MÃ GIẢM GIÁ SHOP',
  subtitle,
  savedVoucherIds = [],
  onVoucherSaved,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!vouchers || vouchers.length === 0) return null;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-orange-100 shadow-xs space-y-3 relative group">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-100 text-[#ee4d2d] rounded-lg">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-800 uppercase tracking-wide">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>

        {/* Dynamic Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-[#ee4d2d] text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Cuộn sang trái"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-[#ee4d2d] text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Cuộn sang phải"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Carousel Items Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {vouchers.map((voucher) => (
          <VoucherCard
            key={voucher.id}
            voucher={voucher}
            isSavedInitial={savedVoucherIds.includes(voucher.id)}
            onSaved={onVoucherSaved}
          />
        ))}
      </div>
    </div>
  );
};
