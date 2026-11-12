import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.0.2:8000/api';

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

// ==========================
// REAL-TIME NIN & ONBOARDING
// ==========================
export const verifyNinRealtime = async (ninNumber: string) => {
  const response = await apiClient.post('/auth/verify-nin/', {
    nin_number: ninNumber,
  });
  return response.data;
};

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

// ==========================
// 1. CUSTOMER BOOKING API
// ==========================
export const bookDeliveryOrder = async (orderData: {
  pickup_address: string;
  pickup_contact_name: string;
  pickup_contact_phone: string;
  dropoff_address: string;
  dropoff_contact_name: string;
  dropoff_contact_phone: string;
  descriptions?: string;
  package_type: string;
  required_vehicle: 'BICYCLE' | 'MOTORCYCLE' | 'CAR';
  distance: string;
  estimated_earnings: number;
}) => {
  try {
    const response = await apiClient.post('/orders/book/', orderData);
    return response.data;
  } catch (error) {
    console.error('Failed to book order:', error);
    throw error;
  }
};



// ==========================
// 2. RIDER DISPATCH & ACCEPTANCE API
// ==========================
export const fetchAvailableOrders = async () => {
  try {
    const response = await apiClient.get('/orders/available/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch available orders:', error);
    throw error;
  }
};

export const acceptOrder = async (orderId: number) => {
  try {
    const response = await apiClient.post(`/orders/${orderId}/accept/`);
    return response.data;
  } catch (error) {
    console.error('Failed to accept order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (
  orderId: number, 
  status: 'IN_TRANSIT' | 'ARRIVED_DROPOFF' | 'COMPLETED', 
  pin?: string
) => {
  try {
    const payload: any = { status };
    if (pin) payload.dropoff_pin = pin;

    const response = await apiClient.patch(`/orders/${orderId}/status/`, payload);
    return response.data;
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
};

// ==========================
// 3. IN-APP MESSAGING API
// ==========================
export const fetchOrderMessages = async (orderId: number) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}/messages/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    throw error;
  }
};

export const sendOrderMessage = async (orderId: number, messageText: string) => {
  try {
    const response = await apiClient.post(`/orders/${orderId}/messages/`, {
      message_text: messageText,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

export default apiClient;