import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Users, Search, Lock, Unlock, Edit, Trash2, X, Save, AlertTriangle, ShieldCheck, Store, UserCheck, CheckCircle2, User as UserIcon, UserPlus } from 'lucide-react';
import { adminService, AdminUser } from '../../services/admin-service';
import { ShopeePagination } from '../../components/common/ShopeePagination';

export const AdminUserListPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Modal State Tạo Mới Người Dùng (Create User)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createEmail, setCreateEmail] = useState<string>('');
  const [createPassword, setCreatePassword] = useState<string>('');
  const [createFullName, setCreateFullName] = useState<string>('');
  const [createPhone, setCreatePhone] = useState<string>('');
  const [createRole, setCreateRole] = useState<'CUSTOMER' | 'SELLER' | 'ADMIN'>('CUSTOMER');
  const [creating, setCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string>('');

  // Modal State Chỉnh Sửa Người Dùng (Edit User)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editFullName, setEditFullName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editRole, setEditRole] = useState<'CUSTOMER' | 'SELLER' | 'ADMIN'>('CUSTOMER');
  const [saving, setSaving] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string>('');

  // Modal State Xóa Tài Khoản (Delete User)
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Load danh sách người dùng từ API Backend: GET /api/admin/users
  const fetchUsers = async (pageNum = 1) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await adminService.getUsers(pageNum, 20);
      setUsers(res.data || []);
      setTotalPages(res.totalPages || 1);
      setPage(pageNum);
    } catch {
      setErrorMsg('Không thể tải danh sách tài khoản. Vui lòng kiểm tra lại quyền Admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  // Mở modal tạo mới người dùng
  const handleOpenCreateModal = () => {
    setCreateEmail('');
    setCreatePassword('');
    setCreateFullName('');
    setCreatePhone('');
    setCreateRole('CUSTOMER');
    setCreateError('');
    setIsCreateModalOpen(true);
  };

  // Tạo mới người dùng: POST /api/admin/users
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await adminService.createUser({
        email: createEmail,
        password: createPassword,
        fullName: createFullName,
        phone: createPhone || undefined,
        role: createRole,
      });
      await fetchUsers(1);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tạo mới tài khoản người dùng.';
      setCreateError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setCreating(false);
    }
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (u: AdminUser) => {
    setEditingUser(u);
    setEditFullName(u.fullName || '');
    setEditPhone(u.phone || '');
    setEditRole(u.role);
    setModalError('');
    setIsEditModalOpen(true);
  };

  // Lưu chỉnh sửa người dùng: PUT /api/admin/users/:id
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    setModalError('');
    try {
      await adminService.updateUser(editingUser.id, {
        fullName: editFullName,
        phone: editPhone,
        role: editRole,
      });
      await fetchUsers(page);
      setIsEditModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể cập nhật thông tin người dùng.';
      setModalError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSaving(false);
    }
  };

  // Khóa / Mở khóa tài khoản người dùng: PUT /api/admin/users/:id/status
  const handleToggleStatus = async (u: AdminUser) => {
    try {
      await adminService.updateUserStatus(u.id, !u.isActive);
      await fetchUsers(page);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể thay đổi trạng thái tài khoản. Vui lòng thử lại.';
      alert(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  // Mở modal xác nhận xóa
  const handleOpenDeleteModal = (u: AdminUser) => {
    setDeletingUser(u);
    setIsDeleteModalOpen(true);
  };

  // Xác nhận xóa tài khoản: DELETE /api/admin/users/:id
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      await adminService.deleteUser(deletingUser.id);
      await fetchUsers(page);
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể xóa tài khoản này.';
      alert(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setDeleting(false);
    }
  };

  // Lọc danh sách theo từ khóa tìm kiếm và Vai trò (Role)
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchSearch && matchRole;
  });

  return (
    <AdminLayout>
      <div className="space-y-6 font-['Roboto',sans-serif]">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-red-600" /> Quản Lý Người Dùng & Shop Hệ Thống
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý toàn bộ danh sách tài khoản Khách Hàng, Người Bán và Admin trên sàn Shopew (Thêm mới, sửa, khóa, xóa).
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-[#ee4d2d] hover:bg-[#d73211] text-white font-bold text-xs rounded-lg shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Thêm Tài Khoản Mới
          </button>
        </div>

        {/* Thanh Tìm Kiếm & Bộ Lọc Vai Trò */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="sm:col-span-8 flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm theo Tên, Email hoặc Số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                Xóa
              </button>
            )}
          </div>

          <div className="sm:col-span-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-800 focus:outline-none focus:border-red-600 cursor-pointer"
            >
              <option value="ALL">-- Tất Cả Vai Trò (Role) --</option>
              <option value="CUSTOMER">Khách Hàng (CUSTOMER)</option>
              <option value="SELLER">Người Bán (SELLER)</option>
              <option value="ADMIN">Quản Trị Admin (ADMIN)</option>
            </select>
          </div>
        </div>

        {/* Thông Báo Lỗi */}
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-xs flex items-center gap-2 border border-red-200">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Bảng Danh Sách Người Dùng */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 font-medium">Đang tải danh sách tài khoản...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              {searchQuery || roleFilter !== 'ALL' ? 'Không tìm thấy tài khoản nào phù hợp.' : 'Chưa có tài khoản nào.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                    <th className="p-3 text-center">ID</th>
                    <th className="p-3">Họ Và Tên</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Số Điện Thoại</th>
                    <th className="p-3 text-center">Vai Trò (Role)</th>
                    <th className="p-3 text-center">Trạng Thái</th>
                    <th className="p-3 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.map((u) => {
                    const isCustomer = u.role === 'CUSTOMER';
                    const isSeller = u.role === 'SELLER';
                    const isAdmin = u.role === 'ADMIN';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 text-center font-bold text-slate-400">#{u.id}</td>
                        <td className="p-3 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 font-bold">
                              {u.fullName ? u.fullName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                            </div>
                            <span>{u.fullName || 'Người dùng'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">{u.email}</td>
                        <td className="p-3 text-slate-600">{u.phone || '—'}</td>
                        <td className="p-3 text-center">
                          {isAdmin && (
                            <span className="bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> ADMIN
                            </span>
                          )}
                          {isSeller && (
                            <span className="bg-orange-50 text-[#ee4d2d] border border-orange-200 text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Store className="w-3 h-3" /> SELLER
                            </span>
                          )}
                          {isCustomer && (
                            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <UserCheck className="w-3 h-3" /> CUSTOMER
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {u.isActive ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Hoạt động
                            </span>
                          ) : (
                            <span className="bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Đã Khóa
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                                u.isActive
                                  ? 'text-amber-600 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            >
                              {u.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(u)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                              title="Chỉnh sửa thông tin/role"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenDeleteModal(u)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Thanh Phân Trang Chuẩn Shopee */}
        <ShopeePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => fetchUsers(newPage)}
        />

        {/* Modal Tạo Mới Tài Khoản (Create User) */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-red-600" />
                  Thêm Tài Khoản Người Dùng Mới
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-xs">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="nhapemail@example.com"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mật Khẩu *</label>
                  <input
                    type="password"
                    required
                    placeholder="Mật khẩu tài khoản..."
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ Và Tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={createFullName}
                    onChange={(e) => setCreateFullName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    placeholder="0987654321"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân Quyền (Role)</label>
                  <select
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:border-red-600 cursor-pointer"
                  >
                    <option value="CUSTOMER">Khách Hàng (CUSTOMER)</option>
                    <option value="SELLER">Người Bán (SELLER)</option>
                    <option value="ADMIN">Quản Trị Admin (ADMIN)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {creating ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Chỉnh Sửa Người Dùng (Edit User) */}
        {isEditModalOpen && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Edit className="w-5 h-5 text-red-600" />
                  Chỉnh Sửa Tài Khoản #{editingUser.id}
                </h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-xs">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    disabled
                    value={editingUser.email}
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ Và Tên *</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân Quyền (Role)</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:border-red-600 cursor-pointer"
                  >
                    <option value="CUSTOMER">Khách Hàng (CUSTOMER)</option>
                    <option value="SELLER">Người Bán (SELLER)</option>
                    <option value="ADMIN">Quản Trị Admin (ADMIN)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Đang lưu...' : 'Lưu Cập Nhật'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Xác Nhận Xóa */}
        {isDeleteModalOpen && deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-sm">Xác Nhận Xóa Tài Khoản?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Bạn có chắc chắn muốn xóa tài khoản <strong className="text-slate-800">{deletingUser.email}</strong>? Hành động này không thể hoàn tác.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Đang xóa...' : 'Xác Nhận Xóa'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
