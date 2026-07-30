import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

// Component Footer chuẩn Shopee
export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12 text-xs text-gray-600">
      {/* Banner Cam kết dịch vụ */}
      <div className="border-b border-gray-100 py-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <RotateCcw className="w-8 h-8 text-[#ee4d2d]" />
            <h4 className="font-bold text-gray-800">7 NGÀY TRẢ HÀNG MỄN PHÍ</h4>
            <p className="text-gray-500">Trả hàng miễn phí trong 7 ngày đầu</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-[#ee4d2d]" />
            <h4 className="font-bold text-gray-800">HÀNG CHÍNH HÃNG 100%</h4>
            <p className="text-gray-500">Đảm bảo hàng chính hãng hoặc hoàn tiền</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Truck className="w-8 h-8 text-[#ee4d2d]" />
            <h4 className="font-bold text-gray-800">MIỄN PHÍ VẬN CHUYỂN</h4>
            <p className="text-gray-500">Giao hàng toàn quốc cực kỳ nhanh chóng</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Headphones className="w-8 h-8 text-[#ee4d2d]" />
            <h4 className="font-bold text-gray-800">HỖ TRỢ 24/7</h4>
            <p className="text-gray-500">Đội ngũ chăm sóc khách hàng nhiệt tình</p>
          </div>
        </div>
      </div>

      {/* Cột thông tin chi tiết */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-gray-800 uppercase mb-3">Chăm Sóc Khách Hàng</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-[#ee4d2d]">Trung Tâm Trợ Giúp</a></li>
            <li><a href="#" className="hover:text-[#ee4d2d]">Shopew Blog</a></li>
            <li><a href="#" className="hover:text-[#ee4d2d]">Hướng Dẫn Mua Hàng</a></li>
            <li><a href="#" className="hover:text-[#ee4d2d]">Hướng Dẫn Bán Hàng</a></li>
            <li><a href="#" className="hover:text-[#ee4d2d]">Thanh Toán & Vận Chuyển</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 uppercase mb-3">Về Shopew</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-[#ee4d2d]">Giới Thiệu Về Shopew</a></li>
            <li><a href="#" className="hover:text-[#ee4d2d]">Tuyển Dụng</a></li>
            <li><a href="#" className="hover:text-[#ee4d2d]">Điều Khoản Shopew</a></li>
            <li><a href="#" className="hover:text-[#ee4d2d]">Chính Sách Bảo Mật</a></li>
            <li><a href="#" className="hover:text-[#ee4d2d]">Kênh Người Bán</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 uppercase mb-3">Thanh Toán</h3>
          <div className="flex flex-wrap gap-2 text-gray-700 font-medium">
            <span className="border px-2 py-1 rounded bg-gray-50">Visa</span>
            <span className="border px-2 py-1 rounded bg-gray-50">Mastercard</span>
            <span className="border px-2 py-1 rounded bg-gray-50">JCB</span>
            <span className="border px-2 py-1 rounded bg-gray-50">ShopewPay</span>
            <span className="border px-2 py-1 rounded bg-gray-50">COD</span>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 uppercase mb-3">Đơn Vị Vận Chuyển</h3>
          <div className="flex flex-wrap gap-2 text-gray-700 font-medium">
            <span className="border px-2 py-1 rounded bg-gray-50">SPX Express</span>
            <span className="border px-2 py-1 rounded bg-gray-50">Giao Hàng Nhanh</span>
            <span className="border px-2 py-1 rounded bg-gray-50">Viettel Post</span>
            <span className="border px-2 py-1 rounded bg-gray-50">Ninja Van</span>
          </div>
        </div>
      </div>

      {/* Bản quyền */}
      <div className="bg-gray-100 py-4 text-center border-t border-gray-200 text-gray-500">
        <p>© 2026 Shopew Enterprise. Tất cả các quyền được bảo lưu.</p>
        <p className="mt-1">Dự án mô phỏng Thương mại Điện tử 100% Shopee Clone.</p>
      </div>
    </footer>
  );
};
