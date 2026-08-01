import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types/catalog';
import { LayoutGrid, Shirt, Smartphone, Sparkles, Home, ShoppingBag } from 'lucide-react';

interface CategoryBarProps {
  categories: Category[];
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ categories }) => {
  // Mapping Icon linh hoạt theo tên danh mục
  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('thời trang') || lower.includes('áo')) return <Shirt className="w-6 h-6 text-indigo-500" />;
    if (lower.includes('điện thoại') || lower.includes('tai nghe')) return <Smartphone className="w-6 h-6 text-blue-500" />;
    if (lower.includes('trang sức') || lower.includes('nữ')) return <Sparkles className="w-6 h-6 text-pink-500" />;
    if (lower.includes('nhà cửa') || lower.includes('bếp')) return <Home className="w-6 h-6 text-amber-500" />;
    return <ShoppingBag className="w-6 h-6 text-[#ee4d2d]" />;
  };

  // Lọc chỉ lấy các danh mục ngành hàng cấp cha (parentId === null) để giao diện gọn gàng chuẩn Shopee
  const displayCategories = React.useMemo(() => {
    return categories.filter((c) => c.parentId === null || !c.parentId);
  }, [categories]);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
        <LayoutGrid className="w-5 h-5 text-[#ee4d2d]" />
        <h3 className="font-bold text-gray-800 uppercase text-sm tracking-wide">DANH MỤC SẢN PHẨM</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {displayCategories.map((cat) => (
          <Link
            key={cat.id}
            to={`/search?category_id=${cat.id}`}
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100 hover:border-[#ee4d2d] hover:shadow-md transition-all group bg-gray-50/50 hover:bg-white text-center"
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              {getCategoryIcon(cat.name)}
            </div>
            <span className="text-xs font-semibold text-gray-700 group-hover:text-[#ee4d2d] line-clamp-2">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
