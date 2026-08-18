import api from "../lib/userApi";

export interface ApiUser {
  userId: number;
  fullName: string;
  gender: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  username: string;
  roleId: number;
  loyaltyPoint: number | null;
  registerDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  role: { roleId: number; roleName: string } | null;
}

export type ApiUserWrite = Omit<ApiUser, "role">;

export const userService = {
  async getAll(): Promise<ApiUser[]> {
    const res = await api.get<ApiUser[]>("/User");
    return res.data;
  },

  async getById(id: number): Promise<ApiUser> {
    const res = await api.get<ApiUser>(`/User/${id}`);
    return res.data;
  },

  async create(
    data: Partial<ApiUserWrite> & { username: string; password: string },
  ) {
    const res = await api.post("/User", data);
    return res.data;
  },

  async update(id: number, data: ApiUserWrite) {
    await api.put(`/User/${id}`, data);
  },

  async delete(id: number) {
    await api.delete(`/User/${id}`);
  },

  async changePassword(
    id: number,
    data: { currentPassword: string; newPassword: string },
  ) {
    await api.put(`/User/${id}/password`, data);
  },

  async updateMyInfo(data: {
    fullName?: string;
    gender?: string;
    email?: string;
    address?: string;
  }) {
    await api.put("/User/me/infor", data);
  },
};
