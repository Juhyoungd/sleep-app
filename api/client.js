import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const BASE_URL = __DEV__
  ? Platform.select({
      ios: "http://localhost:8000",
      android: "http://10.0.2.2:8000",
      default: "http://localhost:8000",
    })
  : "https://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// 요청 시 토큰 자동첨부
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;
let pending = [];

const onRefreshed = (token) => {
  pending.forEach((cb) => cb(token));
  pending = [];
};

// 401 → 자동 토큰 재발급
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (refreshing) {
        const newToken = await new Promise((resolve) => pending.push(resolve));
        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`;
          original._retry = true;
          return api(original);
        }
        return Promise.reject(error);
      }

      refreshing = true;
      original._retry = true;
      try {
        const refresh = await SecureStore.getItemAsync("refresh_token");
        if (!refresh) throw new Error("No refresh token");
        const r = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refresh });
        const access = r.data.access_token;
        const newRefresh = r.data.refresh_token;
        await SecureStore.setItemAsync("access_token", access);
        await SecureStore.setItemAsync("refresh_token", newRefresh);
        onRefreshed(access);
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      } catch (e) {
        onRefreshed(null);
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
