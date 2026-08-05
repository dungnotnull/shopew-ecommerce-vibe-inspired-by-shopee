import React, { useState } from 'react';
import { Ticket, Check, Sparkles } from 'lucide-react';
import { Voucher, voucherService } from '../../services/voucher-service';
import { formatVND } from '../../utils/format-currency';

interface VoucherCardProps {
  voucher: Voucher;
  onSaved?: () => void;
  isSavedInitial?: boolean;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({ voucher, onSaved, isSavedInitial = false }) => {
  const [saving, setSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(isSavedInitial);

  const handleSave = async () => {
    if (saving || isSaved) return;
    setSaving(true);
    try {
      await voucherService.saveVoucher(voucher.id);
      setIsSaved(true);
      if (onSaved) onSaved();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Bạn đã lưu voucher này hoặc cần đăng nhập.';
      if (msg.includes('đã lưu')) {
        setIsSaved(true);
      } else {
        alert(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const isPlatform = !voucher.shopId;

  return (
    <div className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-xl border border-orange-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex items-stretch relative group">
      {/* Vùng trái - Badge giảm giá */}
      <div
        className={`w-24 sm:w-28 p-3 flex flex-col items-center justify-center text-center text-white relative border-r-2 border-dashed border-white/40 ${
          isPlatform
            ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500'
            : 'bg-gradient-to-br from-red-500 via-pink-600 to-orange-500'
        }`}
      >
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 border-r border-orange-200" />

        {isPlatform ? (
          <Sparkles className="w-5 h-5 mb-1 text-yellow-200 animate-pulse" />
        ) : (
          <Ticket className="w-5 h-5 mb-1 text-pink-200" />
        )}

        <div className="font-extrabold text-sm sm:text-base leading-tight drop-shadow-xs">
          GIẢM {voucher.discountPercentage}%
        </div>
        {voucher.maxDiscount > 0 && (
          <div className="text-[10px] text-orange-100 font-medium mt-0.5">
            Tối đa {formatVND(voucher.maxDiscount)}
          </div>
        )}
      </div>

      {/* Vùng phải - Chi tiết voucher & Nút Lưu */}
      <div className="flex-1 p-3 flex flex-col justify-between space-y-2 bg-orange-50/20">
        <div>
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                isPlatform
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-pink-100 text-pink-800 border border-pink-300'
              }`}
            >
              {isPlatform ? 'Voucher Sàn' : 'Voucher Shop'}
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              {voucher.code}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">
            Đơn tối thiểu {formatVND(voucher.minOrderValue)}
          </p>

          <p className="text-[10px] text-slate-400 mt-0.5">
            HSD: {new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}
          </p>
        </div>

        {/* Nút bấm Lưu Voucher */}
        <button
          onClick={handleSave}
          disabled={saving || isSaved}
          className={`w-full py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer ${
            isSaved
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 cursor-default'
              : 'bg-[#ee4d2d] hover:bg-[#d73211] text-white shadow-xs hover:shadow-sm active:scale-98'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5" /> Đã Lưu Vào Ví
            </>
          ) : saving ? (
            'Đang Lưu...'
          ) : (
            'Lưu Voucher'
          )}
        </button>
      </div>

      {/* Vết cắt tròn viền vát voucher */}
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 border-l border-orange-200" />
    </div>
  );
};
