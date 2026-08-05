import React, { useState, useEffect } from 'react';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { addressService, AddressPayload } from '../../services/address-service';
import { Plus, MapPin, Trash2, Edit2, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

// Trang Sổ Địa Chỉ Giao Hàng (User Address Book) kết nối API Backend
export const AddressPage: React.FC = () => {
  const { user } = useAuthStore();

  const [addresses, setAddresses] = useState<AddressPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State điều khiển Modal Thêm / Chỉnh Sửa Địa Chỉ
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fields của Form
  const [receiverName, setReceiverName] = useState(user?.fullName || '');
  const [receiverPhone, setReceiverPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Quận 1');
  const [state, setState] = useState('TP. Hồ Chí Minh');
  const [isDefault, setIsDefault] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nạp danh sách địa chỉ từ Backend: GET /api/v1/users/addresses
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressService.getUserAddresses();
      setAddresses(data);
    } catch {
      setErrorMsg('Không thể nạp danh sách địa chỉ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Reset Form khi mở modal thêm mới
  const handleOpenAddModal = () => {
    setEditingId(null);
    setReceiverName(user?.fullName || '');
    setReceiverPhone(user?.phone || '');
    setStreet('');
    setCity('Quận 1');
    setState('TP. Hồ Chí Minh');
    setIsDefault(addresses.length === 0);
    setErrorMsg('');
    setShowModal(true);
  };

  // Mở modal chỉnh sửa địa chỉ đã chọn
  const handleOpenEditModal = (addr: AddressPayload) => {
    if (!addr.id) return;
    setEditingId(addr.id);
    setReceiverName(addr.receiverName || '');
    setReceiverPhone(addr.receiverPhone || '');
    setStreet(addr.street || '');
    setCity(addr.city || 'Quận 1');
    setState(addr.state || 'TP. Hồ Chí Minh');
    setIsDefault(Boolean(addr.isDefault));
    setErrorMsg('');
    setShowModal(true);
  };

  // Đặt địa chỉ làm mặc định (PUT /api/v1/users/addresses/:id)
  const handleSetDefault = async (id: number) => {
    try {
      await addressService.updateAddress(id, { isDefault: true });
      await fetchAddresses();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể thiết lập địa chỉ mặc định.');
    }
  };

  // Xóa địa chỉ (DELETE /api/v1/users/addresses/:id)
  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      await addressService.deleteAddress(id);
      await fetchAddresses();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể xóa địa chỉ.');
    }
  };

  // Submit Thêm mới hoặc Cập nhật địa chỉ
  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validate số điện thoại nhận hàng
    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(receiverPhone.trim())) {
      setErrorMsg('Số điện thoại nhận hàng phải bao gồm từ 10 đến 11 chữ số.');
      return;
    }

    if (!receiverName.trim() || !street.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Tên người nhận và Số nhà / Tên đường.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        street: street.trim(),
        city: city.trim() || 'Quận 1',
        state: state.trim() || 'TP. Hồ Chí Minh',
        zipCode: '700000',
        isDefault,
      };

      if (editingId) {
        // Cập nhật địa chỉ: PUT /api/v1/users/addresses/:id
        await addressService.updateAddress(editingId, payload);
      } else {
        // Thêm địa chỉ mới: POST /api/v1/users/addresses
        await addressService.createAddress(payload);
      }

      setShowModal(false);
      await fetchAddresses();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Không thể lưu thông tin địa chỉ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 max-w-4xl mx-auto font-['Roboto',sans-serif]">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Địa Chỉ Của Tôi</h1>
            <p className="text-xs text-gray-500 mt-1">Quản lý người nhận và địa chỉ giao hàng để đặt hàng nhanh chóng</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 bg-[#ee4d2d] hover:bg-[#d03e20] text-white text-xs font-bold px-4 py-2 rounded transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm Địa Chỉ Mới
          </button>
        </div>

        {/* Danh sách địa chỉ */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 font-medium flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#ee4d2d]" /> Đang nạp danh sách địa chỉ...
          </div>
        ) : addresses.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500 space-y-2">
            <p className="font-bold text-gray-700">Bạn chưa có địa chỉ nhận hàng nào</p>
            <p>Vui lòng bấm nút "Thêm Địa Chỉ Mới" để lưu thông tin địa chỉ của bạn.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-start hover:border-gray-300 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-800 text-sm">{addr.receiverName || 'Khách hàng'}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-600 font-medium">{addr.receiverPhone || 'N/A'}</span>
                    {addr.isDefault && (
                      <span className="bg-red-50 text-[#ee4d2d] text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {addr.street}, {addr.city}, {addr.state}
                  </p>
                </div>

                <div className="flex flex-col items-end space-y-2 text-xs shrink-0">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleOpenEditModal(addr)}
                      className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <Edit2 className="w-3 h-3" /> Cập nhật
                    </button>
                    {!addr.isDefault && addr.id && (
                      <button
                        onClick={() => handleDeleteAddress(addr.id!)}
                        className="text-red-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <Trash2 className="w-3 h-3" /> Xóa
                      </button>
                    )}
                  </div>
                  {!addr.isDefault && addr.id && (
                    <button
                      onClick={() => handleSetDefault(addr.id!)}
                      className="border border-gray-300 text-gray-700 hover:border-[#ee4d2d] hover:text-[#ee4d2d] px-3 py-1 rounded text-[11px] font-medium cursor-pointer"
                    >
                      Thiết lập mặc định
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Thêm / Chỉnh Sửa Địa Chỉ */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editingId ? 'Chỉnh Sửa Địa Chỉ' : 'Địa Chỉ Mới'}
              </h3>

              {errorMsg && (
                <div className="mb-3 p-2.5 bg-red-50 text-red-600 border border-red-200 rounded text-xs font-medium">
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleSubmitAddress} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Tên Người Nhận</label>
                  <input
                    type="text"
                    placeholder="Họ và tên người nhận"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d] font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="tel"
                    placeholder="Số điện thoại nhận hàng"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d] font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Số Nhà / Tên Đường</label>
                  <input
                    type="text"
                    placeholder="Số nhà, tên đường, phường/xã"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Quận / Huyện</label>
                    <input
                      type="text"
                      placeholder="Quận / Huyện"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Tỉnh / TP</label>
                    <input
                      type="text"
                      placeholder="Tỉnh / Thành phố"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                      required
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded text-[#ee4d2d] focus:ring-[#ee4d2d]"
                  />
                  Đặt làm địa chỉ mặc định
                </label>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs bg-[#ee4d2d] text-white font-bold rounded hover:bg-[#d03e20] cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Đang lưu...' : 'Hoàn Thành'}
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
