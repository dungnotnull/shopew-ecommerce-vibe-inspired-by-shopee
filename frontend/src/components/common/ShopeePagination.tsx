import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ShopeePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Component Phân trang chuẩn giao diện Shopee
 * - Số trang hiện tại: Khối hình chữ nhật màu cam đỏ (#ee4d2d) chữ trắng
 * - Số trang khác: Chữ màu xám, không có viền khung, hover sang màu cam đỏ
 * - Nút điều hướng Trái/Phải: Icon mũi tên đơn giản không viền
 */
export const ShopeePagination: React.FC<ShopeePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  // Tạo mảng danh sách số trang chuẩn Shopee (1 2 3 4 5 ... N)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-6 sm:gap-8 my-8 select-none font-['Roboto',sans-serif]">
      {/* Nút Mũi Tên Trang Trước (<) */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="text-slate-400 hover:text-[#ee4d2d] disabled:opacity-30 disabled:hover:text-slate-400 transition cursor-pointer disabled:cursor-not-allowed p-1 flex items-center justify-center"
        title="Trang trước"
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
      </button>

      {/* Danh sách các con số phân trang */}
      <div className="flex items-center gap-4 sm:gap-6">
        {pageNumbers.map((item, index) => {
          if (typeof item === 'string') {
            return (
              <span key={`dots-${index}`} className="text-slate-400 text-base font-normal tracking-widest px-1">
                ...
              </span>
            );
          }

          const isCurrent = item === currentPage;

          return (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={
                isCurrent
                  ? 'bg-[#ee4d2d] text-white font-semibold text-base min-w-[34px] h-9 px-3 rounded-[2px] shadow-xs flex items-center justify-center cursor-default transition-all'
                  : 'text-slate-500 hover:text-[#ee4d2d] font-normal text-base cursor-pointer transition-colors px-1.5 py-0.5'
              }
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Nút Mũi Tên Trang Sau (>) */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="text-slate-400 hover:text-[#ee4d2d] disabled:opacity-30 disabled:hover:text-slate-400 transition cursor-pointer disabled:cursor-not-allowed p-1 flex items-center justify-center"
        title="Trang sau"
      >
        <ChevronRight className="w-5 h-5 stroke-[2.2]" />
      </button>
    </div>
  );
};
