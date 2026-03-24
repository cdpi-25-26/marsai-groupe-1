import axios from "axios";
import { toast } from "../components/ToastProvider.jsx";

const rawApiHost = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/+$/, "");
const apiHost = rawApiHost.endsWith("/api") ? rawApiHost.slice(0, -4) : rawApiHost;

const instance = axios.create({
  baseURL: `${apiHost}/api`,
  timeout: 10000,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const rawMessage =
      error.response?.data?.error ??
      error.response?.data?.message ??
      error.message ??
      "Erreur inconnue";

    let message;
    if (typeof rawMessage === "string") {
      message = rawMessage;
    } else if (rawMessage && typeof rawMessage === "object") {
      // Certains endpoints renvoient un objet (statusCode, status, isOperational, ...)
      message = rawMessage.message || "Erreur serveur";
    } else {
      message = "Erreur inconnue";
    }

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
    } else if (status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login?reason=forbidden";
      }
    }

    toast(message, "error");

    return Promise.reject(error);
  },
);

export default instance;
