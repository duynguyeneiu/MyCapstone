import axios from "axios";

const userApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_USER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

userApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("hm-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default userApi;
