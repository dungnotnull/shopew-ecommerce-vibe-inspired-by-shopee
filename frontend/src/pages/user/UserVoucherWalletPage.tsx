import React, { useEffect, useState } from 'react';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Ticket, Clock, ArrowRight } from 'lucide-react';
import { voucherService, Voucher } from '../../services/voucher-service';
import { formatVND } from '../../utils/format-currency';
import { Link } from 'react-router-dom';

export const UserVoucherWalletPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const data = await voucherService.getWalletVouchers();
      setVouchers(data);
    } catch {
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 font-['Roboto',sans-serif]">
        <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-[#ee4d2d]" />
              Kho Voucher Dành Cho Bạn
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Quản lý danh sách các Mã giảm giá Sàn và Mã giảm giá Shop đã lưu trong ví của bạn.
            </p>
          </div>

          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-xs text-[#ee4d2d] font-bold hover:underline"
          >
            Sử dụng ngay <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-gray-400">Đang tải kho Voucher...</div>
        ) : vouchers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center space-y-3 shadow-xs">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto" />
            <div className="text-sm font-bold text-gray-700">Kho Voucher của bạn đang trống</div>
            <p className="text-xs text-gray-400">Hãy lưu các Mã giảm giá hot trên trang chủ hoặc chi tiết sản phẩm để nhận ưu đãi mua sắm.</p>
            <Link
              to="/"
              className="inline-block bg-[#ee4d2d] text-white px-4 py-2 rounded-md font-bold text-xs hover:bg-[#d73211] transition-colors"
            >
              Khám Phá Voucher Trang Chủ
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vouchers.map((v) => (
              <div key={v.id} className="bg-white border border-orange-200 rounded-lg p-4 flex gap-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="w-20 bg-orange-50 border border-orange-200 rounded-md flex flex-col items-center justify-center p-2 text-center shrink-0">
                  <span className="text-lg font-black text-[#ee4d2d]">{v.discountPercentage}%</span>
                  <span className="text-[10px] text-orange-700 font-bold uppercase">GIẢM</span>
                </div>

                <div className="flex-1 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-sm">{v.code}</span>
                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                      {v.shopId ? 'Voucher Shop' : 'Voucher Sàn'}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    Giảm tối đa {formatVND(v.maxDiscount)} cho đơn từ {formatVND(v.minOrderValue)}
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-1 pt-1">
                    <Clock className="w-3 h-3 text-orange-400" />
                    HSD: {new Date(v.expiresAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};
