import React, { useState, useEffect } from 'react';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { MapPin, CreditCard, CheckCircle2, ArrowLeft, ShoppingBag, Plus, Edit2, Trash2, Check, RefreshCw, Ticket, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../services/order-service';
import { addressService, AddressPayload } from '../services/address-service';
import { voucherService, Voucher } from '../services/voucher-service';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { formatVND } from '../utils/format-currency';
import { VoucherModal } from '../components/vouchers/VoucherModal';

export const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCartItems = location.state?.selectedCartItems || [];

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successOrder, setSuccessOrder] = useState<{ orderGroupId: string; status: string } | null>(null);

  // Quản lý danh sách địa chỉ giao hàng của User từ API Backend
  const [addresses, setAddresses] = useState<AddressPayload[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);

  // Quản lý Vouchers từ Ví User: GET /api/v1/vouchers/wallet
  const [walletVouchers, setWalletVouchers] = useState<Voucher[]>([]);
  const [selectedPlatformVoucherId, setSelectedPlatformVoucherId] = useState<number | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);

  // State Modal Chọn & Chỉnh Sửa / Thêm Địa Chỉ
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [isEditingInModal, setIsEditingInModal] = useState<boolean>(false);
  const [editingAddrId, setEditingAddrId] = useState<number | null>(null);

  // State cho Popup Confirm Xóa Địa Chỉ (thay thế window.confirm)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deletingAddrId, setDeletingAddrId] = useState<number | null>(null);
  const [isDeletingAddr, setIsDeletingAddr] = useState<boolean>(false);

  // Field Form trong Modal
  const [formName, setFormName] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formStreet, setFormStreet] = useState<string>('');
  const [formCity, setFormCity] = useState<string>('Quận 1');
  const [formState, setFormState] = useState<string>('TP. Hồ Chí Minh');
  const [formIsDefault, setFormIsDefault] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string>('');
  const [savingAddress, setSavingAddress] = useState<boolean>(false);

  // Nạp danh sách địa chỉ từ Backend: GET /api/v1/users/addresses
  const fetchUserAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await addressService.getUserAddresses();
      setAddresses(data);
      if (data.length > 0) {
        const defaultAddr = data.find((a: any) => a.isDefault) || data[0];
        if (defaultAddr.id) setSelectedAddressId(defaultAddr.id);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Nạp danh sách Voucher từ Ví người dùng: GET /api/v1/vouchers/wallet
  const fetchWalletVouchers = async () => {
    try {
      const data = await voucherService.getWalletVouchers();
      setWalletVouchers(data);
    } catch {
      setWalletVouchers([]);
    }
  };

  useEffect(() => {
    fetchUserAddresses();
    fetchWalletVouchers();
  }, []);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  // Mở Form thêm mới địa chỉ trong Modal
  const handleOpenAddForm = () => {
    setEditingAddrId(null);
    setFormName('');
    setFormPhone('');
    setFormStreet('');
    setFormCity('Quận 1');
    setFormState('TP. Hồ Chí Minh');
    setFormIsDefault(addresses.length === 0);
    setModalError('');
    setIsEditingInModal(true);
    setShowAddressModal(true);
  };

  // Mở Form chỉnh sửa địa chỉ trong Modal
  const handleOpenEditForm = (addr: AddressPayload) => {
    if (!addr.id) return;
    setEditingAddrId(addr.id);
    setFormName(addr.receiverName || '');
    setFormPhone(addr.receiverPhone || '');
    setFormStreet(addr.street || '');
    setFormCity(addr.city || 'Quận 1');
    setFormState(addr.state || 'TP. Hồ Chí Minh');
    setFormIsDefault(Boolean(addr.isDefault));
    setModalError('');
    setIsEditingInModal(true);
    setShowAddressModal(true);
  };

  // Mở Popup Confirm trước khi Xóa Địa Chỉ trong Modal Checkout
  const handleOpenDeleteConfirmInModal = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeletingAddrId(id);
    setDeleteConfirmOpen(true);
  };

  // Thực thi Xóa Địa Chỉ sau khi người dùng bấm xác nhận trên Popup Confirm
  const handleConfirmDeleteAddressInModal = async () => {
    if (!deletingAddrId) return;
    setIsDeletingAddr(true);
    try {
      await addressService.deleteAddress(deletingAddrId);
      const remainingAddresses = await addressService.getUserAddresses();
      setAddresses(remainingAddresses);

      if (selectedAddressId === deletingAddrId) {
        const nextDefault = remainingAddresses.find((a) => a.isDefault) || remainingAddresses[0];
        setSelectedAddressId(nextDefault?.id || null);
      }
      setDeleteConfirmOpen(false);
      setDeletingAddrId(null);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Không thể xóa địa chỉ này vì địa chỉ đã được liên kết với đơn hàng đã tạo trước đó.';
      alert(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
      setDeleteConfirmOpen(false);
    } finally {
      setIsDeletingAddr(false);
    }
  };

  // Lưu Địa chỉ (Thêm mới hoặc Cập nhật qua API Backend)
  const handleSaveAddressForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(formPhone.trim())) {
      setModalError('Số điện thoại phải từ 10 đến 11 chữ số.');
      return;
    }

    if (!formName.trim() || !formStreet.trim()) {
      setModalError('Vui lòng điền đầy đủ Tên người nhận và Số nhà/Tên đường.');
      return;
    }

    setSavingAddress(true);
    try {
      const payload = {
        receiverName: formName.trim(),
        receiverPhone: formPhone.trim(),
        street: formStreet.trim(),
        city: formCity.trim() || 'Quận 1',
        state: formState.trim() || 'TP. Hồ Chí Minh',
        zipCode: '700000',
        isDefault: formIsDefault,
      };

      let saved;
      if (editingAddrId) {
        saved = await addressService.updateAddress(editingAddrId, payload);
      } else {
        saved = await addressService.createAddress(payload);
      }

      await fetchUserAddresses();
      if (saved?.id) setSelectedAddressId(saved.id);
      setIsEditingInModal(false);
    } catch (err: any) {
      setModalError(err?.response?.data?.message || 'Không thể lưu thông tin địa chỉ.');
    } finally {
      setSavingAddress(false);
    }
  };

  const totalProductAmount = selectedCartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const shippingFee = selectedCartItems.length > 0 ? 30000 : 0;

  // Tính giảm giá Voucher Sàn (Platform Voucher)
  const selectedPlatformVoucher = walletVouchers.find((v) => v.id === selectedPlatformVoucherId);
  let platformDiscount = 0;
  if (selectedPlatformVoucher && totalProductAmount >= selectedPlatformVoucher.minOrderValue) {
    platformDiscount = Math.floor(totalProductAmount * (selectedPlatformVoucher.discountPercentage / 100));
    if (selectedPlatformVoucher.maxDiscount > 0 && platformDiscount > selectedPlatformVoucher.maxDiscount) {
      platformDiscount = selectedPlatformVoucher.maxDiscount;
    }
  }

  const grandTotal = Math.max(0, totalProductAmount + shippingFee - platformDiscount);

  // Thực hiện Đặt Hàng
  const handlePlaceOrder = async () => {
    if (selectedCartItems.length === 0) {
      alert('Không có sản phẩm nào được chọn để thanh toán.');
      return;
    }

    if (!selectedAddress || !selectedAddress.id) {
      alert('Vui lòng thêm hoặc chọn địa chỉ nhận hàng trước khi thanh toán.');
      setShowAddressModal(true);
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        cartItems: selectedCartItems.map((item: any) => ({
          variantId: item.skuId || item.id,
          quantity: item.quantity,
        })),
        shippingAddressId: selectedAddress.id,
      };

      if (selectedPlatformVoucherId) {
        payload.platformVoucherId = selectedPlatformVoucherId;
      }

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
            {/* Khối Thông Tin Địa Chỉ Nhận Hàng (Kết nối API Backend) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#ee4d2d]">
                  <MapPin className="w-5 h-5" /> Địa Chỉ Nhận Hàng
                </div>
                <button
                  onClick={() => {
                    setIsEditingInModal(false);
                    setShowAddressModal(true);
                  }}
                  className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> {selectedAddress ? 'Thay Đổi' : 'Thêm Địa Chỉ'}
                </button>
              </div>

              {loadingAddresses ? (
                <div className="text-xs text-slate-400 py-2 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#ee4d2d]" /> Đang nạp thông tin người nhận...
                </div>
              ) : selectedAddress ? (
                <div className="text-xs text-slate-800 font-medium space-y-1">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>{selectedAddress.receiverName || 'Người nhận'}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-600 font-semibold">{selectedAddress.receiverPhone || 'N/A'}</span>
                    {selectedAddress.isDefault && (
                      <span className="bg-red-50 text-[#ee4d2d] text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <div className="text-slate-600">
                    {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-2 flex items-center justify-between">
                  <span>Bạn chưa có địa chỉ nhận hàng. Vui lòng thêm địa chỉ để thanh toán.</span>
                  <button
                    onClick={handleOpenAddForm}
                    className="px-3 py-1.5 bg-[#ee4d2d] text-white text-xs font-bold rounded cursor-pointer"
                  >
                    + Thêm Địa Chỉ Mới
                  </button>
                </div>
              )}
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

            {/* Khối Chọn Shopew Voucher / Mã Giảm Giá (Tích hợp Modal Chọn Voucher) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Ticket className="w-5 h-5 text-[#ee4d2d]" /> Shopew Voucher & Mã Giảm Giá
                </div>
                <button
                  onClick={() => setShowVoucherModal(true)}
                  className="text-xs text-[#ee4d2d] font-bold hover:underline flex items-center gap-1 cursor-pointer bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200"
                >
                  {selectedPlatformVoucher ? 'Đổi Voucher khác' : 'Chọn Voucher'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {selectedPlatformVoucher ? (
                <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-[#ee4d2d] rounded-xl font-bold flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#ee4d2d] text-white text-[10px] px-2 py-0.5 rounded font-extrabold uppercase">
                      Đã áp dụng
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {selectedPlatformVoucher.code} (-{selectedPlatformVoucher.discountPercentage}%)
                    </span>
                  </div>
                  <span className="text-sm font-extrabold">-{formatVND(platformDiscount)}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-500 py-1">
                  <span>Ví của bạn có {walletVouchers.length} mã giảm giá sẵn sàng sử dụng.</span>
                  <button
                    onClick={() => setShowVoucherModal(true)}
                    className="font-bold text-[#ee4d2d] hover:underline cursor-pointer"
                  >
                    Bấm để chọn mã
                  </button>
                </div>
              )}
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
                {platformDiscount > 0 && (
                  <div className="flex justify-between text-[#ee4d2d]">
                    <span>Giảm giá Voucher:</span>
                    <span className="font-bold">-{formatVND(platformDiscount)}</span>
                  </div>
                )}
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

        {/* Modal Chọn & Quản Lý Địa Chỉ Nhận Hàng */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#ee4d2d]" /> Địa Chỉ Nhận Hàng Của Tôi
                </h3>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {!isEditingInModal ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Chọn địa chỉ nhận hàng cho đơn này:</span>
                    <button
                      onClick={handleOpenAddForm}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#ee4d2d] text-white font-bold rounded-lg cursor-pointer hover:bg-[#d73211]"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm Địa Chỉ Mới
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 font-medium">
                      Chưa có địa chỉ nào. Hãy bấm "Thêm Địa Chỉ Mới" ở trên.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {addresses.map((addr) => {
                        const isSelected = addr.id === selectedAddressId;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => addr.id && setSelectedAddressId(addr.id)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isSelected
                                ? 'border-[#ee4d2d] bg-orange-50/40 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                <span>{addr.receiverName || 'Người nhận'}</span>
                                <span className="text-slate-300">|</span>
                                <span className="text-slate-600 font-semibold">{addr.receiverPhone || 'N/A'}</span>
                                {addr.isDefault && (
                                  <span className="bg-red-50 text-[#ee4d2d] text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-600">
                                {addr.street}, {addr.city}, {addr.state}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditForm(addr);
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                title="Chỉnh sửa thông tin địa chỉ này"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {addr.id && (
                                <button
                                  onClick={(e) => handleOpenDeleteConfirmInModal(e, addr.id!)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                  title="Xóa địa chỉ này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {isSelected && (
                                <div className="w-6 h-6 bg-[#ee4d2d] text-white rounded-full flex items-center justify-center">
                                  <Check className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setShowAddressModal(false)}
                      className="px-5 py-2 bg-[#ee4d2d] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Xác Nhận Chọn
                    </button>
                  </div>
                </div>
              ) : (
                /* Form Thêm mới / Cập nhật Địa chỉ trực tiếp trong Modal */
                <form onSubmit={handleSaveAddressForm} className="space-y-3 text-xs">
                  <div className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                    {editingAddrId ? 'Chỉnh Sửa Thông Tin Người Nhận & Địa Chỉ' : 'Thêm Địa Chỉ Nhận Hàng Mới'}
                  </div>

                  {modalError && (
                    <div className="p-2 bg-red-50 text-red-600 border border-red-200 rounded font-medium">
                      {modalError}
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tên Người Nhận</label>
                    <input
                      type="text"
                      placeholder="Họ và tên người nhận"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#ee4d2d] font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                    <input
                      type="tel"
                      placeholder="Số điện thoại nhận hàng"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#ee4d2d] font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số Nhà / Tên Đường</label>
                    <input
                      type="text"
                      placeholder="Số nhà, tên đường, phường/xã"
                      value={formStreet}
                      onChange={(e) => setFormStreet(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#ee4d2d]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Quận / Huyện</label>
                      <input
                        type="text"
                        placeholder="Quận / Huyện"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#ee4d2d]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tỉnh / TP</label>
                      <input
                        type="text"
                        placeholder="Tỉnh / Thành phố"
                        value={formState}
                        onChange={(e) => setFormState(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#ee4d2d]"
                        required
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formIsDefault}
                      onChange={(e) => setFormIsDefault(e.target.checked)}
                      className="accent-[#ee4d2d]"
                    />
                    Đặt làm địa chỉ mặc định
                  </label>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsEditingInModal(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                    >
                      Quay Lại
                    </button>
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="px-4 py-2 bg-[#ee4d2d] text-white font-bold rounded-lg hover:bg-[#d73211] cursor-pointer disabled:opacity-50"
                    >
                      {savingAddress ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* System Confirm Modal cho Thao tác Xóa Địa Chỉ trong Checkout */}
        <ConfirmModal
          isOpen={deleteConfirmOpen}
          title="Xác nhận xóa địa chỉ nhận hàng"
          message="Bạn có chắc chắn muốn xóa địa chỉ nhận hàng này khỏi sổ địa chỉ?"
          confirmText="Đồng ý Xóa"
          cancelText="Giữ lại"
          type="danger"
          isLoading={isDeletingAddr}
          onConfirm={handleConfirmDeleteAddressInModal}
          onCancel={() => {
            setDeleteConfirmOpen(false);
            setDeletingAddrId(null);
          }}
        />

        {/* Modal Chọn Voucher Trực Tiếp Từ Ví */}
        <VoucherModal
          isOpen={showVoucherModal}
          onClose={() => setShowVoucherModal(false)}
          walletVouchers={walletVouchers}
          totalAmount={totalProductAmount}
          selectedPlatformVoucherId={selectedPlatformVoucherId}
          onSelectPlatformVoucher={(id) => setSelectedPlatformVoucherId(id)}
        />

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
