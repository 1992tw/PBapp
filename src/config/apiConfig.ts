// src/config/apiConfig.ts
import { Platform } from 'react-native';
import { API_URL as ENV_API_URL } from '@env';

export const API_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  default: ENV_API_URL,
});