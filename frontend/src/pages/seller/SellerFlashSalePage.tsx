import React, { useState, useEffect } from 'react';
import { SellerLayout } from '../../components/layout/SellerLayout';
import { voucherService, FlashSaleSession } from '../../services/voucher-service';
import { apiClient } from '../../services/api-client';
import { formatVND } from '../../utils/format-currency';
import { Zap, Plus, Clock, Calendar, AlertCircle, RefreshCw, Package, CheckCircle2 } from 'lucide-react';

export const SellerFlashSalePage: React.FC = () => {
  const [sessions, setSessions] = useState<FlashSaleSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [registeredItems, setRegisteredItems] = useState<any[]>([]);

  const [loadingSessions, setLoadingSessions] = useState<boolean>(true);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);

  // Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedSkuId, setSelectedSkuId] = useState<number | null>(null);

  const [promotionalStock, setPromotionalStock] = useState<number>(10);
  const [discountPercentage, setDiscountPercentage] = useState<number>(15);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Nạp các phiên Flash Sale khả dụng từ Backend: GET /api/v1/seller/flash-sales/sessions
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await voucherService.getSellerFlashSaleSessions();
      setSessions(data);
      if (data.length > 0) {
        setSelectedSessionId(data[0].id);
      }
    } catch {
      setErrorMsg('Không thể nạp danh sách phiên Flash Sale khả dụng.');
    } finally {
      setLoadingSessions(false);
    }
  };

  // Nạp danh sách sản phẩm đã đăng ký trong phiên đã chọn: GET /api/v1/seller/flash-sales/:sessionId/items
  const fetchRegisteredItems = async (sessionId: number) => {
    setLoadingItems(true);
    try {
      const data = await voucherService.getSellerRegisteredFlashSaleItems(sessionId);
      setRegisteredItems(data);
    } catch {
      setRegisteredItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // Nạp danh sách sản phẩm của Seller từ Backend để chọn đăng ký: GET /api/seller/products
  const fetchSellerProducts = async () => {
    try {
      const res = await apiClient.get('/seller/products');
      const data = res.data?.data || res.data || [];
      setSellerProducts(Array.isArray(data) ? data : []);
    } catch {
      setSellerProducts([]);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchSellerProducts();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      fetchRegisteredItems(selectedSessionId);
    }
  }, [selectedSessionId]);

  const handleOpenRegisterModal = () => {
    setSelectedProductId(null);
    setSelectedSkuId(null);
    setPromotionalStock(10);
    setDiscountPercentage(15);
    setErrorMsg('');
    setSuccessMsg('');
    setShowRegisterModal(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedSessionId || !selectedProductId || !selectedSkuId) {
      setErrorMsg('Vui lòng chọn đầy đủ Khung giờ, Sản phẩm và Phân loại (SKU).');
      return;
    }

    if (discountPercentage <= 0 || discountPercentage > 90) {
      setErrorMsg('% giảm giá Flash Sale phải lớn hơn 0 và nhỏ hơn 90%.');
      return;
    }

    if (promotionalStock <= 0) {
      setErrorMsg('Số lượng kho bán Flash Sale phải lớn hơn 0.');
      return;
    }

    setSubmitting(true);
    try {
      await voucherService.registerFlashSaleItem({
        sessionId: selectedSessionId,
        productId: selectedProductId,
        skuId: selectedSkuId,
        promotionalStock,
        discountPercentage,
      });

      setSuccessMsg('Đăng ký sản phẩm tham gia Flash Sale thành công!');
      setTimeout(() => {
        setShowRegisterModal(false);
        setSuccessMsg('');
      }, 1500);

      if (selectedSessionId) {
        await fetchRegisteredItems(selectedSessionId);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Không thể đăng ký sản phẩm tham gia Flash Sale.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProductObj = sellerProducts.find((p) => p.id === selectedProductId);
  const availableSkus: any[] = selectedProductObj?.skus || [];

  return (
    <SellerLayout>
      <div className="space-y-6 font-['Roboto',sans-serif]">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#ee4d2d] fill-[#ee4d2d]" /> Đăng Ký Chương Trình Flash Sale
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Đăng ký các phân loại sản phẩm hot tham gia khung giờ săn sale cùng Shopew
            </p>
          </div>
          <button
            onClick={handleOpenRegisterModal}
            disabled={!selectedSessionId}
            className="px-4 py-2 bg-[#ee4d2d] hover:bg-[#d03e20] text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> Đăng Ký Sản Phẩm Vào Khung Giờ
          </button>
        </div>

        {/* Danh sách các Phiên Session khả dụng */}
        {loadingSessions ? (
          <div className="p-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#ee4d2d]" /> Đang tải danh sách khung giờ Flash Sale...
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-orange-50 p-8 text-center rounded-xl border border-orange-200 space-y-2">
            <Clock className="w-8 h-8 text-[#ee4d2d] mx-auto" />
            <div className="text-sm font-bold text-gray-800">Chưa có khung giờ Flash Sale nào khả dụng</div>
            <p className="text-xs text-gray-500">
              Vui lòng quay lại sau khi Quản trị viên (Admin) tạo các khung giờ Flash Sale mới.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs font-bold text-gray-700">Chọn khung giờ Flash Sale:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {sessions.map((session) => {
                const isSelected = session.id === selectedSessionId;
                return (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'border-[#ee4d2d] bg-orange-50/60 shadow-xs ring-1 ring-[#ee4d2d]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span className="text-gray-900">Phiên #{session.id}</span>
                      {isSelected && (
                        <span className="bg-[#ee4d2d] text-white text-[10px] px-2 py-0.5 rounded font-bold">
                          Đã chọn
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>Bắt đầu: {new Date(session.startTime).toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>Kết thúc: {new Date(session.endTime).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Danh sách sản phẩm đã đăng ký trong phiên được chọn */}
        {selectedSessionId && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-600" /> Sản Phẩm Đã Đăng Ký Trong Phiên #{selectedSessionId} (
              {registeredItems.length})
            </h2>

            {loadingItems ? (
              <div className="p-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#ee4d2d]" /> Đang nạp danh sách sản phẩm đăng ký...
              </div>
            ) : registeredItems.length === 0 ? (
              <div className="bg-gray-50 p-8 text-center rounded-xl border border-gray-200 text-xs text-gray-500">
                Gian hàng chưa có sản phẩm nào đăng ký trong khung giờ này. Bấm "Đăng Ký Sản Phẩm Vào Khung Giờ" ở trên để tham gia.
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 border-b border-gray-200 font-bold text-gray-700 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Sản Phẩm / SKU</th>
                      <th className="px-4 py-3">Giá Khuyến Mãi</th>
                      <th className="px-4 py-3">% Giảm Giá</th>
                      <th className="px-4 py-3">Kho Flash Sale</th>
                      <th className="px-4 py-3">Đã Bán</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white font-medium text-gray-800">
                    {registeredItems.map((item) => {
                      // Xử lý lấy hình ảnh SKU hoặc SPU nếu SKU chưa cài hình ảnh riêng
                      const productImg = Array.isArray(item.product?.images)
                        ? item.product.images[0]
                        : typeof item.product?.images === 'string'
                        ? (JSON.parse(item.product.images)[0] || item.product.images)
                        : null;

                      const itemImage = item.thumbnailUrl || item.sku?.thumbnailUrl || productImg || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                      const originalPrice = item.sku?.originalPrice || item.sku?.price || item.product?.priceMin || 0;
                      const calculatedPrice = item.price || Math.floor(originalPrice * (1 - item.discountPercentage / 100));

                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={itemImage}
                                alt="Item"
                                className="w-10 h-10 object-cover rounded border border-gray-200"
                              />
                              <div>
                                <div className="font-bold text-gray-900 line-clamp-1">{item.productName || item.product?.name || `SKU #${item.skuId}`}</div>
                                <div className="text-[11px] text-gray-500">Mã SKU: {item.skuCode || item.sku?.skuCode || item.skuId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-extrabold text-[#ee4d2d]">
                            {formatVND(calculatedPrice)}
                            {originalPrice > calculatedPrice && (
                              <div className="text-[10px] text-gray-400 line-through font-normal">{formatVND(originalPrice)}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-red-50 text-red-600 font-extrabold px-2 py-0.5 rounded border border-red-200">
                              -{item.discountPercentage}%
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-800">{item.promotionalStock || item.stock || 0}</td>
                          <td className="px-4 py-3 text-emerald-600 font-bold">{item.soldCount || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal Form Đăng Ký Sản Phẩm Vô Flash Sale */}
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#ee4d2d]" /> Đăng Ký Sản Phẩm Vào Khung Giờ #{selectedSessionId}
                </h3>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded text-xs font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                {/* Chọn Sản Phẩm (SPU) */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Chọn Sản Phẩm (SPU)</label>
                  <select
                    value={selectedProductId || ''}
                    onChange={(e) => {
                      const pId = Number(e.target.value);
                      setSelectedProductId(pId);
                      setSelectedSkuId(null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#ee4d2d] font-medium"
                    required
                  >
                    <option value="">-- Chọn sản phẩm của Gian hàng --</option>
                    {sellerProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (ID: #{p.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chọn Phân Loại SKU */}
                {selectedProductId && (
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Chọn Phân Loại Cụ Thể (SKU)</label>
                    <select
                      value={selectedSkuId || ''}
                      onChange={(e) => setSelectedSkuId(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#ee4d2d] font-bold text-gray-800"
                      required
                    >
                      <option value="">-- Chọn SKU phân loại --</option>
                      {availableSkus.map((s) => (
                        <option key={s.id} value={s.id}>
                          Mã SKU: {s.skuCode || s.id} - Giá gốc: {formatVND(s.price)} - Kho gốc: {s.stock}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {/* % Giảm Giá */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">% Giảm Giá Flash Sale</label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#ee4d2d] font-bold text-[#ee4d2d]"
                      required
                    />
                  </div>

                  {/* Kho Bán Flash Sale */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Số Lượng Kho Đăng Ký</label>
                    <input
                      type="number"
                      min="1"
                      value={promotionalStock}
                      onChange={(e) => setPromotionalStock(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#ee4d2d] font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-[#ee4d2d] hover:bg-[#d03e20] text-white font-bold rounded-lg cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Đang Đăng Ký...' : 'Xác Nhận Đăng Ký'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
};
