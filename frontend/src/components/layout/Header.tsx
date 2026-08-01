import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, ShoppingBag } from 'lucide-react';
import { Navbar } from './Navbar';
import CatalogService from '../../services/catalog-service';
import { Category } from '../../types/catalog';

// Header chính của hệ thống Shopew
export const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quickCategories, setQuickCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  // Nạp danh mục ngành hàng từ API Backend để hiển thị Tag tìm kiếm nhanh
  useEffect(() => {
    const fetchQuickCats = async () => {
      try {
        const catData = await CatalogService.getCategories();
        if (catData && catData.length > 0) {
          const allCats: Category[] = [];
          catData.forEach(c => {
            allCats.push(c);
            if (c.children && c.children.length > 0) {
              allCats.push(...c.children);
            }
          });
          setQuickCategories(allCats.slice(0, 6));
        }
      } catch {
        // Fallback giữ nguyên giao diện
      }
    };
    fetchQuickCats();
  }, []);

  // Xử lý gửi Form Tìm kiếm
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#ee4d2d] shadow-md">
      {/* Navbar phụ ở góc trên */}
      <Navbar />

      {/* Thanh Header chính (Logo + Search Bar + Giỏ hàng) */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-8">
        {/* Logo Shopew */}
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-2xl tracking-tight shrink-0">
          <div className="bg-white text-[#ee4d2d] p-1.5 rounded-lg shadow-sm">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <span>shopew</span>
        </Link>

        {/* Thanh Tìm kiếm Smart Search */}
        <div className="flex-1 max-w-3xl">
          <form onSubmit={handleSearchSubmit} className="relative flex bg-white p-1 rounded-sm shadow-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Shopew Bao La Deal - Tìm kiếm sản phẩm, thương hiệu..."
              className="w-full px-3 py-1.5 text-sm text-gray-800 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#ee4d2d] hover:bg-[#d03e20] text-white px-6 py-2 rounded-sm transition-colors flex items-center justify-center shrink-0"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Tag Từ khóa/Danh mục gợi ý nhanh từ API thực tế */}
          <div className="flex items-center gap-3 text-xs text-white/90 mt-1.5 overflow-hidden whitespace-nowrap">
            {quickCategories.length > 0 ? (
              quickCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/search?category_id=${cat.id}`}
                  className="hover:underline opacity-95 hover:opacity-100 transition-opacity"
                >
                  {cat.name}
                </Link>
              ))
            ) : (
              <>
                <Link to="/search?category_id=1" className="hover:underline">Thời Trang Nam</Link>
                <Link to="/search?category_id=2" className="hover:underline">Điện Thoại & Phụ Kiện</Link>
                <Link to="/search?category_id=3" className="hover:underline">Thời Trang Nữ</Link>
              </>
            )}
          </div>
        </div>

        {/* Giỏ Hàng Icon */}
        <Link to="/cart" className="relative p-2 text-white hover:opacity-90 transition-opacity">
          <ShoppingCart className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 bg-white text-[#ee4d2d] font-bold text-xs px-2 py-0.5 rounded-full border border-[#ee4d2d]">
            0
          </span>
        </Link>
      </div>
    </header>
  );
};
