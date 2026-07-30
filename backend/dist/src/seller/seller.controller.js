"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let SellerController = class SellerController {
    getDashboard(req) {
        return {
            shopName: req.user.fullName + ' Shop',
            revenueThisMonth: 125400000,
            newOrders: 48,
            totalSPUs: 124,
            shopRating: 4.9,
            todo: {
                pendingConfirmation: 12,
                pendingPickup: 5,
                returnRequests: 2,
                lockedProducts: 0
            }
        };
    }
};
exports.SellerController = SellerController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.SELLER),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy dữ liệu tổng quan cho Seller Dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trả về thống kê Seller' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SellerController.prototype, "getDashboard", null);
exports.SellerController = SellerController = __decorate([
    (0, swagger_1.ApiTags)('Seller'),
    (0, common_1.Controller)('seller'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard)
], SellerController);
//# sourceMappingURL=seller.controller.js.map