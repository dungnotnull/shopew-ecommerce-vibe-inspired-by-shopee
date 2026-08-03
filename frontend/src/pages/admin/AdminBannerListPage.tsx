import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Tag, Plus, Edit, Trash2, Search, Upload, Image as ImageIcon, Loader2, Link as LinkIcon, CheckCircle, XCircle, ArrowUpDown, RefreshCw, ExternalLink } from 'lucide-react';
import { adminService, AdminBanner } from '../../services/admin-service';

export const AdminBannerListPage: React.FC = () => {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // State Modal Thêm/Sửa Banner
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const [title, setTitle] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string>('');

  // State Modal Xác Nhận Xóa Banner
  const [deletingBanner, setDeletingBanner] = useState<AdminBanner | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  const fetchBanners = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await adminService.getBanners(1, 100);
      setBanners(res.data || []);
    } catch (err: any) {
      setErrorMsg('Không thể tải danh sách Banner. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Tự động tắt thông báo thành công sau 4 giây
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Xử lý Upload Ảnh Banner qua API POST /api/v1/upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setModalError('');
    try {
      const uploadedUrl = await adminService.uploadImage(file);
      if (!uploadedUrl) {
        throw new Error('Server không trả về URL hình ảnh.');
      }
      setImageUrl(uploadedUrl);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể tải tệp hình ảnh. Vui lòng chọn file hợp lệ (jpg, png, webp, gif).';
      setModalError(msg);
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  // Mở modal tạo mới Banner
  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setImageUrl('');
    setLinkUrl('');
    setSortOrder(banners.length > 0 ? Math.max(...banners.map(b => b.sortOrder || 0)) + 1 : 0);
    setIsActive(true);
    setModalError('');
    setIsModalOpen(true);
  };

  // Mở modal chỉnh sửa Banner
  const handleOpenEditModal = (banner: AdminBanner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setImageUrl(banner.imageUrl);
    setLinkUrl(banner.linkUrl || '');
    setSortOrder(banner.sortOrder || 0);
    setIsActive(banner.isActive);
    setModalError('');
    setIsModalOpen(true);
  };

  // Lưu Banner (Tạo mới hoặc Cập nhật)
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setModalError('Vui lòng nhập tên/tiêu đề Banner.');
      return;
    }
    if (!imageUrl.trim()) {
      setModalError('Vui lòng tải lên hoặc dán URL hình ảnh Banner.');
      return;
    }

    setSaving(true);
    setModalError('');
    try {
      const payload = {
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl.trim() || undefined,
        sortOrder: Number(sortOrder) || 0,
        isActive,
      };

      if (editingBanner) {
        await adminService.updateBanner(editingBanner.id, payload);
        setSuccessMsg(`Đã cập nhật Banner "${title}" thành công!`);
      } else {
        await adminService.createBanner(payload);
        setSuccessMsg(`Đã tạo Banner mới "${title}" thành công!`);
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      setModalError(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu Banner. Vui lòng kiểm tra lại.');
    } finally {
      setSaving(false);
    }
  };

  // Nhanh chóng bật/tắt trạng thái hiển thị
  const handleToggleActive = async (banner: AdminBanner) => {
    try {
      const updated = await adminService.updateBanner(banner.id, { isActive: !banner.isActive });
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: updated.isActive } : b));
      setSuccessMsg(`Đã ${updated.isActive ? 'kích hoạt' : 'ẩn'} Banner "${banner.title}" thành công.`);
    } catch {
      setErrorMsg('Không thể thay đổi trạng thái Banner.');
    }
  };

  // Mở modal xóa Banner
  const handleOpenDeleteModal = (banner: AdminBanner) => {
    setDeletingBanner(banner);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  // Thực hiện xóa Banner
  const handleConfirmDelete = async () => {
    if (!deletingBanner) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await adminService.deleteBanner(deletingBanner.id);
      setSuccessMsg(`Đã xóa Banner "${deletingBanner.title}" thành công!`);
      setIsDeleteModalOpen(false);
      setDeletingBanner(null);
      fetchBanners();
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || 'Không thể xóa Banner này. Vui lòng thử lại sau.');
    } finally {
      setDeleting(false);
    }
  };

  // Lọc Banner theo ô tìm kiếm
  const filteredBanners = banners.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.linkUrl && b.linkUrl.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-6 font-['Roboto',sans-serif]">
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Tag className="w-6 h-6 text-red-600" /> Quản Lý Banner Quảng Cáo Sàn
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý danh sách Banner slider khuyến mãi trên trang chủ và các chiến dịch quảng cáo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBanners}
              className="p-2 text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-slate-200 rounded-md transition"
              title="Tải lại danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs px-4 py-2 rounded-md shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm Banner Mới
            </button>
          </div>
        </div>

        {/* Thông Báo Thành Công / Lỗi */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-3 rounded-md flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-800 text-sm font-bold">×</button>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-md flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-800 text-sm font-bold">×</button>
          </div>
        )}

        {/* Thanh Tìm Kiếm & Thống Kê Nhanh */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề hoặc liên kết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 font-medium w-full md:w-auto justify-end">
            <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-md">
              Tổng số: <strong className="text-slate-900">{banners.length}</strong> Banner
            </span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-md">
              Đang hiện: <strong>{banners.filter(b => b.isActive).length}</strong>
            </span>
            <span className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-md">
              Đang ẩn: <strong>{banners.filter(b => !b.isActive).length}</strong>
            </span>
          </div>
        </div>

        {/* Bảng Danh Sách Banner */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <span className="text-xs">Đang tải danh sách Banner...</span>
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">Chưa có Banner quảng cáo nào</p>
            <p className="text-xs text-slate-400 mt-1">Bấm nút "Thêm Banner Mới" ở trên để tạo banner cho trang chủ.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-slate-200 font-semibold border-b border-slate-700">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4 w-44">Hình Ảnh Banner</th>
                  <th className="py-3 px-4">Tiêu Đề & Đường Dẫn</th>
                  <th className="py-3 px-4 w-28 text-center">
                    <span className="flex items-center justify-center gap-1">
                      Thứ Tự <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </span>
                  </th>
                  <th className="py-3 px-4 w-32 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 w-28 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredBanners.map((banner, index) => (
                  <tr key={banner.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">
                      {index + 1}
                    </td>

                    {/* Hình ảnh banner preview */}
                    <td className="py-3 px-4">
                      <div className="w-36 h-16 rounded-md overflow-hidden border border-slate-200 bg-slate-100 relative group">
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <a
                            href={banner.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white bg-black/60 p-1.5 rounded-full hover:bg-red-600 transition"
                            title="Xem ảnh gốc"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Tiêu đề & Link URL */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 text-sm mb-1">{banner.title}</div>
                      {banner.linkUrl ? (
                        <a
                          href={banner.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1 truncate max-w-xs"
                        >
                          <LinkIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{banner.linkUrl}</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Không gắn đường dẫn</span>
                      )}
                    </td>

                    {/* Thứ tự sắp xếp */}
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs">
                        #{banner.sortOrder ?? 0}
                      </span>
                    </td>

                    {/* Trạng thái Bật/Tắt */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition flex items-center justify-center gap-1 mx-auto cursor-pointer border ${
                          banner.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                        }`}
                        title="Bấm để thay đổi trạng thái"
                      >
                        {banner.isActive ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Hiển thị
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span> Ẩn
                          </>
                        )}
                      </button>
                    </td>

                    {/* Thao tác Chỉnh sửa / Xóa */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(banner)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                          title="Sửa Banner"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(banner)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                          title="Xóa Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL THÊM / SỬA BANNER */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-red-500" />
                  {editingBanner ? 'Chỉnh Sửa Banner Quảng Cáo' : 'Tạo Banner Quảng Cáo Mới'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveBanner} className="p-6 space-y-4">
                {modalError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-md flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Tiêu đề Banner */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tiêu Đề / Tên Banner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Siêu Sale Khuyến Mãi Tháng 8 - Giảm 50%"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>

                {/* Hình Ảnh Banner */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hình Ảnh Banner <span className="text-red-500">*</span>
                  </label>

                  <div className="space-y-2">
                    {/* Preview ảnh nếu có */}
                    {imageUrl && (
                      <div className="relative w-full h-32 rounded-md overflow-hidden border border-slate-300 bg-slate-100">
                        <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full transition text-xs"
                          title="Xóa ảnh"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <label className="flex-1 bg-slate-50 border border-dashed border-slate-300 hover:border-red-400 hover:bg-red-50/30 rounded-md p-3 text-center cursor-pointer transition">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                          {uploadingImage ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                              <span>Đang tải tệp ảnh lên...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-slate-500" />
                              <span>Tải ảnh từ máy tính</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>

                    <div className="text-[11px] text-slate-400 font-medium">Hoặc nhập trực tiếp URL đường dẫn hình ảnh:</div>
                    <input
                      type="text"
                      placeholder="/api/uploads/... hoặc https://example.com/banner-image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>

                {/* Đường dẫn khi click Banner */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đường Dẫn Đích Khi Click (Link URL)
                  </label>
                  <input
                    type="text"
                    placeholder="/search?category_id=1 hoặc https://..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Khi khách hàng bấm vào banner slider sẽ chuyển hướng tới liên kết này.</p>
                </div>

                {/* Thứ tự & Trạng thái */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Thứ Tự Sắp Xếp
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Trạng Thái Hiển Thị
                    </label>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-slate-300 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-slate-700">Kích hoạt ngay trên trang chủ</span>
                    </label>
                  </div>
                </div>

                {/* Buttons Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md text-xs font-medium transition cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingBanner ? 'Lưu Thay Đổi' : 'Tạo Banner Mới'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL XÁC NHẬN XÓA BANNER */}
        {isDeleteModalOpen && deletingBanner && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <div className="bg-red-100 p-2.5 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Xác Nhận Xóa Banner</h3>
                  <p className="text-xs text-slate-500">Hành động này không thể hoàn tác.</p>
                </div>
              </div>

              {deleteError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-md">
                  {deleteError}
                </div>
              )}

              <p className="text-xs text-slate-700">
                Bạn có chắc chắn muốn xóa Banner <strong className="text-slate-900">"{deletingBanner.title}"</strong> không?
              </p>

              {deletingBanner.imageUrl && (
                <div className="w-full h-24 rounded border border-slate-200 overflow-hidden bg-slate-50">
                  <img src={deletingBanner.imageUrl} alt="Banner Delete Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md text-xs font-medium transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Đồng Ý Xóa</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
