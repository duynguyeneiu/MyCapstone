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
    const res = await api.get<ApiUser[]>("/Users");
    return res.data;
  },

  async getById(id: number): Promise<ApiUser> {
    const res = await api.get<ApiUser>(`/Users/${id}`);
    return res.data;
  },

  async create(data: Partial<ApiUserWrite> & { username: string; password: string }) {
    const res = await api.post("/Users", data);
    return res.data;
  },

  // PUT replaces the whole row — pass the full entity (minus the Role nav
  // property) so fields you don't touch aren't wiped out.
  async update(id: number, data: ApiUserWrite) {
    await api.put(`/Users/${id}`, data);
  },

  async delete(id: number) {
    await api.delete(`/Users/${id}`);
  },
};
