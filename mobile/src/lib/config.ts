import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEFAULT_API_URL = 'https://sardorbek.alwaysdata.net/v1';
const API_STORAGE_KEY = '@maktab_api_url';

export async function getApiUrl(): Promise<string> {
  try {
    const customUrl = await AsyncStorage.getItem(API_STORAGE_KEY);
    return customUrl || DEFAULT_API_URL;
  } catch {
    return DEFAULT_API_URL;
  }
}

export async function setApiUrl(url: string): Promise<void> {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  await AsyncStorage.setItem(API_STORAGE_KEY, cleanUrl);
}
