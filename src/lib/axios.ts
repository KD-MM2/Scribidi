import Axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import localForage from "localforage";

const PUBLIC_ROUTES = ["/auth/login", "/auth/register", "/"];

export const api = Axios.create({
  baseURL: "http://localhost:3000",
});

const authRequestInterceptor = async (config: InternalAxiosRequestConfig) => {
  const token = await localForage.getItem("scribidi_token");

  if (config.headers) {
    config.headers.Accept = "application/json";
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  config.withCredentials = true;
  return config;
};

const handleUnauthorizedResponse = async (error: AxiosError) => {
  if (error.response?.status === 401) {
    await localForage.removeItem("scribidi_token");

    const currentPath = window.location.pathname;
    // Don't redirect if we're already on a public route
    if (!PUBLIC_ROUTES.includes(currentPath)) {
      console.log("Redirecting to login");
      window.location.href = `/auth/login?redirectTo=${encodeURIComponent(currentPath)}`;
    }
    return Promise.reject(new Error("Authentication required"));
  }
  return Promise.reject(error);
};

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
  (response) => response.data,
  handleUnauthorizedResponse
);
