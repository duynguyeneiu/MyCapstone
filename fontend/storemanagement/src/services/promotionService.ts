import orderApi from "../lib/orderApi";

// Promotion API lives in OrderService (/api/Promotion)

export interface ApiPromotion {
  promotionId: number;
  code: string;
  description?: string | null;
  discountType: "Percentage" | "Fixed";
  discountValue: number;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Inactive";                                     // stored value
  displayStatus: "Active" | "Inactive" | "Expired" | "Scheduled";    // computed by backend
  usageCount: number;
  totalDiscount: number;
}

export interface SavePromotionRequest {
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  startDate: string;   // yyyy-MM-dd
  endDate: string;     // yyyy-MM-dd
  status: string;      // Active | Inactive
}

export interface PromotionApplyResult {
  promotionId: number;
  code: string;
  discount: number;
}

export const promotionService = {
  async getAll(): Promise<ApiPromotion[]> {
    const res = await orderApi.get<ApiPromotion[]>("/Promotion");
    return res.data;
  },

  async create(data: SavePromotionRequest): Promise<ApiPromotion> {
    const res = await orderApi.post<ApiPromotion>("/Promotion", data);
    return res.data;
  },

  async update(id: number, data: SavePromotionRequest): Promise<void> {
    await orderApi.put(`/Promotion/${id}`, data);
  },

  async remove(id: number): Promise<void> {
    await orderApi.delete(`/Promotion/${id}`);
  },

  // Preview only – checkout recalculates the discount on the server
  async validate(code: string, orderAmount: number): Promise<PromotionApplyResult> {
    const res = await orderApi.post<PromotionApplyResult>("/Promotion/validate", { code, orderAmount });
    return res.data;
  },
};
