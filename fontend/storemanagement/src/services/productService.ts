import api from "../lib/api";
import { Product } from "../lib/data";
import { getImageUrl } from "../lib/utils";

interface ApiProduct {
  productId: number;
  productName: string;
  description: string | null;
  salePrice: number;
  quantityInStock: number;
  image: string | null;
  categoryId: number;
  categoryName?: string;
  barcode: string | null;
  status: string;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiProductRaw {
  productId: number;
  productCode: string;
  barcode: string | null;
  productName: string;
  unit: string;
  importPrice: number;
  salePrice: number;
  quantityInStock: number;
  image: string | null;
  description: string | null;
  categoryId: number;
  categoryName?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string | null;
}

const mapProduct = (
  p: ApiProduct,
): Product => ({
  id: p.productId,
  name: p.productName,
  description: p.description ?? "",
  price: p.salePrice,
  quantity: p.quantityInStock,
  image: getImageUrl(p.image),

  categoryId: p.categoryId,
  category: p.categoryName,
  brandId: 0,
  barcode: p.barcode ?? "",
  status: p.status,
});

export interface PagedProducts {
  items: Product[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const res =
      await api.get<
        PagedResult<ApiProduct>
      >(
        "/Products",
        {
          params: {
            page: 1,
            pageSize: 1000,
          },
        },
      );

    return res.data.items.map(
      mapProduct,
    );
  },

  async getPaged(
    params: {
      page?: number;
      pageSize?: number;
      keyword?: string;
    } = {},
  ): Promise<PagedProducts> {
    const res =
      await api.get<
        PagedResult<ApiProduct>
      >(
        "/Products",
        {
          params: {
            page: 1,
            pageSize: 10,
            ...params,
          },
        },
      );

    return {
      items:
        res.data.items.map(
          mapProduct,
        ),
      totalItems: res.data.totalCount,
      page: res.data.page,
      pageSize: res.data.pageSize,
      totalPages: res.data.totalPages,
    };
  },

  async getByCategory(
    categoryId: number,

    params: {
      page?: number;
      pageSize?: number;
    } = {},
  ): Promise<PagedProducts> {
    const res =
      await api.get<
        PagedResult<ApiProduct>
      >(
        `/Products/category/${categoryId}`,
        {
          params: {
            page: 1,
            pageSize: 10,
            ...params,
          },
        },
      );

    return {
      items:
        res.data.items.map(
          mapProduct,
        ),
      totalItems: res.data.totalCount,
      page: res.data.page,
      pageSize: res.data.pageSize,
      totalPages: res.data.totalPages,
    };
  },

  async getById(
    id: number,
  ): Promise<Product> {
    const res =
      await api.get<ApiProduct>(
        `/Products/${id}`,
      );

    return mapProduct(
      res.data,
    );
  },

  async getAllRaw():
    Promise<ApiProductRaw[]> {
    const res =
      await api.get<
        PagedResult<ApiProductRaw>
      >(
        "/Products",
        {
          params: {
            page: 1,
            pageSize: 1000,
          },
        },
      );

    return res.data.items;
  },

  async getRawById(
    id: number,
  ): Promise<ApiProductRaw> {
    const res =
      await api.get<ApiProductRaw>(
        `/Products/${id}`,
      );

    return res.data;
  },

  async create(
    data: ApiProductRaw,
  ) {
    const res =
      await api.post(
        "/Products",
        data,
      );

    return res.data;
  },

  async update(
    id: number,
    data: ApiProductRaw,
  ) {
    const res =
      await api.put(
        `/Products/${id}`,
        data,
      );

    return res.data;
  },

  // Upload ảnh sản phẩm, trả về tên file (lưu vào Product.Image)
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<{ fileName: string; url: string }>(
      "/Products/upload-image",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.fileName;
  },

  async delete(
    id: number,
  ) {
    await api.delete(
      `/Products/${id}`,
    );
  },
};