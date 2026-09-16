import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from './config';
import {
  User,
  LoginResponse,
  StudentPortalData,
  ParentPortalData,
  TeacherPortalData,
  Announcement,
  CoinReward,
  CoinLeaderboardItem,
  SystemSetting,
} from '../types';

const TOKEN_KEY = '@maktab_access_token';

export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = await getApiUrl();
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return null as unknown as T;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.message ||
        (Array.isArray(data) ? data[0]?.message : null) ||
        `Server xatosi: ${response.status}`;
      throw new Error(message);
    }

    return data as T;
  } catch (error: any) {
    if (error.message && !error.message.includes('Server xatosi')) {
      throw error;
    }
    throw new Error('Internet aloqasi yoki API server bilan bogʻlanib boʻlmadi.');
  }
}

export const api = {
  auth: {
    login: async (credentials: { username: string; password: string }): Promise<LoginResponse> => {
      const data = await request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (data?.token) {
        await setToken(data.token);
      }
      return data;
    },

    getProfile: async (): Promise<User> => {
      return request<User>('/auth/profile');
    },

    changePassword: async (passwords: {
      old_password: string;
      new_password: string;
      confirm_password: string;
    }): Promise<{ success: boolean; message: string }> => {
      return request<{ success: boolean; message: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(passwords),
      });
    },

    logout: async (): Promise<void> => {
      try {
        await request('/auth/logout', { method: 'POST' });
      } catch {
        // Ignore logout errors
      } finally {
        await removeToken();
      }
    },
  },

  portal: {
    student: async (): Promise<StudentPortalData> => {
      return request<StudentPortalData>('/portal/student');
    },

    parent: async (): Promise<ParentPortalData> => {
      return request<ParentPortalData>('/portal/parent');
    },

    teacher: async (): Promise<TeacherPortalData> => {
      return request<TeacherPortalData>('/portal/teacher');
    },
  },

  announcements: {
    getAll: async (): Promise<{ items: Announcement[] }> => {
      const res = await request<any>('/announcement?sort=-created_at');
      if (Array.isArray(res)) return { items: res };
      return { items: res?.items || [] };
    },
  },

  attendance: {
    batch: async (data: { lesson_id: number; records: { student_id: number; status: number; remarks?: string }[] }) => {
      return request('/attendance/batch', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  coins: {
    getBalance: async (studentId: number): Promise<{ balance: number; total_earned: number; total_spent: number }> => {
      return request(`/coin-transaction/balance/${studentId}`);
    },
    getLeaderboard: async (): Promise<CoinLeaderboardItem[]> => {
      return request('/coin-transaction/leaderboard');
    },
    getRewards: async (): Promise<{ items: CoinReward[] }> => {
      const res = await request<any>('/coin-reward?filter[is_available]=1');
      if (Array.isArray(res)) return { items: res };
      return { items: res?.items || [] };
    },
  },

  settings: {
    get: async (): Promise<SystemSetting[]> => {
      const res = await request<any>('/setting');
      return Array.isArray(res) ? res : res?.items || [];
    },
  },
};
