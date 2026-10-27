import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'coda_access_token';
const REFRESH_TOKEN_KEY = 'coda_refresh_token';

/**
 * Stores JWT access and refresh tokens securely in the device hardware/keychain.
 */

export const saveTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Failed to save auth tokens to SecureStore:', error);
  }
};

/**
 * Retrieves the saved access token for authenticated API headers.
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve access token:', error);
    return null;
  }
};

/**
 * Clears stored tokens on logout or session expiration.
 */
export const clearTokens = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to clear tokens:', error);
  }
};