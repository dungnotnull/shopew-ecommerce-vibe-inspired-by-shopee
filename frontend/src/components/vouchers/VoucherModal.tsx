import React, { useState } from 'react';
import { Ticket, Check, X, Search, AlertCircle } from 'lucide-react';
import { Voucher } from '../../services/voucher-service';
import { formatVND } from '../../utils/format-currency';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletVouchers: Voucher[];
  totalAmount: number;
  selectedPlatformVoucherId: number | null;
  onSelectPlatformVoucher: (voucherId: number | null) => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  isOpen,
  onClose,
  walletVouchers,
  totalAmount,
  selectedPlatformVoucherId,
  onSelectPlatformVoucher,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PLATFORM' | 'SHOP'>('ALL');
  const [customCode, setCustomCode] = useState<string>('');
  const [codeMsg, setCodeMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isOpen) return null;

  const filteredVouchers = walletVouchers.filter((v) => {
    if (activeTab === 'PLATFORM') return !v.shopId;
    if (activeTab === 'SHOP') return Boolean(v.shopId);
    return true;
  });

  const handleApplyCustomCode = () => {
    if (!customCode.trim()) return;
    const found = walletVouchers.find(
      (v) => v.code.toLowerCase() === customCode.trim().toLowerCase()
    );

    if (found) {
      if (totalAmount < found.minOrderValue) {
        setCodeMsg({
          type: 'error',
          text: `Mã ${found.code} yêu cầu đơn tối thiểu ${formatVND(found.minOrderValue)}.`,
        });
      } else {
        onSelectPlatformVoucher(found.id);
        setCodeMsg({
          type: 'success',
          text: `Áp dụng thành công mã ${found.code}!`,
        });
      }
    } else {
      setCodeMsg({
        type: 'error',
        text: 'Mã giảm giá không hợp lệ hoặc chưa được lưu vào Ví.',
      });
    }
  };

  const selectedVoucher = walletVouchers.find((v) => v.id === selectedPlatformVoucherId);

  // Tính số tiền giảm giá dự kiến
  let calculatedDiscount = 0;
  if (selectedVoucher && totalAmount >= selectedVoucher.minOrderValue) {
    calculatedDiscount = Math.floor(totalAmount * (selectedVoucher.discountPercentage / 100));
    if (selectedVoucher.maxDiscount > 0 && calculatedDiscount > selectedVoucher.maxDiscount) {
      calculatedDiscount = selectedVoucher.maxDiscount;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#ee4d2d] text-white rounded-xl shadow-xs">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
                Chọn Shopew Voucher
              </h3>
              <p className="text-xs text-slate-500">Ví Voucher của bạn ({walletVouchers.length} mã)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form nhập mã voucher */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Nhập mã Shopew Voucher..."
                value={customCode}
                onChange={(e) => {
                  setCustomCode(e.target.value);
                  setCodeMsg(null);
                }}
                className="w-full px-3.5 py-2 pl-9 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 uppercase placeholder:normal-case placeholder:font-normal focus:border-[#ee4d2d] focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              onClick={handleApplyCustomCode}
              className="px-4 py-2 bg-[#ee4d2d] hover:bg-[#d73211] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Áp Dụng
            </button>
          </div>

          {codeMsg && (
            <div
              className={`text-xs font-bold p-2 rounded-lg flex items-center gap-1.5 ${
                codeMsg.type === 'error'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{codeMsg.text}</span>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center border-b border-slate-200 px-4 text-xs font-bold bg-white">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ALL'
                ? 'border-[#ee4d2d] text-[#ee4d2d]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tất Cả ({walletVouchers.length})
          </button>
          <button
            onClick={() => setActiveTab('PLATFORM')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'PLATFORM'
                ? 'border-[#ee4d2d] text-[#ee4d2d]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Voucher Sàn ({walletVouchers.filter((v) => !v.shopId).length})
          </button>
          <button
            onClick={() => setActiveTab('SHOP')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'SHOP'
                ? 'border-[#ee4d2d] text-[#ee4d2d]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Voucher Shop ({walletVouchers.filter((v) => v.shopId).length})
          </button>
        </div>

        {/* List Vouchers */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {filteredVouchers.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-slate-400 text-xs">
              <Ticket className="w-10 h-10 mx-auto text-slate-300" />
              <p>Không tìm thấy mã giảm giá nào trong Ví.</p>
            </div>
          ) : (
            filteredVouchers.map((voucher) => {
              const isSelected = voucher.id === selectedPlatformVoucherId;
              const isEligible = totalAmount >= voucher.minOrderValue;

              return (
                <div
                  key={voucher.id}
                  onClick={() => {
                    if (isEligible) {
                      onSelectPlatformVoucher(isSelected ? null : voucher.id);
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 bg-white ${
                    !isEligible
                      ? 'opacity-60 border-slate-200 bg-slate-50 cursor-not-allowed'
                      : isSelected
                      ? 'border-[#ee4d2d] ring-2 ring-orange-500/20 bg-orange-50/30 cursor-pointer'
                      : 'border-slate-200 hover:border-orange-300 cursor-pointer'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                          !voucher.shopId
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-pink-100 text-pink-800'
                        }`}
                      >
                        {!voucher.shopId ? 'Sàn Shopew' : 'Shop'}
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-800">
                        {voucher.code}
                      </span>
                    </div>

                    <div className="font-extrabold text-sm text-[#ee4d2d]">
                      Giảm {voucher.discountPercentage}%
                      {voucher.maxDiscount > 0 && (
                        <span className="text-xs text-slate-600 font-medium ml-1">
                          (Tối đa {formatVND(voucher.maxDiscount)})
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Đơn tối thiểu {formatVND(voucher.minOrderValue)}
                    </div>

                    {!isEligible && (
                      <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> Chưa đủ giá trị đơn tối thiểu
                      </div>
                    )}
                  </div>

                  {/* Radio indicator */}
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-[#ee4d2d] bg-[#ee4d2d] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <div>
            {selectedVoucher ? (
              <div className="text-xs">
                <span className="text-slate-500">Tiết kiệm: </span>
                <span className="font-extrabold text-[#ee4d2d] text-sm">
                  -{formatVND(calculatedDiscount)}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400">Chưa chọn voucher</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectPlatformVoucher(null)}
              className="px-3.5 py-2 text-slate-600 font-bold text-xs hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Bỏ Chọn
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#ee4d2d] hover:bg-[#d73211] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Áp Dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
