import axios from "axios";

const reviewApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_REVIEW_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

reviewApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("hm-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default reviewApi;
