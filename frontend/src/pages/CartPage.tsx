import React, { useEffect, useState } from 'react';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { ShoppingBag, Store, ArrowRight, ShoppingCart, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService, CartGroup } from '../services/order-service';
import { formatVND } from '../utils/format-currency';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartGroups, setCartGroups] = useState<CartGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  // Tải danh sách sản phẩm trong Giỏ hàng
  const fetchCart = async (keepSelection = false) => {
    setLoading(true);
    try {
      const data = await orderService.getCart();
      setCartGroups(data);
      const allIds = data.flatMap((g) => g.items.map((i) => i.id));
      if (!keepSelection) {
        setSelectedItemIds(allIds);
      } else {
        setSelectedItemIds((prev) => prev.filter((id) => allIds.includes(id)));
      }
    } catch (err) {
      console.error('Lỗi khi tải giỏ hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Thay đổi số lượng item hoặc xóa khi số lượng = 0
  const handleQuantityChange = async (variantId: number, newQty: number) => {
    try {
      await orderService.addToCart({ variantId, quantity: Math.max(0, newQty) });
      fetchCart(true);
    } catch {
      alert('Không thể cập nhật giỏ hàng.');
    }
  };

  // Chọn/Bỏ chọn tất cả
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = cartGroups.flatMap((g) => g.items.map((i) => i.id));
      setSelectedItemIds(allIds);
    } else {
      setSelectedItemIds([]);
    }
  };

  // Chọn/Bỏ chọn một item
  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItemIds((prev) => [...prev, id]);
    } else {
      setSelectedItemIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Tính tổng số lượng và tổng tiền các item được chọn
  const selectedItems = cartGroups.flatMap((g) => g.items).filter((i) => selectedItemIds.includes(i.id));
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isAllSelected = selectedItems.length > 0 && selectedItems.length === cartGroups.flatMap((g) => g.items).length;

  // Điều hướng sang trang Thanh Toán
  const handleProceedCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.');
      return;
    }
    navigate('/checkout', { state: { selectedCartItems: selectedItems } });
  };

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 font-['Roboto',sans-serif]">
        {/* Header Tiêu Đề */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-[#ee4d2d]" /> Giỏ Hàng Mua Sắm
          </h1>
          <span className="text-xs text-slate-500 font-medium">
            Shopee Đảm Bảo - 3 Ngày Trả Hàng / Hoàn Tiền Miễn Phí
          </span>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-xl text-center text-xs text-slate-400 font-medium">
            Đang tải dữ liệu giỏ hàng...
          </div>
        ) : cartGroups.length === 0 ? (
          <div className="bg-white p-16 rounded-xl border border-slate-200 text-center space-y-4">
            <div className="w-20 h-20 bg-orange-50 text-[#ee4d2d] rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Giỏ hàng của bạn còn trống</h2>
              <p className="text-xs text-slate-500 mt-1">Hãy khám phá hàng ngàn sản phẩm chất lượng trên Shopew!</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#ee4d2d] hover:bg-[#d73211] text-white text-xs font-bold rounded-lg shadow-md transition-colors"
            >
              Mua Sắm Ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header Bảng Giỏ Hàng */}
            <div className="bg-white px-6 py-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 grid grid-cols-12 items-center">
              <div className="col-span-6 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 accent-[#ee4d2d] cursor-pointer"
                />
                <span>Sản Phẩm</span>
              </div>
              <div className="col-span-2 text-center">Đơn Giá</div>
              <div className="col-span-2 text-center">Số Lượng</div>
              <div className="col-span-2 text-right">Số Tiền</div>
            </div>

            {/* Danh Sách Nhóm Theo Shop */}
            {cartGroups.map((group) => (
              <div key={group.shopId} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                {/* Tên Shop */}
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Store className="w-4 h-4 text-[#ee4d2d]" />
                  <span>{group.shopName}</span>
                </div>

                {/* Danh Sách Items thuộc Shop */}
                <div className="divide-y divide-slate-100">
                  {group.items.map((item) => (
                    <div key={item.id} className="p-6 grid grid-cols-12 items-center text-xs gap-4">
                      {/* Checkbox + Ảnh + Tên Sản Phẩm */}
                      <div className="col-span-6 flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                          className="w-4 h-4 accent-[#ee4d2d] cursor-pointer shrink-0"
                        />
                        <img
                          src={item.productImage || 'https://via.placeholder.com/80'}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-md border border-slate-200 shrink-0"
                        />
                        <div className="space-y-1">
                          <Link to={`/product/${item.productId}`} className="font-bold text-slate-800 hover:text-[#ee4d2d] line-clamp-2">
                            {item.productName}
                          </Link>
                          {item.skuCode && (
                            <span className="inline-block text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                              Phân loại: {item.skuCode}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Đơn Giá */}
                      <div className="col-span-2 text-center font-bold text-slate-700">
                        {formatVND(item.price)}
                        {item.originalPrice > item.price && (
                          <span className="block text-[11px] text-slate-400 line-through font-normal">
                            {formatVND(item.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Tăng / Gảm Số Lượng */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white">
                          <button
                            onClick={() => handleQuantityChange(item.skuId, item.quantity - 1)}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold border-r border-slate-300"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 font-bold text-slate-800">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.skuId, item.quantity + 1)}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold border-l border-slate-300"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Thành Tiền & Nút Xóa */}
                      <div className="col-span-2 text-right flex items-center justify-end gap-3">
                        <span className="font-extrabold text-[#ee4d2d] text-sm">
                          {formatVND(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.skuId, 0)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Xóa sản phẩm khỏi giỏ hàng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Thanh Checkout Cố Định Phía Dưới */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-lg flex items-center justify-between sticky bottom-4 z-20">
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 accent-[#ee4d2d] cursor-pointer"
                  />
                  <span>Chọn Tất Cả ({cartGroups.flatMap((g) => g.items).length})</span>
                </label>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs text-slate-500">Tổng thanh toán ({selectedItems.length} sản phẩm):</span>
                  <div className="text-xl font-extrabold text-[#ee4d2d]">{formatVND(totalAmount)}</div>
                </div>

                <button
                  onClick={handleProceedCheckout}
                  disabled={selectedItems.length === 0}
                  className="px-8 py-3 bg-[#ee4d2d] hover:bg-[#d73211] text-white font-bold rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  Mua Hàng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};
