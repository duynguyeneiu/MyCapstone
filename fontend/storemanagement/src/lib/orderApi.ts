import axios from "axios";

const orderApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ORDER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

orderApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("hm-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default orderApi;
