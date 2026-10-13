import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "user_access_token";
const REFRESH_KEY = "user_refresh_token";
const USER_DATA_KEY = "user_profile_data";

export async function saveAuthData(access: string, refresh: string, user: any) {
  await SecureStore.setItemAsync(ACCESS_KEY, access);
  await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
}

export async function getAccessToken() {
  return await SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken() {
  return await SecureStore.getItemAsync(REFRESH_KEY);
}

export async function getUserData() {
  const data = await SecureStore.getItemAsync(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

export async function clearAuthData() {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
  await SecureStore.deleteItemAsync(USER_DATA_KEY);
}