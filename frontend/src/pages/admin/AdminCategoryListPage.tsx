import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Layers, Plus, Edit, FolderPlus, Folder, RefreshCw, X, Save, ChevronRight, Trash2, Search, AlertTriangle } from 'lucide-react';
import CatalogService from '../../services/catalog-service';
import { Category } from '../../types/catalog';

export const AdminCategoryListPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // State Modal Thêm/Sửa Danh Mục
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string>('');

  // State Modal Xác Nhận Xóa Danh Mục
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  const fetchCategories = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await CatalogService.getCategories();
      setCategories(data || []);
    } catch (err: any) {
      setErrorMsg('Không thể tải danh sách ngành hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Mở modal tạo mới
  const handleOpenCreateModal = (pId: number | null = null) => {
    setEditingCategory(null);
    setCategoryName('');
    setParentId(pId);
    setModalError('');
    setIsModalOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setParentId(cat.parentId || null);
    setModalError('');
    setIsModalOpen(true);
  };

  // Lưu danh mục (Create / Update)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setSaving(true);
    setModalError('');
    try {
      if (editingCategory) {
        await CatalogService.updateCategory(editingCategory.id, {
          name: categoryName,
          parentId,
        });
      } else {
        await CatalogService.createCategory({
          name: categoryName,
          parentId,
        });
      }
      await fetchCategories();
      setIsModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể lưu danh mục. Vui lòng kiểm tra phân quyền Admin.';
      setModalError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSaving(false);
    }
  };

  // Mở modal xác nhận xóa
  const handleOpenDeleteModal = (cat: Category) => {
    setDeletingCategory(cat);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  // Xử lý Xóa danh mục qua API DELETE /api/v1/categories/:id
  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await CatalogService.deleteCategory(deletingCategory.id);
      await fetchCategories();
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể xóa danh mục này. Có thể danh mục đang chứa sản phẩm hoặc ngành hàng con.';
      setDeleteError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setDeleting(false);
    }
  };

  // Lấy danh sách ngành hàng gốc cho dropdown chọn danh mục cha (loại trừ chính nó nếu đang sửa)
  const getParentOptions = (cats: Category[], currentId?: number): Category[] => {
    const list: Category[] = [];
    const collect = (items: Category[]) => {
      items.forEach((c) => {
        if (currentId && c.id === currentId) return;
        list.push(c);
        if (c.children && c.children.length > 0) {
          collect(c.children);
        }
      });
    };
    collect(cats);
    return list;
  };

  // Lọc danh mục theo từ khóa tìm kiếm
  const filterCategories = (items: Category[], query: string): Category[] => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();

    const result: Category[] = [];
    items.forEach((cat) => {
      const nameMatches = cat.name.toLowerCase().includes(q);
      const filteredChildren = cat.children ? filterCategories(cat.children, query) : [];
      if (nameMatches || filteredChildren.length > 0) {
        result.push({
          ...cat,
          children: filteredChildren,
        });
      }
    });
    return result;
  };

  const displayedCategories = filterCategories(categories, searchQuery);

  return (
    <AdminLayout>
      <div className="space-y-6 font-['Roboto',sans-serif]">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-6 h-6 text-red-600" /> Quản Lý Danh Mục Ngành Hàng Sàn (Admin CRUD)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý toàn bộ cây danh mục sản phẩm Shopew, tạo mới, chỉnh sửa hoặc xóa danh mục ngành hàng.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCategories}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => handleOpenCreateModal(null)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm Danh Mục Mới
            </button>
          </div>
        </div>

        {/* Thanh Tìm Kiếm Ngành Hàng */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục theo tên..."
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

        {/* Thông Báo Lỗi Kết Nối */}
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-xs flex items-center gap-2 border border-red-200">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Cây Danh Mục Sản Phẩm */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 font-medium">Đang tải cây danh mục hệ thống...</div>
          ) : displayedCategories.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              {searchQuery ? 'Không tìm thấy danh mục nào phù hợp.' : 'Chưa có danh mục nào. Hãy bấm Thêm Danh Mục Mới.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {displayedCategories.map((pCat) => {
                const subCount = pCat.children?.length || 0;

                return (
                  <div key={pCat.id} className="p-4 space-y-3 hover:bg-slate-50/70 transition-colors">
                    {/* Danh Mục Cấp 1 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-lg border border-red-100">
                          <Folder className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-800">{pCat.name}</h3>
                            <span className="text-[10px] font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded-full">
                              Cấp 1 (ID: #{pCat.id})
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {subCount > 0 ? `Bao gồm ${subCount} ngành hàng con` : 'Chưa có ngành hàng con'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenCreateModal(pCat.id)}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                          title="Thêm danh mục con"
                        >
                          <FolderPlus className="w-3.5 h-3.5" /> + Thêm Ngành Hàng Con
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(pCat)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                          title="Chỉnh sửa danh mục"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(pCat)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          title="Xóa danh mục"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Danh Mục Con (Sub Categories Cấp 2 / Cấp 3) */}
                    {subCount > 0 && (
                      <div className="ml-10 pl-4 border-l-2 border-red-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                        {pCat.children?.map((subCat) => (
                          <div
                            key={subCat.id}
                            className="bg-slate-50 p-2.5 rounded-md border border-slate-200 flex items-center justify-between hover:border-red-400 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <ChevronRight className="w-3.5 h-3.5 text-red-600 shrink-0" />
                              <div>
                                <span className="text-xs font-bold text-slate-800 block">{subCat.name}</span>
                                <span className="text-[10px] text-slate-400">ID: #{subCat.id}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditModal(subCat)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded cursor-pointer transition-colors"
                                title="Sửa danh mục con"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(subCat)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded cursor-pointer transition-colors"
                                title="Xóa danh mục con"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Thêm / Chỉnh Sửa Danh Mục */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Folder className="w-5 h-5 text-red-600" />
                  {editingCategory ? `Chỉnh Sửa Danh Mục #${editingCategory.id}` : 'Thêm Danh Mục Ngành Hàng Mới'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-xs">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên Danh Mục Ngành Hàng *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Thời Trang Nam, Thiết Bị Điện Tử..."
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trực Thuộc Danh Mục Cha</label>
                  <select
                    value={parentId || ''}
                    onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-red-600"
                  >
                    <option value="">-- Là Danh Mục Cấp 1 (Danh Mục Gốc) --</option>
                    {getParentOptions(categories, editingCategory?.id).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (ID: #{c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Đang lưu...' : 'Lưu Danh Mục'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Xác Nhận Xóa Danh Mục (Delete Confirmation) */}
        {isDeleteModalOpen && deletingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-sm">Xác Nhận Xóa Danh Mục?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Bạn có chắc chắn muốn xóa danh mục <span className="font-bold text-slate-800">"{deletingCategory.name}"</span> (ID: #{deletingCategory.id}) khỏi hệ thống không?
                </p>
              </div>

              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-xs text-left">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Đang xóa...' : 'Xóa Danh Mục'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCategoryListPage;
