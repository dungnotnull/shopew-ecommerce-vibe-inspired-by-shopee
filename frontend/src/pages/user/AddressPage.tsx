import React, { useState, useEffect } from 'react';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { ShippingAddress } from '../../types/user';
import { Plus, MapPin, Trash2, Edit2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

// Trang Sổ Địa Chỉ Giao Hàng (User Address Book)
export const AddressPage: React.FC = () => {
  const { user } = useAuthStore();

  // Dữ liệu Địa chỉ giao hàng
  const [addresses, setAddresses] = useState<ShippingAddress[]>([
    {
      id: 1,
      fullName: user?.fullName || 'Nguyễn Văn A',
      phone: user?.phone || '0987654321',
      province: 'TP. Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Phường Bến Nghé',
      detailAddress: 'Số 123 Đường Lê Lợi',
      isDefault: true,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [province, setProvince] = useState('TP. Hồ Chí Minh');
  const [district, setDistrict] = useState('Quận 1');
  const [ward, setWard] = useState('Phường Bến Nghé');
  const [detailAddress, setDetailAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName((prev) => prev || user.fullName || '');
      setPhone((prev) => prev || user.phone || '');
      setAddresses((prev) =>
        prev.map((a, idx) => (idx === 0 ? { ...a, fullName: user.fullName || a.fullName, phone: user.phone || a.phone } : a))
      );
    }
  }, [user]);

  // Đặt địa chỉ mặc định
  const handleSetDefault = (id: number) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  // Xóa địa chỉ
  const handleDeleteAddress = (id: number) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const [errorMsg, setErrorMsg] = useState('');

  // Thêm địa chỉ mới
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validate Số điện thoại buộc từ 10 đến 11 chữ số
    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(phone.trim())) {
      setErrorMsg('Số điện thoại nhận hàng phải bao gồm từ 10 đến 11 chữ số.');
      return;
    }

    const newAddr: ShippingAddress = {
      id: Date.now(),
      fullName,
      phone,
      province,
      district,
      ward,
      detailAddress,
      isDefault: isDefault || addresses.length === 0,
    };

    if (newAddr.isDefault) {
      setAddresses((prev) =>
        prev.map((addr) => ({ ...addr, isDefault: false }))
      );
    }

    setAddresses((prev) => [...prev, newAddr]);
    setShowModal(false);
    // Clear form
    setFullName('');
    setPhone('');
    setDetailAddress('');
    setIsDefault(false);
  };

  return (
    <CustomerLayout>
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Địa Chỉ Của Tôi</h1>
            <p className="text-xs text-gray-500 mt-1">Quản lý địa chỉ nhận hàng để thanh toán nhanh chóng</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 bg-[#ee4d2d] hover:bg-[#d03e20] text-white text-xs font-bold px-4 py-2 rounded transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Thêm Địa Chỉ Mới
          </button>
        </div>

        {/* Danh sách địa chỉ */}
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-start hover:border-gray-300 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-800 text-sm">{addr.fullName}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs text-gray-600 font-medium">{addr.phone}</span>
                  {addr.isDefault && (
                    <span className="bg-red-50 text-[#ee4d2d] text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}
                </p>
              </div>

              <div className="flex flex-col items-end space-y-2 text-xs">
                <div className="flex items-center space-x-3">
                  <button className="text-blue-600 hover:underline flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Cập nhật
                  </button>
                  {!addr.isDefault && (
                    <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-600 hover:underline flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Xóa
                    </button>
                  )}
                </div>
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="border border-gray-300 text-gray-700 hover:border-[#ee4d2d] hover:text-[#ee4d2d] px-3 py-1 rounded text-[11px]"
                  >
                    Thiết lập mặc định
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Thêm địa chỉ mới */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Địa Chỉ Mới</h3>

              {errorMsg && (
                <div className="mb-3 p-2.5 bg-red-50 text-red-600 border border-red-200 rounded text-xs">
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleAddAddress} className="space-y-3">
                <input
                  type="text"
                  placeholder="Họ và tên người nhận"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                  required
                />
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Tỉnh / Thành phố"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Quận / Huyện"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Phường / Xã"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                  required
                />
                <textarea
                  placeholder="Địa chỉ cụ thể (Tòa nhà, số nhà, tên đường)"
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                  required
                ></textarea>

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
                    className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs bg-[#ee4d2d] text-white font-bold rounded hover:bg-[#d03e20]"
                  >
                    Hoàn Thành
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
