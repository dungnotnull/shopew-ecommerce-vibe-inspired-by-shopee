import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { orderService, Order, OrderStatus } from '../../services/order-service';
import { addressService } from '../../services/address-service';
import { formatVND } from '../../utils/format-currency';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import {
  ShoppingBag,
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
  Search,
  RefreshCw,
  Eye,
  MapPin,
  Edit2,
  Save,
  User,
  Phone,
  ChevronRight,
} from 'lucide-react';

// Danh sách các Tab lọc trạng thái đơn hàng theo chuẩn Shopee
const ORDER_TABS: { id: string; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
  { id: 'PROCESSING', label: 'Vận chuyển' },
  { id: 'SHIPPED', label: 'Đang giao' },
  { id: 'DELIVERED', label: 'Hoàn thành' },
  { id: 'CANCELLED', label: 'Đã hủy' },
];

export const UserOrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // State cho Modal Xem Chi Tiết Đơn Hàng
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // State cho Modal Chỉnh Sửa Địa Chỉ Nhận Hàng Đơn Hàng
  const [editingAddressOrder, setEditingAddressOrder] = useState<Order | null>(null);
  const [editReceiverName, setEditReceiverName] = useState<string>('');
  const [editReceiverPhone, setEditReceiverPhone] = useState<string>('');
  const [editStreet, setEditStreet] = useState<string>('');
  const [editCity, setEditCity] = useState<string>('');
  const [editState, setEditState] = useState<string>('');
  const [savingAddress, setSavingAddress] = useState<boolean>(false);

  // State cho System Confirm Popup Modal Hủy Đơn Hàng
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [cancelingOrderId, setCancelingOrderId] = useState<number | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Thống báo Toast trạng thái
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Nạp danh sách đơn hàng từ API Backend
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getUserOrders();
      setOrders(data);
    } catch {
      showToast('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Lọc đơn hàng theo Tab đã chọn & từ khóa tìm kiếm
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchTab = activeTab === 'ALL' || order.status === activeTab;
      const matchSearch =
        !searchQuery.trim() ||
        order.id.toString().includes(searchQuery) ||
        order.shop?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderItems.some((item) => item.product?.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchTab && matchSearch;
    });
  }, [orders, activeTab, searchQuery]);

  // Xử lý mở Confirm Modal trước khi Hủy Đơn Hàng
  const handleOpenCancelModal = (orderId: number) => {
    setCancelingOrderId(orderId);
    setCancelModalOpen(true);
  };

  // Thực thi Hủy Đơn Hàng sau khi người dùng xác nhận trên Popup Confirm hệ thống
  const handleConfirmCancelOrder = async () => {
    if (!cancelingOrderId) return;
    setIsActionLoading(true);
    try {
      await orderService.cancelOrder(cancelingOrderId);
      showToast('Hủy đơn hàng thành công!');
      setCancelModalOpen(false);
      setCancelingOrderId(null);
      // Cập nhật state trực tiếp
      setOrders((prev) =>
        prev.map((o) => (o.id === cancelingOrderId ? { ...o, status: 'CANCELLED' as OrderStatus } : o))
      );
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Hủy đơn hàng thất bại. Vui lòng kiểm tra lại.';
      showToast(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Xử lý mở Modal Chỉnh Sửa Địa Chỉ Nhận Hàng
  const handleOpenEditAddress = (order: Order) => {
    setEditingAddressOrder(order);
    const addr = order.shippingAddress;
    setEditReceiverName(addr?.receiverName || '');
    setEditReceiverPhone(addr?.receiverPhone || '');
    setEditStreet(addr?.street || '');
    setEditCity(addr?.city || 'Quận 1');
    setEditState(addr?.state || 'TP. Hồ Chí Minh');
  };

  // Gọi API cập nhật địa chỉ người nhận (PUT /api/v1/users/addresses/:id hoặc POST)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddressOrder) return;

    if (!editReceiverName.trim() || !editReceiverPhone.trim() || !editStreet.trim()) {
      showToast('Vui lòng điền đầy đủ Tên người nhận, Số điện thoại và Tên đường.', 'error');
      return;
    }

    setSavingAddress(true);
    try {
      const payload = {
        receiverName: editReceiverName.trim(),
        receiverPhone: editReceiverPhone.trim(),
        street: editStreet.trim(),
        city: editCity.trim() || 'Quận 1',
        state: editState.trim() || 'TP. Hồ Chí Minh',
      };

      let updatedAddr;
      if (editingAddressOrder.shippingAddress?.id) {
        updatedAddr = await addressService.updateAddress(editingAddressOrder.shippingAddress.id, payload);
      } else {
        updatedAddr = await addressService.createAddress(payload);
      }

      const newShippingAddr = {
        id: updatedAddr.id || editingAddressOrder.shippingAddress?.id || 1,
        receiverName: payload.receiverName,
        receiverPhone: payload.receiverPhone,
        street: payload.street,
        city: payload.city,
        state: payload.state,
        zipCode: '700000',
      };

      // Cập nhật lại UI Đơn hàng với dữ liệu người nhận & địa chỉ mới
      setOrders((prev) =>
        prev.map((o) => (o.id === editingAddressOrder.id ? { ...o, shippingAddress: newShippingAddr } : o))
      );

      if (selectedOrderDetails && selectedOrderDetails.id === editingAddressOrder.id) {
        setSelectedOrderDetails((prev) => (prev ? { ...prev, shippingAddress: newShippingAddr } : null));
      }

      showToast('✅ Đã cập nhật thông tin người nhận và địa chỉ giao hàng thành công!');
      setEditingAddressOrder(null);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Không thể cập nhật địa chỉ giao hàng.', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  // Xử lý mở Modal Chi Tiết Đơn Hàng (Gọi API getOrderDetails lấy đầy đủ địa chỉ & người nhận)
  const handleViewOrderDetails = async (order: Order) => {
    try {
      const details = await orderService.getOrderDetails(order.id);
      setSelectedOrderDetails(details || order);
    } catch {
      setSelectedOrderDetails(order);
    }
  };

  // Xử lý Thanh Toán Ngay cho đơn PENDING_PAYMENT
  const handlePayOrder = async (orderId: number) => {
    setIsActionLoading(true);
    try {
      await orderService.payOrder(orderId);
      showToast('Thanh toán đơn hàng thành công! Đơn đã chuyển sang trạng thái đang xử lý.');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'PROCESSING' as OrderStatus } : o))
      );
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Thanh toán không thành công. Vui lòng thử lại.';
      showToast(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Render Badge màu tương ứng với từng Trạng thái đơn hàng
  const renderStatusBadge = (status: OrderStatus) => {
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
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang xử lý
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
            <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            <XCircle className="w-3.5 h-3.5" /> Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <CustomerLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* Header Thông Báo Toast */}
          {toastMessage && (
            <div
              className={`p-4 rounded-xl shadow-md text-sm font-medium flex items-center justify-between transition-all ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              <span>{toastMessage.text}</span>
              <button onClick={() => setToastMessage(null)} className="font-bold hover:opacity-80">
                ✕
              </button>
            </div>
          )}

          {/* Tiêu đề Trang Quản Lý Đơn Hàng */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center font-bold">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Đơn Mua Của Tôi</h1>
                <p className="text-xs text-gray-500">Quản lý và theo dõi tiến độ các đơn hàng đã đặt trên Shopew</p>
              </div>
            </div>

            {/* Ô Tìm Kiếm Nhanh Đơn Hàng */}
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo Mã đơn, Tên Shop hoặc Sản phẩm..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ee4d2d] focus:bg-white transition-colors"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Thanh Nav Tabs Lọc Theo Trạng Thái chuẩn Shopee */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <div className="flex border-b border-gray-100 min-w-max">
              {ORDER_TABS.map((tab) => {
                const count =
                  tab.id === 'ALL'
                    ? orders.length
                    : orders.filter((o) => o.status === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 text-sm font-semibold transition-all relative flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'text-[#ee4d2d] border-b-2 border-[#ee4d2d] bg-orange-50/30'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          activeTab === tab.id
                            ? 'bg-[#ee4d2d] text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Danh Sách Các Đơn Hàng */}
          {loading ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#ee4d2d] animate-spin mx-auto" />
              <p className="text-sm font-medium text-gray-500">Đang tải danh sách đơn hàng...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center space-y-4">
              <div className="w-20 h-20 bg-orange-50 text-[#ee4d2d] rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-10 h-10 opacity-70" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-800">Chưa có đơn hàng nào</h3>
                <p className="text-xs text-gray-500">Bạn chưa có đơn hàng nào trong phân mục này.</p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#ee4d2d] hover:bg-[#d03e20] text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105"
              >
                Mua sắm ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Header Đơn Hàng: Thông tin Shop & Trạng thái */}
                  <div className="px-6 py-3.5 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-gray-700" />
                      <span className="font-bold text-sm text-gray-800">
                        {order.shop?.name || `Shop #${order.shopId}`}
                      </span>
                      {order.shopId && (
                        <Link
                          to={`/shops/${order.shopId}`}
                          className="text-xs text-[#ee4d2d] hover:underline flex items-center font-medium ml-2"
                        >
                          Ghé Shop <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">Mã đơn: #{order.id}</span>
                      {renderStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Bar Địa chỉ nhận hàng & Người nhận */}
                  {order.shippingAddress && (
                    <div
                      onClick={() => handleOpenEditAddress(order)}
                      className="bg-gray-50/80 hover:bg-orange-50/50 px-4 py-2.5 text-xs text-gray-700 flex items-center justify-between border-b border-gray-100 font-medium cursor-pointer group transition-colors"
                      title="Nhấn để chỉnh sửa người nhận & địa chỉ giao hàng"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#ee4d2d] shrink-0" />
                        <span>
                          <strong>Người nhận:</strong> {order.shippingAddress.receiverName || 'Khách hàng'} ({order.shippingAddress.receiverPhone || 'N/A'}) - {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#ee4d2d] font-bold flex items-center gap-1 group-hover:underline shrink-0">
                        <Edit2 className="w-3 h-3" /> Sửa
                      </span>
                    </div>
                  )}

                  {/* Body sản phẩm trong đơn */}
                  <div className="p-4 sm:p-6 space-y-4">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img
                          src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded-xl border border-gray-100 shrink-0"
                        />
                        <div className="flex-1 space-y-1">
                          <h3 className="font-bold text-sm text-gray-900 line-clamp-1">
                            {item.product?.name}
                          </h3>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 font-medium">Số lượng: x{item.quantity}</span>
                            <span className="font-bold text-[#ee4d2d]">{formatVND(item.price)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer đơn hàng */}
                  <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs text-gray-400">
                      Ngày đặt: <span className="font-medium text-gray-700">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 ml-auto">
                      <div className="text-right">
                        <span className="text-xs text-gray-500">Thành tiền: </span>
                        <span className="text-base font-extrabold text-[#ee4d2d]">
                          {formatVND(order.totalAmount)}
                        </span>
                      </div>

                      {/* Các Nút Thao Tác Theo Trạng Thái */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewOrderDetails(order)}
                          className="px-3.5 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Xem chi tiết
                        </button>

                        {/* Cho phép Hủy Đơn khi PENDING_PAYMENT hoặc PROCESSING */}
                        {(order.status === 'PENDING_PAYMENT' || order.status === 'PROCESSING') && (
                          <button
                            disabled={isActionLoading}
                            onClick={() => handleOpenCancelModal(order.id)}
                            className="px-3.5 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Hủy đơn hàng
                          </button>
                        )}

                        {/* Nút Thanh toán ngay khi PENDING_PAYMENT */}
                        {order.status === 'PENDING_PAYMENT' && (
                          <button
                            disabled={isActionLoading}
                            onClick={() => handlePayOrder(order.id)}
                            className="px-4 py-2 bg-[#ee4d2d] hover:bg-[#d03e20] text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Thanh toán ngay
                          </button>
                        )}

                        {/* Nút Mua Lại khi DELIVERED hoặc CANCELLED */}
                        {(order.status === 'DELIVERED' || order.status === 'CANCELLED') && (
                          <Link
                            to="/"
                            className="px-4 py-2 bg-[#ee4d2d] hover:bg-[#d03e20] text-white font-bold text-xs rounded-xl transition-colors shadow-sm inline-block"
                          >
                            Mua lại
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Confirm Modal cho Thao tác Hủy Đơn Hàng */}
        <ConfirmModal
          isOpen={cancelModalOpen}
          title="Xác nhận hủy đơn hàng"
          message={`Bạn có chắc chắn muốn hủy đơn hàng #${cancelingOrderId}? Hành động này không thể hoàn tác và kho sản phẩm sẽ được hoàn trả.`}
          confirmText="Đồng ý Hủy"
          cancelText="Giữ lại đơn"
          type="danger"
          isLoading={isActionLoading}
          onConfirm={handleConfirmCancelOrder}
          onCancel={() => {
            setCancelModalOpen(false);
            setCancelingOrderId(null);
          }}
        />

        {/* Modal Xem Chi Tiết Đơn Hàng Chi Tiết */}
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 p-6 space-y-6">
              {/* Header Modal */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Chi Tiết Đơn Hàng #{selectedOrderDetails.id}</h3>
                  <p className="text-xs text-gray-500">
                    Đặt lúc: {new Date(selectedOrderDetails.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Thông tin Địa chỉ Giao Hàng */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#ee4d2d]" /> Địa chỉ nhận hàng
                  </h4>
                  <button
                    onClick={() => handleOpenEditAddress(selectedOrderDetails)}
                    className="text-xs text-[#ee4d2d] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Sửa địa chỉ
                  </button>
                </div>
                {selectedOrderDetails.shippingAddress ? (
                  <div className="text-xs text-gray-700 space-y-1">
                    <p className="font-bold text-gray-900">
                      {selectedOrderDetails.shippingAddress.receiverName || 'Người nhận'} ({selectedOrderDetails.shippingAddress.receiverPhone || 'N/A'})
                    </p>
                    <p>
                      {selectedOrderDetails.shippingAddress.street},{' '}
                      {selectedOrderDetails.shippingAddress.city},{' '}
                      {selectedOrderDetails.shippingAddress.state}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Thông tin địa chỉ giao hàng mặc định.</p>
                )}
              </div>

              {/* Danh sách Sản Phẩm trong Đơn */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Danh sách sản phẩm</h4>
                <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden">
                  {selectedOrderDetails.orderItems?.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center gap-4 bg-white">
                      <img
                        src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                        alt={item.product?.name}
                        className="w-14 h-14 object-cover rounded-lg border border-gray-100"
                      />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-800">{item.product?.name}</p>
                        <p className="text-xs text-gray-500">Số lượng: x{item.quantity}</p>
                      </div>
                      <span className="text-xs font-bold text-[#ee4d2d]">{formatVND(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng Thanh Toán */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="font-bold text-gray-700">Tổng thanh toán:</span>
                <span className="text-lg font-extrabold text-[#ee4d2d]">
                  {formatVND(selectedOrderDetails.totalAmount)}
                </span>
              </div>

              {/* Nút Đóng Modal */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 font-bold text-xs text-gray-800 rounded-xl transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Chỉnh Sửa Địa Chỉ Nhận Hàng (Gợi ý / Gọi API Cập Nhật PUT /api/v1/users/addresses/:id) */}
        {editingAddressOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#ee4d2d]" />
                  Chỉnh Sửa Địa Chỉ Nhận Hàng #{editingAddressOrder.id}
                </h3>
                <button
                  onClick={() => setEditingAddressOrder(null)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-500" /> Tên Người Nhận
                  </label>
                  <input
                    type="text"
                    value={editReceiverName}
                    onChange={(e) => setEditReceiverName(e.target.value)}
                    placeholder="Nhập họ và tên người nhận"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#ee4d2d] focus:border-[#ee4d2d] font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-500" /> Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    value={editReceiverPhone}
                    onChange={(e) => setEditReceiverPhone(e.target.value)}
                    placeholder="Nhập số điện thoại nhận hàng"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#ee4d2d] focus:border-[#ee4d2d] font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Số Nhà / Tên Đường</label>
                  <input
                    type="text"
                    value={editStreet}
                    onChange={(e) => setEditStreet(e.target.value)}
                    placeholder="VD: 123 Đường Nguyễn Huệ, Phường Bến Nghé"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#ee4d2d] focus:border-[#ee4d2d]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Quận / Huyện</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      placeholder="VD: Quận 1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#ee4d2d]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Tỉnh / TP</label>
                    <input
                      type="text"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      placeholder="VD: TP. Hồ Chí Minh"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#ee4d2d]"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditingAddressOrder(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded-xl font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingAddress ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

