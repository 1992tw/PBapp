import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

interface AuthResponse {
  username: string;
  message: string;
  token?: string;
}

// Frontend code: resetPassword and forgotPassword functions

export const resetPassword = async (resetCode: string, password: string) => {
  try {
    await axios.post(`${API_URL}/reset-password`, { newPassword: password, resetCode });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || 'Failed to reset password.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

export const forgotPassword = async (email: string) => {
  try {
    await axios.post(`${API_URL}/forgot-pass`, { email });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || 'Failed to send email.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};


export const login = async (identifier: string, password: string) => { // updated parameter
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/login`, {
      identifier, // now accepts username or email
      password,
    });

    if (response.data.token) {
      await AsyncStorage.setItem('auth-token', response.data.token);
      await AsyncStorage.setItem('username', response.data.username);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || 'Login failed.');
    } else {
      throw new Error('An unexpected error occurred during login.');
    }
  }
};

export const register = async (username: string, email: string, password: string) => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/register`, {
      username,
      email,
      password,
    });

    if (response.data.token) {
      await AsyncStorage.setItem('auth-token', response.data.token);
      await AsyncStorage.setItem('username', username);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || 'Registration failed.');
    } else {
      throw new Error('An unexpected error occurred during registration.');
    }
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem('auth-token');
  await AsyncStorage.removeItem('username');
};

export const isLoggedIn = async () => {
  const token = await AsyncStorage.getItem('auth-token');
  return !!token;
};
