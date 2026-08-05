import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { voucherService, FlashSaleSession } from '../../services/voucher-service';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Zap, Plus, Edit2, Trash2, Clock, Calendar, AlertCircle, RefreshCw } from 'lucide-react';

export const AdminFlashSalePage: React.FC = () => {
  const [sessions, setSessions] = useState<FlashSaleSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingSession, setEditingSession] = useState<FlashSaleSession | null>(null);

  // Form Fields
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Delete Confirm Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Nạp danh sách Session Flash Sale từ API Backend: GET /api/v1/admin/flash-sales
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await voucherService.getAdminFlashSaleSessions();
      setSessions(data);
    } catch {
      setErrorMsg('Không thể nạp danh sách phiên Flash Sale.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSession(null);
    // Mặc định tạo session từ thời điểm hiện tại tới 2 giờ sau
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    setStartTime(now.toISOString().slice(0, 16));
    setEndTime(twoHoursLater.toISOString().slice(0, 16));
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (session: FlashSaleSession) => {
    setEditingSession(session);
    setStartTime(new Date(session.startTime).toISOString().slice(0, 16));
    setEndTime(new Date(session.endTime).toISOString().slice(0, 16));
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const startISO = new Date(startTime).toISOString();
    const endISO = new Date(endTime).toISOString();

    if (new Date(endTime) <= new Date(startTime)) {
      setErrorMsg('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingSession) {
        await voucherService.updateAdminFlashSaleSession(editingSession.id, {
          startTime: startISO,
          endTime: endISO,
        });
      } else {
        await voucherService.createFlashSaleSession({
          startTime: startISO,
          endTime: endISO,
        });
      }
      setShowModal(false);
      await fetchSessions();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Không thể lưu phiên Flash Sale.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (id: number) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await voucherService.deleteAdminFlashSaleSession(deletingId);
      setDeleteModalOpen(false);
      setDeletingId(null);
      await fetchSessions();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể xóa phiên Flash Sale.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Render Status Badge
  const getSessionStatus = (startStr: string, endStr: string) => {
    const now = new Date().getTime();
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();

    if (now < start) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Sắp diễn ra
        </span>
      );
    } else if (now >= start && now <= end) {
      return (
        <span className="px-2.5 py-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-full flex items-center gap-1 animate-pulse">
          <Zap className="w-3.5 h-3.5 fill-red-600" /> Đang diễn ra
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-1 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-full">
          Đã kết thúc
        </span>
      );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 font-['Roboto',sans-serif]">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Zap className="w-6 h-6 text-red-600 fill-red-600" /> Quản Lý Khung Giờ Flash Sale
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Tạo và thiết lập các phiên Flash Sale đồng bộ với Redis High-Concurrency Cache
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" /> Tạo Khung Giờ Mới
          </button>
        </div>

        {/* Dynamic Table & Content */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-red-600" /> Đang nạp danh sách phiên Flash Sale...
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-slate-50 p-12 text-center rounded-xl border border-slate-200 space-y-3">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700">Chưa có phiên Flash Sale nào</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Bấm "Tạo Khung Giờ Mới" ở trên để khởi tạo phiên săn sale cho hệ thống.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">ID Phiên</th>
                  <th className="px-4 py-3">Thời Gian Bắt Đầu</th>
                  <th className="px-4 py-3">Thời Gian Kết Thúc</th>
                  <th className="px-4 py-3">Trạng Thái</th>
                  <th className="px-4 py-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-800">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">#{session.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(session.startTime).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(session.endTime).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">{getSessionStatus(session.startTime, session.endTime)}</td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(session)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                        title="Chỉnh sửa thời gian"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(session.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        title="Xóa phiên này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Tạo / Cập nhật Session */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-600" />
                  {editingSession ? 'Cập Nhật Khung Giờ Flash Sale' : 'Tạo Khung Giờ Flash Sale Mới'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs hover:bg-slate-200"
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

              <form onSubmit={handleSaveSession} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời Gian Bắt Đầu</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-red-600 font-semibold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời Gian Kết Thúc</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-red-600 font-semibold text-slate-800"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Đang Lưu...' : 'Lưu Phiên'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* System Confirm Modal Xóa Session */}
        <ConfirmModal
          isOpen={deleteModalOpen}
          title="Xác nhận xóa phiên Flash Sale"
          message="Bạn có chắc chắn muốn xóa phiên Flash Sale này? Tất cả dữ liệu đăng ký trong phiên sẽ bị hủy."
          confirmText="Đồng ý Xóa"
          cancelText="Giữ lại"
          type="danger"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteModalOpen(false);
            setDeletingId(null);
          }}
        />
      </div>
    </AdminLayout>
  );
};
