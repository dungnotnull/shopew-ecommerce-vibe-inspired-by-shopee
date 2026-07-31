import React, { useEffect, useState } from 'react';
import { Layers, Plus, Edit, FolderPlus, Folder, RefreshCw, X, Save, ChevronRight } from 'lucide-react';
import CatalogService from '../../services/catalog-service';
import { Category } from '../../types/catalog';

export const SellerCategoryListPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State Modal Thêm/Sửa Danh Mục
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await CatalogService.getCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreateModal = (pId: number | null = null) => {
    setEditingCategory(null);
    setCategoryName('');
    setParentId(pId);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setParentId(cat.parentId || null);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-['Roboto',sans-serif]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg shadow-xs border border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#ee4d2d]" /> Quản Lý Danh Mục Sản Phẩm (2 Cấp)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Xem danh sách ngành hàng, thêm mới và tùy chỉnh danh mục sản phẩm cho Kênh Người Bán
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenCreateModal(null)}
            className="bg-[#ee4d2d] hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm Danh Mục Mới
          </button>
        </div>
      </div>

      {/* Main Categories Tree Grid */}
      <div className="bg-white rounded-lg shadow-xs border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Đang tải cây danh mục...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">Chưa có danh mục nào. Hãy bấm Thêm Danh Mục Mới.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((pCat) => {
              const subCount = pCat.children?.length || 0;

              return (
                <div key={pCat.id} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                  {/* Danh Mục Cha (Parent Category) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 text-[#ee4d2d] rounded-lg">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-gray-900">{pCat.name}</h3>
                          <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            ID #{pCat.id}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {subCount > 0 ? `Chứa ${subCount} ngành hàng con` : 'Chưa có ngành hàng con'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenCreateModal(pCat.id)}
                        className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#ee4d2d] text-xs font-bold rounded-md flex items-center gap-1 cursor-pointer"
                        title="Thêm danh mục con"
                      >
                        <FolderPlus className="w-3.5 h-3.5" /> + Thêm Ngành Hàng Con
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(pCat)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="Sửa danh mục cha"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Danh Mục Con (Sub Categories) */}
                  {subCount > 0 && (
                    <div className="ml-10 pl-4 border-l-2 border-orange-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                      {pCat.children?.map((subCat) => (
                        <div
                          key={subCat.id}
                          className="bg-gray-50 p-2.5 rounded-md border border-gray-200 flex items-center justify-between hover:border-[#ee4d2d] transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-[#ee4d2d]" />
                            <span className="text-xs font-semibold text-gray-800">{subCat.name}</span>
                            <span className="text-[10px] text-gray-400">#{subCat.id}</span>
                          </div>
                          <button
                            onClick={() => handleOpenEditModal(subCat)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded cursor-pointer"
                            title="Sửa danh mục con"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal Thêm / Sửa Danh Mục */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Folder className="w-5 h-5 text-[#ee4d2d]" />
                {editingCategory ? `Sửa Danh Mục #${editingCategory.id}` : 'Thêm Danh Mục Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tên Danh Mục *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Thời Trang Nam, Điện Thoại Di Động..."
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#ee4d2d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Thuộc Danh Mục Cha (Nếu có)</label>
                <select
                  value={parentId || ''}
                  onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#ee4d2d]"
                >
                  <option value="">-- Là Danh Mục Cấp 1 (Gốc) --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (ID #{c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#ee4d2d] hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Đang lưu...' : 'Lưu Danh Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
