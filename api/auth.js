import { api } from "./client";
import * as SecureStore from "expo-secure-store";

export async function register(email, password) {
  await api.post("/auth/register", { email, password });
}

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  await SecureStore.setItemAsync("access_token", data.access_token);
  await SecureStore.setItemAsync("refresh_token", data.refresh_token);
}

export async function logout() {
  await SecureStore.deleteItemAsync("access_token");
  await SecureStore.deleteItemAsync("refresh_token");
}
