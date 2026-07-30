export declare class SellerController {
    getDashboard(req: any): {
        shopName: string;
        revenueThisMonth: number;
        newOrders: number;
        totalSPUs: number;
        shopRating: number;
        todo: {
            pendingConfirmation: number;
            pendingPickup: number;
            returnRequests: number;
            lockedProducts: number;
        };
    };
}
