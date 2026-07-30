import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface CustomerLayoutProps {
  children?: React.ReactNode;
}

// Layout chung cho giao diện Khách hàng
export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Header cố định */}
      <Header />

      {/* Nội dung trang chính */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer phía dưới */}
      <Footer />
    </div>
  );
};
