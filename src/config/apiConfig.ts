// src/config/apiConfig.ts
import { Platform } from 'react-native';
import { API_URL as ENV_API_URL } from '@env';

export const API_URL = Platform.select({
  ios: ENV_API_URL,
  android: 'http://10.0.2.2:5000/api/user',
  web: ENV_API_URL, // Ensure ENV_API_URL is set correctly for web
  default: ENV_API_URL,
});