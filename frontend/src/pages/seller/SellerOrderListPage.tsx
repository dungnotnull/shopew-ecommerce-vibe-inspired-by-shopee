import React, { useState, useEffect, useMemo } from 'react';
import { orderService, Order, OrderStatus } from '../../services/order-service';
import { formatVND } from '../../utils/format-currency';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RefreshCw,
  Search,
  MapPin,
  Send,
} from 'lucide-react';

export const SellerOrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // State Confirm Modal Cập Nhật Trạng Thái
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [targetOrder, setTargetOrder] = useState<{ id: number; newStatus: OrderStatus } | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Nạp danh sách Đơn Hàng cho Seller từ API Backend
  const fetchSellerOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getSellerOrders();
      setOrders(data);
    } catch {
      showToast('Không thể tải danh sách đơn hàng gian hàng. Vui lòng kiểm tra lại backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  // Lọc đơn hàng theo Tab & Tìm kiếm
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchTab = activeTab === 'ALL' || o.status === activeTab;
      const matchSearch =
        !searchTerm.trim() ||
        o.id.toString().includes(searchTerm) ||
        o.orderItems.some((item) => item.product?.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchTab && matchSearch;
    });
  }, [orders, activeTab, searchTerm]);

  // Mở Popup Confirm trước khi đổi trạng thái đơn
  const handleOpenStatusConfirm = (id: number, newStatus: OrderStatus) => {
    setTargetOrder({ id, newStatus });
    setConfirmModalOpen(true);
  };

  // Thực thi đổi trạng thái đơn sau khi xác nhận trên Confirm Modal
  const handleConfirmStatusChange = async () => {
    if (!targetOrder) return;
    setIsUpdating(true);
    try {
      await orderService.updateSellerOrderStatus(targetOrder.id, targetOrder.newStatus);
      showToast(`Đã cập nhật trạng thái đơn hàng #${targetOrder.id} thành công!`);
      setOrders((prev) =>
        prev.map((o) => (o.id === targetOrder.id ? { ...o, status: targetOrder.newStatus } : o))
      );
      setConfirmModalOpen(false);
      setTargetOrder(null);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Cập nhật trạng thái đơn hàng không thành công.';
      showToast(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            <Clock className="w-3.5 h-3.5" /> Chờ thanh toán
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang chuẩn bị hàng
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Truck className="w-3.5 h-3.5" /> Đang giao hàng
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Giao thành công
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            <XCircle className="w-3.5 h-3.5" /> Đã hủy
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Header Quản Lý Đơn Hàng Seller Center */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Quản Lý Đơn Hàng Kênh Người Bán</h1>
            <p className="text-xs text-gray-500">Theo dõi, chuẩn bị hàng và cập nhật tiến độ giao hàng cho người mua</p>
          </div>
        </div>

        {/* Ô Tìm kiếm đơn hàng */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm mã đơn hoặc sản phẩm..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ee4d2d] focus:bg-white"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Navigation Tabs Lọc Trạng Thái */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <div className="flex border-b border-gray-100 min-w-max">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
            { id: 'PROCESSING', label: 'Cần chuẩn bị hàng' },
            { id: 'SHIPPED', label: 'Đang giao' },
            { id: 'DELIVERED', label: 'Đã hoàn thành' },
            { id: 'CANCELLED', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-semibold transition-all relative ${
                activeTab === tab.id
                  ? 'text-[#ee4d2d] border-b-2 border-[#ee4d2d] bg-orange-50/30'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Danh Sách Đơn Hàng Gian Hàng */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl text-center space-y-3 border border-gray-100 shadow-sm">
          <RefreshCw className="w-8 h-8 text-[#ee4d2d] animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Đang nạp dữ liệu đơn hàng...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center space-y-2 border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-gray-700">Chưa tìm thấy đơn hàng nào trong phân mục này</p>
          <p className="text-xs text-gray-400">Các đơn hàng mới phát sinh từ khách hàng sẽ hiển thị tại đây.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden space-y-3 p-6"
            >
              {/* Header Card Đơn Hàng */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900">Mã đơn: #{order.id}</span>
                  <span className="text-xs text-gray-400">
                    • {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Thông tin Địa chỉ & Khách hàng */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-start gap-2 text-xs text-gray-700">
                <MapPin className="w-4 h-4 text-[#ee4d2d] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900">
                    {order.shippingAddress?.receiverName || `Khách hàng User #${order.userId}`}
                  </span>{' '}
                  {order.shippingAddress?.receiverPhone && `(${order.shippingAddress.receiverPhone})`} -{' '}
                  <span>
                    {order.shippingAddress
                      ? `${order.shippingAddress.street}, ${order.shippingAddress.city}`
                      : 'Địa chỉ mặc định'}
                  </span>
                </div>
              </div>

              {/* Danh sách các items trong đơn hàng */}
              <div className="divide-y divide-gray-50">
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center gap-4">
                    <img
                      src={
                        item.product?.images?.[0] ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'
                      }
                      alt={item.product?.name}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">Số lượng: x{item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-[#ee4d2d]">{formatVND(item.price)}</span>
                  </div>
                ))}
              </div>

              {/* Footer & Nút Thao Tác Đổi Trạng Thái cho Seller */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-gray-500">Doanh thu đơn: </span>
                  <span className="text-base font-extrabold text-[#ee4d2d]">
                    {formatVND(order.totalAmount)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Nút giao hàng: PROCESSING -> SHIPPED */}
                  {order.status === 'PROCESSING' && (
                    <button
                      onClick={() => handleOpenStatusConfirm(order.id, 'SHIPPED')}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Giao hàng cho ĐVVC
                    </button>
                  )}

                  {/* Nút hoàn thành đơn: SHIPPED -> DELIVERED */}
                  {order.status === 'SHIPPED' && (
                    <button
                      onClick={() => handleOpenStatusConfirm(order.id, 'DELIVERED')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Xác nhận đã giao hàng
                    </button>
                  )}

                  {/* Nút Hủy đơn cho Seller */}
                  {(order.status === 'PENDING_PAYMENT' || order.status === 'PROCESSING') && (
                    <button
                      onClick={() => handleOpenStatusConfirm(order.id, 'CANCELLED')}
                      className="px-3.5 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Hủy đơn hàng
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* System Confirm Modal cho Thao tác Cập nhật Trạng thái Đơn hàng Seller */}
      {targetOrder && (
        <ConfirmModal
          isOpen={confirmModalOpen}
          title="Xác nhận chuyển trạng thái đơn hàng"
          message={`Bạn có chắc chắn muốn chuyển đơn hàng #${targetOrder.id} sang trạng thái "${
            targetOrder.newStatus === 'SHIPPED'
              ? 'Đang giao hàng'
              : targetOrder.newStatus === 'DELIVERED'
              ? 'Đã giao thành công'
              : 'Đã hủy'
          }" không?`}
          confirmText="Xác nhận chuyển"
          cancelText="Hủy bỏ"
          type={targetOrder.newStatus === 'CANCELLED' ? 'danger' : 'info'}
          isLoading={isUpdating}
          onConfirm={handleConfirmStatusChange}
          onCancel={() => {
            setConfirmModalOpen(false);
            setTargetOrder(null);
          }}
        />
      )}
    </div>
  );
};
