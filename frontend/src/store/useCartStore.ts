import { create } from 'zustand';
import { orderService } from '../services/order-service';

interface CartState {
  cartCount: number;
  fetchCartCount: () => Promise<void>;
  setCartCount: (count: number) => void;
}

// Zustand store quản lý số lượng sản phẩm giỏ hàng theo thời gian thực trên badge Header
export const useCartStore = create<CartState>((set) => ({
  cartCount: 0,
  fetchCartCount: async () => {
    try {
      const groups = await orderService.getCart();
      const totalCount = groups.flatMap((g) => g.items).reduce((sum, item) => sum + item.quantity, 0);
      set({ cartCount: totalCount });
    } catch {
      set({ cartCount: 0 });
    }
  },
  setCartCount: (count: number) => set({ cartCount: count }),
}));
