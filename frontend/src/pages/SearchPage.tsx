import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, RotateCcw, ArrowUpDown, ChevronRight } from 'lucide-react';
import { SearchParams, SearchResult, Category } from '../types/catalog';
import CatalogService from '../services/catalog-service';
import { ProductCard } from '../components/catalog/ProductCard';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { ShopeePagination } from '../components/common/ShopeePagination';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category_id') || '';

  // Filter State
  const [query, setQuery] = useState<string>(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [isMall, setIsMall] = useState<boolean>(false);
  const [isPreferred, setIsPreferred] = useState<boolean>(false);
  const [sort, setSort] = useState<'relevance' | 'sold' | 'newest' | 'price'>('relevance');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(1);

  // API Results
  const [result, setResult] = useState<SearchResult | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Tải danh mục cây
    CatalogService.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const doSearch = async () => {
      setLoading(true);
      const params: SearchParams = {
        q: queryParam || undefined,
        category_id: categoryParam ? Number(categoryParam) : undefined,
        price_min: priceMin ? Number(priceMin) : undefined,
        price_max: priceMax ? Number(priceMax) : undefined,
        rating: rating,
        isMall: isMall || undefined,
        isPreferred: isPreferred || undefined,
        sort: sort,
        order: order,
        page: page,
        limit: 20,
      };

      const res = await CatalogService.searchProducts(params);
      setResult(res);
      setLoading(false);
    };

    doSearch();
  }, [queryParam, categoryParam, priceMin, priceMax, rating, isMall, isPreferred, sort, order, page]);

  const handleApplyQuery = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams: Record<string, string> = {};
    if (query) newParams.q = query;
    if (selectedCategory) newParams.category_id = selectedCategory;
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setPriceMin('');
    setPriceMax('');
    setRating(undefined);
    setIsMall(false);
    setIsPreferred(false);
    setSort('relevance');
    setSearchParams({});
  };

  const renderCategoryNodes = (catList: Category[], level = 0) => {
    return catList.map((cat) => {
      const isSelected = selectedCategory === String(cat.id);
      const hasChildren = cat.children && cat.children.length > 0;

      return (
        <React.Fragment key={cat.id}>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(String(cat.id));
              setSearchParams({ q: query, category_id: String(cat.id) });
            }}
            className={`w-full text-left py-1.5 rounded transition-colors flex items-center justify-between text-xs cursor-pointer ${
              level === 0 ? 'px-2 font-bold text-gray-800' : level === 1 ? 'pl-5 pr-2 font-medium text-gray-700' : 'pl-8 pr-2 font-normal text-gray-600'
            } ${
              isSelected ? 'font-bold text-[#ee4d2d] bg-orange-50' : 'hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-1.5 truncate">
              {level > 0 && <span className="text-gray-400 font-mono text-[10px]">└─</span>}
              <span className="truncate">{cat.name}</span>
            </span>
            {isSelected && <ChevronRight className="w-3.5 h-3.5 text-[#ee4d2d] shrink-0" />}
          </button>
          {hasChildren && renderCategoryNodes(cat.children!, level + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Search Header Bar */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleApplyQuery} className="flex-1 flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#ee4d2d]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
            <button
              type="submit"
              className="bg-[#ee4d2d] hover:bg-orange-600 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Tìm Kiếm
            </button>
          </form>
        </div>

        {/* Main Grid: Left Filter Sidebar & Right Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Cột trái: Bộ Lọc Sản Phẩm Đa Tiêu Chí (Phase 3 Format) */}
          <div className="md:col-span-3 space-y-5 bg-white p-4 rounded-lg border border-gray-100 h-fit shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                <Filter className="w-4 h-4 text-[#ee4d2d]" />
                <span>BỘ LỌC TÌM KIẾM</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-gray-500 hover:text-[#ee4d2d] flex items-center gap-1 cursor-pointer"
                title="Xóa bộ lọc"
              >
                <RotateCcw className="w-3 h-3" /> Đặt lại
              </button>
            </div>

            {/* Theo Danh Mục (Hiển thị đầy đủ danh mục cha và tất cả danh mục con) */}
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase mb-2">Tất Cả Danh Mục</h4>
              <div className="space-y-0.5 max-h-64 overflow-y-auto text-xs pr-1 border border-gray-100 rounded-md p-1 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('');
                    setSearchParams({ q: query });
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded transition-colors cursor-pointer ${
                    !selectedCategory ? 'font-bold text-[#ee4d2d] bg-orange-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Tất cả danh mục
                </button>
                {renderCategoryNodes(categories)}
              </div>
            </div>

            {/* Dịch Vụ & Khuyến Mãi */}
            <div className="pt-3 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-800 uppercase mb-2.5">Dịch Vụ & Khuyến Mãi</h4>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                  <input
                    type="checkbox"
                    checked={isMall}
                    onChange={(e) => setIsMall(e.target.checked)}
                    className="accent-[#ee4d2d] rounded"
                  />
                  <span className="font-semibold text-red-600">Shopee Mall</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                  <input
                    type="checkbox"
                    checked={isPreferred}
                    onChange={(e) => setIsPreferred(e.target.checked)}
                    className="accent-[#ee4d2d] rounded"
                  />
                  <span className="font-semibold text-[#ee4d2d]">Shop Yêu Thích</span>
                </label>
              </div>
            </div>

            {/* Khoảng Giá VND */}
            <div className="pt-3 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-800 uppercase mb-2">Khoảng Giá (VND)</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Từ ₫"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#ee4d2d]"
                />
                <span className="text-gray-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Đến ₫"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#ee4d2d]"
                />
              </div>
            </div>

            {/* Đánh Giá Stars */}
            <div className="pt-3 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-800 uppercase mb-2">Đánh Giá</h4>
              <div className="space-y-1 text-xs">
                {[5, 4, 3].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(rating === star ? undefined : star)}
                    className={`w-full text-left px-2 py-1.5 rounded transition-colors flex items-center gap-1 ${
                      rating === star ? 'bg-orange-50 text-[#ee4d2d] font-bold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>★ {star} sao trở lên</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cột phải: Thanh Sắp Xếp & Lưới Sản Phẩm */}
          <div className="md:col-span-9 space-y-4">
            {/* Thanh Sắp Xếp */}
            <div className="bg-gray-100 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">Sắp xếp theo:</span>
                <button
                  onClick={() => setSort('relevance')}
                  className={`px-4 py-1.5 rounded font-semibold transition-colors ${
                    sort === 'relevance' ? 'bg-[#ee4d2d] text-white shadow-xs' : 'bg-white text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Liên Quan
                </button>
                <button
                  onClick={() => setSort('newest')}
                  className={`px-4 py-1.5 rounded font-semibold transition-colors ${
                    sort === 'newest' ? 'bg-[#ee4d2d] text-white shadow-xs' : 'bg-white text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mới Nhất
                </button>
                <button
                  onClick={() => setSort('sold')}
                  className={`px-4 py-1.5 rounded font-semibold transition-colors ${
                    sort === 'sold' ? 'bg-[#ee4d2d] text-white shadow-xs' : 'bg-white text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bán Chạy
                </button>
              </div>

              {/* Selector Giá Thấp/Cao */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSort('price');
                    setOrder(order === 'asc' ? 'desc' : 'asc');
                  }}
                  className={`px-4 py-1.5 rounded font-semibold transition-colors flex items-center gap-1 ${
                    sort === 'price' ? 'bg-[#ee4d2d] text-white shadow-xs' : 'bg-white text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Giá: {order === 'asc' ? 'Thấp đến Cao' : 'Cao đến Thấp'}
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Lưới sản phẩm */}
            {loading ? (
              <div className="min-h-[40vh] flex items-center justify-center text-gray-500 text-sm">
                Đang tìm kiếm sản phẩm...
              </div>
            ) : result && result.data.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {result.data.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                <ShopeePagination
                  currentPage={page}
                  totalPages={result.totalPages || Math.ceil((result.total || 0) / 20) || 1}
                  onPageChange={(newPage) => {
                    setPage(newPage);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
                <p className="text-gray-500 font-medium text-sm">Không tìm thấy sản phẩm phù hợp với bộ lọc.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-3 text-xs text-[#ee4d2d] font-bold underline"
                >
                  Xóa bộ lọc để xem tất cả sản phẩm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};
