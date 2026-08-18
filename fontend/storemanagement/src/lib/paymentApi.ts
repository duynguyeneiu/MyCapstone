import axios from "axios";

const paymentApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_PAYMENT_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

paymentApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("hm-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default paymentApi;
