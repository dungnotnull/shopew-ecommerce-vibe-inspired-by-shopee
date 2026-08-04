import React, { useState } from 'react';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { MapPin, CreditCard, CheckCircle2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../services/order-service';
import { formatVND } from '../utils/format';

export const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCartItems = location.state?.selectedCartItems || [];

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successOrder, setSuccessOrder] = useState<{ orderGroupId: string; status: string } | null>(null);

  // Giả lập Địa chỉ giao hàng mặc định
  const defaultAddress = {
    id: 1,
    fullName: 'Nguyen Van A',
    phone: '0987654321',
    fullAddress: 'Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  };

  const totalProductAmount = selectedCartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const shippingFee = selectedCartItems.length > 0 ? 30000 : 0;
  const grandTotal = totalProductAmount + shippingFee;

  const handlePlaceOrder = async () => {
    if (selectedCartItems.length === 0) {
      alert('Không có sản phẩm nào được chọn để thanh toán.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        cartItems: selectedCartItems.map((item: any) => ({
          variantId: item.skuId || item.id,
          quantity: item.quantity,
        })),
        shippingAddressId: defaultAddress.id,
      };

      const res = await orderService.checkout(payload);
      setSuccessOrder(res);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại sau.';
      alert(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 font-['Roboto',sans-serif]">
        {/* Top Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <Link to="/cart" className="text-xs text-slate-500 hover:text-[#ee4d2d] font-bold flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Quay Lại Giỏ Hàng
          </Link>
          <h1 className="text-lg font-bold text-slate-800">Thanh Toán Đơn Hàng</h1>
        </div>

        {selectedCartItems.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-4">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">Chưa chọn sản phẩm thanh toán.</p>
            <Link to="/cart" className="inline-block px-4 py-2 bg-[#ee4d2d] text-white text-xs font-bold rounded-lg">
              Về Giỏ Hàng
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Địa Chỉ Nhận Hàng */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#ee4d2d]">
                <MapPin className="w-5 h-5" /> Địa Chỉ Nhận Hàng
              </div>
              <div className="text-xs text-slate-800 font-semibold space-y-1">
                <div className="font-bold text-slate-900">{defaultAddress.fullName} ({defaultAddress.phone})</div>
                <div className="text-slate-600">{defaultAddress.fullAddress}</div>
              </div>
            </div>

            {/* Danh Sách Sản Phẩm */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 text-xs font-bold text-slate-700">
                Sản Phẩm Đặt Mua ({selectedCartItems.length})
              </div>
              <div className="divide-y divide-slate-100 p-4">
                {selectedCartItems.map((item: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.productImage || 'https://via.placeholder.com/60'}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-md border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-800">{item.productName}</div>
                        <div className="text-[11px] text-slate-500">Số lượng: x{item.quantity}</div>
                      </div>
                    </div>
                    <div className="font-extrabold text-slate-800">{formatVND(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phương Thức Thanh Toán & Chi Tiết */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                <CreditCard className="w-5 h-5 text-[#ee4d2d]" /> Phương Thức Thanh Toán
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-800">
                <span className="bg-[#ee4d2d] text-white px-2 py-0.5 rounded text-[10px]">COD</span>
                <span>Thanh toán khi nhận hàng (Thanh toán tiền mặt cho shipper)</span>
              </div>

              {/* Chi Tiết Thanh Toán */}
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Tổng tiền hàng:</span>
                  <span className="font-bold text-slate-800">{formatVND(totalProductAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-bold text-slate-800">{formatVND(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-3">
                  <span>Tổng thanh toán:</span>
                  <span className="text-[#ee4d2d] text-lg">{formatVND(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full py-3.5 bg-[#ee4d2d] hover:bg-[#d73211] text-white font-extrabold rounded-xl shadow-lg transition-colors cursor-pointer text-sm disabled:opacity-50"
              >
                {submitting ? 'Đang Xử Lý Đơn Hàng...' : 'Đặt Hàng Ngay'}
              </button>
            </div>
          </div>
        )}

        {/* Modal Thành Công */}
        {successOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-slate-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Đặt Hàng Thành Công!</h3>
                <p className="text-xs text-slate-500 mt-1">Cảm ơn bạn đã mua hàng tại Shopew.</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 space-y-1">
                <div>Mã nhóm đơn: <strong className="text-slate-900">{successOrder.orderGroupId}</strong></div>
                <div>Trạng thái: <span className="text-amber-600 font-bold">{successOrder.status}</span></div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2.5 bg-[#ee4d2d] text-white text-xs font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Về Trang Chủ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};
