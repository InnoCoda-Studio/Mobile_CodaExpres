import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.0.3:8000/api';
//70123456789
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// AUTOMATIC JWT INTERCEPTOR
apiClient.interceptors.request.use(

  async (config) => {
    try {
      const publicEndpoints = [
        '/auth/send-otp/',
        '/auth/verify-otp/',
        '/auth/login/',
        '/auth/register/',
        '/auth/password-reset/request/',
        '/auth/password-reset/confirm/',
      ];

      const isPublic = publicEndpoints.some((endpoint) => config.url?.includes(endpoint));

      if (!isPublic) {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error reading auth token from storage:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// REAL-TIME NIN VERIFICATION
export const verifyNinRealtime = async (ninNumber: string) => {
  const response = await apiClient.post('/auth/verify-nin/', {
    nin_number: ninNumber,
  });
  return response.data;
};

// RIDER ONBOARDING PROFILE UPDATE
export const updateRiderProfile = async (profileData: {
  nin_number?: string;
  vehicle_type?: string;
  residential_address?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  live_selfieUri?: string;
  nin_cardUri?: string;
}) => {
  const formData = new FormData();

  if (profileData.nin_number) formData.append('nin_number', profileData.nin_number);
  if (profileData.vehicle_type) formData.append('vehicle_type', profileData.vehicle_type);
  if (profileData.residential_address) formData.append('residential_address', profileData.residential_address);
  if (profileData.bank_name) formData.append('bank_name', profileData.bank_name);
  if (profileData.account_number) formData.append('account_number', profileData.account_number);
  if (profileData.account_name) formData.append('account_name', profileData.account_name);

  if (profileData.live_selfieUri) {
    formData.append('live_selfie', {
      uri: profileData.live_selfieUri,
      name: 'live_selfie.jpg',
      type: 'image/jpeg',
    } as any);
  }

  if (profileData.nin_cardUri) {
    formData.append('nin_id_card_image', {
      uri: profileData.nin_cardUri,
      name: 'nin_card.jpg',
      type: 'image/jpeg',
    } as any);
  }

  const response = await apiClient.patch('/auth/riders/onboarding/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default apiClient;